/* eslint-disable react-hooks/purity -- intentional one-time random seed in useMemo */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  Euler,
  Matrix4,
  Vector3,
} from "three";
import type { BufferAttribute, PerspectiveCamera, Points } from "three";
import { useIsMobile } from "../../hooks/useIsMobile";
import { REDUCED_MOTION } from "../../constants/accessibility";

/* ─── Tuning constants ─── */

const PARTICLE_COUNT = 2000;
const STAR_COUNT = 50;
const SPHERE_RADIUS = 6;
const INTERACTION_RADIUS = 4;
const REPULSION_STRENGTH = 0.25;
const ROTATION_RAD_PER_S = 0.08; // ~78s per full rotation — frame-rate-independent
const DELTA_CAP_S = 1 / 30; // cap delta — prevents tab-switch / lazy-load spikes
const TILT_X = Math.PI * 0.083; // ~15° static forward lean
const TILT_Z = -Math.PI / 6; // ~30° diagonal rotation axis (10h→4h)
const CORE_FRACTION = 0.7; // 70% particles in tight Gaussian core
const CORE_STD_DEV = 1.2; // Gaussian spread (tighter = denser core)
const CORE_BRIGHTNESS = 1.3; // Core particles 30% brighter
const SCATTER_BRIGHTNESS = 0.7; // Scatter particles 30% dimmer

/* ─── Material & color constants ─── */

const PARTICLE_SIZE = 0.05;
const STAR_SIZE = 0.09;
const COLOR_CYAN = "#22d3ee"; // Tailwind cyan-400
const COLOR_SLATE_100 = "#f1f5f9";
const COLOR_WHITE = "#ffffff";
const CYAN_PROBABILITY = 0.7; // 70% cyan, 30% white in constellation

/* ─── Wrapper constants ─── */

const FADE_IN_DELAY_MS = 100;
const CAMERA_FOV = 60;
const MOUSE_OFFSCREEN = { x: 100, y: 100 }; // sentinel: far outside NDC [-1,1]
const VIGNETTE_MASK =
  "radial-gradient(ellipse at center, black 50%, transparent 100%)";

/* ─── Per-frame drift/twinkle animation config ─── */

/** Single-axis sinusoidal drift parameters */
interface AxisDrift {
  readonly freq: number; // time multiplier (rad/s scaling)
  readonly phaseScale: number; // per-particle phase offset multiplier
  readonly amp: number; // displacement amplitude (world units)
}

/** Vertical twinkle oscillation parameters */
interface TwinkleConfig {
  readonly baseFreq: number; // base oscillation frequency
  readonly modFreq: number; // per-group frequency offset
  readonly modCount: number; // group modulo divisor
  readonly phaseScale: number; // per-particle phase offset multiplier
  readonly amp: number; // displacement amplitude (world units)
}

/** Combined animation config for a particle layer */
interface LayerAnimConfig {
  readonly drift: {
    readonly x: AxisDrift;
    readonly y: AxisDrift;
    readonly z?: AxisDrift;
  };
  readonly twinkle: TwinkleConfig;
}

/** Constellation: Y-dominant drift, 3-axis, subtle twinkle */
const CONSTELLATION_ANIM: LayerAnimConfig = {
  drift: {
    x: { freq: 0.3, phaseScale: 0.01, amp: 0.02 },
    y: { freq: 0.25, phaseScale: 0.02, amp: 0.05 },
    z: { freq: 0.35, phaseScale: 0.015, amp: 0.015 },
  },
  twinkle: { baseFreq: 0.8, modFreq: 0.3, modCount: 7, phaseScale: 1.7, amp: 0.03 },
};

/** Bright stars: gentler 2-axis drift, stronger twinkle */
const BRIGHT_STAR_ANIM: LayerAnimConfig = {
  drift: {
    x: { freq: 0.2, phaseScale: 0.05, amp: 0.015 },
    y: { freq: 0.2, phaseScale: 0.04, amp: 0.04 },
  },
  twinkle: { baseFreq: 0.4, modFreq: 0.25, modCount: 7, phaseScale: 2.1, amp: 0.06 },
};

type MouseRef = React.RefObject<{ x: number; y: number }>;
type ScrollRef = React.RefObject<number>;

/* ─── Pre-allocated objects for per-frame math (zero GC pressure) ─── */

const _euler = new Euler();
const _invMatrix = new Matrix4();
const _mouseLocal = new Vector3();

/** Radial gradient texture — parameterized by color stops */
const TEXTURE_SIZE = 32;
const TEXTURE_HALF = TEXTURE_SIZE / 2;

function useRadialTexture(stops: readonly (readonly [number, string])[]) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      TEXTURE_HALF, TEXTURE_HALF, 0,
      TEXTURE_HALF, TEXTURE_HALF, TEXTURE_HALF,
    );
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
    return new CanvasTexture(canvas);
  }, [stops]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const PARTICLE_GLOW_STOPS = [
  [0, "rgba(255,255,255,1)"],
  [0.4, "rgba(255,255,255,0.4)"],
  [1, "rgba(255,255,255,0)"],
] as const;

const STAR_GLOW_STOPS = [
  [0, "rgba(255,255,255,1)"],
  [0.5, "rgba(255,255,255,0.8)"],
  [0.8, "rgba(255,255,255,0.2)"],
  [1, "rgba(255,255,255,0)"],
] as const;

/** Subtle center bias — pow(0.7) */
function randomRadius() {
  return Math.pow(Math.random(), 0.7) * SPHERE_RADIUS;
}

/** Box-Muller transform for Gaussian distribution */
function gaussianRandom(stdDev: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev;
}

function randomSpherePoint(radius: number) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  };
}

/**
 * Project mouse NDC → local particle space.
 * Accounts for full rotation chain: group rotZ → points rotX → points rotY.
 * Inverse = Ry(-rotY) · Rx(-TILT_X) · Rz(-TILT_Z)  (Euler order YXZ)
 */
function projectMouseToLocal(
  mouseRef: MouseRef,
  rotY: number,
  cam: PerspectiveCamera,
  aspect: number,
): Vector3 {
  const vFOV = (cam.fov * Math.PI) / 180;
  const dist = cam.position.z;
  const halfH = Math.tan(vFOV / 2) * dist;
  const halfW = halfH * aspect;

  // NDC → world space at z=0 plane
  const worldX = mouseRef.current.x * halfW;
  const worldY = mouseRef.current.y * halfH;

  // Build inverse rotation: undo rotZ(TILT_Z) → rotX(TILT_X) → rotY(rotY)
  _euler.set(-TILT_X, -rotY, -TILT_Z, "YXZ");
  _invMatrix.makeRotationFromEuler(_euler);
  _mouseLocal.set(worldX, worldY, 0).applyMatrix4(_invMatrix);

  return _mouseLocal;
}

/** Shared repulsion logic for both particle layers */
function computeRepulsion(
  baseX: number,
  baseY: number,
  baseZ: number,
  mouse: Vector3,
) {
  const dx = baseX - mouse.x;
  const dy = baseY - mouse.y;
  const dz = baseZ - mouse.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (dist >= INTERACTION_RADIUS || dist === 0) {
    return { rx: 0, ry: 0, rz: 0 };
  }

  const force = (1 - dist / INTERACTION_RADIUS) * REPULSION_STRENGTH;
  return {
    rx: (dx / dist) * force,
    ry: (dy / dist) * force,
    rz: (dz / dist) * force,
  };
}

/**
 * Animate particle positions: base + drift + twinkle + mouse repulsion.
 * X/Z axes use sin, Y axis uses cos — keeps Y-dominant drift orthogonal to XZ rotation.
 * Pure function, mutates `arr` in place.
 */
function animateParticles(
  arr: Float32Array,
  bases: Float32Array,
  count: number,
  time: number,
  mouse: Vector3,
  anim: LayerAnimConfig,
): void {
  const { drift, twinkle } = anim;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const bx = bases[i3];
    const by = bases[i3 + 1];
    const bz = bases[i3 + 2];

    const dx = Math.sin(time * drift.x.freq + i * drift.x.phaseScale) * drift.x.amp;
    const dy = Math.cos(time * drift.y.freq + i * drift.y.phaseScale) * drift.y.amp;
    const dz = drift.z
      ? Math.sin(time * drift.z.freq + i * drift.z.phaseScale) * drift.z.amp
      : 0;
    const tw = Math.sin(
      time * (twinkle.baseFreq + (i % twinkle.modCount) * twinkle.modFreq)
        + i * twinkle.phaseScale,
    ) * twinkle.amp;

    const { rx, ry, rz } = computeRepulsion(bx, by, bz, mouse);

    arr[i3] = bx + dx + rx;
    arr[i3 + 1] = by + dy + tw + ry;
    arr[i3 + 2] = bz + dz + rz;
  }
}

/* ─── Main particle layer (2000 particles) ─── */

function ParticleConstellation({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<Points>(null);
  const positionsRef = useRef<BufferAttribute>(null);
  const texture = useRadialTexture(PARTICLE_GLOW_STOPS);

  const { positions, colors, basePositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const base = new Float32Array(PARTICLE_COUNT * 3);

    const cyan = new Color(COLOR_CYAN);
    const white = new Color(COLOR_SLATE_100);
    const coreCount = Math.floor(PARTICLE_COUNT * CORE_FRACTION);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      let x: number, y: number, z: number;
      let brightnessFactor: number;

      if (i < coreCount) {
        // Tight Gaussian core — dense, bright
        x = gaussianRandom(CORE_STD_DEV);
        y = gaussianRandom(CORE_STD_DEV);
        z = gaussianRandom(CORE_STD_DEV);
        brightnessFactor = CORE_BRIGHTNESS;
      } else {
        // Uniform scatter — sparse, deliberately dim
        const point = randomSpherePoint(randomRadius());
        x = point.x; y = point.y; z = point.z;
        brightnessFactor = SCATTER_BRIGHTNESS;
      }

      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      base[i3] = x; base[i3 + 1] = y; base[i3 + 2] = z;

      const color = Math.random() < CYAN_PROBABILITY ? cyan : white;
      col[i3] = Math.min(1, color.r * brightnessFactor);
      col[i3 + 1] = Math.min(1, color.g * brightnessFactor);
      col[i3 + 2] = Math.min(1, color.b * brightnessFactor);
    }

    return { positions: pos, colors: col, basePositions: base };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const arr = positionsRef.current.array as Float32Array;
    const cam = state.camera as PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouseToLocal(mouseRef, rotY, cam, aspect);

    animateParticles(arr, basePositions, PARTICLE_COUNT, state.clock.elapsedTime, mouse, CONSTELLATION_ANIM);

    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_RAD_PER_S * Math.min(delta, DELTA_CAP_S);
  });

  return (
    <points ref={pointsRef} rotation-x={TILT_X}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionsRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={PARTICLE_SIZE}
        vertexColors
        sizeAttenuation
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Bright stars layer (50 particles, twinkle + cursor) ─── */

function BrightStars({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<Points>(null);
  const positionsRef = useRef<BufferAttribute>(null);
  const texture = useRadialTexture(STAR_GLOW_STOPS);

  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const base = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const { x, y, z } = randomSpherePoint(randomRadius());
      const i3 = i * 3;
      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;
    }

    return { positions: pos, basePositions: base };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const arr = positionsRef.current.array as Float32Array;
    const cam = state.camera as PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouseToLocal(mouseRef, rotY, cam, aspect);

    animateParticles(arr, basePositions, STAR_COUNT, state.clock.elapsedTime, mouse, BRIGHT_STAR_ANIM);

    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_RAD_PER_S * Math.min(delta, DELTA_CAP_S);
  });

  return (
    <points ref={pointsRef} rotation-x={TILT_X}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionsRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={STAR_SIZE}
        color={COLOR_WHITE}
        sizeAttenuation
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Camera dive — scroll-linked fly-through ─── */

const CAMERA_Z_START = 12;
const DIVE_DEPTH = 8; // camera finishes at z=4 (inside the sphere of radius 6)
const DIVE_EXPONENT = 2.5; // exponential easing — slow start, accelerates
const DIVE_PROGRESS_END = 0.55; // complete dive before sticky unstick (0.6)

function CameraDive({ scrollRef }: { scrollRef: ScrollRef }) {
  useFrame((state) => {
    const rawProgress = scrollRef.current;
    const progress = Math.min(rawProgress / DIVE_PROGRESS_END, 1);
    const dive = Math.pow(progress, DIVE_EXPONENT) * DIVE_DEPTH;
    state.camera.position.z = CAMERA_Z_START - dive;
  });
  return null;
}

/* ─── Scene: shared mouseRef for both layers ─── */

function ConstellationScene({ scrollRef }: { scrollRef?: ScrollRef }) {
  const mouseRef = useRef(MOUSE_OFFSCREEN);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile]);

  return (
    <group rotation-z={TILT_Z}>
      {scrollRef && <CameraDive scrollRef={scrollRef} />}
      <ParticleConstellation mouseRef={mouseRef} />
      <BrightStars mouseRef={mouseRef} />
    </group>
  );
}

/* ─── Wrapper: lazy-loadable, fade-in, radial mask ─── */

export default function HeroParticles({ scrollRef, paused }: { scrollRef?: ScrollRef; paused?: boolean }) {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), FADE_IN_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (REDUCED_MOTION) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity duration-1500"
      style={{
        opacity: visible ? 1 : 0,
        maskImage: VIGNETTE_MASK,
        WebkitMaskImage: VIGNETTE_MASK,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z_START], fov: CAMERA_FOV }}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={paused ? "never" : "always"}
      >
        <ConstellationScene scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}

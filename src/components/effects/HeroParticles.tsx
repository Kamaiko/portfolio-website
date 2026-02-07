import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "../../hooks/useIsMobile";
import { REDUCED_MOTION } from "../../constants/accessibility";

/* ─── Tuning constants ─── */

const PARTICLE_COUNT = 2000;
const STAR_COUNT = 50;
const SPHERE_RADIUS = 6;
const INTERACTION_RADIUS = 4;
const REPULSION_STRENGTH = 0.25;
const ROTATION_SPEED = 0.0005; // ~210s per full rotation — ambient
const TILT_X = Math.PI * 0.083; // ~15° static forward lean
const TILT_Z = -Math.PI / 6; // ~30° diagonal rotation axis (10h→4h)

type MouseRef = React.RefObject<{ x: number; y: number }>;

/* ─── Pre-allocated objects for per-frame math (zero GC pressure) ─── */

const _euler = new THREE.Euler();
const _invMatrix = new THREE.Matrix4();
const _mouseLocal = new THREE.Vector3();

/** Programmatic circle texture with soft glow */
function useCircleTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Brighter texture for star layer — broader white core */
function useBrightStarTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.8)");
    gradient.addColorStop(0.8, "rgba(255,255,255,0.2)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Subtle center bias — pow(0.7) */
function randomRadius() {
  return Math.pow(Math.random(), 0.7) * SPHERE_RADIUS;
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
  cam: THREE.PerspectiveCamera,
  aspect: number,
): THREE.Vector3 {
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
  mouse: THREE.Vector3,
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

/* ─── Main particle layer (2000 particles) ─── */

function ParticleConstellation({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useCircleTexture();

  const { positions, colors, basePositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const base = new Float32Array(PARTICLE_COUNT * 3);

    const cyan = new THREE.Color("#22d3ee");
    const white = new THREE.Color("#f1f5f9");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const { x, y, z } = randomSpherePoint(randomRadius());
      const i3 = i * 3;

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;
      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      // eslint-disable-next-line react-hooks/purity -- intentional one-time random seed
      const color = Math.random() < 0.7 ? cyan : white;
      col[i3] = color.r;
      col[i3 + 1] = color.g;
      col[i3 + 2] = color.b;
    }

    return { positions: pos, colors: col, basePositions: base };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const arr = positionsRef.current.array as Float32Array;
    const t = state.clock.elapsedTime;
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouseToLocal(mouseRef, rotY, cam, aspect);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      // Ambient float — visible at ~4px movement
      const driftX = Math.sin(t * 0.3 + i * 0.01) * 0.06;
      const driftY = Math.cos(t * 0.4 + i * 0.02) * 0.06;
      const driftZ = Math.sin(t * 0.5 + i * 0.015) * 0.02;

      // Subtle Z twinkle — shimmer via sizeAttenuation
      const twinkle =
        Math.sin(t * (0.8 + (i % 7) * 0.3) + i * 1.7) * 0.2;

      const { rx, ry, rz } = computeRepulsion(bx, by, bz, mouse);

      arr[i3] = bx + driftX + rx;
      arr[i3 + 1] = by + driftY + ry;
      arr[i3 + 2] = bz + driftZ + rz + twinkle;
    }

    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_SPEED;
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
        size={0.05}
        vertexColors
        sizeAttenuation
        transparent
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Bright stars layer (50 particles, twinkle + cursor) ─── */

function BrightStars({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useBrightStarTexture();

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

  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const arr = positionsRef.current.array as Float32Array;
    const t = state.clock.elapsedTime;
    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouseToLocal(mouseRef, rotY, cam, aspect);

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const bx = basePositions[i3];
      const by = basePositions[i3 + 1];
      const bz = basePositions[i3 + 2];

      // Gentle float
      const driftX = Math.sin(t * 0.2 + i * 0.05) * 0.04;
      const driftY = Math.cos(t * 0.3 + i * 0.04) * 0.04;

      // Moderate Z twinkle — visible pulsing, not chaotic jumping
      const twinkle =
        Math.sin(t * (0.4 + (i % 7) * 0.25) + i * 2.1) * 0.5;

      const { rx, ry, rz } = computeRepulsion(bx, by, bz, mouse);

      arr[i3] = bx + driftX + rx;
      arr[i3 + 1] = by + driftY + ry;
      arr[i3 + 2] = bz + twinkle + rz;
    }

    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_SPEED;
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
        size={0.09}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Scene: shared mouseRef for both layers ─── */

function ConstellationScene() {
  const mouseRef = useRef({ x: 100, y: 100 });
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
      <ParticleConstellation mouseRef={mouseRef} />
      <BrightStars mouseRef={mouseRef} />
    </group>
  );
}

/* ─── Wrapper: lazy-loadable, fade-in, radial mask ─── */

export default function HeroParticles() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (REDUCED_MOTION) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity duration-1500"
      style={{
        opacity: visible ? 1 : 0,
        maskImage:
          "radial-gradient(ellipse at center, black 50%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 50%, transparent 100%)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
      >
        <ConstellationScene />
      </Canvas>
    </div>
  );
}

/* eslint-disable react-hooks/purity -- intentional one-time random seed in useMemo */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/**
 * Demo 20: Dual Distribution — Tight Gaussian Core + Dim Uniform Scatter
 * 70% particles: Gaussian (stdDev 1.0) for dense bright core
 * 30% particles: Uniform spherical, deliberately dim
 * NO radial mask — full distribution visible for comparison.
 */

/* ─── Constants ─── */

const PARTICLE_COUNT = 2000;
const STAR_COUNT = 50;
const SPHERE_RADIUS = 6;
const INTERACTION_RADIUS = 4;
const REPULSION_STRENGTH = 0.25;
const ROTATION_RAD_PER_S = 0.03;
const TILT_X = Math.PI * 0.083;
const TILT_Z = -Math.PI / 6;
const CORE_FRACTION = 0.7;
const CORE_STD_DEV = 1.0;
const CORE_BRIGHTNESS = 1.3;
const SCATTER_BRIGHTNESS = 0.5;

const TEXTURE_SIZE = 32;
const TEXTURE_HALF = TEXTURE_SIZE / 2;

/* ─── Pre-allocated objects ─── */

const _euler = new THREE.Euler();
const _invMatrix = new THREE.Matrix4();
const _mouseLocal = new THREE.Vector3();

/* ─── Textures ─── */

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
    return new THREE.CanvasTexture(canvas);
  }, [stops]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ─── Distribution helpers ─── */

/** Box-Muller transform for Gaussian distribution */
function gaussianRandom(stdDev: number) {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * stdDev;
}

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

/* ─── Shared math ─── */

function projectMouseToLocal(
  mouseRef: React.RefObject<{ x: number; y: number }>,
  rotY: number,
  cam: THREE.PerspectiveCamera,
  aspect: number,
): THREE.Vector3 {
  const vFOV = (cam.fov * Math.PI) / 180;
  const dist = cam.position.z;
  const halfH = Math.tan(vFOV / 2) * dist;
  const halfW = halfH * aspect;
  const worldX = mouseRef.current.x * halfW;
  const worldY = mouseRef.current.y * halfH;
  _euler.set(-TILT_X, -rotY, -TILT_Z, "YXZ");
  _invMatrix.makeRotationFromEuler(_euler);
  _mouseLocal.set(worldX, worldY, 0).applyMatrix4(_invMatrix);
  return _mouseLocal;
}

function computeRepulsion(
  baseX: number, baseY: number, baseZ: number,
  mouse: THREE.Vector3,
) {
  const dx = baseX - mouse.x;
  const dy = baseY - mouse.y;
  const dz = baseZ - mouse.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist >= INTERACTION_RADIUS || dist === 0) return { rx: 0, ry: 0, rz: 0 };
  const force = (1 - dist / INTERACTION_RADIUS) * REPULSION_STRENGTH;
  return { rx: (dx / dist) * force, ry: (dy / dist) * force, rz: (dz / dist) * force };
}

/* ─── Main particle layer ─── */

type MouseRef = React.RefObject<{ x: number; y: number }>;

function ParticleConstellation({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useRadialTexture(PARTICLE_GLOW_STOPS);

  const { positions, colors, basePositions } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const base = new Float32Array(PARTICLE_COUNT * 3);
    const cyan = new THREE.Color("#22d3ee");
    const white = new THREE.Color("#f1f5f9");
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

      const color = Math.random() < 0.7 ? cyan : white;
      col[i3] = Math.min(1, color.r * brightnessFactor);
      col[i3 + 1] = Math.min(1, color.g * brightnessFactor);
      col[i3 + 2] = Math.min(1, color.b * brightnessFactor);
    }
    return { positions: pos, colors: col, basePositions: base };
  }, []);

  useFrame((state, delta) => {
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
      const driftX = Math.sin(t * 0.3 + i * 0.01) * 0.06;
      const driftY = Math.cos(t * 0.4 + i * 0.02) * 0.06;
      const driftZ = Math.sin(t * 0.5 + i * 0.015) * 0.02;
      const twinkle = Math.sin(t * (0.8 + (i % 7) * 0.3) + i * 1.7) * 0.2;
      const { rx, ry, rz } = computeRepulsion(bx, by, bz, mouse);
      arr[i3] = bx + driftX + rx;
      arr[i3 + 1] = by + driftY + ry;
      arr[i3 + 2] = bz + driftZ + rz + twinkle;
    }
    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_RAD_PER_S * delta;
  });

  return (
    <points ref={pointsRef} rotation-x={TILT_X}>
      <bufferGeometry>
        <bufferAttribute ref={positionsRef} attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture} size={0.05} vertexColors sizeAttenuation
        transparent opacity={1.0} blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  );
}

/* ─── Bright stars layer ─── */

function BrightStars({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useRadialTexture(STAR_GLOW_STOPS);

  const { positions, basePositions } = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const base = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const { x, y, z } = randomSpherePoint(randomRadius());
      const i3 = i * 3;
      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
      base[i3] = x; base[i3 + 1] = y; base[i3 + 2] = z;
    }
    return { positions: pos, basePositions: base };
  }, []);

  useFrame((state, delta) => {
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
      const driftX = Math.sin(t * 0.2 + i * 0.05) * 0.04;
      const driftY = Math.cos(t * 0.3 + i * 0.04) * 0.04;
      const twinkle = Math.sin(t * (0.4 + (i % 7) * 0.25) + i * 2.1) * 0.5;
      const { rx, ry, rz } = computeRepulsion(bx, by, bz, mouse);
      arr[i3] = bx + driftX + rx;
      arr[i3 + 1] = by + driftY + ry;
      arr[i3 + 2] = bz + twinkle + rz;
    }
    positionsRef.current.needsUpdate = true;
    pointsRef.current.rotation.y += ROTATION_RAD_PER_S * delta;
  });

  return (
    <points ref={pointsRef} rotation-x={TILT_X}>
      <bufferGeometry>
        <bufferAttribute ref={positionsRef} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture} size={0.09} color="#ffffff" sizeAttenuation
        transparent opacity={1.0} blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  );
}

/* ─── Scene ─── */

function ConstellationScene() {
  const mouseRef = useRef({ x: 100, y: 100 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <group rotation-z={TILT_Z}>
      <ParticleConstellation mouseRef={mouseRef} />
      <BrightStars mouseRef={mouseRef} />
    </group>
  );
}

/* ─── Demo wrapper ─── */

export default function HeroParticlesHaloBDemo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DemoSection
      number={20}
      title="Halo B — Gaussienne serre + scatter sombre"
      description="70% Gaussian core (stdDev 1.0, +30% luminosite) + 30% scatter (50% luminosite). Forte separation noyau/periphere. Pas de masque radial."
    >
      <div
        className="relative h-screen overflow-hidden rounded-lg bg-slate-950 transition-opacity duration-1500"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <Canvas
          className="absolute inset-0"
          camera={{ position: [0, 0, 12], fov: 60 }}
          dpr={[1, 1.5]}
        >
          <ConstellationScene />
        </Canvas>

        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center">
          <h1 className="text-6xl font-bold tracking-tight text-slate-100">
            Patrick Patenaude
          </h1>
          <p className="mt-4 text-xl text-cyan-400">Développeur Full-Stack</p>
        </div>
      </div>
    </DemoSection>
  );
}

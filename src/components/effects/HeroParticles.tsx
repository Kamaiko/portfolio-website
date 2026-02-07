import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "../../hooks/useIsMobile";

const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const PARTICLE_COUNT = 2000;
const STAR_COUNT = 50;
const SPHERE_RADIUS = 5;
const INTERACTION_RADIUS = 4;
const REPULSION_STRENGTH = 0.25;
const ROTATION_SPEED = 0.0003;
const TILT_X = Math.PI * 0.083; // ~15° static tilt
const TILT_Z = -Math.PI / 6; // ~30° diagonal rotation axis (10h→4h)

type MouseRef = React.RefObject<{ x: number; y: number }>;

/** Programmatic circle texture with soft glow */
function useCircleTexture() {
  return useMemo(() => {
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
}

/** Subtle center bias — pow(0.7) between uniform and heavy concentration */
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

/** Project mouse NDC to local space accounting for group Y rotation */
function projectMouse(
  mouseRef: MouseRef,
  rotY: number,
  cam: THREE.PerspectiveCamera,
  aspect: number,
) {
  const vFOV = (cam.fov * Math.PI) / 180;
  const dist = cam.position.z;
  const halfH = Math.tan(vFOV / 2) * dist;
  const halfW = halfH * aspect;
  const mx = mouseRef.current.x * halfW;
  const my = mouseRef.current.y * halfH;

  const cosR = Math.cos(rotY);
  const sinR = Math.sin(rotY);
  return { x: mx * cosR, y: my, z: -mx * sinR };
}

/* ─── Main particle layer (2000 particles, interactive) ─── */

function ParticleConstellation({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useCircleTexture();

  const { positions, colors, basePositions } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);

    const cyan = new THREE.Color("#22d3ee");
    const white = new THREE.Color("#f1f5f9");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const { x, y, z } = randomSpherePoint(randomRadius());
      const i3 = i * 3;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;

      // eslint-disable-next-line react-hooks/purity -- intentional one-time random seed
      const color = Math.random() < 0.7 ? cyan : white;
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return { positions, colors, basePositions };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const posArray = positionsRef.current.array as Float32Array;
    const time = state.clock.elapsedTime;

    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouse(mouseRef, rotY, cam, aspect);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];

      // Ambient drift
      const driftX = Math.sin(time * 0.3 + i * 0.01) * 0.02;
      const driftY = Math.cos(time * 0.4 + i * 0.02) * 0.02;
      const driftZ = Math.sin(time * 0.5 + i * 0.015) * 0.02;

      // Twinkle: Z oscillation → sizeAttenuation makes it shimmer
      const twinkle =
        Math.sin(time * (0.8 + (i % 7) * 0.3) + i * 1.7) * 0.15;

      // Repulsion
      const dx = baseX - mouse.x;
      const dy = baseY - mouse.y;
      const dz = baseZ - mouse.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;

      if (distance < INTERACTION_RADIUS && distance > 0) {
        const force =
          (1 - distance / INTERACTION_RADIUS) * REPULSION_STRENGTH;
        repulseX = (dx / distance) * force;
        repulseY = (dy / distance) * force;
        repulseZ = (dz / distance) * force;
      }

      posArray[i3] = baseX + driftX + repulseX;
      posArray[i3 + 1] = baseY + driftY + repulseY;
      posArray[i3 + 2] = baseZ + driftZ + repulseZ + twinkle;
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
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Bright stars layer (50 particles, cursor-interactive, twinkle) ─── */

function BrightStars({ mouseRef }: { mouseRef: MouseRef }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const texture = useCircleTexture();

  const { positions, basePositions } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const basePositions = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const { x, y, z } = randomSpherePoint(randomRadius());
      const i3 = i * 3;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      basePositions[i3] = x;
      basePositions[i3 + 1] = y;
      basePositions[i3 + 2] = z;
    }

    return { positions, basePositions };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const posArray = positionsRef.current.array as Float32Array;
    const time = state.clock.elapsedTime;

    const cam = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / state.size.height;
    const rotY = pointsRef.current.rotation.y;
    const mouse = projectMouse(mouseRef, rotY, cam, aspect);

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;

      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];

      // Gentle drift
      const driftX = Math.sin(time * 0.2 + i * 0.05) * 0.03;
      const driftY = Math.cos(time * 0.3 + i * 0.04) * 0.03;

      // Aggressive Z twinkle — sizeAttenuation creates visible pulsing
      const twinkle =
        Math.sin(time * (0.4 + (i % 7) * 0.25) + i * 2.1) * 1.5;

      // Repulsion (same as main particles)
      const dx = baseX - mouse.x;
      const dy = baseY - mouse.y;
      const dz = baseZ - mouse.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;

      if (distance < INTERACTION_RADIUS && distance > 0) {
        const force =
          (1 - distance / INTERACTION_RADIUS) * REPULSION_STRENGTH;
        repulseX = (dx / distance) * force;
        repulseY = (dy / distance) * force;
        repulseZ = (dz / distance) * force;
      }

      posArray[i3] = baseX + driftX + repulseX;
      posArray[i3 + 1] = baseY + driftY + repulseY;
      posArray[i3 + 2] = baseZ + twinkle + repulseZ;
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

/* ─── Wrapper: lazy-loadable, fade-in, mask ─── */

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

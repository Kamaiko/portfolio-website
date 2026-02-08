/* eslint-disable react-hooks/purity -- intentional one-time random seed in useMemo */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/* ─── Tuning constants ─── */

const SAMPLE_W = 150;
const SAMPLE_H = 50;
const FONT_SIZE = 42;
const PIXEL_STEP = 2; // sample every Nth pixel → controls particle count
const WORLD_SCALE = 0.06; // pixel → world unit
const SPRING_K = 6.0;
const DAMPING = 0.93;
const REPULSION_RADIUS = 2.5;
const REPULSION_FORCE = 12;
const EXPLOSION_IMPULSE = 8;
const PARTICLE_SIZE = 0.06;

/* ─── Pre-allocated ─── */

const _vec3 = new THREE.Vector3();

/* ─── Radial gradient texture (reusable pattern from HeroParticles) ─── */

const TEX_SIZE = 32;
const TEX_HALF = TEX_SIZE / 2;

function makeParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    TEX_HALF, TEX_HALF, 0,
    TEX_HALF, TEX_HALF, TEX_HALF,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  return new THREE.CanvasTexture(canvas);
}

/* ─── Text sampling → target positions ─── */

function sampleTextPositions(): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${FONT_SIZE}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("404", SAMPLE_W / 2, SAMPLE_H / 2);

  const imageData = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
  const points: number[] = [];

  for (let y = 0; y < SAMPLE_H; y += PIXEL_STEP) {
    for (let x = 0; x < SAMPLE_W; x += PIXEL_STEP) {
      const alpha = imageData.data[(y * SAMPLE_W + x) * 4 + 3];
      if (alpha > 128) {
        points.push(
          (x - SAMPLE_W / 2) * WORLD_SCALE,
          -(y - SAMPLE_H / 2) * WORLD_SCALE,
          0,
        );
      }
    }
  }
  return new Float32Array(points);
}

/* ─── Particle scene ─── */

function Particles404Scene() {
  const pointsRef = useRef<THREE.Points>(null);
  const posAttrRef = useRef<THREE.BufferAttribute>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const { size } = useThree();

  const { targets, positions, colors, count } = useMemo(() => {
    const targets = sampleTextPositions();
    const count = targets.length / 3;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cyan = new THREE.Color("#22d3ee");
    const white = new THREE.Color("#f1f5f9");

    // Start particles scattered randomly, they'll spring toward targets
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 6;
      positions[i3 + 2] = (Math.random() - 0.5) * 4;

      const c = Math.random() < 0.7 ? cyan : white;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    return { targets, positions, colors, count };
  }, []);

  // Initialize velocities
  useEffect(() => {
    velocitiesRef.current = new Float32Array(count * 3);
  }, [count]);

  const texture = useMemo(() => makeParticleTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  // Click → explosion
  const handleClick = useCallback(() => {
    const vel = velocitiesRef.current;
    if (!vel) return;
    for (let i = 0; i < vel.length / 3; i++) {
      const i3 = i * 3;
      vel[i3] += (Math.random() - 0.5) * EXPLOSION_IMPULSE;
      vel[i3 + 1] += (Math.random() - 0.5) * EXPLOSION_IMPULSE;
      vel[i3 + 2] += (Math.random() - 0.5) * EXPLOSION_IMPULSE * 0.5;
    }
  }, []);

  useFrame((state, delta) => {
    if (!posAttrRef.current || !velocitiesRef.current) return;

    const arr = posAttrRef.current.array as Float32Array;
    const vel = velocitiesRef.current;
    const dt = Math.min(delta, 0.05);
    const pointer = state.pointer;

    // Project pointer to world space at z=0
    const cam = state.camera as THREE.PerspectiveCamera;
    const vFOV = (cam.fov * Math.PI) / 180;
    const dist = cam.position.z;
    const halfH = Math.tan(vFOV / 2) * dist;
    const halfW = halfH * (size.width / size.height);
    const mouseX = pointer.x * halfW;
    const mouseY = pointer.y * halfH;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Current position
      const cx = arr[i3];
      const cy = arr[i3 + 1];
      const cz = arr[i3 + 2];

      // Target
      const tx = targets[i3];
      const ty = targets[i3 + 1];
      const tz = targets[i3 + 2];

      // Spring force toward target
      vel[i3] += (tx - cx) * SPRING_K * dt;
      vel[i3 + 1] += (ty - cy) * SPRING_K * dt;
      vel[i3 + 2] += (tz - cz) * SPRING_K * dt;

      // Mouse repulsion
      _vec3.set(cx - mouseX, cy - mouseY, cz);
      const dist2 = _vec3.lengthSq();
      if (dist2 < REPULSION_RADIUS * REPULSION_RADIUS && dist2 > 0.001) {
        const d = Math.sqrt(dist2);
        const force = (1 - d / REPULSION_RADIUS) * REPULSION_FORCE * dt;
        vel[i3] += (_vec3.x / d) * force;
        vel[i3 + 1] += (_vec3.y / d) * force;
        vel[i3 + 2] += (_vec3.z / d) * force;
      }

      // Damping
      vel[i3] *= DAMPING;
      vel[i3 + 1] *= DAMPING;
      vel[i3 + 2] *= DAMPING;

      // Integrate
      arr[i3] += vel[i3] * dt;
      arr[i3 + 1] += vel[i3 + 1] * dt;
      arr[i3 + 2] += vel[i3 + 2] * dt;
    }

    posAttrRef.current.needsUpdate = true;
  });

  return (
    <group onClick={handleClick}>
      {/* Invisible click plane */}
      <mesh visible={false}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial />
      </mesh>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            ref={posAttrRef}
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          size={PARTICLE_SIZE}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ─── Wrapper ─── */

export default function Particles404Demo() {
  return (
    <DemoSection
      number={10}
      title="Particules 404 — Texte Magnetique"
      description="Des particules forment '404'. La souris les repousse, elles reviennent en spring. Cliquez pour une explosion — elles se reforment toutes seules."
    >
      <div className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          dpr={[1, 1.5]}
        >
          <Particles404Scene />
        </Canvas>
      </div>
    </DemoSection>
  );
}

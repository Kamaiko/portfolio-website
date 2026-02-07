import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/**
 * Demo 16: Nebula Distribution Hero Particles
 * 2500 particles with Gaussian distribution (denser at center, sparse at edges)
 */

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  // Store initial positions and sizes for repulsion
  const { positions, colors, sizes, initialPositions } = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const initialPositions = new Float32Array(count * 3);

    // Cyan + white color mix (70/30)
    const cyan = new THREE.Color(0x22d3ee);
    const white = new THREE.Color(0xf1f5f9);

    // Box-Muller transform for Gaussian distribution
    const gaussianRandom = (stdDev: number) => {
      const u1 = Math.random();
      const u2 = Math.random();
      const r = Math.sqrt(-2 * Math.log(u1));
      return r * Math.cos(2 * Math.PI * u2) * stdDev;
    };

    for (let i = 0; i < count; i++) {
      // Gaussian distribution: wider than tall, mostly flat
      const x = gaussianRandom(2.5); // stdDev = 2.5 for width
      const y = gaussianRandom(1.5); // stdDev = 1.5 for height
      const z = gaussianRandom(0.3); // stdDev = 0.3 for depth (flat)

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // Calculate distance from center for size/brightness variation
      const distFromCenter = Math.sqrt(x * x + y * y);
      const isCore = distFromCenter < 2;

      // Particles near center: larger and brighter
      sizes[i] = isCore ? 0.08 : 0.05;

      // 70% cyan, 30% white
      const color = Math.random() < 0.7 ? cyan : white;
      const brightness = isCore ? 1.0 : 0.7; // Brighter in the core
      colors[i * 3] = color.r * brightness;
      colors[i * 3 + 1] = color.g * brightness;
      colors[i * 3 + 2] = color.b * brightness;
    }

    return { positions, colors, sizes, initialPositions };
  }, []);

  // Track mouse position and apply repulsion
  useFrame((state) => {
    if (!particlesRef.current) return;

    const cam = state.camera as THREE.PerspectiveCamera;
    const vFOV = (cam.fov * Math.PI) / 180;
    const dist = cam.position.z;
    const halfH = Math.tan(vFOV / 2) * dist;
    const halfW = halfH * (state.size.width / state.size.height);
    const mouseX = state.pointer.x * halfW;
    const mouseY = state.pointer.y * halfH;

    // Apply cursor repulsion
    const posArray = particlesRef.current.geometry.attributes.position
      .array as Float32Array;
    const interactionRadius = 4;
    const repulsionStrength = 0.3;

    for (let i = 0; i < posArray.length / 3; i++) {
      const idx = i * 3;
      const initialX = initialPositions[idx];
      const initialY = initialPositions[idx + 1];
      const initialZ = initialPositions[idx + 2];

      const dx = initialX - mouseX;
      const dy = initialY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < interactionRadius) {
        const force = (1 - distance / interactionRadius) * repulsionStrength;
        posArray[idx] = initialX + dx * force;
        posArray[idx + 1] = initialY + dy * force;
      } else {
        // Smooth return to initial position
        posArray[idx] += (initialX - posArray[idx]) * 0.1;
        posArray[idx + 1] += (initialY - posArray[idx + 1]) * 0.1;
      }
      posArray[idx + 2] = initialZ;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}

export default function HeroParticlesNebulaDemo() {
  return (
    <DemoSection
      number={16}
      title="Hero Particles — Nébuleuse"
      description="2500 particles with Gaussian distribution (Box-Muller transform). Denser and brighter at center, sparse at edges."
    >
      <div className="relative h-[500px] overflow-hidden rounded-lg bg-slate-950">
        {/* Canvas behind */}
        <Canvas
          className="absolute inset-0 pointer-events-none"
          camera={{ position: [0, 0, 10], fov: 60 }}
        >
          <ParticleField />
        </Canvas>

        {/* Mock hero text on top */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center pointer-events-none">
          <h1 className="text-6xl font-bold text-slate-100 tracking-tight">
            Patrick Patenaude
          </h1>
          <p className="mt-4 text-xl text-cyan-400">Développeur Full-Stack</p>
        </div>
      </div>
    </DemoSection>
  );
}

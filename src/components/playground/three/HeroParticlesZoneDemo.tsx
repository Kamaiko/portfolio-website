/* eslint-disable react-hooks/purity -- intentional one-time random seed in useMemo */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/**
 * Demo 15: Centered Zone Hero Particles
 * 1500 particles in a smaller sphere with fade-out edges
 */

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  // Store initial positions for repulsion
  const { positions, colors, initialPositions } = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);

    // Cyan + white color mix (70/30)
    const cyan = new THREE.Color(0x22d3ee);
    const white = new THREE.Color(0xf1f5f9);

    for (let i = 0; i < count; i++) {
      // Smaller sphere distribution (radius 4)
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.cbrt(Math.random()) * 4;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      // 70% cyan, 30% white
      const color = Math.random() < 0.7 ? cyan : white;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors, initialPositions };
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
        posArray[idx + 2] = initialZ;
      } else {
        // Smooth return to initial position
        posArray[idx] += (initialX - posArray[idx]) * 0.1;
        posArray[idx + 1] += (initialY - posArray[idx + 1]) * 0.1;
        posArray[idx + 2] += (initialZ - posArray[idx + 2]) * 0.1;
      }
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
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroParticlesZoneDemo() {
  return (
    <DemoSection
      number={9}
      title="Hero Particles — Zone Centrée"
      description="1500 particles in a centered zone with radial fade-out edges. Tighter camera view for a focused effect."
    >
      <div className="relative mx-auto w-[600px] h-[300px] overflow-hidden rounded-lg bg-slate-950">
        {/* Canvas with radial fade mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 100%)",
          }}
        >
          <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
            <ParticleField />
          </Canvas>
        </div>

        {/* Mock hero text on top */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-bold text-slate-100 tracking-tight">
            Patrick Patenaude
          </h1>
          <p className="mt-3 text-lg text-cyan-400">Développeur Full-Stack</p>
        </div>
      </div>
    </DemoSection>
  );
}

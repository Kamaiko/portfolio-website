import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/**
 * Demo 14: Full Viewport Hero Particles
 * 2000 particles in a wide flat disc with cursor repulsion
 */

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);

  // Store initial positions for repulsion
  const { positions, colors, initialPositions } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);

    // Cyan + white color mix (70/30)
    const cyan = new THREE.Color(0x22d3ee);
    const white = new THREE.Color(0xf1f5f9);

    for (let i = 0; i < count; i++) {
      // Flat disc distribution (radius 8, small y spread)
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 8;
      const x = Math.cos(angle) * radius;
      const y = (Math.random() - 0.5) * 1.0; // Small y spread (±0.5)
      const z = (Math.random() - 0.5) * 0.5;

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

  // Track mouse position
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
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroParticlesFullDemo() {
  return (
    <DemoSection
      number={14}
      title="Hero Particles — Full Viewport"
      description="2000 particles in a wide flat disc with pronounced cursor repulsion. Canvas fills the hero viewport, text overlays on top."
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

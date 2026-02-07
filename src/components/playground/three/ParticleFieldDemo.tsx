import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import DemoSection from '../DemoSection';

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);

  // Generate initial positions, colors, and sizes
  const { positions, colors, sizes, basePositions } = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const basePositions = new Float32Array(count * 3);

    const cyanColor = new THREE.Color('#22d3ee');
    const whiteColor = new THREE.Color('#f1f5f9');

    for (let i = 0; i < count; i++) {
      // Random position in sphere
      const radius = Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;

      // 70% cyan, 30% white
      const color = Math.random() < 0.7 ? cyanColor : whiteColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random size
      sizes[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions, colors, sizes, basePositions };
  }, []);

  // Animation and interaction
  useFrame((state) => {
    if (!pointsRef.current || !positionsRef.current) return;

    const positions = positionsRef.current.array as Float32Array;
    const time = state.clock.elapsedTime;
    const pointer = state.pointer;

    // Project pointer from NDC to world-space at z=0 (interaction plane)
    const cam = state.camera as THREE.PerspectiveCamera;
    const vFOV = (cam.fov * Math.PI) / 180;
    const dist = cam.position.z;
    const halfH = Math.tan(vFOV / 2) * dist;
    const halfW = halfH * (state.size.width / state.size.height);
    const mouseX = pointer.x * halfW;
    const mouseY = pointer.y * halfH;
    const mouseZ = 0;

    const interactionRadius = 4;
    const repulsionStrength = 0.3;

    // Update particle positions
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;

      // Get base position
      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      const baseZ = basePositions[i3 + 2];

      // Ambient drift
      const driftX = Math.sin(time * 0.3 + i * 0.01) * 0.02;
      const driftY = Math.cos(time * 0.4 + i * 0.02) * 0.02;
      const driftZ = Math.sin(time * 0.5 + i * 0.015) * 0.02;

      // Calculate distance to mouse
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const dz = baseZ - mouseZ;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // Repulsion effect
      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;

      if (distance < interactionRadius && distance > 0) {
        const force = (1 - distance / interactionRadius) * repulsionStrength;
        repulseX = (dx / distance) * force;
        repulseY = (dy / distance) * force;
        repulseZ = (dz / distance) * force;
      }

      // Apply all effects
      positions[i3] = baseX + driftX + repulseX;
      positions[i3 + 1] = baseY + driftY + repulseY;
      positions[i3 + 2] = baseZ + driftZ + repulseZ;
    }

    positionsRef.current.needsUpdate = true;

    // Slow rotation
    pointsRef.current.rotation.y += 0.0008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionsRef}
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
        size={0.05}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleFieldDemo() {
  return (
    <DemoSection
      number={11}
      title="Particules Interactives"
      description="Champ de 2000 particules 3D réagissant au mouvement de la souris avec effet de répulsion et animation cosmique. Les particules dérivent doucement dans l'espace tout en s'écartant du curseur."
    >
      <div className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          dpr={[1, 1.5]}
        >
          <ParticleField />
        </Canvas>
      </div>
    </DemoSection>
  );
}

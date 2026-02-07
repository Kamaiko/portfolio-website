import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import DemoSection from '../DemoSection';

function WaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create geometry with high segment count for smooth waves
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(10, 10, 48, 48);
  }, []);

  // Store original positions for wave calculation
  const originalPositions = useMemo(() => {
    const pos = geometry.attributes.position;
    return Float32Array.from(pos.array);
  }, [geometry]);

  // Create color attribute
  useMemo(() => {
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [geometry]);

  // Pre-allocate colors for the animation loop (avoids GC pressure)
  const slateColor = useMemo(() => new THREE.Color(0.118, 0.161, 0.231), []);
  const cyanColor = useMemo(() => new THREE.Color(0.133, 0.827, 0.933), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const position = meshRef.current.geometry.attributes.position;
    const color = meshRef.current.geometry.attributes.color;

    for (let i = 0; i < position.count; i++) {
      const i3 = i * 3;
      const x = originalPositions[i3];
      // PlaneGeometry is X-Y: use Y (i3+1) as the second wave axis (Z is always 0)
      const origY = originalPositions[i3 + 1];

      const y = Math.sin(x * 0.5 + time * 0.8) * Math.cos(origY * 0.5 + time * 0.6) * 0.4;
      position.setY(i, y);

      const lerpFactor = y < 0 ? 0 : y > 0.3 ? 1 : y / 0.3;
      tempColor.copy(slateColor).lerp(cyanColor, lerpFactor);
      color.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
    }

    // Mark attributes as needing update
    position.needsUpdate = true;
    color.needsUpdate = true;

    // Recompute normals for correct lighting
    meshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation-x={-Math.PI / 2}>
      <meshStandardMaterial
        flatShading
        vertexColors
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <WaveMesh />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
        enableZoom={false}
      />
    </>
  );
}

export default function WaveMeshDemo() {
  return (
    <DemoSection
      number={13}
      title="Vague Mesh / Terrain"
      description="Terrain ondulant animé avec géométrie low-poly. Les vagues sinusoïdales se propagent en temps réel, créant un paysage hypnotique avec dégradés de couleur basés sur l'altitude."
    >
      <div className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <Canvas
          camera={{ position: [6, 4, 6], fov: 50 }}
          dpr={[1, 1.5]}
        >
          <Scene />
        </Canvas>
      </div>
    </DemoSection>
  );
}

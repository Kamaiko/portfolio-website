import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import DemoSection from '../DemoSection';

function RotatingGeometry({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationSpeed = useRef({ x: 0.003, y: 0.005 });
  const scaleRef = useRef(1);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2, 1), []);

  useFrame(() => {
    if (!groupRef.current) return;

    const targetSpeedX = isHovered ? 0.012 : 0.003;
    const targetSpeedY = isHovered ? 0.020 : 0.005;
    const targetScale = isHovered ? 1.1 : 1.0;

    rotationSpeed.current.x = THREE.MathUtils.lerp(rotationSpeed.current.x, targetSpeedX, 0.05);
    rotationSpeed.current.y = THREE.MathUtils.lerp(rotationSpeed.current.y, targetSpeedY, 0.05);
    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.05);

    groupRef.current.rotation.x += rotationSpeed.current.x;
    groupRef.current.rotation.y += rotationSpeed.current.y;
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe layer */}
      <mesh geometry={geometry}>
        <meshBasicMaterial wireframe color="#22d3ee" opacity={0.6} transparent />
      </mesh>
      {/* Subtle fill layer */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#22d3ee" opacity={0.03} transparent />
      </mesh>
    </group>
  );
}

export default function AbstractGeometryDemo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <DemoSection
      number={8}
      title="Geometrie Abstraite"
      description="Icosaedre filaire avec animation de rotation fluide. Survolez pour accelerer la rotation et agrandir la forme."
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50 }}
            dpr={[1, 1.5]}
          >
            <RotatingGeometry isHovered={isHovered} />
          </Canvas>
        </div>
      </div>
    </DemoSection>
  );
}

import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Text3D, Center, Float, Environment, ContactShadows, Sparkles } from "@react-three/drei";

const FONT_URL = "/fonts/helvetiker-bold.typeface.json";

interface Props {
  onReady: () => void;
}

function ReadySignal({ onReady }: Props) {
  useEffect(onReady, [onReady]);
  return null;
}

function Scene({ onReady }: Props) {
  return (
    <>
      <ReadySignal onReady={onReady} />

      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <Center>
          <Text3D
            font={FONT_URL}
            size={2.5}
            height={0.5}
            bevelEnabled
            bevelThickness={0.03}
            bevelSize={0.02}
            bevelSegments={4}
          >
            404
            <meshStandardMaterial
              color="#38bdf8"
              metalness={0.6}
              roughness={0.25}
              envMapIntensity={0.6}
              emissive="#38bdf8"
              emissiveIntensity={0.02}
            />
          </Text3D>
        </Center>
      </Float>

      <Sparkles count={40} scale={6} size={2} speed={0.4} color="#60a5fa" opacity={0.3} />

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
        color="#38bdf8"
      />

      <Environment preset="night" />

      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <pointLight position={[-3, -2, 4]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[3, 2, -3]} intensity={0.2} color="#3b82f6" />
    </>
  );
}

export default function NotFound3D({ onReady }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

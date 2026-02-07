import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/* ═══════════════════════════════════════════════════════════════════
   CityScene 3D — Flat (Orthographic)
   Recreates the SVG city skyline with Three.js for enhanced effects
   ═══════════════════════════════════════════════════════════════════ */

// Viewport constants (matching SVG version aspect ratio ~5:1)
const W = 16;
const H = 3.2;

// Color palette (matching SVG version)
const SKY = "#0c1222";
const BACK_CLR = "#1e293b";
const MID_CLR = "#283548";
const FRONT_CLR = "#0a1018";
const CYAN = "#22d3ee";
const STAR_CLR = "#e2e8f0";

// Parallax speeds (units per frame)
const SPEED_BACK = 0.01;
const SPEED_MID = 0.02;
const SPEED_FRONT = 0.04;

/* ─── Building data structures ─── */

interface Building {
  x: number;
  width: number;
  height: number;
  hasAntenna?: boolean;
}

interface Window {
  x: number;
  y: number;
  phaseOffset: number;
  frequencyOffset: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  phaseOffset: number;
}

interface DustParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  driftSpeed: number;
  phaseOffset: number;
}

/* ─── Static data (pre-computed, stable) ─── */

const BACK_BUILDINGS: Building[] = [
  { x: -7, width: 0.6, height: 2.0 },
  { x: -5.5, width: 0.5, height: 1.6 },
  { x: -3.8, width: 1.0, height: 0.9 },
  { x: -1.5, width: 0.5, height: 2.2 },
  { x: 0.5, width: 0.6, height: 1.5 },
  { x: 2.8, width: 0.5, height: 1.8 },
];

const MID_BUILDINGS: Building[] = [
  { x: -7, width: 1.2, height: 2.4, hasAntenna: false },
  { x: -5, width: 1.4, height: 2.8, hasAntenna: true },
  { x: -2.8, width: 1.0, height: 2.0 },
  { x: -1.0, width: 1.3, height: 3.0, hasAntenna: false },
  { x: 1.0, width: 1.2, height: 2.5 },
  { x: 3.0, width: 1.5, height: 3.2, hasAntenna: true },
  { x: 5.2, width: 1.1, height: 2.2, hasAntenna: false },
  { x: 7.0, width: 1.4, height: 2.7, hasAntenna: true },
];

const FRONT_BUILDINGS: Building[] = [
  { x: -7.5, width: 1.5, height: 0.7 },
  { x: -5.0, width: 1.8, height: 0.5 },
  { x: -2.0, width: 1.2, height: 0.6 },
  { x: 1.0, width: 1.6, height: 0.8 },
];

// Generate window positions (pre-computed, stable)
const WINDOWS: Window[] = (() => {
  const windows: Window[] = [];
  MID_BUILDINGS.forEach((building) => {
    const cols = Math.floor(building.width / 0.15);
    const rows = Math.floor(building.height / 0.2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (building.x * 1000 + r * 100 + c * 10) | 0;
        if (Math.abs(seed % 100) > 65) continue; // Skip some windows
        windows.push({
          x: building.x + 0.1 + c * 0.15,
          y: -H / 2 + 0.2 + building.height - r * 0.2,
          phaseOffset: (seed % 1000) / 100,
          frequencyOffset: (seed % 5) * 0.1,
        });
      }
    }
  });
  return windows;
})();

// Generate stars (pre-computed, stable)
const STARS: Star[] = (() => {
  const stars: Star[] = [];
  for (let i = 0; i < 25; i++) {
    const seed = i * 2654435761;
    stars.push({
      x: ((seed % 16000) / 1000) - 8,
      y: ((seed >> 8) % 1600) / 1000 + 0.5,
      z: -0.1,
      size: 0.02 + ((seed % 20) / 500),
      phaseOffset: (seed % 1000) / 100,
    });
  }
  return stars;
})();

// Generate dust particles (pre-computed, stable)
const DUST_PARTICLES: DustParticle[] = (() => {
  const particles: DustParticle[] = [];
  for (let i = 0; i < 12; i++) {
    const seed = i * 1597334677;
    particles.push({
      x: ((seed % 16000) / 1000) - 8,
      y: ((seed >> 8) % 3200) / 1000 - 1.6,
      z: ((seed >> 16) % 100) / 200,
      size: 0.015 + ((seed % 10) / 1000),
      driftSpeed: 0.005 + ((seed % 5) / 500),
      phaseOffset: (seed % 1000) / 100,
    });
  }
  return particles;
})();

/* ─── Building layer components ─── */

function BackLayer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x -= SPEED_BACK;
      if (groupRef.current.position.x < -W) {
        groupRef.current.position.x += W;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1].map((offset) => (
        <group key={offset} position={[offset * W, 0, -3]}>
          {BACK_BUILDINGS.map((building, i) => (
            <mesh key={i} position={[building.x, -H / 2 + building.height / 2, 0]}>
              <boxGeometry args={[building.width, building.height, 0.1]} />
              <meshBasicMaterial color={BACK_CLR} transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function MidLayer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x -= SPEED_MID;
      if (groupRef.current.position.x < -W) {
        groupRef.current.position.x += W;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1].map((offset) => (
        <group key={offset} position={[offset * W, 0, 0]}>
          {/* Buildings */}
          {MID_BUILDINGS.map((building, i) => (
            <group key={i}>
              <mesh position={[building.x, -H / 2 + building.height / 2, 0]}>
                <boxGeometry args={[building.width, building.height, 0.1]} />
                <meshBasicMaterial color={MID_CLR} />
              </mesh>
              {/* Antenna */}
              {building.hasAntenna && (
                <group position={[building.x, -H / 2 + building.height, 0]}>
                  <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
                    <meshBasicMaterial color={MID_CLR} />
                  </mesh>
                  <mesh position={[0, 0.32, 0]}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.6} />
                  </mesh>
                </group>
              )}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

function Windows() {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x -= SPEED_MID;
      if (groupRef.current.position.x < -W) {
        groupRef.current.position.x += W;
      }
    }
    const time = clock.getElapsedTime();
    materialsRef.current.forEach((material, i) => {
      const window = WINDOWS[i];
      const wave = Math.sin(time * (1 + window.frequencyOffset) + window.phaseOffset);
      material.opacity = 0.3 + wave * 0.5;
    });
  });

  return (
    <group ref={groupRef}>
      {[0, 1].map((offset) => (
        <group key={offset} position={[offset * W, 0, 0.05]}>
          {WINDOWS.map((window, i) => (
            <mesh key={i} position={[window.x, window.y, 0]}>
              <planeGeometry args={[0.05, 0.07]} />
              <meshStandardMaterial
                ref={(ref: THREE.MeshStandardMaterial | null) => {
                  if (ref && offset === 0) materialsRef.current[i] = ref;
                }}
                color={CYAN}
                emissive={CYAN}
                emissiveIntensity={0.8}
                transparent
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function FrontLayer() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x -= SPEED_FRONT;
      if (groupRef.current.position.x < -W) {
        groupRef.current.position.x += W;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1].map((offset) => (
        <group key={offset} position={[offset * W, 0, 2]}>
          {FRONT_BUILDINGS.map((building, i) => (
            <mesh key={i} position={[building.x, -H / 2 + building.height / 2, 0]}>
              <boxGeometry args={[building.width, building.height, 0.1]} />
              <meshBasicMaterial color={FRONT_CLR} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ─── Sky elements ─── */

function StarField() {
  const materialsRef = useRef<THREE.PointsMaterial[]>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    materialsRef.current.forEach((material, i) => {
      const star = STARS[i];
      const wave = Math.sin(time * 0.8 + star.phaseOffset);
      material.opacity = 0.4 + wave * 0.4;
    });
  });

  return (
    <>
      {STARS.map((star, i) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
        return (
          <points key={i} position={[star.x, star.y, star.z]} geometry={geometry}>
            <pointsMaterial
              ref={(ref) => {
                if (ref) materialsRef.current[i] = ref;
              }}
              color={STAR_CLR}
              size={star.size}
              transparent
            />
          </points>
        );
      })}
    </>
  );
}

function Moon() {
  return (
    <group position={[5.5, 1.0, -0.2]}>
      {/* Halo */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.08} />
      </mesh>
      {/* Moon body */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={STAR_CLR} emissive={CYAN} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function DustParticles() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        const particle = DUST_PARTICLES[i];
        child.position.y = particle.y + Math.sin(time * particle.driftSpeed + particle.phaseOffset) * 0.3;
        child.position.x = particle.x + Math.cos(time * particle.driftSpeed * 0.5 + particle.phaseOffset) * 0.2;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {DUST_PARTICLES.map((particle, i) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));
        return (
          <points key={i} position={[particle.x, particle.y, particle.z]} geometry={geometry}>
            <pointsMaterial color={CYAN} size={particle.size} transparent opacity={0.3} />
          </points>
        );
      })}
    </group>
  );
}

/* ─── Scene container ─── */

function Scene() {
  return (
    <>
      {/* Camera setup for orthographic view */}
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.1}
        far={100}
      />

      {/* Ambient light for meshStandardMaterial visibility */}
      <ambientLight intensity={0.5} />

      {/* Fog for subtle depth */}
      <fogExp2 attach="fog" args={[SKY, 0.02]} />

      {/* Sky elements (static) */}
      <StarField />
      <Moon />

      {/* Building layers (scrolling) */}
      <BackLayer />
      <MidLayer />
      <Windows />
      <FrontLayer />

      {/* Dust particles */}
      <DustParticles />

      {/* Ground */}
      <mesh position={[0, -H / 2 - 0.05, 1]}>
        <planeGeometry args={[W * 2, 0.1]} />
        <meshBasicMaterial color={FRONT_CLR} />
      </mesh>
    </>
  );
}

/* ─── Main component ─── */

export default function CityScene3DFlatDemo() {
  return (
    <DemoSection
      number={17}
      title="CityScene 3D — Flat (Ortho)"
      description="Recreates the SVG city skyline with Three.js orthographic camera, maintaining the flat 2D aesthetic while adding enhanced lighting and particle effects."
    >
      <div className="h-40 overflow-hidden rounded-lg border border-slate-800" style={{ backgroundColor: SKY }}>
        <Canvas>
          <Scene />
        </Canvas>
      </div>
    </DemoSection>
  );
}

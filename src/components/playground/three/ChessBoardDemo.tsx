import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import DemoSection from '../DemoSection';

// Types
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type Team = 'cyan' | 'slate';

interface PiecePosition {
  x: number;
  z: number;
  type: PieceType;
  team: Team;
  shouldAnimate?: boolean;
}

// Materials
const cyanMaterial = new THREE.MeshStandardMaterial({
  color: '#22d3ee',
  metalness: 0.3,
  roughness: 0.5,
});

const slateMaterial = new THREE.MeshStandardMaterial({
  color: '#94a3b8',
  metalness: 0.3,
  roughness: 0.5,
});

// Piece geometries components
function Pawn({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      <mesh position={[0, 0.15, 0]} material={material}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>
      <mesh position={[0, 0.4, 0]} material={material}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>
    </group>
  );
}

function Rook({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      <mesh position={[0, 0.25, 0]} material={material}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 16]} />
      </mesh>
      {/* Crenellations */}
      <mesh position={[0.15, 0.55, 0]} material={material}>
        <boxGeometry args={[0.1, 0.15, 0.4]} />
      </mesh>
      <mesh position={[-0.15, 0.55, 0]} material={material}>
        <boxGeometry args={[0.1, 0.15, 0.4]} />
      </mesh>
      <mesh position={[0, 0.55, 0.15]} material={material}>
        <boxGeometry args={[0.4, 0.15, 0.1]} />
      </mesh>
      <mesh position={[0, 0.55, -0.15]} material={material}>
        <boxGeometry args={[0.4, 0.15, 0.1]} />
      </mesh>
    </group>
  );
}

function Knight({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} material={material}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.4, 0.1]} rotation={[Math.PI / 6, 0, 0]} material={material}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 12]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0.25]} rotation={[0, 0, 0]} material={material}>
        <coneGeometry args={[0.18, 0.35, 12]} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.08, 0.8, 0.25]} material={material}>
        <coneGeometry args={[0.06, 0.15, 8]} />
      </mesh>
      <mesh position={[-0.08, 0.8, 0.25]} material={material}>
        <coneGeometry args={[0.06, 0.15, 8]} />
      </mesh>
    </group>
  );
}

function Bishop({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={material}>
        <coneGeometry args={[0.22, 0.6, 16]} />
      </mesh>
      <mesh position={[0, 0.7, 0]} material={material}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
    </group>
  );
}

function Queen({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      <mesh position={[0, 0.2, 0]} material={material}>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={material}>
        <coneGeometry args={[0.22, 0.4, 16]} />
      </mesh>
      {/* Crown spikes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI * 2) / 5) * 0.18,
            0.75,
            Math.sin((i * Math.PI * 2) / 5) * 0.18,
          ]}
          material={material}
        >
          <coneGeometry args={[0.05, 0.15, 8]} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} material={material}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
    </group>
  );
}

function King({ team }: { team: Team }) {
  const material = team === 'cyan' ? cyanMaterial : slateMaterial;

  return (
    <group>
      <mesh position={[0, 0.2, 0]} material={material}>
        <cylinderGeometry args={[0.25, 0.25, 0.4, 16]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={material}>
        <coneGeometry args={[0.22, 0.4, 16]} />
      </mesh>
      {/* Cross on top */}
      <mesh position={[0, 0.8, 0]} material={material}>
        <boxGeometry args={[0.15, 0.04, 0.04]} />
      </mesh>
      <mesh position={[0, 0.85, 0]} material={material}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
      </mesh>
    </group>
  );
}

// Piece selector
function ChessPiece({ type, team }: { type: PieceType; team: Team }) {
  switch (type) {
    case 'pawn':
      return <Pawn team={team} />;
    case 'rook':
      return <Rook team={team} />;
    case 'knight':
      return <Knight team={team} />;
    case 'bishop':
      return <Bishop team={team} />;
    case 'queen':
      return <Queen team={team} />;
    case 'king':
      return <King team={team} />;
  }
}

// Animation phases for knight hop
type KnightPhase = 'pause' | 'rise' | 'move' | 'descend' | 'return-pause' | 'return-rise' | 'return-move' | 'return-descend';

// Animated knight — uses refs only (no setState in useFrame)
function AnimatedKnight({ startX, startZ, team }: { startX: number; startZ: number; team: Team }) {
  const groupRef = useRef<THREE.Group>(null);
  const phaseRef = useRef<KnightPhase>('pause');
  const timerRef = useRef(0);

  // Target: knight L-move (+1 right, -2 forward)
  const endX = startX + 1;
  const endZ = startZ - 2;
  const hopHeight = 1.2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    timerRef.current += delta;
    const t = timerRef.current;
    const g = groupRef.current;
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const advance = (next: KnightPhase) => { phaseRef.current = next; timerRef.current = 0; };

    switch (phaseRef.current) {
      case 'pause':
        if (t >= 2) advance('rise');
        break;
      case 'rise':
        if (t < 0.3) { g.position.y = (t / 0.3) * hopHeight; }
        else { g.position.y = hopHeight; advance('move'); }
        break;
      case 'move':
        if (t < 0.5) {
          const p = easeOut(t / 0.5);
          g.position.x = startX + (endX - startX) * p;
          g.position.z = startZ + (endZ - startZ) * p;
        } else { g.position.x = endX; g.position.z = endZ; advance('descend'); }
        break;
      case 'descend':
        if (t < 0.3) { g.position.y = hopHeight * (1 - t / 0.3); }
        else { g.position.y = 0; advance('return-pause'); }
        break;
      case 'return-pause':
        if (t >= 2) advance('return-rise');
        break;
      case 'return-rise':
        if (t < 0.3) { g.position.y = (t / 0.3) * hopHeight; }
        else { g.position.y = hopHeight; advance('return-move'); }
        break;
      case 'return-move':
        if (t < 0.5) {
          const p = easeOut(t / 0.5);
          g.position.x = endX + (startX - endX) * p;
          g.position.z = endZ + (startZ - endZ) * p;
        } else { g.position.x = startX; g.position.z = startZ; advance('return-descend'); }
        break;
      case 'return-descend':
        if (t < 0.3) { g.position.y = hopHeight * (1 - t / 0.3); }
        else { g.position.y = 0; advance('pause'); }
        break;
    }
  });

  return (
    <group ref={groupRef} position={[startX, 0, startZ]}>
      <Knight team={team} />
    </group>
  );
}

// Board square
function BoardSquare({ x, z, isDark }: { x: number; z: number; isDark: boolean }) {
  return (
    <mesh position={[x, -0.05, z]} receiveShadow>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color={isDark ? '#1e293b' : '#334155'} />
    </mesh>
  );
}

// Chess board scene
function ChessBoard() {
  // Mid-game piece positions
  const pieces: PiecePosition[] = [
    // Cyan team
    { x: -3.5, z: -3.5, type: 'king', team: 'cyan' },
    { x: 0.5, z: -3.5, type: 'queen', team: 'cyan' },
    { x: 2.5, z: -2.5, type: 'rook', team: 'cyan' },
    { x: -1.5, z: -1.5, type: 'knight', team: 'cyan', shouldAnimate: true },
    { x: 1.5, z: -0.5, type: 'bishop', team: 'cyan' },
    { x: -2.5, z: -2.5, type: 'pawn', team: 'cyan' },
    { x: 0.5, z: -1.5, type: 'pawn', team: 'cyan' },
    { x: 3.5, z: -1.5, type: 'pawn', team: 'cyan' },

    // Slate team
    { x: 3.5, z: 3.5, type: 'king', team: 'slate' },
    { x: -0.5, z: 3.5, type: 'queen', team: 'slate' },
    { x: -2.5, z: 2.5, type: 'rook', team: 'slate' },
    { x: 1.5, z: 1.5, type: 'knight', team: 'slate' },
    { x: -1.5, z: 0.5, type: 'bishop', team: 'slate' },
    { x: 2.5, z: 2.5, type: 'pawn', team: 'slate' },
    { x: -0.5, z: 1.5, type: 'pawn', team: 'slate' },
    { x: -3.5, z: 1.5, type: 'pawn', team: 'slate' },
  ];

  return (
    <>
      {/* Board squares */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => {
          const x = col - 3.5;
          const z = row - 3.5;
          const isDark = (row + col) % 2 === 0;
          return <BoardSquare key={`${row}-${col}`} x={x} z={z} isDark={isDark} />;
        })
      )}

      {/* Chess pieces */}
      {pieces.map((piece, idx) => {
        if (piece.shouldAnimate) {
          return (
            <AnimatedKnight
              key={idx}
              startX={piece.x}
              startZ={piece.z}
              team={piece.team}
            />
          );
        }

        return (
          <group key={idx} position={[piece.x, 0, piece.z]}>
            <ChessPiece type={piece.type} team={piece.team} />
          </group>
        );
      })}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#e0f7fa" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={8}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

// Main component
export default function ChessBoardDemo() {
  return (
    <DemoSection
      number={5}
      title="Echiquier 3D"
      description="Un échiquier 3D interactif avec des pièces procédurales en Three.js. Observez le cavalier cyan effectuer ses déplacements caractéristiques en L. Utilisez la souris pour explorer la scène."
    >
      <div className="h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <Canvas
          camera={{ position: [8, 8, 8], fov: 45 }}
          dpr={[1, 1.5]}
          shadows
        >
          <ChessBoard />
        </Canvas>
      </div>
    </DemoSection>
  );
}

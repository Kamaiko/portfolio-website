/* eslint-disable react-hooks/immutability -- intentional physics state mutation in useFrame */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import DemoSection from "../DemoSection";

/* ─── Constants ─── */

const BLOCK_SIZE = 0.45;
const CHAR_GAP = 0.6;
const GRAVITY = 12;
const BOUNCE = 0.3;
const FLOOR_Y = 0;
const SETTLE_THRESHOLD = 0.05;
const PROJECTILE_SPEED = 18;
const SPLASH_RADIUS = 1.8;
const SPLASH_FORCE = 5;
const HIT_TRANSFER = 6;
const ANGULAR_TRANSFER = 4;
const PROJECTILE_RADIUS = 0.2;

/* ─── Pre-allocated (per-frame math, zero GC) ─── */

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _euler = new THREE.Euler();

/* ─── Character grid definitions ─── */

// prettier-ignore
const CHAR_4: number[][] = [
  [0,0,0,1,0],
  [0,0,1,1,0],
  [0,1,0,1,0],
  [1,0,0,1,0],
  [1,1,1,1,1],
  [0,0,0,1,0],
  [0,0,0,1,0],
];

// prettier-ignore
const CHAR_0: number[][] = [
  [0,1,1,1,0],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [1,0,0,0,1],
  [0,1,1,1,0],
];

function buildBlockPositions(): Float32Array {
  const blocks: number[] = [];
  const chars = [CHAR_4, CHAR_0, CHAR_4];
  const charWidth = 5 * BLOCK_SIZE;
  const totalWidth = 3 * charWidth + 2 * CHAR_GAP;
  let offsetX = -totalWidth / 2;

  for (const charGrid of chars) {
    for (let row = 0; row < charGrid.length; row++) {
      for (let col = 0; col < charGrid[row].length; col++) {
        if (charGrid[row][col]) {
          blocks.push(
            offsetX + col * BLOCK_SIZE + BLOCK_SIZE / 2,
            (charGrid.length - 1 - row) * BLOCK_SIZE + BLOCK_SIZE / 2 + 0.5,
            0,
          );
        }
      }
    }
    offsetX += charWidth + CHAR_GAP;
  }
  return new Float32Array(blocks);
}

/* ─── Physics state ─── */

interface PhysicsState {
  positions: Float32Array;
  velocities: Float32Array;
  rotations: Float32Array;
  angularVel: Float32Array;
  active: boolean[];
  settled: boolean[];
  initPositions: Float32Array;
}

function createPhysics(blockPositions: Float32Array): PhysicsState {
  const count = blockPositions.length / 3;
  return {
    positions: new Float32Array(blockPositions),
    velocities: new Float32Array(count * 3),
    rotations: new Float32Array(count * 3),
    angularVel: new Float32Array(count * 3),
    active: new Array(count).fill(false) as boolean[],
    settled: new Array(count).fill(false) as boolean[],
    initPositions: new Float32Array(blockPositions),
  };
}

/* ─── Projectile state ─── */

interface Projectile {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  alive: boolean;
}

/* ─── Scene ─── */

function Destruction404Scene({
  onAllDestroyed,
}: {
  onAllDestroyed: () => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const projMeshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const destroyedRef = useRef(false);

  const blockPositions = useMemo(() => buildBlockPositions(), []);
  const blockCount = blockPositions.length / 3;

  const physics = useMemo(() => createPhysics(blockPositions), [blockPositions]);

  const projectileRef = useRef<Projectile>({
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    alive: false,
  });

  // Instance matrices are set in first useFrame call

  // Shoot on click — use R3F event's intersection point for direction
  const handleClick = useCallback(
    (e: THREE.Intersection & { stopPropagation: () => void }) => {
      e.stopPropagation();
      const dir = e.point.clone().sub(camera.position).normalize();
      const proj = projectileRef.current;
      proj.position.copy(camera.position);
      proj.velocity.copy(dir).multiplyScalar(PROJECTILE_SPEED);
      proj.alive = true;
    },
    [camera],
  );

  // Reset
  const handleReset = useCallback(() => {
    for (let i = 0; i < blockCount; i++) {
      const i3 = i * 3;
      physics.positions[i3] = physics.initPositions[i3];
      physics.positions[i3 + 1] = physics.initPositions[i3 + 1];
      physics.positions[i3 + 2] = physics.initPositions[i3 + 2];
      physics.velocities[i3] = 0;
      physics.velocities[i3 + 1] = 0;
      physics.velocities[i3 + 2] = 0;
      physics.rotations[i3] = 0;
      physics.rotations[i3 + 1] = 0;
      physics.rotations[i3 + 2] = 0;
      physics.angularVel[i3] = 0;
      physics.angularVel[i3 + 1] = 0;
      physics.angularVel[i3 + 2] = 0;
      physics.active[i] = false;
      physics.settled[i] = false;
    }
    destroyedRef.current = false;
  }, [physics, blockCount]);

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dt = Math.min(delta, 0.05);
    const proj = projectileRef.current;

    // ── Projectile physics ──
    if (proj.alive) {
      proj.position.addScaledVector(proj.velocity, dt);

      // Check collision with blocks
      for (let i = 0; i < blockCount; i++) {
        if (physics.settled[i]) continue;
        const i3 = i * 3;
        const bx = physics.positions[i3];
        const by = physics.positions[i3 + 1];
        const bz = physics.positions[i3 + 2];

        const dx = proj.position.x - bx;
        const dy = proj.position.y - by;
        const dz = proj.position.z - bz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < BLOCK_SIZE / 2 + PROJECTILE_RADIUS) {
          // Direct hit — activate and transfer velocity
          physics.active[i] = true;
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;
          physics.velocities[i3] += nx * HIT_TRANSFER;
          physics.velocities[i3 + 1] += ny * HIT_TRANSFER + 2;
          physics.velocities[i3 + 2] += nz * HIT_TRANSFER;
          physics.angularVel[i3] += (Math.random() - 0.5) * ANGULAR_TRANSFER;
          physics.angularVel[i3 + 1] += (Math.random() - 0.5) * ANGULAR_TRANSFER;
          physics.angularVel[i3 + 2] += (Math.random() - 0.5) * ANGULAR_TRANSFER;

          // Splash damage to nearby blocks
          for (let j = 0; j < blockCount; j++) {
            if (j === i || physics.settled[j]) continue;
            const j3 = j * 3;
            const sx = physics.positions[j3] - bx;
            const sy = physics.positions[j3 + 1] - by;
            const sz = physics.positions[j3 + 2] - bz;
            const sd = Math.sqrt(sx * sx + sy * sy + sz * sz);
            if (sd < SPLASH_RADIUS && sd > 0) {
              physics.active[j] = true;
              const sf = (1 - sd / SPLASH_RADIUS) * SPLASH_FORCE;
              physics.velocities[j3] += (sx / sd) * sf;
              physics.velocities[j3 + 1] += (sy / sd) * sf + 1;
              physics.velocities[j3 + 2] += (sz / sd) * sf;
              physics.angularVel[j3] += (Math.random() - 0.5) * 2;
              physics.angularVel[j3 + 1] += (Math.random() - 0.5) * 2;
            }
          }

          proj.alive = false;
          break;
        }
      }

      // Kill projectile if too far
      if (proj.position.length() > 30) {
        proj.alive = false;
      }

      // Update projectile mesh
      if (projMeshRef.current) {
        projMeshRef.current.position.copy(proj.position);
        projMeshRef.current.visible = proj.alive;
      }
    } else if (projMeshRef.current) {
      projMeshRef.current.visible = false;
    }

    // ── Block physics ──
    let allDown = true;
    for (let i = 0; i < blockCount; i++) {
      const i3 = i * 3;

      if (!physics.active[i]) {
        // Static block — just set matrix
        _position.set(
          physics.positions[i3],
          physics.positions[i3 + 1],
          physics.positions[i3 + 2],
        );
        _euler.set(0, 0, 0);
        _quaternion.setFromEuler(_euler);
        _matrix.compose(_position, _quaternion, _scale);
        mesh.setMatrixAt(i, _matrix);
        allDown = false;
        continue;
      }

      if (physics.settled[i]) continue;

      // Gravity
      physics.velocities[i3 + 1] -= GRAVITY * dt;

      // Integrate position
      physics.positions[i3] += physics.velocities[i3] * dt;
      physics.positions[i3 + 1] += physics.velocities[i3 + 1] * dt;
      physics.positions[i3 + 2] += physics.velocities[i3 + 2] * dt;

      // Integrate rotation
      physics.rotations[i3] += physics.angularVel[i3] * dt;
      physics.rotations[i3 + 1] += physics.angularVel[i3 + 1] * dt;
      physics.rotations[i3 + 2] += physics.angularVel[i3 + 2] * dt;

      // Floor bounce
      if (physics.positions[i3 + 1] < FLOOR_Y + BLOCK_SIZE / 2) {
        physics.positions[i3 + 1] = FLOOR_Y + BLOCK_SIZE / 2;
        physics.velocities[i3 + 1] *= -BOUNCE;
        physics.velocities[i3] *= 0.8; // friction
        physics.velocities[i3 + 2] *= 0.8;
        physics.angularVel[i3] *= 0.7;
        physics.angularVel[i3 + 1] *= 0.7;
        physics.angularVel[i3 + 2] *= 0.7;

        // Settle check
        const speed =
          Math.abs(physics.velocities[i3]) +
          Math.abs(physics.velocities[i3 + 1]) +
          Math.abs(physics.velocities[i3 + 2]);
        if (speed < SETTLE_THRESHOLD) {
          physics.settled[i] = true;
        }
      }

      // Update matrix
      _position.set(
        physics.positions[i3],
        physics.positions[i3 + 1],
        physics.positions[i3 + 2],
      );
      _euler.set(
        physics.rotations[i3],
        physics.rotations[i3 + 1],
        physics.rotations[i3 + 2],
      );
      _quaternion.setFromEuler(_euler);
      _matrix.compose(_position, _quaternion, _scale);
      mesh.setMatrixAt(i, _matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Check if all blocks have been activated and settled
    if (!destroyedRef.current) {
      const anyStatic = physics.active.some((a) => !a);
      if (!anyStatic && allDown) {
        // All blocks are either active+settled or active+falling
        const allSettled = physics.settled.every((s) => s);
        if (allSettled) {
          destroyedRef.current = true;
          onAllDestroyed();
        }
      }
    }
  });

  return (
    <group>
      {/* Click target — transparent plane (visible={false} blocks R3F raycasting) */}
      <mesh onClick={handleClick} onDoubleClick={handleReset}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Blocks */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, blockCount]}>
        <boxGeometry args={[BLOCK_SIZE * 0.95, BLOCK_SIZE * 0.95, BLOCK_SIZE * 0.95]} />
        <meshStandardMaterial vertexColors={false} color="#22d3ee" />
      </instancedMesh>

      {/* Projectile */}
      <mesh ref={projMeshRef} visible={false}>
        <sphereGeometry args={[PROJECTILE_RADIUS, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#22d3ee" emissiveIntensity={2} />
      </mesh>

      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={FLOOR_Y}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[0, 3, 4]} intensity={0.5} color="#22d3ee" />
    </group>
  );
}

/* ─── Wrapper ─── */

export default function Destruction404Demo() {
  const [destroyed, setDestroyed] = useState(false);

  const handleAllDestroyed = useCallback(() => {
    setDestroyed(true);
    setTimeout(() => setDestroyed(false), 3000);
  }, []);

  return (
    <DemoSection
      number={11}
      title="Destruction 404 — Physics Cubes"
      description="Le '404' est construit en cubes 3D. Cliquez pour tirer une boule et tout casser. Double-cliquez pour reset. Physics maison — zero dependances."
    >
      <div className="relative h-[400px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <Canvas
          className="destruction-canvas"
          camera={{ position: [0, 3, 10], fov: 45 }}
          dpr={[1, 1.5]}
        >
          <Destruction404Scene onAllDestroyed={handleAllDestroyed} />
        </Canvas>

        {/* Destroyed overlay */}
        {destroyed && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-slate-950/80 px-6 py-4 text-center backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-cyan-400">
                You broke it...
              </p>
              <p className="mt-1 font-mono text-sm text-slate-400">
                it was already broken.
              </p>
            </div>
          </div>
        )}
      </div>
    </DemoSection>
  );
}

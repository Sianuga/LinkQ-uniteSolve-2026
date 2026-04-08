import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BG_COLOR = "#0a0a1a";
const PARTICLE_COUNT = 50;
const PARTICLE_RADIUS = 5;
const PARTICLE_HEIGHT = 4;

// ---------------------------------------------------------------------------
// Floating Particles — pre-computed at module scope (pure)
// ---------------------------------------------------------------------------

function buildParticleData() {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const sed = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * PARTICLE_RADIUS;
    pos[i * 3] = Math.cos(angle) * r;
    pos[i * 3 + 1] = Math.random() * PARTICLE_HEIGHT;
    pos[i * 3 + 2] = Math.sin(angle) * r;

    sed[i * 3] = Math.random() * 100;
    sed[i * 3 + 1] = Math.random() * 100;
    sed[i * 3 + 2] = Math.random() * 100;
  }
  return { positions: pos, seeds: sed };
}

const PARTICLE_DATA = buildParticleData();

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, seeds } = PARTICLE_DATA;

  useFrame(({ clock }) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const posAttr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = clock.getElapsedTime();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // Slow upward drift (0.08-0.14 units/s depending on seed)
      arr[iy] += 0.0008 + seeds[iy] * 0.00006;

      // Subtle horizontal wobble
      arr[ix] += Math.sin(t * 0.4 + seeds[ix]) * 0.0008;
      arr[iz] += Math.cos(t * 0.35 + seeds[iz]) * 0.0008;

      // Wrap when above ceiling
      if (arr[iy] > PARTICLE_HEIGHT) {
        arr[iy] = 0;
        // Re-randomise horizontal position so it doesn't look looped
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * PARTICLE_RADIUS;
        arr[ix] = Math.cos(angle) * r;
        arr[iz] = Math.sin(angle) * r;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#93C5FD"
        transparent
        opacity={0.6}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Horizontal Floor Lines
// ---------------------------------------------------------------------------

function FloorGridLines() {
  const zOffsets = [-1.5, -0.5, 0.5, 1.5];

  return (
    <group position-y={0.005}>
      {zOffsets.map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[6, 0.01]} />
          <meshBasicMaterial
            color="#1E3A8A"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ambient Glow Strip (pulsing horizontal line at character feet)
// ---------------------------------------------------------------------------

function GlowStrip() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (!mat) return;
    // Oscillate emissive intensity between 0.3 and 0.8
    const t = clock.getElapsedTime();
    mat.emissiveIntensity = 0.55 + 0.25 * Math.sin(t * 1.2);
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={0.01} position-z={0}>
      <planeGeometry args={[6, 0.04]} />
      <meshStandardMaterial
        color="#000000"
        emissive="#3B82F6"
        emissiveIntensity={0.55}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Reflective Floor
// ---------------------------------------------------------------------------

function ReflectiveFloor() {
  const rimRef = useRef<THREE.Mesh>(null);

  // Pulse the rim glow
  useFrame(({ clock }) => {
    const mat = rimRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (!mat) return;
    const t = clock.getElapsedTime();
    mat.emissiveIntensity = 0.6 + 0.3 * Math.sin(t * 0.8);
  });

  const MAIN_RADIUS = 3.5;
  const MAIN_HEIGHT = 0.6;
  const BASE_RADIUS = 4.0;
  const BASE_HEIGHT = 0.15;
  const RIM_INNER = MAIN_RADIUS - 0.06;
  const RIM_OUTER = MAIN_RADIUS + 0.06;
  const RIM_HEIGHT = 0.04;
  const SEGMENTS = 64;

  return (
    <group>
      {/* Main platform cylinder — top surface at y=0 */}
      <mesh position-y={-MAIN_HEIGHT / 2} receiveShadow castShadow>
        <cylinderGeometry args={[MAIN_RADIUS, MAIN_RADIUS, MAIN_HEIGHT, SEGMENTS]} />
        <meshStandardMaterial
          color={BG_COLOR}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Stepped base — slightly wider, sits below main cylinder */}
      <mesh position-y={-MAIN_HEIGHT - BASE_HEIGHT / 2} receiveShadow>
        <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS, BASE_HEIGHT, SEGMENTS]} />
        <meshStandardMaterial
          color="#06060f"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      {/* Glowing rim ring on top edge */}
      <mesh ref={rimRef} position-y={0.005} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[RIM_INNER, RIM_OUTER, SEGMENTS]} />
        <meshStandardMaterial
          color="#000000"
          emissive="#3B82F6"
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle side glow — a slightly larger transparent cylinder hugging the edge */}
      <mesh position-y={-MAIN_HEIGHT / 2}>
        <cylinderGeometry args={[MAIN_RADIUS + 0.02, MAIN_RADIUS + 0.02, MAIN_HEIGHT, SEGMENTS, 1, true]} />
        <meshStandardMaterial
          color="#0d0d2b"
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Volumetric Light Beam — fake god-ray using an open-ended cone
// ---------------------------------------------------------------------------

function VolumetricBeam() {
  return (
    <mesh position={[0, 3, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[1.2, 5, 32, 1, true]} />
      <meshBasicMaterial
        color="#3B82F6"
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Classroom model
// ---------------------------------------------------------------------------

const CLASSROOM_MODEL = '/models/arena/lowpoly_stylized_classroom.glb';

function ClassroomModel() {
  const { scene } = useGLTF(CLASSROOM_MODEL);
  const cloned = useMemo(() => {
    const c = skeletonClone(scene);
    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Scale classroom to ~6 units wide — backdrop behind characters
    const s = 6 / Math.max(size.x, size.z);
    const wrapper = new THREE.Group();
    wrapper.add(c);
    wrapper.scale.setScalar(s);
    // Center and place floor at y=0
    c.position.set(-center.x, -box.min.y, -center.z);
    return wrapper;
  }, [scene]);

  // Push far behind characters (z=-8) so camera sees chars in front, classroom behind
  return <primitive object={cloned} position={[0, 0, -8]} />;
}

useGLTF.preload(CLASSROOM_MODEL);

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export default function LobbyEnvironment() {
  return (
    <>
      {/* Scene-level properties (fog + background) — attaches to scene */}
      <color attach="background" args={[BG_COLOR]} />
      <fogExp2 attach="fog" args={[BG_COLOR, 0.03]} />

      {/* Lighting — brighter to illuminate classroom */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight
        position={[3, 6, 2]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#3B82F6" distance={10} decay={2} />

      {/* Classroom disabled for now */}
      {/* <ClassroomModel /> */}

      {/* Floor (fallback if classroom doesn't cover it) */}
      <ReflectiveFloor />

      {/* Atmosphere */}
      <FloatingParticles />
    </>
  );
}

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BG_COLOR = "#0a0a1a";
const PARTICLE_COUNT = 50;
const PARTICLE_RADIUS = 5;
const PARTICLE_HEIGHT = 4;
const FLOOR_RADIUS = 4;

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
// Grid Rings on the Floor
// ---------------------------------------------------------------------------

function FloorGridRings() {
  const radii = [1.3, 2.6, 3.8];

  return (
    <group rotation-x={-Math.PI / 2} position-y={0.005}>
      {radii.map((r) => (
        <mesh key={r}>
          <ringGeometry args={[r - 0.005, r + 0.005, 128]} />
          <meshBasicMaterial
            color="#1E3A8A"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Ambient Glow Ring (pulsing torus)
// ---------------------------------------------------------------------------

function GlowRing() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (!mat) return;
    // Oscillate emissive intensity between 0.3 and 0.8
    const t = clock.getElapsedTime();
    mat.emissiveIntensity = 0.55 + 0.25 * Math.sin(t * 1.2);
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={0.01}>
      <torusGeometry args={[3.5, 0.02, 16, 128]} />
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
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
      <circleGeometry args={[FLOOR_RADIUS, 128]} />
      <meshStandardMaterial
        color={BG_COLOR}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
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

export default function LobbyEnvironment() {
  return (
    <>
      {/* Scene-level properties (fog + background) — attaches to scene */}
      <color attach="background" args={[BG_COLOR]} />
      <fogExp2 attach="fog" args={[BG_COLOR, 0.06]} />

      {/* Lighting */}
      <ambientLight intensity={0.15} color="#93C5FD" />
      <directionalLight
        position={[3, 6, 2]}
        intensity={0.4}
        color="#a5b4fc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#3B82F6" distance={10} decay={2} />

      {/* Floor */}
      <ReflectiveFloor />
      <FloorGridRings />

      {/* Atmosphere */}
      <GlowRing />
      <FloatingParticles />
      <VolumetricBeam />
    </>
  );
}

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Capsule, Sphere, Cylinder, Cone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarType } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LobbyCharacterProps {
  avatarType: AvatarType;
  name: string;
  matchScore: number;
  position: [number, number, number];
  rotationY?: number;
  onClick: () => void;
  isSelected: boolean;
  isFocused: boolean;
  userId?: string;
  program?: string;
  tags?: string[];
  shared?: { events: number; interests: number };
}

// ---------------------------------------------------------------------------
// Colour palette & material presets per avatar type
// ---------------------------------------------------------------------------

interface AvatarPreset {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
}

const PRESETS: Record<AvatarType, AvatarPreset> = {
  buff_arnold: {
    color: '#F97316',
    emissive: '#F97316',
    emissiveIntensity: 0.1,
    metalness: 0.3,
    roughness: 0.4,
    opacity: 1,
    transparent: false,
  },
  banana_guy: {
    color: '#EAB308',
    emissive: '#EAB308',
    emissiveIntensity: 0.1,
    metalness: 0.2,
    roughness: 0.5,
    opacity: 1,
    transparent: false,
  },
  anime_girl: {
    color: '#06B6D4',
    emissive: '#06B6D4',
    emissiveIntensity: 0.2,
    metalness: 0.25,
    roughness: 0.45,
    opacity: 1,
    transparent: false,
  },
  bland_normal_guy: {
    color: '#9CA3AF',
    emissive: '#9CA3AF',
    emissiveIntensity: 0.0,
    metalness: 0.1,
    roughness: 0.8,
    opacity: 1,
    transparent: false,
  },
  mystery_silhouette: {
    color: '#0a0a0a',
    emissive: '#6B21A8',
    emissiveIntensity: 0.3,
    metalness: 0.4,
    roughness: 0.3,
    opacity: 0.85,
    transparent: true,
  },
};

// ---------------------------------------------------------------------------
// Shared material hook — returns a MeshStandardMaterial with optional
// emissive boost when selected.
// ---------------------------------------------------------------------------

function useMat(preset: AvatarPreset, selected: boolean) {
  return useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: preset.color,
      emissive: preset.emissive,
      emissiveIntensity: selected
        ? preset.emissiveIntensity + 0.25
        : preset.emissiveIntensity,
      metalness: preset.metalness,
      roughness: preset.roughness,
      transparent: preset.transparent || false,
      opacity: preset.opacity ?? 1,
    });
    return mat;
  }, [preset, selected]);
}

// ---------------------------------------------------------------------------
// Per-type body builders
// ---------------------------------------------------------------------------

function BuffArnold({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <group>
      {/* Wide torso */}
      <mesh material={mat} position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
      </mesh>

      {/* Head */}
      <Sphere args={[0.28, 24, 24]} position={[0, 1.72, 0]} material={mat} castShadow />

      {/* Left arm — flexing outward and up */}
      <group position={[-0.52, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        {/* Upper arm */}
        <Cylinder args={[0.1, 0.12, 0.45, 12]} position={[0, 0.2, 0]} material={mat} castShadow />
        {/* Forearm — bent up for flex */}
        <group position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2.5]}>
          <Cylinder args={[0.09, 0.1, 0.4, 12]} position={[0, 0.2, 0]} material={mat} castShadow />
          {/* Bicep bulge */}
          <Sphere args={[0.12, 12, 12]} position={[0, 0.05, 0]} material={mat} castShadow />
        </group>
      </group>

      {/* Right arm — mirror */}
      <group position={[0.52, 1.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <Cylinder args={[0.1, 0.12, 0.45, 12]} position={[0, 0.2, 0]} material={mat} castShadow />
        <group position={[0, 0.45, 0]} rotation={[0, 0, -Math.PI / 2.5]}>
          <Cylinder args={[0.09, 0.1, 0.4, 12]} position={[0, 0.2, 0]} material={mat} castShadow />
          <Sphere args={[0.12, 12, 12]} position={[0, 0.05, 0]} material={mat} castShadow />
        </group>
      </group>

      {/* Legs */}
      <Cylinder args={[0.14, 0.12, 0.5, 12]} position={[-0.18, 0.25, 0]} material={mat} castShadow />
      <Cylinder args={[0.14, 0.12, 0.5, 12]} position={[0.18, 0.25, 0]} material={mat} castShadow />
    </group>
  );
}

function BananaGuy({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <group>
      {/* Elongated body — tall narrow capsule simulated with cylinder + spheres */}
      <Cylinder args={[0.18, 0.2, 1.2, 16]} position={[0, 0.85, 0]} material={mat} castShadow />
      <Sphere args={[0.18, 16, 16]} position={[0, 1.45, 0]} material={mat} castShadow />
      <Sphere args={[0.2, 16, 16]} position={[0, 0.25, 0]} material={mat} castShadow />

      {/* Small head on top */}
      <Sphere args={[0.2, 20, 20]} position={[0, 1.72, 0]} material={mat} castShadow />

      {/* Banana curve — slight tilt of the body is handled by a subtle rotation on group */}
      {/* Stem on top of head */}
      <Cylinder args={[0.03, 0.02, 0.15, 8]} position={[0, 1.95, 0]} material={mat} castShadow />

      {/* Thin arms at sides */}
      <Cylinder
        args={[0.05, 0.04, 0.55, 8]}
        position={[-0.28, 0.95, 0]}
        rotation={[0, 0, 0.2]}
        material={mat}
        castShadow
      />
      <Cylinder
        args={[0.05, 0.04, 0.55, 8]}
        position={[0.28, 0.95, 0]}
        rotation={[0, 0, -0.2]}
        material={mat}
        castShadow
      />

      {/* Legs */}
      <Cylinder args={[0.08, 0.07, 0.4, 10]} position={[-0.1, 0.2, 0]} material={mat} castShadow />
      <Cylinder args={[0.08, 0.07, 0.4, 10]} position={[0.1, 0.2, 0]} material={mat} castShadow />
    </group>
  );
}

function AnimeGirl({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <group>
      {/* Slimmer body */}
      <Capsule args={[0.18, 0.65, 8, 16]} position={[0, 0.85, 0]} material={mat} castShadow />

      {/* Medium head */}
      <Sphere args={[0.26, 24, 24]} position={[0, 1.58, 0]} material={mat} castShadow />

      {/* Big anime eyes — two small dark spheres */}
      <mesh position={[-0.1, 1.62, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#0f172a" emissive="#67e8f9" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.1, 1.62, 0.22]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#0f172a" emissive="#67e8f9" emissiveIntensity={0.6} />
      </mesh>

      {/* Eye shine dots */}
      <mesh position={[-0.08, 1.64, 0.28]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.12, 1.64, 0.28]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* Twin tails — two cones behind head rotated outward */}
      <Cone
        args={[0.08, 0.45, 8]}
        position={[-0.25, 1.7, -0.15]}
        rotation={[0.4, 0, -0.6]}
        material={mat}
        castShadow
      />
      <Cone
        args={[0.08, 0.45, 8]}
        position={[0.25, 1.7, -0.15]}
        rotation={[0.4, 0, 0.6]}
        material={mat}
        castShadow
      />

      {/* Hair bangs — a flattened sphere in front */}
      <mesh position={[0, 1.72, 0.15]} scale={[1.1, 0.35, 0.5]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#06B6D4" emissive="#06B6D4" emissiveIntensity={0.15} />
      </mesh>

      {/* Arms */}
      <Cylinder
        args={[0.05, 0.04, 0.5, 8]}
        position={[-0.27, 0.9, 0]}
        rotation={[0, 0, 0.15]}
        material={mat}
        castShadow
      />
      <Cylinder
        args={[0.05, 0.04, 0.5, 8]}
        position={[0.27, 0.9, 0]}
        rotation={[0, 0, -0.15]}
        material={mat}
        castShadow
      />

      {/* Skirt — a cone below body */}
      <Cone args={[0.28, 0.3, 12]} position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]} material={mat} castShadow />

      {/* Legs */}
      <Cylinder args={[0.06, 0.05, 0.4, 10]} position={[-0.1, 0.18, 0]} material={mat} castShadow />
      <Cylinder args={[0.06, 0.05, 0.4, 10]} position={[0.1, 0.18, 0]} material={mat} castShadow />
    </group>
  );
}

function BlandNormalGuy({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <group>
      {/* Standard body */}
      <Capsule args={[0.2, 0.6, 8, 16]} position={[0, 0.85, 0]} material={mat} castShadow />

      {/* Head */}
      <Sphere args={[0.24, 20, 20]} position={[0, 1.55, 0]} material={mat} castShadow />

      {/* Arms */}
      <Cylinder
        args={[0.06, 0.05, 0.5, 8]}
        position={[-0.3, 0.85, 0]}
        rotation={[0, 0, 0.12]}
        material={mat}
        castShadow
      />
      <Cylinder
        args={[0.06, 0.05, 0.5, 8]}
        position={[0.3, 0.85, 0]}
        rotation={[0, 0, -0.12]}
        material={mat}
        castShadow
      />

      {/* Legs */}
      <Cylinder args={[0.09, 0.08, 0.5, 10]} position={[-0.12, 0.25, 0]} material={mat} castShadow />
      <Cylinder args={[0.09, 0.08, 0.5, 10]} position={[0.12, 0.25, 0]} material={mat} castShadow />
    </group>
  );
}

function MysterySilhouette({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const glitchRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!glitchRef.current) return;
    // Subtle random glitch on X
    glitchRef.current.position.x = (Math.random() - 0.5) * 0.04;
  });

  return (
    <group ref={glitchRef}>
      {/* Same silhouette as normal guy */}
      <Capsule args={[0.2, 0.6, 8, 16]} position={[0, 0.85, 0]} material={mat} castShadow />
      <Sphere args={[0.24, 20, 20]} position={[0, 1.55, 0]} material={mat} castShadow />

      {/* Question mark on face — a small glowing sphere */}
      <mesh position={[0, 1.58, 0.22]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#6B21A8" emissive="#a855f7" emissiveIntensity={1.0} transparent opacity={0.9} />
      </mesh>

      {/* Arms */}
      <Cylinder
        args={[0.06, 0.05, 0.5, 8]}
        position={[-0.3, 0.85, 0]}
        rotation={[0, 0, 0.12]}
        material={mat}
        castShadow
      />
      <Cylinder
        args={[0.06, 0.05, 0.5, 8]}
        position={[0.3, 0.85, 0]}
        rotation={[0, 0, -0.12]}
        material={mat}
        castShadow
      />

      {/* Legs */}
      <Cylinder args={[0.09, 0.08, 0.5, 10]} position={[-0.12, 0.25, 0]} material={mat} castShadow />
      <Cylinder args={[0.09, 0.08, 0.5, 10]} position={[0.12, 0.25, 0]} material={mat} castShadow />

      {/* Wispy aura particles — small translucent spheres floating around */}
      {[0, 1, 2, 3, 4].map((i) => (
        <AuraOrb key={i} index={i} />
      ))}
    </group>
  );
}

/** Small floating orb for mystery aura effect. */
function AuraOrb({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => index * ((Math.PI * 2) / 5), [index]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.8 + offset;
    ref.current.position.x = Math.sin(t) * 0.4;
    ref.current.position.z = Math.cos(t) * 0.4;
    ref.current.position.y = 0.9 + Math.sin(t * 1.3) * 0.3;
    // Pulse opacity
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.3 + Math.sin(t * 2) * 0.2;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshStandardMaterial
        color="#6B21A8"
        emissive="#a855f7"
        emissiveIntensity={0.8}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// GLB model for buff_arnold
// ---------------------------------------------------------------------------

const BUFF_ARNOLD_MODEL = '/models/character_01.glb';
const BANANA_GUY_MODEL = '/models/cute_cat_in_cute_banana.glb';
const NORMAL_GUY_MODEL = '/models/man_in_suit.glb';

function useClonedModel(path: string, scale = 0.015) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Reset any root-level transforms from Sketchfab export so the model
    // sits at the parent group's position, not at the scene origin.
    c.position.set(0, 0, 0);
    c.rotation.set(0, 0, 0);
    c.scale.setScalar(1);
    return c;
  }, [scene]);
  return <primitive object={cloned} scale={scale} position={[0, 0, 0]} />;
}

function BuffArnoldGLB() {
  return useClonedModel(BUFF_ARNOLD_MODEL, 0.015);
}

function BananaGuyGLB() {
  return useClonedModel(BANANA_GUY_MODEL, 0.015);
}

function NormalGuyGLB() {
  return useClonedModel(NORMAL_GUY_MODEL, 0.015);
}

useGLTF.preload(BUFF_ARNOLD_MODEL);
useGLTF.preload(BANANA_GUY_MODEL);
useGLTF.preload(NORMAL_GUY_MODEL);

// ---------------------------------------------------------------------------
// Body router
// ---------------------------------------------------------------------------

function CharacterBody({
  avatarType,
  mat,
}: {
  avatarType: AvatarType;
  mat: THREE.MeshStandardMaterial;
}) {
  switch (avatarType) {
    case 'buff_arnold':
      return <BuffArnoldGLB />;
    case 'banana_guy':
      return <BananaGuyGLB />;
    case 'anime_girl':
      return <AnimeGirl mat={mat} />;
    case 'bland_normal_guy':
      return <NormalGuyGLB />;
    case 'mystery_silhouette':
      return <MysterySilhouette mat={mat} />;
    default:
      return <NormalGuyGLB />;
  }
}

// ---------------------------------------------------------------------------
// Head Y positions per avatar type (for label placement)
// ---------------------------------------------------------------------------

const HEAD_Y: Record<AvatarType, number> = {
  buff_arnold: 2.15,
  banana_guy: 2.2,
  anime_girl: 2.05,
  bland_normal_guy: 1.95,
  mystery_silhouette: 1.95,
};

// ---------------------------------------------------------------------------
// Match score colour helper
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

// ---------------------------------------------------------------------------
// Floating label component (Drei Html)
// ---------------------------------------------------------------------------

function FloatingLabel({
  name,
  matchScore,
  y,
}: {
  name: string;
  matchScore: number;
  y: number;
}) {
  return (
    <Html
      position={[0, y, 0]}
      center
      distanceFactor={6}
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 20,
          padding: '4px 12px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </span>
        <span
          style={{
            background: scoreColor(matchScore),
            color: '#fff',
            fontWeight: 700,
            fontSize: 11,
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: 10,
            padding: '1px 7px',
            lineHeight: '18px',
          }}
        >
          {matchScore}%
        </span>
      </div>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LobbyCharacter({
  avatarType,
  name,
  matchScore,
  position,
  rotationY = 0,
  onClick,
  isSelected,
  isFocused,
}: LobbyCharacterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const preset = PRESETS[avatarType];
  const mat = useMat(preset, isSelected);

  // Track animated focus values for smooth lerp
  const focusState = useRef({ scale: 1.0, opacity: 1.0, emissive: preset.emissiveIntensity });

  // Stable random seed per character (from name) for desynchronised animation
  const seed = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) {
      h = (h * 31 + name.charCodeAt(i)) | 0;
    }
    return (h & 0xffff) / 0xffff;
  }, [name]);

  // ------ idle animation + focus dimming ------
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime + seed * 100;

    // Focus-based target values
    const targetScale = isFocused ? (isSelected ? 1.1 : 1.0) : 0.75;
    const targetOpacity = isFocused ? (preset.opacity ?? 1) : 0.4;
    const targetEmissive = isFocused
      ? preset.emissiveIntensity + (isSelected ? 0.25 : 0)
      : preset.emissiveIntensity * 0.2; // desaturated when not focused

    // Smooth lerp
    const lerpSpeed = 0.07;
    focusState.current.scale = THREE.MathUtils.lerp(focusState.current.scale, targetScale, lerpSpeed);
    focusState.current.opacity = THREE.MathUtils.lerp(focusState.current.opacity, targetOpacity, lerpSpeed);
    focusState.current.emissive = THREE.MathUtils.lerp(focusState.current.emissive, targetEmissive, lerpSpeed);

    // Apply scale with breathing
    const breathe = 1.0 + Math.sin(t * 1.8) * 0.01;
    const s = focusState.current.scale;
    groupRef.current.scale.setScalar(s);
    groupRef.current.scale.y = s * breathe;

    // Update material opacity and emissive for dimming
    mat.opacity = focusState.current.opacity;
    mat.transparent = focusState.current.opacity < 0.99;
    mat.emissiveIntensity = focusState.current.emissive;

    // Weight shift — subtle Z rotation
    groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.02;

    // Head look-around
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      headRef.current.rotation.x = Math.sin(t * 0.35) * 0.03;
    }
  });

  // Cursor style
  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Invisible click target — a tall box around the character for easier clicking */}
        <mesh visible={false} position={[0, 1.0, 0]}>
          <boxGeometry args={[0.9, 2.2, 0.7]} />
        </mesh>

        {/* Head group for look-around */}
        <group ref={headRef}>
          <CharacterBody avatarType={avatarType} mat={mat} />
        </group>

        {/* Shadow caster disc on the ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <circleGeometry args={[0.35, 24]} />
          <meshStandardMaterial color="#000" transparent opacity={0.18} />
        </mesh>

        {/* Selected spotlight from above */}
        {isSelected && (
          <spotLight
            position={[0, 4, 0]}
            angle={0.35}
            penumbra={0.6}
            intensity={2}
            distance={6}
            color="#ffffff"
            castShadow
            target-position={[0, 0, 0]}
          />
        )}

        {/* Hover ring */}
        {(hovered || isSelected) && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.4, 0.48, 32]} />
            <meshStandardMaterial
              color={preset.emissive}
              emissive={preset.emissive}
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* Floating name + match score label — always visible, outside groupRef so it is not scaled */}
      <FloatingLabel
        name={name}
        matchScore={matchScore}
        y={HEAD_Y[avatarType]}
      />
    </group>
  );
}

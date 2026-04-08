import { Suspense, useMemo, useRef, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerformanceMonitor,
  AdaptiveDpr,
  Html,
} from '@react-three/drei';
// Post-processing removed for faster load — emissive materials provide glow
import * as THREE from 'three';

import LobbyLighting from '@/components/3d/LobbyLighting';
import LobbyEnvironment from '@/components/3d/LobbyEnvironment';
import LobbyCharacter from '@/components/3d/LobbyCharacter';

import type { AvatarType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CharacterData {
  userId: string;
  name: string;
  avatarType: AvatarType;
  matchScore: number;
  program: string;
  tags: string[];
  shared: { events: number; interests: number };
}

interface LobbySceneProps {
  characters: CharacterData[];
  selectedId: string | null;
  onSelectCharacter: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

/** Compute semi-circle positions from -60 deg to +60 deg facing camera. */
function useSemiCircleLayout(count: number, radius: number) {
  return useMemo(() => {
    if (count === 0) return [];

    const startAngle = THREE.MathUtils.degToRad(-60);
    const endAngle = THREE.MathUtils.degToRad(60);
    const span = endAngle - startAngle;

    return Array.from({ length: count }, (_, i) => {
      // Spread evenly across the arc; single item goes to centre
      const t = count === 1 ? 0.5 : i / (count - 1);
      const angle = startAngle + t * span;

      // Position on the semi-circle (XZ plane)
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      // Rotation so the character faces inward (toward the origin)
      const rotationY = angle + Math.PI;

      return {
        position: [x, 0, z] as [number, number, number],
        rotationY,
      };
    });
  }, [count, radius]);
}

/* ------------------------------------------------------------------ */
/*  Loading spinner (Canvas-friendly HTML overlay)                     */
/* ------------------------------------------------------------------ */

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
        <p className="whitespace-nowrap text-xs font-medium text-white/70">
          Loading lobby...
        </p>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/*  Inner scene (rendered inside Canvas)                               */
/* ------------------------------------------------------------------ */

interface InnerSceneProps {
  characters: CharacterData[];
  selectedId: string | null;
  onSelectCharacter: (id: string) => void;
}

function InnerScene({ characters, selectedId, onSelectCharacter }: InnerSceneProps) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const [dprDegraded, setDprDegraded] = useState(false);

  const layout = useSemiCircleLayout(characters.length, 2.5);

  /* ------ Performance callbacks ------ */
  const handlePerformanceIncline = useCallback(() => {
    setDprDegraded(false);
  }, []);

  const handlePerformanceDecline = useCallback(() => {
    setDprDegraded(true);
  }, []);

  /* ------ Whether to auto-rotate ------ */
  const shouldAutoRotate = selectedId === null;

  return (
    <>
      {/* ---- Performance adaptive tools ---- */}
      <PerformanceMonitor
        onIncline={handlePerformanceIncline}
        onDecline={handlePerformanceDecline}
      />
      <AdaptiveDpr pixelated />

      {/* ---- Lighting ---- */}
      <LobbyLighting />

      {/* ---- Environment (floor, particles, fog, etc.) ---- */}
      <LobbyEnvironment />

      {/* ---- Characters arranged in semi-circle ---- */}
      {characters.map((char, i) => {
        const placement = layout[i];
        if (!placement) return null;

        return (
          <LobbyCharacter
            key={char.userId}
            userId={char.userId}
            name={char.name}
            avatarType={char.avatarType}
            matchScore={char.matchScore}
            program={char.program}
            tags={char.tags}
            shared={char.shared}
            position={placement.position}
            rotationY={placement.rotationY}
            isSelected={char.userId === selectedId}
            onClick={() => onSelectCharacter(char.userId)}
          />
        );
      })}

      {/* ---- Camera controls ---- */}
      <OrbitControls
        ref={controlsRef}
        autoRotate={shouldAutoRotate}
        autoRotateSpeed={0.3}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 0.8, 0]}
        enableDamping
        dampingFactor={0.08}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
      />

      {/* Post-processing removed for performance — emissive materials handle glow */}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main exported component                                            */
/* ------------------------------------------------------------------ */

export default function LobbyScene({
  characters,
  selectedId,
  onSelectCharacter,
}: LobbySceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3, 6], fov: 50 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#0a0a1a' }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <InnerScene
          characters={characters}
          selectedId={selectedId}
          onSelectCharacter={onSelectCharacter}
        />
      </Suspense>
    </Canvas>
  );
}

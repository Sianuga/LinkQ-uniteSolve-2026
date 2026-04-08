import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr, Html } from '@react-three/drei';
import * as THREE from 'three';

import LobbyLighting from '@/components/3d/LobbyLighting';
import LobbyEnvironment from '@/components/3d/LobbyEnvironment';
import LobbyCharacter from '@/components/3d/LobbyCharacter';

import type { AvatarType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CharacterData {
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
  focusIndex: number;
  onSelectCharacter: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Line layout — characters spaced in a row along X axis             */
/* ------------------------------------------------------------------ */

const CHARACTER_SPACING = 2.5; // distance between characters

function useLineLayout(count: number) {
  return useMemo(() => {
    const totalWidth = (count - 1) * CHARACTER_SPACING;
    const startX = -totalWidth / 2;

    return Array.from({ length: count }, (_, i) => ({
      position: [startX + i * CHARACTER_SPACING, 0, 0] as [number, number, number],
      rotationY: 0, // all face camera
    }));
  }, [count]);
}

/* ------------------------------------------------------------------ */
/*  Camera controller — smoothly follows focusIndex on X axis         */
/* ------------------------------------------------------------------ */

function CameraController({ focusIndex, characterCount }: { focusIndex: number; characterCount: number }) {
  const { camera } = useThree();
  const targetX = useRef(0);

  useEffect(() => {
    const totalWidth = (characterCount - 1) * CHARACTER_SPACING;
    const startX = -totalWidth / 2;
    targetX.current = startX + focusIndex * CHARACTER_SPACING;
  }, [focusIndex, characterCount]);

  useFrame(() => {
    // Smooth lerp camera X toward the focused character
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX.current, 0.08);
    camera.lookAt(targetX.current, 0.8, 0);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Swipe handler — horizontal drag on the canvas to change focus     */
/* ------------------------------------------------------------------ */

function SwipeHandler({
  characterCount,
  onSwipe,
}: {
  characterCount: number;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const startX = useRef(0);
  const dragging = useRef(false);

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      startX.current = e.clientX;
      dragging.current = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      const dx = e.clientX - startX.current;
      if (Math.abs(dx) > 40) {
        onSwipe(dx < 0 ? 'right' : 'left');
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl, onSwipe, characterCount]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Loading spinner                                                    */
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
/*  Inner scene                                                        */
/* ------------------------------------------------------------------ */

function InnerScene({
  characters,
  selectedId,
  focusIndex,
  onSelectCharacter,
  onSwipe,
}: {
  characters: CharacterData[];
  selectedId: string | null;
  focusIndex: number;
  onSelectCharacter: (id: string) => void;
  onSwipe: (dir: 'left' | 'right') => void;
}) {
  const layout = useLineLayout(characters.length);

  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />

      <LobbyLighting />
      <LobbyEnvironment />

      <CameraController focusIndex={focusIndex} characterCount={characters.length} />
      <SwipeHandler characterCount={characters.length} onSwipe={onSwipe} />

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
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function LobbyScene({
  characters,
  selectedId,
  focusIndex,
  onSelectCharacter,
}: LobbySceneProps) {
  const [internalFocus, setInternalFocus] = useState(focusIndex);

  useEffect(() => {
    setInternalFocus(focusIndex);
  }, [focusIndex]);

  const handleSwipe = useMemo(
    () => (dir: 'left' | 'right') => {
      setInternalFocus((prev) => {
        const next = dir === 'right' ? prev + 1 : prev - 1;
        const clamped = Math.max(0, Math.min(characters.length - 1, next));
        // Also select the character we swipe to
        if (characters[clamped]) {
          onSelectCharacter(characters[clamped].userId);
        }
        return clamped;
      });
    },
    [characters, onSelectCharacter],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 2, 5], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#0a0a1a', touchAction: 'none' }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <InnerScene
          characters={characters}
          selectedId={selectedId}
          focusIndex={internalFocus}
          onSelectCharacter={onSelectCharacter}
          onSwipe={handleSwipe}
        />
      </Suspense>
    </Canvas>
  );
}

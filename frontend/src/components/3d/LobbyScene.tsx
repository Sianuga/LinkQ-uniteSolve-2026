import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, AdaptiveDpr, Html } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
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

export interface LobbySceneProps {
  characters: CharacterData[];
  selectedId: string | null;
  focusIndex: number;
  onSelectCharacter: (id: string) => void;
  onFocusChange?: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SPACING = 2.0;
const CAMERA_POS: [number, number, number] = [0, 1.6, 5.5];
const CAMERA_LOOKAT: [number, number, number] = [0, 0.9, 0];
const CAMERA_FOV = 40;

/* ------------------------------------------------------------------ */
/*  CameraSetup — fixed camera, calls lookAt every frame              */
/* ------------------------------------------------------------------ */

function CameraSetup() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.set(CAMERA_POS[0], CAMERA_POS[1], CAMERA_POS[2]);
    camera.lookAt(CAMERA_LOOKAT[0], CAMERA_LOOKAT[1], CAMERA_LOOKAT[2]);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  SwipeHandler — horizontal drag on the canvas to change focus       */
/* ------------------------------------------------------------------ */

function SwipeHandler({
  characterCount,
  focusIndex,
  onSwipe,
  onOverscroll,
}: {
  characterCount: number;
  focusIndex: number;
  onSwipe: (direction: 'left' | 'right', skip: number) => void;
  onOverscroll: (offset: number) => void;
}) {
  const { gl } = useThree();

  useDrag(
    ({ movement: [mx], velocity: [vx], elapsed, last, tap }) => {
      if (tap) return;
      if (last && Math.abs(mx) < 10 && elapsed < 300) return;

      if (!last) {
        const atStart = focusIndex === 0 && mx > 0;
        const atEnd = focusIndex === characterCount - 1 && mx < 0;
        if (atStart || atEnd) {
          const rubberBand = Math.sign(mx) * Math.min(Math.abs(mx) / 200, 0.5);
          onOverscroll(rubberBand);
        }
        return;
      }

      onOverscroll(0);

      const absMx = Math.abs(mx);
      const absVx = Math.abs(vx);

      if (absMx > 25 || absVx > 0.3) {
        const direction: 'left' | 'right' = mx < 0 ? 'right' : 'left';
        const skip = absVx > 1.0 ? 2 : 1;
        onSwipe(direction, skip);
        navigator.vibrate?.(10);
      }
    },
    {
      target: gl.domElement,
      pointer: { touch: true },
      threshold: 10,
      filterTaps: true,
    },
  );

  return null;
}

/* ------------------------------------------------------------------ */
/*  Per-character spotlight                                             */
/* ------------------------------------------------------------------ */

function CharacterSpotlight({ isFocused }: { isFocused: boolean }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const currentIntensity = useRef(0.4);

  useFrame(() => {
    if (!lightRef.current) return;
    const target = isFocused ? 2.5 : 0.4;
    currentIntensity.current = THREE.MathUtils.lerp(currentIntensity.current, target, 0.08);
    lightRef.current.intensity = currentIntensity.current;
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[0, 4, 1]}
        intensity={0.4}
        angle={0.5}
        penumbra={0.7}
        distance={8}
        color={isFocused ? '#ffffff' : '#a0b4d0'}
        castShadow={false}
        target={targetRef.current ?? undefined}
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  LineupGroup — horizontal character lineup that slides to center    */
/*  the focused character                                              */
/* ------------------------------------------------------------------ */

function LineupGroup({
  characters,
  focusIndex,
  selectedId,
  overscrollOffset,
  onSelect,
}: {
  characters: CharacterData[];
  focusIndex: number;
  selectedId: string | null;
  overscrollOffset: number;
  onSelect: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Store per-character z targets for smooth lerp
  const charGroupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    if (!groupRef.current) return;

    // Slide group so the focused character is centered at x=0
    const targetX = -focusIndex * SPACING + overscrollOffset * SPACING * 0.3;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      0.08,
    );

    // Smoothly lerp each character's z position based on focus
    for (let i = 0; i < characters.length; i++) {
      const ref = charGroupRefs.current[i];
      if (!ref) continue;
      const targetZ = i === focusIndex ? 0.5 : -0.3;
      ref.position.z = THREE.MathUtils.lerp(ref.position.z, targetZ, 0.08);
    }
  });

  return (
    <group ref={groupRef}>
      {characters.map((char, i) => (
        <group
          key={char.userId}
          ref={(el) => {
            charGroupRefs.current[i] = el;
          }}
          position={[i * SPACING, 0, i === focusIndex ? 0.5 : -0.3]}
        >
          <LobbyCharacter
            userId={char.userId}
            name={char.name}
            avatarType={char.avatarType}
            matchScore={char.matchScore}
            program={char.program}
            tags={char.tags}
            shared={char.shared}
            position={[0, 0, 0]}
            rotationY={0}
            isSelected={char.userId === selectedId}
            isFocused={i === focusIndex}
            onClick={() => onSelect(char.userId)}
          />
          <CharacterSpotlight isFocused={i === focusIndex} />
        </group>
      ))}
    </group>
  );
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
  overscrollOffset,
  onSelectCharacter,
  onSwipe,
  onOverscroll,
}: {
  characters: CharacterData[];
  selectedId: string | null;
  focusIndex: number;
  overscrollOffset: number;
  onSelectCharacter: (id: string) => void;
  onSwipe: (dir: 'left' | 'right', skip: number) => void;
  onOverscroll: (offset: number) => void;
}) {
  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />

      <CameraSetup />

      <LobbyLighting />
      <LobbyEnvironment />

      <SwipeHandler
        characterCount={characters.length}
        focusIndex={focusIndex}
        onSwipe={onSwipe}
        onOverscroll={onOverscroll}
      />

      <LineupGroup
        characters={characters}
        focusIndex={focusIndex}
        selectedId={selectedId}
        overscrollOffset={overscrollOffset}
        onSelect={onSelectCharacter}
      />
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
  onFocusChange,
}: LobbySceneProps) {
  const [internalFocus, setInternalFocus] = useState(focusIndex);
  const [overscrollOffset, setOverscrollOffset] = useState(0);

  useEffect(() => {
    setInternalFocus(focusIndex);
  }, [focusIndex]);

  const handleSwipe = useCallback(
    (dir: 'left' | 'right', skip: number) => {
      setInternalFocus((prev) => {
        const delta = dir === 'right' ? skip : -skip;
        const next = prev + delta;
        const clamped = Math.max(0, Math.min(characters.length - 1, next));
        onFocusChange?.(clamped);
        return clamped;
      });
    },
    [characters.length, onFocusChange],
  );

  const handleOverscroll = useCallback((offset: number) => {
    setOverscrollOffset(offset);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: CAMERA_POS, fov: CAMERA_FOV }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#0a0a1a', touchAction: 'none' }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <InnerScene
          characters={characters}
          selectedId={selectedId}
          focusIndex={internalFocus}
          overscrollOffset={overscrollOffset}
          onSelectCharacter={onSelectCharacter}
          onSwipe={handleSwipe}
          onOverscroll={handleOverscroll}
        />
      </Suspense>
    </Canvas>
  );
}

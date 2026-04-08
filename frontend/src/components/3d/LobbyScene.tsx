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

const SPACING = 1.4;

// Overview: camera far back to see all 5 characters on mobile portrait
const OVERVIEW_POS: [number, number, number] = [0, 2.2, 12];
const OVERVIEW_LOOKAT: [number, number, number] = [0, 0.8, 0];

// Zoomed: camera close to focused character
const ZOOM_DISTANCE = 3.0;
const ZOOM_HEIGHT = 1.5;
const ZOOM_LOOKAT_Y = 0.9;

/* ------------------------------------------------------------------ */
/*  CameraController — overview (all chars visible) or zoom on select */
/* ------------------------------------------------------------------ */

function CameraController({
  selectedId,
  focusIndex,
  characterCount,
}: {
  selectedId: string | null;
  focusIndex: number;
  characterCount: number;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...OVERVIEW_POS));
  const targetLookAt = useRef(new THREE.Vector3(...OVERVIEW_LOOKAT));
  const currentPos = useRef(new THREE.Vector3(...OVERVIEW_POS));
  const currentLookAt = useRef(new THREE.Vector3(...OVERVIEW_LOOKAT));

  useEffect(() => {
    if (selectedId) {
      // Zoom in on the focused character
      const totalWidth = (characterCount - 1) * SPACING;
      const charX = -totalWidth / 2 + focusIndex * SPACING;
      targetPos.current.set(charX, ZOOM_HEIGHT, ZOOM_DISTANCE);
      targetLookAt.current.set(charX, ZOOM_LOOKAT_Y, 0);
    } else {
      // Overview — see all characters
      targetPos.current.set(...OVERVIEW_POS);
      targetLookAt.current.set(...OVERVIEW_LOOKAT);
    }
  }, [selectedId, focusIndex, characterCount]);

  useFrame(() => {
    const speed = 0.06;
    currentPos.current.lerp(targetPos.current, speed);
    currentLookAt.current.lerp(targetLookAt.current, speed);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
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
  onSelect,
}: {
  characters: CharacterData[];
  focusIndex: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  // Characters in fixed positions — camera moves, not the group
  const totalWidth = (characters.length - 1) * SPACING;
  const startX = -totalWidth / 2;

  return (
    <group>
      {characters.map((char, i) => (
        <group key={char.userId} position={[startX + i * SPACING, 0, 0]}>
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

      <CameraController selectedId={selectedId} focusIndex={focusIndex} characterCount={characters.length} />

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
      camera={{ position: OVERVIEW_POS, fov: 55 }}
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

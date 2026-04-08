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

const CAMERA_POS: [number, number, number] = [0, 1.6, 4.5];
const CAMERA_LOOKAT: [number, number, number] = [0, 0.8, 0];
const ZOOM_POS: [number, number, number] = [0, 1.4, 3.0];
const ZOOM_LOOKAT: [number, number, number] = [0, 0.9, 0];

/** Carousel slot positions — only 3 characters visible at a time. */
const SLOTS = {
  center: { pos: [0, 0, 0.3] as [number, number, number], scale: 1.0 },
  left: { pos: [-2.0, 0, -0.5] as [number, number, number], scale: 0.7 },
  right: { pos: [2.0, 0, -0.5] as [number, number, number], scale: 0.7 },
};

/* ------------------------------------------------------------------ */
/*  Utility                                                            */
/* ------------------------------------------------------------------ */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ------------------------------------------------------------------ */
/*  CameraController — 2-state: overview or zoomed to center           */
/* ------------------------------------------------------------------ */

function CameraController({ selectedId }: { selectedId: string | null }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_POS));
  const targetLookAt = useRef(new THREE.Vector3(...CAMERA_LOOKAT));
  const currentPos = useRef(new THREE.Vector3(...CAMERA_POS));
  const currentLookAt = useRef(new THREE.Vector3(...CAMERA_LOOKAT));

  useEffect(() => {
    if (selectedId) {
      targetPos.current.set(...ZOOM_POS);
      targetLookAt.current.set(...ZOOM_LOOKAT);
    } else {
      targetPos.current.set(...CAMERA_POS);
      targetLookAt.current.set(...CAMERA_LOOKAT);
    }
  }, [selectedId]);

  useFrame(() => {
    currentPos.current.lerp(targetPos.current, 0.06);
    currentLookAt.current.lerp(targetLookAt.current, 0.06);
    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  SwipeHandler — horizontal drag on the canvas to cycle carousel     */
/* ------------------------------------------------------------------ */

function SwipeHandler({
  characterCount,
  focusIndex,
  onSwipe,
}: {
  characterCount: number;
  focusIndex: number;
  onSwipe: (direction: 'left' | 'right', skip: number) => void;
}) {
  const { gl } = useThree();

  useDrag(
    ({ movement: [mx], velocity: [vx], elapsed, last, tap }) => {
      if (tap) return;
      if (last && Math.abs(mx) < 10 && elapsed < 300) return;

      if (!last) return;

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
/*  Per-character spotlight — only visible on center (focused) char    */
/* ------------------------------------------------------------------ */

function CharacterSpotlight({ isFocused }: { isFocused: boolean }) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const currentIntensity = useRef(0.4);

  useFrame(() => {
    if (!lightRef.current) return;
    const target = isFocused ? 2.5 : 0.4;
    currentIntensity.current = lerp(currentIntensity.current, target, 0.08);
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
/*  AnimatedSlot — lerps position and scale each frame                 */
/* ------------------------------------------------------------------ */

function AnimatedSlot({
  targetPos,
  targetScale,
  children,
}: {
  targetPos: readonly [number, number, number];
  targetScale: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.x = lerp(ref.current.position.x, targetPos[0], 0.1);
    ref.current.position.y = lerp(ref.current.position.y, targetPos[1], 0.1);
    ref.current.position.z = lerp(ref.current.position.z, targetPos[2], 0.1);
    const s = lerp(ref.current.scale.x, targetScale, 0.1);
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} position={[targetPos[0], targetPos[1], targetPos[2]]}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  CarouselGroup — renders exactly 3 characters in left/center/right */
/* ------------------------------------------------------------------ */

function CarouselGroup({
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
  const count = characters.length;

  // Handle edge cases: 0, 1, or 2 characters
  if (count === 0) return null;

  // Compute which indices occupy the 3 slots (wrapping)
  const prevIdx = (focusIndex - 1 + count) % count;
  const currentIdx = focusIndex;
  const nextIdx = (focusIndex + 1) % count;

  // Build the slot assignments — deduplicate for small arrays
  type SlotEntry = {
    charIndex: number;
    slot: 'left' | 'center' | 'right';
  };
  const slots: SlotEntry[] = [];

  // Center is always present
  slots.push({ charIndex: currentIdx, slot: 'center' });

  // Only add left if it differs from center (covers count === 1)
  if (prevIdx !== currentIdx) {
    slots.push({ charIndex: prevIdx, slot: 'left' });
  }

  // Only add right if it differs from center AND from left (covers count <= 2)
  if (nextIdx !== currentIdx && nextIdx !== prevIdx) {
    slots.push({ charIndex: nextIdx, slot: 'right' });
  }

  return (
    <group>
      {slots.map(({ charIndex, slot }) => {
        const char = characters[charIndex];
        const slotDef = SLOTS[slot];
        const isFocused = slot === 'center';

        return (
          <AnimatedSlot
            key={char.userId}
            targetPos={slotDef.pos}
            targetScale={slotDef.scale}
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
              isFocused={isFocused}
              onClick={() => onSelect(char.userId)}
            />
            <CharacterSpotlight isFocused={isFocused} />
          </AnimatedSlot>
        );
      })}
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
  onSelectCharacter,
  onSwipe,
}: {
  characters: CharacterData[];
  selectedId: string | null;
  focusIndex: number;
  onSelectCharacter: (id: string) => void;
  onSwipe: (dir: 'left' | 'right', skip: number) => void;
}) {
  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />

      <CameraController selectedId={selectedId} />

      <LobbyLighting />
      <LobbyEnvironment />

      <SwipeHandler
        characterCount={characters.length}
        focusIndex={focusIndex}
        onSwipe={onSwipe}
      />

      <CarouselGroup
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

  useEffect(() => {
    setInternalFocus(focusIndex);
  }, [focusIndex]);

  const handleSwipe = useCallback(
    (dir: 'left' | 'right', skip: number) => {
      setInternalFocus((prev) => {
        const count = characters.length;
        if (count === 0) return prev;
        const delta = dir === 'right' ? skip : -skip;
        // Wrap around instead of clamping — carousel is circular
        const next = ((prev + delta) % count + count) % count;
        onFocusChange?.(next);
        return next;
      });
    },
    [characters.length, onFocusChange],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: CAMERA_POS, fov: 55 }}
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

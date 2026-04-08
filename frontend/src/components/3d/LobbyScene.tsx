import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react';
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

interface LobbySceneProps {
  characters: CharacterData[];
  selectedId: string | null;
  focusIndex: number;
  onSelectCharacter: (id: string) => void;
  onFocusChange?: (index: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Circle layout — characters arranged on circular platform          */
/* ------------------------------------------------------------------ */

const CIRCLE_RADIUS = 2.2; // radius of character circle (inside platform edge of 4)

function useCircleLayout(count: number) {
  return useMemo(() => {
    if (count === 0) return [];
    if (count === 1) return [{ position: [0, 0, 0] as [number, number, number], rotationY: 0, angle: 0 }];

    return Array.from({ length: count }, (_, i) => {
      // Spread evenly around the circle
      const angle = (i / count) * Math.PI * 2;
      const x = Math.sin(angle) * CIRCLE_RADIUS;
      const z = Math.cos(angle) * CIRCLE_RADIUS;
      // Face toward center
      const rotationY = angle + Math.PI;

      return {
        position: [x, 0, z] as [number, number, number],
        rotationY,
        angle,
      };
    });
  }, [count]);
}

/* ------------------------------------------------------------------ */
/*  Camera controller — orbits around circle to face focused char     */
/* ------------------------------------------------------------------ */

const CAMERA_DISTANCE = 5; // distance from center
const CAMERA_HEIGHT = 2.2;

function CameraController({
  focusIndex,
  characterCount,
  overscrollOffset = 0,
}: {
  focusIndex: number;
  characterCount: number;
  overscrollOffset?: number;
}) {
  const { camera } = useThree();
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);

  useEffect(() => {
    if (characterCount === 0) return;
    // Camera goes to the opposite side of the circle from the focused character
    // so it faces toward them
    const charAngle = (focusIndex / characterCount) * Math.PI * 2;
    targetAngle.current = charAngle + overscrollOffset * 0.3;
  }, [focusIndex, characterCount, overscrollOffset]);

  useFrame(() => {
    // Smoothly lerp angle
    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle.current, 0.06);

    // Position camera on the opposite side of the circle, looking inward
    const camAngle = currentAngle.current + Math.PI; // opposite side
    camera.position.x = Math.sin(camAngle) * CAMERA_DISTANCE;
    camera.position.z = Math.cos(camAngle) * CAMERA_DISTANCE;
    camera.position.y = CAMERA_HEIGHT;

    // Look at the focused character's position on the circle
    const lookX = Math.sin(currentAngle.current) * CIRCLE_RADIUS;
    const lookZ = Math.cos(currentAngle.current) * CIRCLE_RADIUS;
    camera.lookAt(lookX, 0.8, lookZ);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Swipe handler — horizontal drag on the canvas to change focus     */
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

  // When `target` is specified, useDrag auto-binds to the element — no manual bind() call needed
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
/*  Focus spotlight — follows the focused character from above         */
/* ------------------------------------------------------------------ */

function FocusSpotlight({
  focusIndex,
  characterCount,
}: {
  focusIndex: number;
  characterCount: number;
}) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const targetPos = useRef({ x: 0, z: 0 });

  useEffect(() => {
    if (characterCount === 0) return;
    const angle = (focusIndex / characterCount) * Math.PI * 2;
    targetPos.current = {
      x: Math.sin(angle) * CIRCLE_RADIUS,
      z: Math.cos(angle) * CIRCLE_RADIUS,
    };
  }, [focusIndex, characterCount]);

  useFrame(() => {
    if (!lightRef.current) return;
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetPos.current.x, 0.08);
    lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, targetPos.current.z, 0.08);
    if (targetRef.current) {
      targetRef.current.position.x = lightRef.current.position.x;
      targetRef.current.position.z = lightRef.current.position.z;
    }
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        position={[0, 4, 0]}
        intensity={2}
        angle={0.4}
        penumbra={0.8}
        distance={8}
        color="#ffffff"
        castShadow={false}
        target={targetRef.current ?? undefined}
      />
      <object3D ref={targetRef} position={[0, 0, 0]} />
    </>
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
  const layout = useCircleLayout(characters.length);

  return (
    <>
      <PerformanceMonitor />
      <AdaptiveDpr pixelated />

      <LobbyLighting />
      <LobbyEnvironment />

      <CameraController focusIndex={focusIndex} characterCount={characters.length} overscrollOffset={overscrollOffset} />
      <SwipeHandler characterCount={characters.length} focusIndex={focusIndex} onSwipe={onSwipe} onOverscroll={onOverscroll} />

      <FocusSpotlight focusIndex={focusIndex} characterCount={characters.length} />

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
            isFocused={i === focusIndex}
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
        // Swipe only moves focus, does NOT select (no bottom sheet)
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
      camera={{ position: [0, 2, 5], fov: 45 }}
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

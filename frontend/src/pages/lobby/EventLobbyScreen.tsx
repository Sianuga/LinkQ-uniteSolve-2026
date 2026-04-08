import { useState, useRef, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Environment, Float } from '@react-three/drei';
import { ArrowLeft, X, User as UserIcon } from 'lucide-react';
import { mockEvents, mockMatches } from '@/data/mockData';
import type { AvatarType, MatchCandidate } from '@/types';
import type { Group, Mesh } from 'three';

/* ------------------------------------------------------------------ */
/*  Avatar color map                                                   */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS: Record<AvatarType, string> = {
  buff_arnold: '#F97316',
  banana_guy: '#EAB308',
  anime_girl: '#06B6D4',
  bland_normal_guy: '#9CA3AF',
  mystery_silhouette: '#6B21A8',
};

/* ------------------------------------------------------------------ */
/*  3D Character                                                       */
/* ------------------------------------------------------------------ */

interface CharacterProps {
  match: MatchCandidate;
  position: [number, number, number];
  onClick: () => void;
}

function Character({ match, position, onClick }: CharacterProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const color = AVATAR_COLORS[match.avatar] ?? '#9CA3AF';
  const isMystery = match.avatar === 'mystery_silhouette';
  const matchPct = Math.round(match.match_score * 100);

  // Idle bobbing animation — each character gets a unique phase offset
  const phaseOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y =
        position[1] + Math.sin(t * 1.2 + phaseOffset.current) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Body — capsule-like: cylinder + two sphere caps */}
      <mesh ref={bodyRef} position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.7, 8, 16]} />
        <meshStandardMaterial
          color={color}
          transparent={isMystery}
          opacity={isMystery ? 0.6 : 1}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial
          color={color}
          transparent={isMystery}
          opacity={isMystery ? 0.6 : 1}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.42, 0.7, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.1, 0.45, 4, 8]} />
        <meshStandardMaterial
          color={color}
          transparent={isMystery}
          opacity={isMystery ? 0.6 : 1}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.42, 0.7, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.1, 0.45, 4, 8]} />
        <meshStandardMaterial
          color={color}
          transparent={isMystery}
          opacity={isMystery ? 0.6 : 1}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Floating label */}
      <Html position={[0, 2.1, 0]} center distanceFactor={8} zIndexRange={[10, 0]}>
        <div
          className="pointer-events-none select-none whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-center"
          style={{
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <p className="text-xs font-bold text-gray-900 leading-tight">
            {match.name}
          </p>
          <p className="text-[10px] font-semibold text-blue-600 leading-tight">
            {matchPct}% match
          </p>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Ground Platform                                                    */
/* ------------------------------------------------------------------ */

function Platform() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group>
      {/* Main platform disc */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <cylinderGeometry args={[4.5, 4.5, 0.08, 64]} />
        <meshStandardMaterial
          color="#1E3A8A"
          transparent
          opacity={0.85}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>

      {/* Inner ring accent */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshStandardMaterial
          color="#3B82F6"
          transparent
          opacity={0.5}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Outer ring glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[4.3, 4.5, 64]} />
        <meshStandardMaterial
          color="#93C5FD"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.3}
          emissive="#3B82F6"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Grid circles for tech feel */}
      {[1.5, 2.2, 3.5].map((r) => (
        <mesh
          key={r}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
        >
          <ringGeometry args={[r - 0.01, r + 0.01, 64]} />
          <meshStandardMaterial
            color="#60A5FA"
            transparent
            opacity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Particles                                                 */
/* ------------------------------------------------------------------ */

function Particles() {
  const count = 40;
  const particlesRef = useRef<Group>(null);

  // Generate static positions once
  const positions = useRef<[number, number, number][]>(
    Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 12,
      Math.random() * 6 + 0.5,
      (Math.random() - 0.5) * 12,
    ]),
  );

  useFrame((state) => {
    if (!particlesRef.current) return;
    const t = state.clock.getElapsedTime();
    particlesRef.current.children.forEach((child, i) => {
      child.position.y =
        positions.current[i][1] + Math.sin(t * 0.5 + i * 0.7) * 0.3;
    });
  });

  return (
    <group ref={particlesRef}>
      {positions.current.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03 + Math.random() * 0.03, 8, 8]} />
          <meshStandardMaterial
            color="#93C5FD"
            emissive="#3B82F6"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  3D Scene                                                           */
/* ------------------------------------------------------------------ */

interface LobbySceneProps {
  matches: MatchCandidate[];
  onSelectCharacter: (match: MatchCandidate) => void;
}

function LobbyScene({ matches, onSelectCharacter }: LobbySceneProps) {
  // Place characters in a circle
  const radius = 2.8;
  const characterPositions: [number, number, number][] = matches.map(
    (_, i) => {
      const angle = (i / matches.length) * Math.PI * 2 - Math.PI / 2;
      return [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ];
    },
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-4, 5, -3]} intensity={0.4} color="#93C5FD" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#60A5FA" />

      {/* Environment for nice reflections */}
      <Environment preset="city" />

      {/* Ground */}
      <Platform />

      {/* Floating particles */}
      <Particles />

      {/* Characters */}
      {matches.map((match, i) => (
        <Float
          key={match.user_id}
          speed={0}
          floatIntensity={0}
          rotationIntensity={0}
        >
          <Character
            match={match}
            position={characterPositions[i]}
            onClick={() => onSelectCharacter(match)}
          />
        </Float>
      ))}

      {/* Camera controls */}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Fallback                                                   */
/* ------------------------------------------------------------------ */

function LobbyLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
      <p className="text-sm font-medium text-white/80">
        Entering lobby...
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Selected Character Overlay                                         */
/* ------------------------------------------------------------------ */

interface CharacterOverlayProps {
  match: MatchCandidate;
  onClose: () => void;
  onViewProfile: () => void;
}

function CharacterOverlay({ match, onClose, onViewProfile }: CharacterOverlayProps) {
  const color = AVATAR_COLORS[match.avatar] ?? '#9CA3AF';
  const matchPct = Math.round(match.match_score * 100);

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center pb-[max(3rem,env(safe-area-inset-bottom))] pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white p-5 shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Avatar circle */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
          >
            <UserIcon className="h-7 w-7" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {match.name}
            </h3>
            {match.program && (
              <p className="text-sm text-gray-500 truncate">{match.program}</p>
            )}
          </div>
        </div>

        {/* Match score bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">
              Match Score
            </span>
            <span className="text-sm font-bold text-blue-600">
              {matchPct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${matchPct}%`,
                background: `linear-gradient(90deg, ${color}, #3B82F6)`,
              }}
            />
          </div>
        </div>

        {/* Shared info */}
        <div className="flex gap-4 mb-4 text-center">
          <div className="flex-1 rounded-xl bg-blue-50 py-2">
            <p className="text-lg font-bold text-blue-700">
              {match.shared.events}
            </p>
            <p className="text-[10px] font-medium text-blue-500">
              Shared Events
            </p>
          </div>
          <div className="flex-1 rounded-xl bg-purple-50 py-2">
            <p className="text-lg font-bold text-purple-700">
              {match.shared.interests}
            </p>
            <p className="text-[10px] font-medium text-purple-500">
              Shared Interests
            </p>
          </div>
          {match.shared.courses && match.shared.courses.length > 0 && (
            <div className="flex-1 rounded-xl bg-teal-50 py-2">
              <p className="text-lg font-bold text-teal-700">
                {match.shared.courses.length}
              </p>
              <p className="text-[10px] font-medium text-teal-500">
                Shared Courses
              </p>
            </div>
          )}
        </div>

        {/* Tags */}
        {match.tags && match.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {match.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <button
          onClick={onViewProfile}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${color}, #1E3A8A)`,
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen Component                                              */
/* ------------------------------------------------------------------ */

export default function EventLobbyScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState<MatchCandidate | null>(null);

  const event = mockEvents.find((e) => e.id === id);
  const eventTitle = event?.title ?? 'Event Lobby';

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #020617 50%, #000000 100%)',
        }}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={<LobbyLoading />}>
          <Canvas
            camera={{ position: [0, 5, 8], fov: 45 }}
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <LobbyScene
              matches={mockMatches}
              onSelectCharacter={setSelectedMatch}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Top overlay: back button + event title */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 text-center pr-10">
          <h1 className="text-base font-bold text-white drop-shadow-lg truncate">
            {eventTitle}
          </h1>
          <p className="text-[11px] font-medium text-white/60">
            3D Lobby &middot; {mockMatches.length} participants
          </p>
        </div>
      </div>

      {/* Bottom hint */}
      {!selectedMatch && (
        <div className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] z-20 flex justify-center pointer-events-none">
          <div className="rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-medium text-white/70">
            Tap a character to view their profile
          </div>
        </div>
      )}

      {/* Selected character overlay */}
      {selectedMatch && (
        <CharacterOverlay
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onViewProfile={() => {
            setSelectedMatch(null);
            navigate(`/users/${selectedMatch.user_id}`);
          }}
        />
      )}
    </div>
  );
}

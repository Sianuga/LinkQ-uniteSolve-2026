import { ContactShadows, Environment } from '@react-three/drei';

/**
 * LobbyLighting — Dramatic game-quality lighting for the 3D character lobby.
 *
 * Inspired by Valorant's character select screen: characters pop against a
 * near-black background thanks to colored rim lights, a warm key light,
 * and subtle blue fill. A single-frame ContactShadows grounds the character
 * without any per-frame cost.
 */
export default function LobbyLighting() {
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* 1. Key light — warm spot from upper-right front                    */}
      {/* ------------------------------------------------------------------ */}
      <spotLight
        position={[2, 5, 3]}
        intensity={1.5}
        angle={0.5}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffffff"
      />

      {/* ------------------------------------------------------------------ */}
      {/* 2. Fill light — hemisphere with accent-blue sky / primary-blue gnd */}
      {/* ------------------------------------------------------------------ */}
      <hemisphereLight
        args={['#93C5FD', '#1E3A8A', 0.25]}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 3. Rim lights — coloured edges for silhouette "pop"                */}
      {/* ------------------------------------------------------------------ */}
      {/* Left rim — accent cyan-blue */}
      <directionalLight
        position={[-3, 2, -2]}
        color="#93C5FD"
        intensity={0.6}
      />
      {/* Right rim — secondary blue */}
      <directionalLight
        position={[3, 2, -2]}
        color="#3B82F6"
        intensity={0.4}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 4. Ground accent — illuminates reflective floor from centre        */}
      {/* ------------------------------------------------------------------ */}
      <pointLight
        position={[0, 0.1, 0]}
        color="#1E3A8A"
        intensity={0.5}
        distance={6}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 5. Environment map — subtle PBR reflections, kept low to preserve  */}
      {/*    the dramatic hand-placed lighting                               */}
      {/* ------------------------------------------------------------------ */}
      <Environment
        preset="studio"
        environmentIntensity={0.15}
      />

      {/* ------------------------------------------------------------------ */}
      {/* 6. Contact shadows — single cached frame for performance           */}
      {/* ------------------------------------------------------------------ */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.6}
        scale={8}
        blur={2}
        frames={1}
      />
    </>
  );
}

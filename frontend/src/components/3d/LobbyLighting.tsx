import { ContactShadows } from '@react-three/drei';

/**
 * Clean studio-style lighting for the light-theme lobby.
 * Bright, even, flattering — like an Apple product showcase.
 */
export default function LobbyLighting() {
  return (
    <>
      {/* Soft contact shadows under characters */}
      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        frames={1}
        color="#94a3b8"
      />
    </>
  );
}

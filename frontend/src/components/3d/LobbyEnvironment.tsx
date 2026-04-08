import * as THREE from "three";

/**
 * Clean, minimal light-theme environment.
 * No particles, no volumetric beams — just a gradient background,
 * a subtle ground plane, and bright studio-style lighting.
 */
export default function LobbyEnvironment() {
  return (
    <>
      {/* Soft light-blue background */}
      <color attach="background" args={["#F0F4FA"]} />

      {/* Studio lighting — bright, even, flattering */}
      <ambientLight intensity={1.0} color="#ffffff" />

      {/* Key light from front-right, slightly above */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Fill light from left */}
      <directionalLight
        position={[-3, 4, 3]}
        intensity={0.6}
        color="#EBF0FF"
      />

      {/* Rim light from behind for subtle edge definition */}
      <directionalLight
        position={[0, 3, -4]}
        intensity={0.4}
        color="#D4E0F7"
      />

      {/* Ground plane — large, subtle, receives shadows */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#E8ECF4"
          metalness={0.0}
          roughness={0.9}
        />
      </mesh>

      {/* Subtle circular highlight under character area */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color="#FFFFFF"
          metalness={0.0}
          roughness={0.7}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Thin accent line on the ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshStandardMaterial
          color="#3B82F6"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

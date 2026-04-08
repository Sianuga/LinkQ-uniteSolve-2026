import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Voronoi + Perlin noise fullscreen shader background                */
/* ------------------------------------------------------------------ */

const bgVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const bgFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  // Classic Perlin-style hash
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  // Smooth noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Voronoi distance field
  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float minDist = 1.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 neighbor = vec2(float(i), float(j));
        // Animate cell centers slowly
        vec2 point = hash(n + neighbor) * 0.5 + 0.5;
        point = 0.5 + 0.4 * sin(uTime * 0.15 + 6.2831 * point);
        vec2 diff = neighbor + point - f;
        float dist = length(diff);
        minDist = min(minDist, dist);
      }
    }
    return minDist;
  }

  void main() {
    vec2 uv = vUv;
    // Aspect-correct coordinates
    vec2 p = uv * 4.0;

    // Layer 1: Voronoi cells — soft organic shapes
    float v = voronoi(p + uTime * 0.02);
    float v2 = voronoi(p * 1.5 + vec2(5.0) + uTime * 0.015);

    // Layer 2: Perlin noise for soft variation
    float n = noise(p * 2.0 + uTime * 0.05) * 0.5 + 0.5;
    float n2 = noise(p * 0.8 - uTime * 0.03) * 0.5 + 0.5;

    // Combine: voronoi edges + noise clouds
    float pattern = smoothstep(0.0, 0.08, v) * 0.3 + v * 0.2;
    pattern += smoothstep(0.0, 0.1, v2) * 0.15;
    pattern += n * 0.15 + n2 * 0.1;

    // Base white
    vec3 white = vec3(0.96, 0.97, 0.98);
    // Subtle academic blue accent
    vec3 blue = vec3(0.118, 0.227, 0.541); // #1E3A8A
    vec3 lightBlue = vec3(0.576, 0.773, 0.992); // #93C5FD

    // Mix: mostly white, with very subtle blue in voronoi edges
    float edgeFactor = 1.0 - smoothstep(0.0, 0.06, v);
    float edgeFactor2 = 1.0 - smoothstep(0.0, 0.08, v2);

    vec3 color = white;
    // Add subtle blue veins at voronoi cell boundaries
    color = mix(color, lightBlue, edgeFactor * 0.12);
    color = mix(color, blue, edgeFactor2 * 0.04);
    // Add very soft blue clouds from noise
    color = mix(color, lightBlue, n * 0.04);

    // Slight radial vignette (center brighter)
    float vignette = 1.0 - length(vUv - 0.5) * 0.3;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderBackground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={bgVertexShader}
        fragmentShader={bgFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Main environment                                                   */
/* ------------------------------------------------------------------ */

export default function LobbyEnvironment() {
  return (
    <>
      {/* Animated Voronoi + Perlin noise background */}
      <ShaderBackground />

      {/* Fallback bg color (visible for 1 frame before shader renders) */}
      <color attach="background" args={['#F5F7FA']} />

      {/* Studio lighting — bright, even, flattering */}
      <ambientLight intensity={1.0} color="#ffffff" />

      {/* Key light from front-right */}
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

      {/* Rim light from behind */}
      <directionalLight
        position={[0, 3, -4]}
        intensity={0.4}
        color="#D4E0F7"
      />

      {/* Ground plane — academic blue */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#1E3A8A"
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Circular highlight */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial
          color="#3B82F6"
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Accent ring */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshStandardMaterial
          color="#93C5FD"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

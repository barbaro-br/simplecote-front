import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;

  // hash-based value noise (leve, sem texturas)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.0 + vec2(13.7, 5.1);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv;
    float t = uTime * 0.06;
    float n = fbm(p * 2.2 + vec2(t, t * 0.6));
    float wave = sin(p.x * 3.14159 * 1.5 + t * 1.4) * 0.5 + 0.5;

    vec3 navy = vec3(0.071, 0.145, 0.247);   // --brand-navy-deep
    vec3 navyHi = vec3(0.118, 0.227, 0.373); // --brand-navy
    vec3 mint = vec3(0.341, 0.749, 0.557);   // --brand-mint
    vec3 bright = vec3(0.435, 0.902, 0.675); // --brand-mint-bright

    float m = mix(n, wave, 0.55);
    vec3 col = mix(navy, navyHi, smoothstep(0.2, 0.8, p.y));
    col = mix(col, mint, smoothstep(0.45, 0.85, m));
    col = mix(col, bright, smoothstep(0.7, 0.98, m) * 0.6);

    // vinheta sutil nas bordas
    float vig = smoothstep(1.1, 0.35, distance(p, vec2(0.5)));
    col *= 0.85 + 0.15 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`

function ShaderPlano() {
  const material = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
      />
    </mesh>
  )
}

/**
 * Camada 3D do hero: um plano em tela cheia com fragment shader animado
 * navy→mint. Sem modelos/texturas — só shader. Default export para
 * `React.lazy` (chunk R3F/three só baixa depois do first paint).
 */
export default function HeroShader({ onCriado }: { onCriado?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }}
      camera={{ position: [0, 0, 1] }}
      onCreated={onCriado}
      fallback={null}
      aria-hidden
    >
      <ShaderPlano />
    </Canvas>
  )
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A camera-facing additive disc with a soft radial falloff.
 *
 * We use these instead of a postprocessing bloom pass: real bloom means extra
 * render targets and a blur chain every frame, which is exactly the cost a
 * mid-range phone can't absorb. Stacking a few of these on a dark background is
 * visually equivalent here and effectively free.
 */
export function Glow({
  color = "#2b86f5",
  scale = 3,
  intensity = 1,
  position = [0, 0, 0],
  pulse = 0,
}: {
  color?: string;
  scale?: number;
  intensity?: number;
  position?: [number, number, number];
  /** Breathing speed; 0 disables the animation entirely. */
  pulse?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float d = distance(vUv, vec2(0.5)) * 2.0;
            // Two stacked falloffs: a tight hot centre inside a wide soft halo.
            float core = pow(max(0.0, 1.0 - d), 3.0);
            float halo = pow(max(0.0, 1.0 - d), 1.4) * 0.35;
            float a = (core + halo) * uIntensity;
            if (a < 0.001) discard;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
      }),
    [color, intensity],
  );

  useFrame(({ camera, clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.quaternion.copy(camera.quaternion); // billboard
    if (pulse > 0) {
      const s = scale * (1 + Math.sin(clock.elapsedTime * pulse) * 0.06);
      mesh.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The infinite grid plane under the core. Drawn entirely in the fragment shader
 * with a distance fade, which avoids the moiré you get from a textured or
 * line-geometry grid and costs one quad.
 */
export function GridFloor({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#2f7fd6") },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uColor;
          varying vec2 vUv;

          // Analytic anti-aliased grid line using screen-space derivatives.
          float gridLine(vec2 uv, float scale) {
            vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
            return 1.0 - min(min(g.x, g.y), 1.0);
          }

          void main() {
            vec2 uv = vUv;
            uv.y += uTime * 0.008; // slow drift toward the horizon

            float fine = gridLine(uv, 60.0) * 0.32;
            float coarse = gridLine(uv, 12.0) * 0.6;

            // Radial vignette so the plane dissolves rather than ending in an edge.
            float d = length(vUv - 0.5) * 2.0;
            float fade = pow(max(0.0, 1.0 - d), 2.6);

            float a = (fine + coarse) * fade * 0.55;
            if (a < 0.004) discard;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
      }),
    [],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
  });

  return (
    <mesh position={[0, -4.6, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[70, 70]} />
    </mesh>
  );
}

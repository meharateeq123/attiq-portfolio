"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

/**
 * Ambient dust filling the volume around the core. One Points draw call; all
 * motion happens on the GPU so the particle count costs almost nothing on the
 * CPU side.
 */
export function ParticleField({ count = 1200, reducedMotion = false }: { count?: number; reducedMotion?: boolean }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);

    // Deterministic pseudo-random so server and client render identically.
    const rand = (i: number, salt: number) => {
      const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      // Spherical shell with a hollow centre so dust never sits inside the core.
      const r = 5 + rand(i, 1) * 16;
      const theta = rand(i, 2) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i, 3) - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.55;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      seed[i] = rand(i, 4) * 6.283;
      size[i] = 1.2 + rand(i, 5) * 3.4;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uScale: { value: 1 },
        },
        vertexShader: /* glsl */ `
          attribute float aSeed;
          attribute float aSize;
          uniform float uTime;
          uniform float uScroll;
          uniform float uScale;
          varying float vAlpha;

          void main() {
            vec3 p = position;
            // Gentle drift + a slow rise driven by scroll.
            p.x += sin(uTime * 0.14 + aSeed) * 0.5;
            p.y += cos(uTime * 0.11 + aSeed * 1.7) * 0.5 + uScroll * 5.0;
            p.z += sin(uTime * 0.09 + aSeed * 0.6) * 0.5;

            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float dist = -mv.z;
            // Fade in the far field and out at the very near plane.
            vAlpha = smoothstep(2.0, 8.0, dist) * (1.0 - smoothstep(22.0, 34.0, dist));
            vAlpha *= 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.1 + aSeed * 4.0));

            gl_PointSize = aSize * uScale * (60.0 / dist);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
            float a = pow(max(0.0, 1.0 - d), 2.4) * vAlpha;
            if (a < 0.008) discard;
            gl_FragColor = vec4(vec3(0.45, 0.72, 1.0) * a, a);
          }
        `,
      }),
    [],
  );

  useFrame(({ clock, size }) => {
    material.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime;
    material.uniforms.uScroll.value = sceneState.scroll;
    material.uniforms.uScale.value = Math.min(1.3, Math.max(0.6, size.height / 900));
    if (ref.current && !reducedMotion) {
      ref.current.rotation.y = clock.elapsedTime * 0.012;
    }
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

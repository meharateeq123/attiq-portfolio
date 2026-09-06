"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Vertical light columns rising through the scene — the "data flowing into the
 * core" motif. Each is a single additive quad with a shader-driven pulse, so
 * the whole set is cheap enough to keep on mobile.
 */
export function DataStreams({ count = 10, reducedMotion = false }: { count?: number; reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);

  const streams = useMemo(() => {
    const rand = (i: number, salt: number) => {
      const x = Math.sin(i * 45.164 + salt * 91.377) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + rand(i, 1) * 0.5;
      const radius = 5.5 + rand(i, 2) * 7;
      return {
        position: [Math.cos(angle) * radius, -1 + rand(i, 3) * 3, Math.sin(angle) * radius] as [number, number, number],
        height: 7 + rand(i, 4) * 9,
        width: 0.035 + rand(i, 5) * 0.05,
        speed: 0.25 + rand(i, 6) * 0.5,
        offset: rand(i, 7),
      };
    });
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            // Soft horizontal falloff so the quad reads as a beam, not a rectangle.
            float across = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 2.0);
            // Vertical envelope fades both ends into nothing.
            float along = smoothstep(0.0, 0.25, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
            // A packet travelling up the beam.
            float packet = pow(max(0.0, 1.0 - abs(fract(vUv.y - uTime * 0.35) - 0.5) * 4.0), 3.0);
            float a = across * (along * 0.28 + packet * 0.7);
            if (a < 0.005) discard;
            gl_FragColor = vec4(mix(vec3(0.16, 0.5, 1.0), vec3(0.6, 0.93, 1.0), packet) * a, a);
          }
        `,
      }),
    [],
  );

  useFrame(({ clock, camera }) => {
    material.uniforms.uTime.value = reducedMotion ? 0.3 : clock.elapsedTime;
    // Billboard each beam so it always presents its full width.
    group.current?.children.forEach((child) => {
      child.rotation.y = Math.atan2(camera.position.x - child.position.x, camera.position.z - child.position.z);
    });
  });

  return (
    <group ref={group}>
      {streams.map((s, i) => (
        <mesh key={i} position={s.position} material={material}>
          <planeGeometry args={[s.width * 12, s.height]} />
        </mesh>
      ))}
    </group>
  );
}

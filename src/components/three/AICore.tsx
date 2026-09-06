"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Glow } from "./Glow";
import { sceneState, coreLabel } from "@/lib/scene-state";

/**
 * The hero's focal object: a translucent energy cube wrapped in a wireframe
 * shell, ringed by two counter-rotating halos and seated on a holographic
 * platform. Everything here is procedural — no textures to download.
 */
export function AICore({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  /** Energy fill: fresnel rim + a slow vertical scan line.
   *
   *  BackSide, not DoubleSide: with additive blending, drawing both faces adds
   *  the front and back walls together and the cube reads as a flat, blown-out
   *  block. Showing only the far interior walls keeps it a translucent volume
   *  with depth, and the wireframe shell supplies the crisp edges. */
  const coreMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color("#0d4ea8") },
          uColorB: { value: new THREE.Color("#48b6ee") },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            vPos = position;
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            // Rim light — brightest where the surface turns away from camera.
            float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.4);
            // A scan band travelling up through the volume.
            float scan = smoothstep(0.42, 0.5, abs(fract(vPos.y * 0.6 - uTime * 0.16) - 0.5));
            vec3 col = mix(uColorA, uColorB, fres);
            // Kept low on purpose: this is additive over a glow stack, so the
            // apparent brightness is the sum of several layers.
            float a = fres * 0.34 + scan * 0.07 + 0.035;
            gl_FragColor = vec4(col * (0.5 + fres * 0.6), a);
          }
        `,
      }),
    [],
  );

  /** Circular platform: concentric rings fading out toward the rim. */
  const platformMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#3d97ff") },
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
          void main() {
            vec2 c = vUv - 0.5;
            float d = length(c) * 2.0;
            if (d > 1.0) discard;

            // Rings that drift outward, plus a bright outer lip.
            float rings = smoothstep(0.86, 1.0, abs(sin((d * 9.0 - uTime * 0.35) * 3.14159)));
            float lip = smoothstep(0.78, 0.94, d) * (1.0 - smoothstep(0.94, 1.0, d));
            float radial = 1.0 - d;

            float a = (rings * 0.28 + lip * 0.9) * radial * 1.6;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
      }),
    [],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera, size }) => {
    const t = clock.elapsedTime;
    coreMaterial.uniforms.uTime.value = t;
    platformMaterial.uniforms.uTime.value = t;

    // Pin the "AI" mark to the projected centre of the core, matching how the
    // concept chips are positioned in NodeNetwork.
    const el = coreLabel.el;
    if (el && group.current) {
      const alpha = Math.max(0, 1 - sceneState.scroll * 16);
      tmp.setFromMatrixPosition(group.current.matrixWorld).project(camera);
      if (alpha < 0.02 || tmp.z > 1) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      } else {
        const sx = (tmp.x * 0.5 + 0.5) * size.width;
        const sy = (-tmp.y * 0.5 + 0.5) * size.height;
        el.style.visibility = "visible";
        el.style.opacity = String(alpha);
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }
    }

    if (reducedMotion) return;

    // Parallax: the whole assembly leans toward the cursor.
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, sceneState.smoothX * 0.32, 0.06);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -sceneState.smoothY * 0.2, 0.06);
      group.current.position.y = Math.sin(t * 0.5) * 0.12;
    }
    if (shell.current) {
      shell.current.rotation.y = t * 0.18;
      shell.current.rotation.x = t * 0.09;
    }
    if (inner.current) {
      inner.current.rotation.y = -t * 0.34;
      inner.current.rotation.z = t * 0.16;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.5;
    if (ringB.current) ringB.current.rotation.z = -t * 0.36;
  });

  return (
    <group ref={group}>
      {/* Energy volume */}
      <mesh material={coreMaterial}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
      </mesh>

      {/* Wireframe containment shell — hugs the volume so the cube reads as a
          defined object rather than a cage floating around one. */}
      <mesh ref={shell}>
        <boxGeometry args={[1.78, 1.78, 1.78]} />
        <meshBasicMaterial color="#6cbcff" wireframe transparent opacity={0.55} />
      </mesh>

      {/* Inner reasoning lattice */}
      <mesh ref={inner} scale={0.52}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#9fdcff" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Orbit rings, tucked close to the core */}
      <mesh ref={ringA} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[2.15, 0.01, 3, 96]} />
        <meshBasicMaterial color="#57a6ff" transparent opacity={0.45} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 2.5, 0.5, 0.25]}>
        <torusGeometry args={[2.55, 0.007, 3, 96]} />
        <meshBasicMaterial color="#7ee8ff" transparent opacity={0.28} />
      </mesh>

      {/* Holographic platform */}
      <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={platformMaterial}>
        <planeGeometry args={[7, 7]} />
      </mesh>

      {/* Light bloom stack */}
      <Glow color="#2b86f5" scale={6.5} intensity={0.42} pulse={0.9} />
      <Glow color="#7ee8ff" scale={2.6} intensity={0.5} pulse={1.4} />
      <Glow color="#1566d6" scale={4.4} intensity={0.3} position={[0, -2.15, 0]} />
    </group>
  );
}

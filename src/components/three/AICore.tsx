"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Glow } from "./Glow";
import { roundedSlab } from "./geometry";
import { sceneState, coreLabel } from "@/lib/scene-state";

/**
 * The hero's focal object: a solid chrome monolith cut into three chamfered
 * slabs, lit from within, held inside two heavy machined rings.
 *
 * This replaced a stack of transparent wireframes. Wireframes read as clutter
 * at hero scale — a dozen thin additive lines over a dark page look like noise
 * rather than an object, and they gave the headline nothing to sit against.
 * Solid, high-metalness blocks with real chamfers do the opposite: they hold
 * one clear silhouette, and all the visual interest comes from a highlight
 * sliding along an edge instead of from more geometry.
 */

/* Slab stack. The gaps between the slabs are the only place the inner light
 * escapes, so they set the whole read of the object. */
const SLAB_H = 0.66;
const MID_H = 0.74;
const GAP = 0.11;
const SLAB_Y = MID_H / 2 + GAP + SLAB_H / 2; // ±0.84

export function AICore({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Group>(null);
  const ringB = useRef<THREE.Group>(null);

  const geo = useMemo(
    () => ({
      slab: roundedSlab(2.38, 2.38, SLAB_H, 0.3, 0.09),
      mid: roundedSlab(2.62, 2.62, MID_H, 0.34, 0.11),
      // Only ever seen through the two gaps, so a plain box is enough.
      furnace: new THREE.BoxGeometry(2.2, SLAB_Y * 2 + SLAB_H - 0.1, 2.2),
      ringA: new THREE.TorusGeometry(2.18, 0.085, 14, 88),
      ringB: new THREE.TorusGeometry(2.74, 0.05, 10, 96),
      block: roundedSlab(0.42, 0.42, 0.42, 0.1, 0.08),
      platform: new THREE.PlaneGeometry(7.5, 7.5),
    }),
    [],
  );

  /** Light trapped inside the stack: bands drifting up through the volume. */
  const furnaceMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vPos;
          void main() {
            float band = 0.5 + 0.5 * sin(vPos.y * 5.5 - uTime * 1.3);
            float hot = pow(band, 3.0);
            vec3 col = mix(vec3(0.04, 0.30, 0.80), vec3(0.66, 0.95, 1.0), hot);
            gl_FragColor = vec4(col * (0.7 + hot * 0.9), 1.0);
          }
        `,
      }),
    [],
  );

  /** Ground ripple under the core. */
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
            float rings = smoothstep(0.88, 1.0, abs(sin((d * 7.0 - uTime * 0.3) * 3.14159)));
            float lip = smoothstep(0.8, 0.94, d) * (1.0 - smoothstep(0.94, 1.0, d));
            float a = (rings * 0.2 + lip * 0.75) * (1.0 - d) * 1.5;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
      }),
    [],
  );

  const mats = useMemo(() => {
    const shell = new THREE.MeshStandardMaterial({
      color: "#1e2c43",
      metalness: 0.97,
      roughness: 0.17,
      envMapIntensity: 2.4,
    });
    const ring = new THREE.MeshStandardMaterial({
      color: "#2b405f",
      metalness: 1,
      roughness: 0.24,
      envMapIntensity: 2.6,
    });
    const block = new THREE.MeshStandardMaterial({
      color: "#101f36",
      metalness: 0.9,
      roughness: 0.26,
      emissive: new THREE.Color("#0b2f5c"),
      emissiveIntensity: 0.8,
      envMapIntensity: 1.8,
    });
    return { shell, ring, block };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      furnaceMaterial.dispose();
      platformMaterial.dispose();
    };
  }, [geo, mats, furnaceMaterial, platformMaterial]);

  /** Blocks riding the inner ring — solid mass, not orbiting dots. */
  const blocks = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return {
          position: [Math.cos(a) * 2.18, Math.sin(a) * 2.18, 0] as [number, number, number],
          rotation: [0, 0, a] as [number, number, number],
        };
      }),
    [],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, camera, size }) => {
    const t = clock.elapsedTime;
    furnaceMaterial.uniforms.uTime.value = t;
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
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, sceneState.smoothX * 0.3, 0.06);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -sceneState.smoothY * 0.18, 0.06);
      group.current.position.y = Math.sin(t * 0.5) * 0.12;
    }
    // Slow enough that the highlight reads as sliding across a face rather
    // than as the object spinning.
    if (spin.current) spin.current.rotation.y = t * 0.14;
    if (ringA.current) ringA.current.rotation.z = t * 0.3;
    if (ringB.current) ringB.current.rotation.z = -t * 0.22;
  });

  return (
    <group ref={group}>
      {/* ---------------- The monolith ---------------- */}
      <group ref={spin}>
        {/* Inner furnace, masked by the slabs except at the two gaps */}
        <mesh geometry={geo.furnace} material={furnaceMaterial} />

        <mesh geometry={geo.slab} material={mats.shell} position={[0, -SLAB_Y, 0]} />
        <mesh geometry={geo.mid} material={mats.shell} />
        <mesh geometry={geo.slab} material={mats.shell} position={[0, SLAB_Y, 0]} />
      </group>

      {/* Light escaping the seams, so the gaps bloom instead of just glowing */}
      <Glow color="#7ee8ff" scale={3.4} intensity={0.4} position={[0, MID_H / 2 + GAP / 2, 0]} />
      <Glow color="#7ee8ff" scale={3.4} intensity={0.4} position={[0, -MID_H / 2 - GAP / 2, 0]} />

      {/* ---------------- Armature ---------------- */}
      <group rotation={[1.28, 0, 0.22]}>
        <group ref={ringA}>
          <mesh geometry={geo.ringA} material={mats.ring} />
          {blocks.map((b, i) => (
            <mesh
              key={i}
              geometry={geo.block}
              material={mats.block}
              position={b.position}
              rotation={b.rotation}
            />
          ))}
        </group>
      </group>

      <group rotation={[1.05, 0.5, -0.3]}>
        <group ref={ringB}>
          <mesh geometry={geo.ringB} material={mats.ring} />
        </group>
      </group>

      {/* ---------------- Ground ---------------- */}
      <mesh
        geometry={geo.platform}
        material={platformMaterial}
        position={[0, -2.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Bloom stack, kept light — the metal now carries most of the brightness */}
      <Glow color="#2b86f5" scale={7.5} intensity={0.3} pulse={0.9} />
      <Glow color="#1566d6" scale={4.6} intensity={0.26} position={[0, -2.35, 0]} />
    </group>
  );
}

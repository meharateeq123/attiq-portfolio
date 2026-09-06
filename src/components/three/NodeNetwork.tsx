"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, labelRegistry } from "@/lib/scene-state";

type NodeSpec = {
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  height: number;
  size: number;
  labelled: boolean;
  /** Orbit in the screen plane rather than around the vertical axis. */
  planar: boolean;
};

/**
 * Nodes orbiting the core, each tethered to it by a gradient link, with the
 * first few carrying the holographic labels rendered by <SceneLabels />.
 *
 * The network is two draw calls — one Points, one LineSegments. Positions are
 * written into buffers allocated once up front, so the render loop never
 * allocates and never triggers a React render.
 */
export function NodeNetwork({
  count = 14,
  labelCount = 0,
  reducedMotion = false,
}: {
  count?: number;
  /** How many nodes carry a DOM label. 0 on narrow viewports. */
  labelCount?: number;
  reducedMotion?: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  /** Deterministic layout — no Math.random, so every render agrees. */
  const specs = useMemo<NodeSpec[]>(() => {
    const list: NodeSpec[] = [];

    // Labelled anchors sit on a wide, slow orbit at readable angles.
    for (let i = 0; i < labelCount; i++) {
      const a = (i / Math.max(1, labelCount)) * Math.PI * 2 + Math.PI * 0.22;
      // Planar: a node orbiting in depth swings across the core and lands its
      // label on top of the cube. Keeping the labelled ring in the screen
      // plane holds the chips at a constant distance around it.
      list.push({
        radius: 3.4,
        speed: 0.028,
        phase: a,
        tilt: 0,
        height: 0,
        size: 18,
        labelled: true,
        planar: true,
      });
    }

    // Ambient nodes fill the volume behind them. The radius is kept tight on
    // purpose: wider orbits push links off the edge of the frame, which reads
    // as stray lines rather than a network.
    for (let i = 0; i < Math.max(0, count - labelCount); i++) {
      list.push({
        radius: 1.9 + (((i * 37) % 100) / 100) * 1.8,
        speed: 0.07 + (((i * 53) % 100) / 100) * 0.11,
        phase: i * 2.399963, // golden angle spreads them evenly
        tilt: 0.3 + (((i * 71) % 100) / 100) * 0.7,
        height: -1.6 + (((i * 91) % 100) / 100) * 3.2,
        size: 6 + (((i * 29) % 100) / 100) * 5,
        labelled: false,
        planar: false,
      });
    }
    return list;
  }, [count, labelCount]);

  const n = specs.length;
  const chordCount = Math.max(0, n - labelCount - 1);
  const segCount = n + chordCount;

  const { pointGeo, lineGeo, positions, linePos } = useMemo(() => {
    const positions = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const seeds = new Float32Array(n);
    specs.forEach((s, i) => {
      sizes[i] = s.size;
      seeds[i] = i * 1.37;
    });

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    pointGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const linePos = new Float32Array(segCount * 2 * 3);
    const lineCol = new Float32Array(segCount * 2 * 3);
    // Colour ramp along each link: dim at the core, bright cyan at the node.
    for (let i = 0; i < segCount; i++) {
      lineCol.set([0.08, 0.34, 0.75], i * 6);
      lineCol.set([0.42, 0.85, 1.0], i * 6 + 3);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));

    return { pointGeo, lineGeo, positions, linePos };
  }, [specs, n, segCount]);

  const pointMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aSeed;
          uniform float uTime;
          uniform float uScale;
          varying float vPulse;
          void main() {
            vPulse = 0.65 + 0.35 * sin(uTime * 1.6 + aSeed * 3.0);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale * vPulse * (14.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vPulse;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
            float core = pow(max(0.0, 1.0 - d), 4.0);
            float halo = pow(max(0.0, 1.0 - d), 1.5) * 0.4;
            float a = (core + halo) * vPulse;
            if (a < 0.01) discard;
            gl_FragColor = vec4(mix(vec3(0.35, 0.7, 1.0), vec3(0.85, 0.97, 1.0), core) * a, a);
          }
        `,
      }),
    [],
  );

  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Chip dimensions are cached and only re-measured when the viewport changes.
  // Reading offsetWidth in the loop right after writing transforms would force
  // a synchronous reflow on every frame.
  const chipSize = useRef<{ w: number; h: number }[]>([]);
  const measuredAt = useRef(0);

  useFrame(({ clock, size, camera }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    pointMaterial.uniforms.uTime.value = clock.elapsedTime;
    // Keep dot sizes stable across viewport heights.
    pointMaterial.uniforms.uScale.value = Math.min(1.35, Math.max(0.55, size.height / 900));

    // --- node positions -------------------------------------------------
    for (let i = 0; i < n; i++) {
      const s = specs[i];
      const a = s.phase + t * s.speed * Math.PI * 2;

      if (s.planar) {
        // Ring in the XY plane, flattened vertically so it reads as an ellipse
        // around the cube. Only a small z wobble, to keep some parallax.
        positions[i * 3] = Math.cos(a) * s.radius;
        positions[i * 3 + 1] = Math.sin(a) * s.radius * 0.6;
        positions[i * 3 + 2] = Math.sin(t * 0.35 + s.phase) * 0.45;
        continue;
      }

      const x = Math.cos(a) * s.radius;
      const z = Math.sin(a) * s.radius;
      const y = s.height + Math.sin(t * 0.6 + s.phase) * 0.18;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y * Math.cos(s.tilt) - z * Math.sin(s.tilt) * 0.25;
      positions[i * 3 + 2] = z;
    }
    pointGeo.attributes.position.needsUpdate = true;

    // --- links ----------------------------------------------------------
    let o = 0;
    for (let i = 0; i < n; i++) {
      linePos[o++] = 0;
      linePos[o++] = 0;
      linePos[o++] = 0;
      linePos[o++] = positions[i * 3];
      linePos[o++] = positions[i * 3 + 1];
      linePos[o++] = positions[i * 3 + 2];
    }
    for (let i = 0; i < chordCount; i++) {
      const a = labelCount + i;
      const b = labelCount + i + 1;
      linePos[o++] = positions[a * 3];
      linePos[o++] = positions[a * 3 + 1];
      linePos[o++] = positions[a * 3 + 2];
      linePos[o++] = positions[b * 3];
      linePos[o++] = positions[b * 3 + 1];
      linePos[o++] = positions[b * 3 + 2];
    }
    lineGeo.attributes.position.needsUpdate = true;

    // --- DOM labels -----------------------------------------------------
    // Fade out as soon as the hero starts to leave, so the chips never
    // collide with the copy in the section below.
    const alpha = Math.max(0, 1 - sceneState.scroll * 16);
    const world = group.current?.matrixWorld;

    // Re-measure once per viewport size, before any transform is written.
    if (measuredAt.current !== size.width && labelRegistry.length) {
      measuredAt.current = size.width;
      chipSize.current = labelRegistry.map((el) => ({
        w: el?.offsetWidth ?? 0,
        h: el?.offsetHeight ?? 0,
      }));
    }

    for (let i = 0; i < labelRegistry.length; i++) {
      const el = labelRegistry[i];
      if (!el) continue;

      if (i >= labelCount || alpha < 0.02 || !world) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        continue;
      }

      // Local → world (the parent group is moved and scaled by scroll) → NDC.
      tmp.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        .applyMatrix4(world)
        .project(camera);

      // z > 1 means the node is behind the camera; NDC wraps and would place
      // the chip on the opposite side of the screen.
      if (tmp.z > 1) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        continue;
      }

      // Keep the chip fully on screen: a node can orbit past the viewport edge
      // and the label would otherwise be cut in half by it.
      const dims = chipSize.current[i] ?? { w: 0, h: 0 };
      const padX = dims.w / 2 + 14;
      const padY = dims.h / 2 + 14;

      const sx = THREE.MathUtils.clamp(
        (tmp.x * 0.5 + 0.5) * size.width,
        padX,
        size.width - padX,
      );
      const sy = THREE.MathUtils.clamp(
        (-tmp.y * 0.5 + 0.5) * size.height,
        padY,
        size.height - padY,
      );

      el.style.visibility = "visible";
      el.style.opacity = String(alpha);
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });

  return (
    <group ref={group}>
      <points geometry={pointGeo} material={pointMaterial} />
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

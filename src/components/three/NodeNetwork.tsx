"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, labelRegistry } from "@/lib/scene-state";

type NodeSpec = {
  radius: number;
  speed: number;
  phase: number;
  tilt: number;
  height: number;
  /** World radius of the bead. */
  size: number;
  labelled: boolean;
  /** Orbit in the screen plane rather than around the vertical axis. */
  planar: boolean;
};

/**
 * Solid beads orbiting the core, with a tether drawn only to the labelled ones.
 *
 * This used to be a glowing point cloud with a link from every node to the
 * centre plus chords between neighbours. At hero scale that read as a tangle of
 * lines across the headline rather than as a network, so the ambient nodes are
 * now untethered mass and only the five labelled anchors keep a line home. The
 * beads are one instanced draw call and their transforms are written into
 * buffers allocated once up front, so the render loop never allocates and never
 * triggers a React render.
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
      // label on top of it. Keeping the labelled ring in the screen plane holds
      // the chips at a constant distance around the monolith.
      list.push({
        radius: 3.9,
        speed: 0.028,
        phase: a,
        tilt: 0,
        height: 0,
        size: 0.13,
        labelled: true,
        planar: true,
      });
    }

    // Ambient beads fill the volume behind them, out past the armature rings so
    // they never collide with the core's silhouette.
    for (let i = 0; i < Math.max(0, count - labelCount); i++) {
      list.push({
        radius: 3.2 + (((i * 37) % 100) / 100) * 2.4,
        speed: 0.05 + (((i * 53) % 100) / 100) * 0.09,
        phase: i * 2.399963, // golden angle spreads them evenly
        tilt: 0.3 + (((i * 71) % 100) / 100) * 0.7,
        height: -2 + (((i * 91) % 100) / 100) * 4,
        size: 0.04 + (((i * 29) % 100) / 100) * 0.05,
        labelled: false,
        planar: false,
      });
    }
    return list;
  }, [count, labelCount]);

  const n = specs.length;
  const segCount = labelCount;

  const { beads, lineGeo, positions, linePos } = useMemo(() => {
    const positions = new Float32Array(n * 3);

    const beadGeo = new THREE.SphereGeometry(1, 16, 12);
    const beadMat = new THREE.MeshStandardMaterial({
      color: "#12263f",
      metalness: 0.95,
      roughness: 0.2,
      emissive: new THREE.Color("#2f8ae0"),
      emissiveIntensity: 1.1,
      envMapIntensity: 2.2,
    });
    const beads = new THREE.InstancedMesh(beadGeo, beadMat, Math.max(1, n));

    const linePos = new Float32Array(Math.max(1, segCount) * 2 * 3);
    const lineCol = new Float32Array(Math.max(1, segCount) * 2 * 3);
    // Colour ramp along each tether: dim at the core, bright cyan at the node.
    for (let i = 0; i < segCount; i++) {
      lineCol.set([0.06, 0.28, 0.62], i * 6);
      lineCol.set([0.42, 0.85, 1.0], i * 6 + 3);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("color", new THREE.BufferAttribute(lineCol, 3));
    lineGeo.setDrawRange(0, segCount * 2);

    return { beads, lineGeo, positions, linePos };
  }, [n, segCount]);

  useEffect(() => {
    return () => {
      beads.geometry.dispose();
      (beads.material as THREE.Material).dispose();
      beads.dispose();
      lineGeo.dispose();
    };
  }, [beads, lineGeo]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mat4 = useMemo(() => new THREE.Matrix4(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const vec = useMemo(() => new THREE.Vector3(), []);
  const scl = useMemo(() => new THREE.Vector3(), []);

  // Chip dimensions are cached and only re-measured when the viewport changes.
  // Reading offsetWidth in the loop right after writing transforms would force
  // a synchronous reflow on every frame.
  const chipSize = useRef<{ w: number; h: number }[]>([]);
  const measuredAt = useRef(0);

  useFrame(({ clock, size, camera }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;

    // --- node positions -------------------------------------------------
    for (let i = 0; i < n; i++) {
      const s = specs[i];
      const a = s.phase + t * s.speed * Math.PI * 2;

      if (s.planar) {
        // Ring in the XY plane, flattened vertically so it reads as an ellipse
        // around the core. Only a small z wobble, to keep some parallax.
        positions[i * 3] = Math.cos(a) * s.radius;
        positions[i * 3 + 1] = Math.sin(a) * s.radius * 0.62;
        positions[i * 3 + 2] = Math.sin(t * 0.35 + s.phase) * 0.45;
      } else {
        const x = Math.cos(a) * s.radius;
        const z = Math.sin(a) * s.radius;
        const y = s.height + Math.sin(t * 0.6 + s.phase) * 0.18;
        positions[i * 3] = x;
        positions[i * 3 + 1] = y * Math.cos(s.tilt) - z * Math.sin(s.tilt) * 0.25;
        positions[i * 3 + 2] = z;
      }

      // A slow breathe on the radius keeps the beads from looking pinned.
      const pulse = s.labelled ? 1 : 0.85 + 0.15 * Math.sin(t * 1.4 + i);
      vec.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      scl.setScalar(s.size * pulse);
      mat4.compose(vec, quat, scl);
      beads.setMatrixAt(i, mat4);
    }
    beads.instanceMatrix.needsUpdate = true;

    // --- tethers (labelled anchors only) --------------------------------
    let o = 0;
    for (let i = 0; i < segCount; i++) {
      linePos[o++] = 0;
      linePos[o++] = 0;
      linePos[o++] = 0;
      linePos[o++] = positions[i * 3];
      linePos[o++] = positions[i * 3 + 1];
      linePos[o++] = positions[i * 3 + 2];
    }
    if (segCount) lineGeo.attributes.position.needsUpdate = true;

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
      <primitive object={beads} />
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

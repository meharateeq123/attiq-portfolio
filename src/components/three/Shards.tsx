"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";

/**
 * A field of wireframe polyhedra drifting through the scene at varied depths.
 *
 * The core alone carries the hero, but once it scrolls away the lower sections
 * had almost no geometry behind them. These give every section a piece of the
 * 3D environment to sit against, and because they are wireframes they read as
 * structure without ever competing with the copy on top.
 */

type ShardSpec = {
  kind: "ico" | "octa" | "tetra" | "torus" | "box";
  position: [number, number, number];
  scale: number;
  spin: [number, number, number];
  opacity: number;
  color: string;
  /** Scroll position where this shard is most prominent, 0–1. */
  focus: number;
};

const SHARDS: ShardSpec[] = [
  { kind: "ico", position: [-7.5, 2.4, -6], scale: 1.5, spin: [0.05, 0.09, 0.02], opacity: 0.5, color: "#4f9dfa", focus: 0.18 },
  { kind: "torus", position: [8.2, -1.6, -5], scale: 1.9, spin: [0.07, 0.05, 0.04], opacity: 0.42, color: "#7ee8ff", focus: 0.3 },
  { kind: "octa", position: [-6.4, -3.2, -3.5], scale: 1.3, spin: [0.04, 0.11, 0.06], opacity: 0.46, color: "#57a6ff", focus: 0.44 },
  { kind: "box", position: [7.2, 3.4, -7], scale: 1.35, spin: [0.06, 0.04, 0.08], opacity: 0.38, color: "#4f9dfa", focus: 0.56 },
  { kind: "tetra", position: [-8.6, 0.6, -4.5], scale: 1.45, spin: [0.09, 0.06, 0.03], opacity: 0.44, color: "#7ee8ff", focus: 0.68 },
  { kind: "ico", position: [6.6, -3.8, -4], scale: 1.15, spin: [0.05, 0.08, 0.05], opacity: 0.42, color: "#57a6ff", focus: 0.8 },
  { kind: "torus", position: [-5.8, 3.9, -8], scale: 1.6, spin: [0.08, 0.03, 0.06], opacity: 0.34, color: "#4f9dfa", focus: 0.92 },
];

function Geometry({ kind }: { kind: ShardSpec["kind"] }) {
  switch (kind) {
    case "ico":
      return <icosahedronGeometry args={[1, 0]} />;
    case "octa":
      return <octahedronGeometry args={[1, 0]} />;
    case "tetra":
      return <tetrahedronGeometry args={[1, 0]} />;
    case "torus":
      return <torusGeometry args={[0.8, 0.3, 6, 14]} />;
    default:
      return <boxGeometry args={[1.3, 1.3, 1.3]} />;
  }
}

export function Shards({ count = 7, reducedMotion = false }: { count?: number; reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const shards = useMemo(() => SHARDS.slice(0, count), [count]);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    const s = sceneState.scroll;

    shards.forEach((shard, i) => {
      const mesh = meshes.current[i];
      if (!mesh) return;

      mesh.rotation.x = t * shard.spin[0];
      mesh.rotation.y = t * shard.spin[1];
      mesh.rotation.z = t * shard.spin[2];

      // Each shard brightens as the page reaches the scroll position it owns,
      // so the environment keeps changing rather than sitting static.
      const dist = Math.abs(s - shard.focus);
      const presence = Math.max(0, 1 - dist * 3.4);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = shard.opacity * (0.22 + presence * 0.78);

      // Drift toward the camera slightly while in focus.
      mesh.position.z = shard.position[2] + presence * 1.8;
      mesh.position.y = shard.position[1] + Math.sin(t * 0.3 + i) * 0.35;
      mesh.scale.setScalar(shard.scale * (0.9 + presence * 0.28));
    });

    // The whole field counter-rotates gently against the page scroll.
    if (group.current) group.current.rotation.y = -s * 0.5;
  });

  return (
    <group ref={group}>
      {shards.map((shard, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          position={shard.position}
          scale={shard.scale}
        >
          <Geometry kind={shard.kind} />
          <meshBasicMaterial
            color={shard.color}
            wireframe
            transparent
            opacity={shard.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

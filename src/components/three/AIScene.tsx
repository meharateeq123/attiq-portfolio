"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AICore } from "./AICore";
import { NodeNetwork } from "./NodeNetwork";
import { ParticleField } from "./ParticleField";
import { DataStreams } from "./DataStreams";
import { GridFloor } from "./GridFloor";
import { StudioEnvironment } from "./StudioEnv";
import { sceneState, TIER_BUDGET, type PerfTier } from "@/lib/scene-state";
import { coreNodes } from "@/config/site";

/**
 * Composes the environment and drives the camera from scroll + pointer.
 *
 * The camera is never controlled by React state — it's lerped toward a target
 * pose every frame, which is what makes the movement feel weighted rather than
 * snapping between section boundaries.
 */
export function AIScene({ tier, reducedMotion }: { tier: PerfTier; reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const budget = TIER_BUDGET[tier];

  // Narrow viewports centre the core behind the copy; wide ones push it right
  // so the headline owns the left half, as in the layout reference.
  const isNarrow = size.width < 1024;

  const target = useRef({ x: 0, y: 0.4, z: 12 });

  useFrame((_, delta) => {
    // Clamp delta so a backgrounded tab doesn't produce one enormous jump.
    const dt = Math.min(delta, 0.05);
    const damp = 1 - Math.pow(0.001, dt);

    // Smooth the raw pointer once, here, for every consumer in the scene.
    sceneState.smoothX += (sceneState.pointerX - sceneState.smoothX) * damp * 0.55;
    sceneState.smoothY += (sceneState.pointerY - sceneState.smoothY) * damp * 0.55;

    const s = sceneState.scroll;

    // --- scene placement -------------------------------------------------
    if (root.current) {
      // How much of the hero pose is still in effect (1 at the very top).
      const heroWeight = THREE.MathUtils.clamp(1 - s * 7, 0, 1);

      // Hero: the core sits in the right half so the headline owns the left.
      // After that it sweeps side to side across the page so every section
      // gets it passing behind the copy rather than losing it entirely.
      const heroOffset = isNarrow ? 0 : 3.8;
      const sweep = isNarrow ? 0 : Math.cos(s * Math.PI * 2.6) * 3.4;
      const offsetX = heroOffset * heroWeight + sweep * (1 - heroWeight);

      root.current.position.x += (offsetX - root.current.position.x) * damp * 0.4;

      // Rises and falls gently instead of sinking permanently out of frame.
      // On narrow screens the core has no empty column to sit in, so during the
      // hero it drops below the copy rather than sitting behind the headline.
      const narrowDrop = isNarrow ? -1.5 * heroWeight : 0;
      const targetY = -0.4 + Math.sin(s * Math.PI * 2.2) * 1.5 + narrowDrop;
      root.current.position.y += (targetY - root.current.position.y) * damp * 0.4;

      // Grows once past the hero — the core is the environment for the rest
      // of the page, so it should read larger, not shrink away.
      const base = isNarrow ? 0.58 : 0.92;
      const target = base * (1 + (1 - heroWeight) * 0.32);
      root.current.scale.setScalar(
        THREE.MathUtils.lerp(root.current.scale.x || base, target, damp * 0.4),
      );
      if (!reducedMotion) root.current.rotation.y = s * Math.PI * 1.6;
    }

    // --- camera rig ------------------------------------------------------
    // A slow arc through the scroll, plus a light pointer parallax on top.
    target.current.x = Math.sin(s * Math.PI * 1.1) * 2.0 + sceneState.smoothX * 0.8;
    target.current.y = 0.4 - s * 1.2 - sceneState.smoothY * 0.6;
    target.current.z = 12 + Math.sin(s * Math.PI) * 3.5;

    camera.position.x += (target.current.x - camera.position.x) * damp * 0.35;
    camera.position.y += (target.current.y - camera.position.y) * damp * 0.35;
    camera.position.z += (target.current.z - camera.position.z) * damp * 0.35;

    // Look at the world origin, NOT at the group. Aiming the camera at the
    // group would rotate it back into frame and cancel the offset above,
    // re-centring the core over the headline.
    camera.lookAt(0, (root.current?.position.y ?? 0) * 0.35, 0);
  });

  return (
    <>
      {/* The core is solid metal now, so it needs something to reflect and
          something to be lit by — without these it renders as a black
          silhouette. Directional lights only: they have no position falloff, so
          they keep working as the scroll rig sweeps the core across the frame. */}
      <StudioEnvironment />
      <ambientLight intensity={0.42} />
      <directionalLight position={[6, 7, 6]} intensity={2.5} color="#dbeaff" />
      <directionalLight position={[-7, -1.5, -4]} intensity={1.7} color="#2f7fd6" />
      <directionalLight position={[0, -4, 5]} intensity={0.8} color="#7ee8ff" />

      {/* The core assembly — swept around the frame by the scroll rig above. */}
      <group ref={root}>
        <AICore reducedMotion={reducedMotion} />
        {/* Labels are suppressed on narrow viewports: the core sits behind the
            copy there, and floating chips would land on top of the headline. */}
        <NodeNetwork
          count={budget.nodes}
          labelCount={isNarrow ? 0 : coreNodes.length}
          reducedMotion={reducedMotion}
        />
        <GridFloor reducedMotion={reducedMotion} />
      </group>

      {/* World-space environment, deliberately outside the swept group so it
          stays put while the core moves through it. The drifting wireframe
          shards that used to live here are gone: at hero scale they crossed the
          headline and read as clutter rather than as depth. Stars and a few
          distant light columns do the same job without competing. */}
      <ParticleField count={budget.particles} reducedMotion={reducedMotion} />
      {tier !== "low" && <DataStreams count={budget.streams} reducedMotion={reducedMotion} />}
    </>
  );
}

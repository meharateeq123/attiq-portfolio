"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { AIScene } from "./AIScene";
import { SceneLabels } from "./SceneLabels";
import { usePerfTier } from "@/lib/use-perf-tier";
import { TIER_BUDGET, sceneState } from "@/lib/scene-state";

/**
 * One fixed, full-viewport WebGL layer sitting behind the entire page.
 *
 * A single persistent context — rather than a canvas per section — is what
 * keeps this affordable on mobile, and it lets the camera flow continuously
 * through the scroll instead of restarting at every section.
 */
export default function SceneCanvas() {
  const { tier, isMobile, reducedMotion, ready } = usePerfTier();
  const [paused, setPaused] = useState(false);

  // Pointer parallax. Pointer events only — a touch drag is a scroll, not a look.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Stop rendering entirely when the tab is hidden — no reason to burn battery.
  useEffect(() => {
    const onVisibility = () => {
      sceneState.visible = !document.hidden;
      setPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!ready) {
    // Pre-measurement: render only the CSS ambience so the first paint is
    // instant and we never build a scene sized for the wrong device.
    return <div className="scene-fallback" aria-hidden />;
  }

  return (
    <div className="scene-layer" aria-hidden>
      <Canvas
        frameloop={paused ? "never" : "always"}
        dpr={TIER_BUDGET[tier].dpr}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? "low-power" : "high-performance",
          stencil: false,
          depth: true,
        }}
        camera={{ fov: isMobile ? 55 : 42, position: [0, 0.4, 12], near: 0.1, far: 90 }}
        onCreated={({ gl }) => {
          // Transparent clear so the page background shows through the layer.
          gl.setClearColor(new THREE.Color("#03050b"), 0);
          // No tone mapping: it only applies to three's built-in materials, so
          // with a scene that is mostly custom additive shaders it would dim
          // the wireframes and rings while leaving the glows untouched.
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <AIScene tier={tier} reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>

      {/* Paint order is set by z-index, not DOM order: render → vignette →
          labels, so the chips stay bright over the darkened edges. */}
      <div className="scene-vignette" />
      <SceneLabels />
    </div>
  );
}

"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Laptop } from "./Laptop";
import { usePerfTier } from "@/lib/use-perf-tier";

/**
 * A small, self-contained canvas for the About panel.
 *
 * This is the one place with a second WebGL context. The laptop needs to sit
 * inside a specific box in the layout, and aligning a world-space object to a
 * DOM element through the shared background canvas is far more fragile than
 * giving this panel its own viewport. It is skipped entirely on low-tier
 * devices, which fall back to the SVG schematic.
 */
export default function LaptopCanvas() {
  const { reducedMotion } = usePerfTier();

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 34, position: [0, 0.32, 5.9], near: 0.1, far: 40 }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color("#000000"), 0);
        gl.toneMapping = THREE.NoToneMapping;
      }}
      style={{ pointerEvents: "none" }}
    >
      {/* Key, fill and a blue rim to pick out the aluminium edges */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.1} color="#cfe4ff" />
      <directionalLight position={[-4, 1.5, -2]} intensity={1.1} color="#2f7fd6" />
      <pointLight position={[0, 1.6, 2.4]} intensity={9} distance={12} color="#4da3ff" />

      <Laptop reducedMotion={reducedMotion} />
    </Canvas>
  );
}

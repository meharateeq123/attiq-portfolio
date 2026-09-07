"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Laptop } from "./Laptop";
import { StudioEnvironment } from "./StudioEnv";
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
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 32, position: [0, 0.95, 6.8], near: 0.1, far: 40 }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(new THREE.Color("#000000"), 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        // Looking slightly down the machine is what shows the deck and the key
        // caps; head-on, the base collapses to a line.
        camera.lookAt(0, 0.05, 0);
      }}
      style={{ pointerEvents: "none" }}
    >
      <StudioEnvironment />

      {/* Key light carries the shadow; the rest only shape the metal. */}
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[3.2, 5.4, 3.4]}
        intensity={2.6}
        color="#cfe4ff"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-camera-left={-3.2}
        shadow-camera-right={3.2}
        shadow-camera-top={3.2}
        shadow-camera-bottom={-3.2}
        shadow-bias={-0.0012}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-4.2, 1.8, -2.4]} intensity={1.35} color="#2f7fd6" />
      {/* Stands in for the light the screen throws back onto the deck. */}
      <pointLight position={[0, 0.5, 1.1]} intensity={7} distance={6} color="#4da3ff" />

      <Laptop reducedMotion={reducedMotion} />
    </Canvas>
  );
}

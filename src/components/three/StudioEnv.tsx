"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * A tiny procedural studio environment, shared by every canvas on the page.
 *
 * Polished metal with nothing to reflect just renders as flat grey — this is
 * what puts the travelling highlight along an edge and makes a block read as
 * solid. Painting a 256×128 equirect and running it through PMREM costs one
 * frame at mount and no bytes over the network, where an HDRI would cost both.
 */
export function StudioEnvironment({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Sky above the horizon, near-black floor below it.
    const sky = ctx.createLinearGradient(0, 0, 0, 128);
    sky.addColorStop(0, "#123157");
    sky.addColorStop(0.42, "#1c4a80");
    sky.addColorStop(0.5, "#0b1526");
    sky.addColorStop(1, "#03060c");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 256, 128);

    // Softboxes: a wide key streak and a cooler kicker on the opposite side.
    const box = (x: number, y: number, w: number, h: number, alpha: number) => {
      const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, w / 2);
      g.addColorStop(0, `rgba(214, 234, 255, ${alpha * intensity})`);
      g.addColorStop(1, "rgba(214, 234, 255, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    };
    box(28, 8, 84, 38, 0.95);
    box(166, 22, 52, 24, 0.5);

    const equirect = new THREE.CanvasTexture(canvas);
    equirect.mapping = THREE.EquirectangularReflectionMapping;
    equirect.colorSpace = THREE.SRGBColorSpace;

    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromEquirectangular(equirect).texture;
    scene.environment = env;

    equirect.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene, intensity]);

  return null;
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Glow } from "./Glow";

/* ---------------------------------------------------------------------------
 * The code shown on the screen. Tokens carry a colour role so the texture can
 * syntax-highlight without shipping a highlighter.
 * ------------------------------------------------------------------------- */
type Tok = [string, "kw" | "fn" | "str" | "num" | "cmt" | "var" | "op"];

const CODE: Tok[][] = [
  [["from", "kw"], [" agent ", "var"], ["import", "kw"], [" Agent, Tool", "var"]],
  [],
  [["@tool", "fn"]],
  [["def", "kw"], [" search_docs", "fn"], ["(", "op"], ["query", "var"], [": ", "op"], ["str", "kw"], ["):", "op"]],
  [["    ", "op"], ["hits", "var"], [" = ", "op"], ["index", "var"], [".", "op"], ["query", "fn"], ["(", "op"], ["query", "var"], [", k=", "op"], ["8", "num"], [")", "op"]],
  [["    ", "op"], ["return", "kw"], [" rerank", "fn"], ["(", "op"], ["hits", "var"], [")", "op"]],
  [],
  [["# plan -> act -> observe -> repeat", "cmt"]],
  [["agent", "var"], [" = ", "op"], ["Agent", "fn"], ["(", "op"]],
  [["    model=", "op"], ["\"claude\"", "str"], [",", "op"]],
  [["    tools=[", "op"], ["search_docs", "var"], [", ", "op"], ["run_sql", "var"], ["],", "op"]],
  [["    max_steps=", "op"], ["12", "num"], [",", "op"]],
  [[")", "op"]],
  [],
  [["result", "var"], [" = ", "op"], ["await", "kw"], [" agent", "var"], [".", "op"], ["run", "fn"], ["(", "op"], ["goal", "var"], [")", "op"]],
  [["print", "fn"], ["(", "op"], ["result", "var"], [".", "op"], ["summary", "var"], [")", "op"]],
  [],
  [["# ✓ 12 steps  ✓ 3 tools  ✓ done", "cmt"]],
];

const COLORS: Record<Tok[1], string> = {
  kw: "#6fb6ff",
  fn: "#7ee8ff",
  str: "#8fd98f",
  num: "#e0a878",
  cmt: "#4b5f7d",
  var: "#c8d6ea",
  op: "#7d8ba3",
};

/**
 * A procedural laptop with code typing itself out on the screen.
 *
 * Built from primitives rather than a downloaded model: it keeps the page free
 * of a multi-megabyte GLB, matches the site's palette exactly, and lets the
 * screen be a live canvas texture instead of a baked image.
 */
export function Laptop({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  /* --- the screen texture ------------------------------------------------ */
  const screen = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    return { canvas, ctx, texture };
  }, []);

  // How many characters of the code have been "typed" so far.
  const typed = useRef(0);
  const lastDraw = useRef(0);

  const draw = (elapsed: number) => {
    const { ctx, canvas, texture } = screen;
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#070d18";
    ctx.fillRect(0, 0, W, H);

    // Title bar
    ctx.fillStyle = "#0c1626";
    ctx.fillRect(0, 0, W, 30);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(18 + i * 16, 15, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#4b5f7d";
    ctx.font = "500 12px ui-monospace, monospace";
    ctx.fillText("agent.py", 86, 19);

    // Gutter
    ctx.fillStyle = "#0a1220";
    ctx.fillRect(0, 30, 38, H - 30);

    // Sized for legibility at the distance the laptop is actually viewed from,
    // not for fitting the whole file on screen.
    const lineH = 24;
    const top = 56;
    let budget = typed.current;

    for (let i = 0; i < CODE.length; i++) {
      const y = top + i * lineH;
      if (y > H - 8) break;

      ctx.font = "400 11px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = "#2f3f57";
      ctx.textAlign = "right";
      ctx.fillText(String(i + 1), 30, y);
      ctx.textAlign = "left";
      ctx.font = "400 16px ui-monospace, SFMono-Regular, Menlo, monospace";

      let x = 48;
      for (const [text, role] of CODE[i]) {
        if (budget <= 0) break;
        const shown = text.slice(0, budget);
        budget -= shown.length;
        ctx.fillStyle = COLORS[role];
        ctx.fillText(shown, x, y);
        x += ctx.measureText(shown).width;
      }

      // Blinking caret at the write head.
      if (budget <= 0 && Math.floor(elapsed * 2) % 2 === 0) {
        ctx.fillStyle = "#7ee8ff";
        ctx.fillRect(x + 1, y - 12, 8, 16);
      }
      if (budget <= 0) break;
    }

    texture.needsUpdate = true;
  };

  const totalChars = useMemo(
    () => CODE.reduce((sum, line) => sum + line.reduce((s, [t]) => s + t.length, 0), 0),
    [],
  );

  useFrame(({ clock, pointer: p }) => {
    const t = clock.elapsedTime;

    // Type it out, then hold, then start over.
    if (!reducedMotion) {
      typed.current += 2.4;
      if (typed.current > totalChars + 260) typed.current = 0;
    } else if (typed.current < totalChars) {
      typed.current = totalChars;
    }

    // Redraw at ~20fps: the texture upload is the expensive part, and typing
    // does not need to run at the display refresh rate.
    if (t - lastDraw.current > 0.05) {
      lastDraw.current = t;
      draw(t);
    }

    if (!group.current || reducedMotion) return;

    // Lean toward the cursor, with a slow idle float.
    pointer.current.x += (p.x - pointer.current.x) * 0.05;
    pointer.current.y += (p.y - pointer.current.y) * 0.05;
    group.current.rotation.y = -0.3 + pointer.current.x * 0.3;
    group.current.rotation.x = 0.05 + pointer.current.y * 0.1;
    group.current.position.y = -0.15 + Math.sin(t * 0.7) * 0.06;
  });

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#151d2b",
        metalness: 0.82,
        roughness: 0.34,
      }),
    [],
  );

  const edgeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#4d9bf0", transparent: true, opacity: 0.5 }),
    [],
  );

  return (
    <group ref={group} rotation={[0.05, -0.3, 0]} position={[0, -0.15, 0]}>
      {/* Base */}
      <mesh material={bodyMat} position={[0, -0.62, 0.62]}>
        <boxGeometry args={[3.15, 0.12, 2.1]} />
      </mesh>
      {/* Deck inlay */}
      <mesh position={[0, -0.555, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.85, 1.8]} />
        <meshBasicMaterial color="#0a1120" />
      </mesh>
      {/* Trackpad */}
      <mesh position={[0, -0.553, 1.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.55]} />
        <meshBasicMaterial color="#101a2c" />
      </mesh>
      {/* Key rows, suggested rather than modelled key by key */}
      {Array.from({ length: 5 }, (_, r) => (
        <mesh key={r} position={[0, -0.552, 0.16 + r * 0.16]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 0.09]} />
          <meshBasicMaterial color="#1b2740" />
        </mesh>
      ))}

      {/* Lid. The panel inside this group is already modelled standing upright
          along +Y, so this rotation is just the backward lean from vertical —
          not the full hinge sweep from closed. */}
      <group position={[0, -0.56, -0.42]} rotation={[-0.2, 0, 0]}>
        <mesh material={bodyMat} position={[0, 1.02, -0.05]}>
          <boxGeometry args={[3.15, 2.05, 0.09]} />
        </mesh>
        {/* Display */}
        <mesh position={[0, 1.02, 0.005]}>
          <planeGeometry args={[2.92, 1.84]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
        {/* Screen bezel highlight */}
        <lineSegments position={[0, 1.02, 0.01]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(2.94, 1.86)]} />
          <primitive object={edgeMat} attach="material" />
        </lineSegments>
        {/* Screen spill */}
        <Glow color="#2f8ae0" scale={4.6} intensity={0.34} position={[0, 1.02, 0.35]} />
      </group>

      {/* Contact shadow / floor bloom */}
      <Glow color="#1566d6" scale={5.2} intensity={0.3} position={[0, -0.8, 0.6]} />
    </group>
  );
}

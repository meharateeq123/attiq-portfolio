"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Glow } from "./Glow";
import { roundedFace, roundedPanel, roundedSlab } from "./geometry";

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

/* ---------------------------------------------------------------------------
 * Chassis dimensions. Everything below is derived from these, so the parts
 * stay aligned if the proportions are tuned.
 * ------------------------------------------------------------------------- */
const BASE_W = 3.34;
const BASE_D = 2.3;
const BASE_H = 0.14;
const FOOT_H = 0.02;
const DECK_Y = FOOT_H + BASE_H; // top face of the base
// Right at the back edge. Any further forward and the barrel sits on top of
// the keyboard well, and the shut lid overhangs the front of the base.
const HINGE_Z = -BASE_D / 2 + 0.12;

const LID_W = BASE_W;
const LID_H = 2.2;
const LID_T = 0.08;
const LID_LEAN = -0.2; // open: radians back from vertical
// Shut: folded forward onto the deck. Stopped a few degrees short of flat so
// the panel rests above the key caps instead of intersecting them.
const LID_CLOSED = Math.PI / 2 - 0.08;

const SCREEN_W = 3.06;
const SCREEN_H = 1.84;
const SCREEN_Y = LID_H / 2 + 0.05; // nudged up: the chin bezel is deeper

/** Key widths in units; each row is normalised to the same overall width. */
const KEY_ROWS: number[][] = [
  Array.from({ length: 13 }, () => 1),
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75],
  [1.25, 1.25, 1.25, 6, 1.25, 1.25, 1.75],
];
const KB_W = 2.78;
const KB_ROW_PITCH = 0.185;
const KB_FRONT_Z = -0.1; // z of the bottom (space bar) row
const KEY_GAP = 0.022;
const KEY_H = 0.032;

/**
 * A procedural laptop with code typing itself out on the screen.
 *
 * Built from primitives rather than a downloaded model: it keeps the page free
 * of a multi-megabyte GLB, matches the site's palette exactly, and lets the
 * screen be a live canvas texture instead of a baked image.
 */
export function Laptop({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const display = useRef<THREE.Mesh>(null);
  const displayMat = useRef<THREE.MeshBasicMaterial>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // Camera pose to return to. Captured on the first frame rather than written
  // as a constant, so <LaptopCanvas> stays the single source of truth for it.
  const home = useRef<{ pos: THREE.Vector3; fov: number } | null>(null);
  const scratch = useMemo(
    () => ({
      screenPos: new THREE.Vector3(),
      screenQuat: new THREE.Quaternion(),
      normal: new THREE.Vector3(),
      end: new THREE.Vector3(),
      lookHome: new THREE.Vector3(0, 0.05, 0),
      lookEnd: new THREE.Vector3(),
      look: new THREE.Vector3(),
    }),
    [],
  );

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

  /* --- materials --------------------------------------------------------- */
  const mats = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      color: "#1b2534",
      metalness: 0.92,
      roughness: 0.29,
      envMapIntensity: 1.15,
    });
    const deck = new THREE.MeshStandardMaterial({
      color: "#0a1120",
      metalness: 0.5,
      roughness: 0.62,
      envMapIntensity: 0.5,
    });
    const key = new THREE.MeshStandardMaterial({
      color: "#131d2d",
      metalness: 0.34,
      roughness: 0.52,
      // Keyboard backlight: a faint blue bleed out of every cap.
      emissive: new THREE.Color("#12385f"),
      emissiveIntensity: 0.85,
      envMapIntensity: 0.7,
    });

    const trackpad = new THREE.MeshStandardMaterial({
      color: "#0c1524",
      metalness: 0.7,
      roughness: 0.18,
      envMapIntensity: 1.4,
    });
    const bezel = new THREE.MeshStandardMaterial({
      color: "#080d18",
      metalness: 0.4,
      roughness: 0.5,
      envMapIntensity: 0.4,
    });
    const hinge = new THREE.MeshStandardMaterial({
      color: "#0e1522",
      metalness: 0.95,
      roughness: 0.35,
    });
    const rim = new THREE.MeshBasicMaterial({
      color: "#4d9bf0",
      transparent: true,
      opacity: 0.55,
    });
    return { body, deck, key, trackpad, bezel, hinge, rim };
  }, []);

  /* --- geometry ---------------------------------------------------------- */
  const geo = useMemo(
    () => ({
      base: roundedSlab(BASE_W, BASE_D, BASE_H, 0.1, 0.022),
      lid: roundedPanel(LID_W, LID_H, LID_T, 0.1, 0.016),
      well: roundedFace(2.92, 1.06, 0.05),
      trackpad: roundedSlab(1.06, 0.68, 0.012, 0.05, 0.004),
      foot: new THREE.CylinderGeometry(0.07, 0.075, FOOT_H, 12),
      hinge: new THREE.CylinderGeometry(0.05, 0.05, BASE_W - 0.5, 16),
      screen: new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
      notch: new THREE.CircleGeometry(0.018, 10),
      // Outlines, built once — an <edgesGeometry> with inline args would
      // rebuild its source geometry on every render.
      trackpadEdge: new THREE.EdgesGeometry(roundedFace(1.06, 0.68, 0.05)),
      screenEdge: new THREE.EdgesGeometry(
        new THREE.PlaneGeometry(SCREEN_W + 0.02, SCREEN_H + 0.02),
      ),
    }),
    [],
  );

  /**
   * The keyboard, as one instanced mesh. Sixty separate meshes would be sixty
   * draw calls for something the viewer reads as a single texture of depth —
   * but the caps do need real height, because their shadows are most of what
   * makes the deck look like a surface rather than a picture.
   */
  const keyboard = useMemo(() => {
    // A unit-width cap with realistic proportions, so per-instance scaling only
    // stretches the wide keys along X.
    const capGeo = roundedSlab(1, 1, 0.2, 0.16, 0.05);
    const count = KEY_ROWS.reduce((n, row) => n + row.length, 0);
    const mesh = new THREE.InstancedMesh(capGeo, mats.key, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const capD = KB_ROW_PITCH - KEY_GAP;
    let i = 0;

    KEY_ROWS.forEach((row, r) => {
      // Rows are laid out from the space bar backwards, so the function row
      // ends up nearest the hinge.
      const z = KB_FRONT_Z - (KEY_ROWS.length - 1 - r) * KB_ROW_PITCH;
      const units = row.reduce((a, b) => a + b, 0);
      const pitch = KB_W / units;
      // The function row is a half-height strip on a real machine.
      const depth = r === 0 ? capD * 0.66 : capD;
      let x = -KB_W / 2;

      row.forEach((u) => {
        const w = u * pitch - KEY_GAP;
        pos.set(x + (u * pitch) / 2, DECK_Y + 0.001 + KEY_H / 2, z);
        scale.set(w, KEY_H / 0.2, depth);
        m.compose(pos, q, scale);
        mesh.setMatrixAt(i++, m);
        x += u * pitch;
      });
    });

    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }, [mats.key]);

  // Everything here is built imperatively, so it has to be released by hand.
  useEffect(() => {
    return () => {
      Object.values(geo).forEach((g) => g.dispose());
      Object.values(mats).forEach((m) => m.dispose());
      keyboard.geometry.dispose();
      keyboard.dispose();
      screen.texture.dispose();
    };
  }, [geo, mats, keyboard, screen]);

  /** A single soft reflection band raked across the glass. */
  const glassMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            float band = smoothstep(0.62, 0.0, abs((vUv.x * 0.85 + vUv.y) - 1.28));
            float fall = smoothstep(-0.2, 1.0, vUv.y);
            float a = band * (0.035 + fall * 0.075);
            if (a < 0.002) discard;
            gl_FragColor = vec4(vec3(0.60, 0.76, 1.0) * a, a);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => glassMat.dispose(), [glassMat]);

  useFrame(({ clock, camera, pointer: p, gl }) => {
    const t = clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;
    if (!home.current) home.current = { pos: cam.position.clone(), fov: cam.fov };

    /* --- where the panel sits in the scroll -------------------------------
     * Measured off the canvas element itself rather than plumbed down from a
     * scroll listener: it is one rect read per frame for one element, and it
     * stays correct through Lenis' smoothing, resizes and layout changes with
     * no state to keep in sync.
     *
     * 0 = the panel's top edge is entering at the bottom of the viewport,
     * 0.5 = centred, 1 = its bottom edge has left the top.
     */
    let progress = 0.5;
    if (!reducedMotion) {
      const rect = gl.domElement.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      progress = THREE.MathUtils.clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    }

    // Opens as it arrives, then holds. The lid is most of the way up before the
    // screen lights, so the boot reads as a consequence of opening it.
    const open = reducedMotion ? 1 : THREE.MathUtils.smoothstep(progress, 0.16, 0.46);
    // Dives on the way out, finishing while a good third of the panel is still
    // on screen — a push that completes after it has scrolled away is a push
    // nobody sees.
    const diveRaw = reducedMotion ? 0 : THREE.MathUtils.smoothstep(progress, 0.54, 0.8);
    const dive = diveRaw * diveRaw * (3 - 2 * diveRaw); // ease in and out again

    if (lid.current) {
      lid.current.rotation.x = THREE.MathUtils.lerp(LID_CLOSED, LID_LEAN, open);
    }

    /* --- the screen ------------------------------------------------------ */
    // Nothing is typed until the lid is genuinely open, and it retypes from
    // the top each time the panel is scrolled back to.
    const lit = THREE.MathUtils.smoothstep(open, 0.55, 0.95);
    if (reducedMotion) {
      typed.current = totalChars;
    } else if (lit <= 0) {
      typed.current = 0;
    } else {
      typed.current += 2.4;
      if (typed.current > totalChars + 260) typed.current = 0;
    }

    if (displayMat.current) {
      // Past 1 the basic material multiplies the texture up, so the panel
      // blows out as the camera passes through it.
      displayMat.current.color.setScalar(lit * (1 + dive * 1.9));
    }

    // Redraw at ~20fps: the texture upload is the expensive part, and typing
    // does not need to run at the display refresh rate.
    if (t - lastDraw.current > 0.05) {
      lastDraw.current = t;
      draw(t);
    }

    if (!group.current) return;

    /* --- body motion ------------------------------------------------------ */
    // Pointer lean and the idle float both wind down as the dive takes over:
    // a camera flying at a target that is still drifting reads as a wobble.
    const free = 1 - dive;
    pointer.current.x += (p.x - pointer.current.x) * 0.05;
    pointer.current.y += (p.y - pointer.current.y) * 0.05;
    if (!reducedMotion) {
      // Squares up to face the camera as the dive begins, so the push goes
      // straight down the screen's normal instead of in at an angle.
      group.current.rotation.y = (-0.38 + pointer.current.x * 0.26) * free;
      group.current.rotation.x = (0.02 + pointer.current.y * 0.07) * free;
      group.current.position.y = -1.02 + Math.sin(t * 0.7) * 0.045 * free;
    }

    /* --- the dive --------------------------------------------------------- */
    if (!display.current || !home.current) return;
    if (dive <= 0.0001) {
      cam.position.copy(home.current.pos);
      cam.lookAt(scratch.lookHome);
      if (cam.fov !== home.current.fov) {
        cam.fov = home.current.fov;
        cam.updateProjectionMatrix();
      }
      return;
    }

    const s = scratch;
    display.current.getWorldPosition(s.screenPos);
    display.current.getWorldQuaternion(s.screenQuat);
    s.normal.set(0, 0, 1).applyQuaternion(s.screenQuat);

    // End just behind the glass: the last of the travel is the camera passing
    // through the panel, which is what sells "going inside" rather than
    // stopping short of it.
    s.end.copy(s.screenPos).addScaledVector(s.normal, -0.3);
    cam.position.lerpVectors(home.current.pos, s.end, dive);

    s.lookEnd.copy(s.screenPos).addScaledVector(s.normal, -1.2);
    s.look.lerpVectors(s.lookHome, s.lookEnd, dive);
    cam.lookAt(s.look);

    // A slight long-lens squeeze on the way in. Dollying alone reads as the
    // object growing; narrowing with it reads as a camera move.
    cam.fov = THREE.MathUtils.lerp(home.current.fov, home.current.fov * 0.74, dive);
    cam.updateProjectionMatrix();
  });

  return (
    <group ref={group} rotation={[0.02, -0.38, 0]} position={[0, -1.02, 0]}>
      {/* Ground plane: invisible except where the laptop shadows it. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.1]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial opacity={0.55} color="#00060f" />
      </mesh>

      {/* ---------------- Base ---------------- */}
      <mesh
        geometry={geo.base}
        material={mats.body}
        position={[0, FOOT_H + BASE_H / 2, 0]}
        castShadow
        receiveShadow
      />

      {/* Feet, so the chassis floats a hair above its own shadow */}
      {[
        [-BASE_W / 2 + 0.3, BASE_D / 2 - 0.28],
        [BASE_W / 2 - 0.3, BASE_D / 2 - 0.28],
        [-BASE_W / 2 + 0.3, -BASE_D / 2 + 0.24],
        [BASE_W / 2 - 0.3, -BASE_D / 2 + 0.24],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          geometry={geo.foot}
          material={mats.hinge}
          position={[x, FOOT_H / 2, z]}
        />
      ))}

      {/* Recessed keyboard well */}
      <mesh
        geometry={geo.well}
        material={mats.deck}
        position={[0, DECK_Y + 0.0008, -0.47]}
        receiveShadow
      />

      {/* Key caps */}
      <primitive object={keyboard} />

      {/* Trackpad, with a lit rim to catch the eye */}
      <mesh
        geometry={geo.trackpad}
        material={mats.trackpad}
        position={[0, DECK_Y + 0.004, 0.62]}
        receiveShadow
      />
      <lineSegments
        geometry={geo.trackpadEdge}
        position={[0, DECK_Y + 0.011, 0.62]}
      >
        <primitive object={mats.rim} attach="material" />
      </lineSegments>

      {/* Hinge barrel */}
      <mesh
        geometry={geo.hinge}
        material={mats.hinge}
        rotation={[0, 0, Math.PI / 2]}
        position={[0, DECK_Y - 0.035, HINGE_Z]}
        castShadow
      />

      {/* ---------------- Lid ----------------
          Pivoted at the hinge line and leaned back from vertical, so the panel
          swings the way a real lid does instead of being placed by eye. */}
      <group ref={lid} position={[0, DECK_Y - 0.02, HINGE_Z]} rotation={[LID_CLOSED, 0, 0]}>
        <mesh
          geometry={geo.lid}
          material={mats.body}
          position={[0, LID_H / 2, -LID_T / 2]}
          castShadow
          receiveShadow
        />

        {/* Black bezel face, inset into the lid */}
        <mesh position={[0, LID_H / 2, 0.002]}>
          <planeGeometry args={[LID_W - 0.16, LID_H - 0.16]} />
          <primitive object={mats.bezel} attach="material" />
        </mesh>

        {/* Display */}
        <mesh ref={display} geometry={geo.screen} position={[0, SCREEN_Y, 0.004]}>
          <meshBasicMaterial
            ref={displayMat}
            map={screen.texture}
            toneMapped={false}
            color="#000000"
          />
        </mesh>

        {/* Glass sheen over the panel */}
        <mesh geometry={geo.screen} position={[0, SCREEN_Y, 0.006]} material={glassMat} />

        {/* Bezel highlight */}
        <lineSegments geometry={geo.screenEdge} position={[0, SCREEN_Y, 0.007]}>
          <primitive object={mats.rim} attach="material" />
        </lineSegments>

        {/* Camera dot in the top bezel */}
        <mesh geometry={geo.notch} position={[0, LID_H - 0.055, 0.005]}>
          <meshBasicMaterial color="#16283f" />
        </mesh>

        {/* Screen spill onto everything in front of it */}
        <Glow color="#2f8ae0" scale={4.2} intensity={0.3} position={[0, SCREEN_Y, 0.45]} />
      </group>

      {/* Floor bloom under the machine */}
      <Glow color="#1566d6" scale={4.8} intensity={0.26} position={[0, 0.04, 0.2]} />
    </group>
  );
}

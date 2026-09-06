/**
 * A tiny module-level store shared between the DOM layer (Lenis, pointer events)
 * and the WebGL layer. Deliberately mutable and outside React: the 3D scene
 * samples these every frame, and routing them through state would re-render the
 * tree 60 times a second.
 */

export const sceneState = {
  /** Page scroll progress, 0 → 1 across the whole document. */
  scroll: 0,
  /** Raw scroll offset in pixels. */
  scrollY: 0,
  /** Pointer in normalized device coords, -1 → 1. Smoothed in the render loop. */
  pointerX: 0,
  pointerY: 0,
  /** Smoothed follower values — written by the scene, read by anything that needs them. */
  smoothX: 0,
  smoothY: 0,
  /** Section index currently in view, used to re-pose the camera. */
  section: 0,
  /** Set false when the tab is hidden so the render loop can idle. */
  visible: true,
};

/**
 * DOM nodes for the holographic labels tethered to the 3D network.
 *
 * The labels live in normal page markup rather than inside the canvas: that
 * puts them above the vignette overlay (a portal inside the canvas wrapper
 * would be painted under it), keeps their styling in plain CSS, and lets the
 * render loop position them by writing one transform per frame.
 */
export const labelRegistry: (HTMLElement | null)[] = [];

/** The "AI" mark pinned to the centre of the core, positioned the same way. */
export const coreLabel: { el: HTMLElement | null } = { el: null };

export type PerfTier = "low" | "mid" | "high";

/** Particle / node budgets per device tier. Mobile gets a genuinely lighter scene. */
export const TIER_BUDGET: Record<
  PerfTier,
  { particles: number; nodes: number; streams: number; shards: number; dpr: [number, number] }
> = {
  low: { particles: 420, nodes: 9, streams: 6, shards: 3, dpr: [1, 1] },
  mid: { particles: 1100, nodes: 14, streams: 10, shards: 5, dpr: [1, 1.5] },
  high: { particles: 2400, nodes: 18, streams: 14, shards: 7, dpr: [1, 2] },
};

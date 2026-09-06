"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

type ScrollAPI = {
  scrollTo: (target: string | number) => void;
  /** Pause/resume scrolling — used to lock the page behind the mobile menu. */
  stop: () => void;
  start: () => void;
};

const NOOP: ScrollAPI = { scrollTo: () => {}, stop: () => {}, start: () => {} };
const ScrollContext = createContext<ScrollAPI>(NOOP);

export const useSmoothScroll = () => useContext(ScrollContext);

/**
 * Wires Lenis and GSAP into a single render loop.
 *
 * The critical detail is that Lenis is stepped from GSAP's ticker rather than
 * its own rAF: two independent loops would let ScrollTrigger read a scroll
 * position one frame stale, which shows up as pinned elements jittering.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  // The API reads the instance through a ref rather than living in state: the
  // context value stays referentially stable, so nothing below re-renders when
  // Lenis is created, and consumers can safely list these in effect deps.
  const api = useMemo<ScrollAPI>(
    () => ({
      scrollTo: (target) => {
        const lenis = lenisRef.current;
        if (!lenis) return;
        // A stopped instance ignores scrollTo, so resume before jumping — this
        // is the path taken when a link inside the mobile menu is tapped.
        lenis.start();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      },
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
    }),
    [],
  );

  useEffect(() => {
    // Plugins are registered at import time in @/lib/gsap — see the note there.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: 1.15,
      // Expo-out: fast pickup, long glide — reads as "weighted" rather than laggy.
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      // Left false deliberately: native touch scrolling is smoother and far
      // cheaper on mobile than a JS-driven one.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      sceneState.scrollY = scroll;
      sceneState.scroll = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger measure once fonts have settled, or headings that
    // reflow will leave triggers anchored to stale positions.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    const t = window.setTimeout(refresh, 600);

    return () => {
      window.clearTimeout(t);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((s) => s.kill());
      lenisRef.current = null;
    };
  }, []);

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}

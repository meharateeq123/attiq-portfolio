"use client";

import { useEffect, useState } from "react";
import type { PerfTier } from "./scene-state";

export type PerfProfile = {
  tier: PerfTier;
  isMobile: boolean;
  reducedMotion: boolean;
  /** False until we've measured on the client — keeps SSR output deterministic. */
  ready: boolean;
};

const INITIAL: PerfProfile = { tier: "mid", isMobile: false, reducedMotion: false, ready: false };

/**
 * Classifies the device once on mount. We lean on cheap, reliable signals
 * (viewport, memory, core count, pointer type) rather than benchmarking, so the
 * scene can be sized correctly on the very first frame.
 */
export function usePerfTier(): PerfProfile {
  const [profile, setProfile] = useState<PerfProfile>(INITIAL);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    const measure = () => {
      const isMobile = coarse.matches || window.innerWidth < 768;
      const cores = navigator.hardwareConcurrency ?? 4;
      // deviceMemory is Chromium-only; treat "unknown" as mid-range.
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;

      let tier: PerfTier;
      if (isMobile || cores <= 4 || memory <= 4) tier = "low";
      else if (cores >= 8 && memory >= 8 && window.innerWidth >= 1280) tier = "high";
      else tier = "mid";

      setProfile({ tier, isMobile, reducedMotion: reduce.matches, ready: true });
    };

    measure();
    reduce.addEventListener("change", measure);
    coarse.addEventListener("change", measure);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      reduce.removeEventListener("change", measure);
      coarse.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return profile;
}

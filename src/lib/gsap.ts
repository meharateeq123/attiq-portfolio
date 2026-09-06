import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins.
 *
 * Registering inside a provider's effect is too late: children run their own
 * layout effects first, and an unregistered plugin makes GSAP treat
 * `scrollTrigger` as an ordinary property — so a scrubbed tween fires
 * immediately instead of being driven by scroll. Doing it at module scope means
 * any module that imports gsap from here is guaranteed to have it registered.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

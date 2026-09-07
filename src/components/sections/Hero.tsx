"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { profile, heroStats, edgeMotifs } from "@/config/site";
import { HeroName } from "../ui/HeroName";
import { Button } from "../ui/Button";
import { ArrowRight, ArrowDown } from "../ui/Icons";
import { useSmoothScroll } from "../layout/SmoothScroll";

/* ---------------------------------------------------------------------------
 * Name decrypt
 *
 * Each glyph churns through junk characters and then locks into its real one,
 * left to right. Sizes are frozen to the measured width of the real character
 * first: without that, every swap to a narrower glyph reflows the whole line
 * and the name jitters for the length of the animation.
 * ------------------------------------------------------------------------- */
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$*+=<>/";
/** Seconds between one glyph starting to churn and the next. */
const LOCK_STAGGER = 0.036;
/** How long a glyph churns before it resolves. */
const CHURN = 0.5;
/** Seconds between junk swaps. Slower than a frame, or it reads as static. */
const FLICKER = 0.045;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    // The items start at opacity-0 in markup so there's no flash before GSAP
    // takes over — which means the reduced-motion path has to reveal them
    // explicitly rather than just skipping the animation. The boot lines and
    // name glyphs are left exactly as rendered: both carry their full text in
    // markup, so doing nothing is already the correct static state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll("[data-hero-item], [data-hero-lead]"), { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-name-char]");

      // Measure every glyph before touching any of them: interleaving the reads
      // with the writes below would force a layout flush per character.
      const widths = chars.map((c) => c.getBoundingClientRect().width);
      chars.forEach((c, i) => {
        c.style.width = `${widths[i].toFixed(2)}px`;
        c.dataset.scramble = "";
        c.textContent = "";
      });

      gsap.set("[data-hero-item]", { y: 30, opacity: 0 });
      gsap.set("[data-hero-lead]", { y: 12, opacity: 0 });

      const runtime = chars.length * LOCK_STAGGER + CHURN;
      const clock = { t: 0 };
      let lastFlick = -1;

      const tl = gsap.timeline({ delay: 0.25 });

      // --- 1. the eyebrow leads in ------------------------------------------
      tl.to("[data-hero-lead]", { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" });

      // --- 2. the name decrypts ---------------------------------------------
      tl.to(clock, {
        t: runtime,
        duration: runtime,
        ease: "none",
        onUpdate: () => {
          const now = clock.t;
          const flick = Math.floor(now / FLICKER);
          const swap = flick !== lastFlick;
          lastFlick = flick;

          for (let i = 0; i < chars.length; i++) {
            const el = chars[i];
            const start = i * LOCK_STAGGER;

            // Still ahead of the wave: hold the slot open but empty, so the
            // line builds up rather than opening as a solid block of noise.
            if (now < start) continue;

            if (now >= start + CHURN) {
              if (el.dataset.scramble !== undefined) {
                delete el.dataset.scramble;
                el.textContent = el.dataset.char ?? "";
              }
            } else if (swap) {
              el.textContent = CHARSET[(Math.random() * CHARSET.length) | 0];
            }
          }
        },
        onComplete: () => {
          // Hand the glyphs back to normal layout. The frozen widths are in
          // pixels, so leaving them on would break the name at the next resize
          // or font-size step.
          chars.forEach((c) => {
            c.style.width = "";
            delete c.dataset.scramble;
            c.textContent = c.dataset.char ?? "";
          });
        },
      }, "-=0.45");

      // --- 3. everything below it -------------------------------------------
      tl.to(
        "[data-hero-item]",
        { y: 0, opacity: 1, duration: 1, stagger: 0.09, ease: "expo.out" },
        // Starts while the last glyphs are still resolving.
        `-=${CHURN + 0.15}`,
      );

      // The copy drifts up and dissolves as the section leaves — it hands the
      // frame over to the 3D scene rather than just scrolling away.
      gsap.to(copy.current, {
        y: -90,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.6,
        },
      });
    }, el);

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={root}
      id="hero"
      className="above relative flex min-h-[100svh] w-full items-center px-5 pb-28 pt-28 sm:px-8 lg:px-14 lg:pb-28 lg:pt-24 xl:px-20"
    >
      {/* Vertical motif, right edge. Only from 2xl up: below that the orbiting
          concept chips reach the right gutter and would collide with it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none flex-col items-end gap-1 2xl:flex"
      >
        {edgeMotifs.hero.map((w) => (
          <span key={w} className="label-mono text-[0.58rem] leading-tight text-dim/70">
            {w}
          </span>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1400px]">
        {/* Capped so the copy column never runs into the 3D core on the right */}
        <div ref={copy} className="max-w-[min(100%,46rem)]">
          {/* Leads the sequence rather than joining the group below the name:
              a line that sits above the headline should not arrive after it. */}
          <p data-hero-lead className="eyebrow mb-6 opacity-0">
            {profile.eyebrow}
          </p>

          <HeroName lines={profile.nameLines} className="mb-6" />

          <div data-hero-item className="mb-7 flex items-center gap-4 opacity-0">
            <h2 className="label-mono text-[clamp(0.66rem,1.1vw,0.82rem)] font-medium text-blue-300">
              {profile.role}
            </h2>
            <span className="h-px flex-1 max-w-[10rem] bg-[linear-gradient(90deg,var(--line-hot),transparent)]" />
          </div>

          <p
            data-hero-item
            className="mb-10 max-w-xl text-[clamp(0.95rem,1.5vw,1.15rem)] leading-relaxed text-text-soft opacity-0"
          >
            {profile.tagline}
          </p>

          <div data-hero-item className="mb-10 flex flex-wrap items-center gap-3 opacity-0 sm:gap-4">
            <Button href="#work" variant="solid" icon={<ArrowRight className="h-4 w-4" />}>
              View My Work
            </Button>
            <Button href="#contact" variant="outline">
              Let&apos;s Talk
            </Button>
          </div>

          {/* Qualitative stats — edit them in config/site.ts */}
          <dl data-hero-item className="flex flex-wrap items-start gap-x-8 gap-y-6 opacity-0 sm:gap-x-12">
            {heroStats.map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  "flex flex-col gap-1",
                  // Divider only once the row actually fits side by side —
                  // on a wrapped row it reads as a stray indent.
                  i > 0 ? "sm:border-l sm:border-[color:var(--line)] sm:pl-12" : "",
                ].join(" ")}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold leading-none text-grad">
                  {stat.value}
                </dd>
                <span className="label-mono text-[0.6rem] text-muted">{stat.label}</span>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#about");
        }}
        data-hero-item
        className="group absolute bottom-8 left-5 flex items-center gap-3 opacity-0 sm:left-8 lg:left-14 xl:left-20"
        aria-label="Scroll to about section"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--line-hot)]">
          <span className="pulse-ring absolute inset-0 rounded-full border border-[color:var(--blue-400)]" />
          <ArrowDown className="scroll-cue h-4 w-4 text-blue-300" />
        </span>
        <span className="label-mono text-[0.6rem] text-muted transition-colors group-hover:text-text-soft">
          Scroll to explore
        </span>
      </a>
    </section>
  );
}

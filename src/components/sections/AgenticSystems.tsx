"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { agentic } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";

/**
 * The perceive → reason → act → learn loop. A connector line fills as the
 * section scrolls, and each step lights up as the fill reaches it, so the
 * reader physically traces the loop while reading it.
 */
export function AgenticSystems() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(el.querySelectorAll("[data-step]"), { opacity: 1 });
      gsap.set(el.querySelector("[data-progress]"), { scaleX: 1, scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      // The connector fills horizontally on desktop, vertically when stacked.
      gsap.fromTo(
        "[data-progress]",
        { scaleX: isDesktop ? 0 : 1, scaleY: isDesktop ? 1 : 0 },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 78%", scrub: 0.5 },
        },
      );

      steps.forEach((step, i) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: step, start: "top 88%", once: true },
            delay: i * 0.05,
          },
        );
      });
    }, el);

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
  }, []);

  return (
    <Section id="agentic" tone="veil">
      <div className="mb-16 max-w-3xl lg:mb-24">
        <Reveal variant="fade">
          <SectionIndex index={agentic.index} label={agentic.eyebrow} />
        </Reveal>
        <DisplayHeading lines={agentic.headline} accentFrom={1} className="mb-6" />
        <Reveal variant="up" delay={0.1}>
          <p className="max-w-2xl leading-relaxed text-text-soft">{agentic.body}</p>
        </Reveal>
      </div>

      <div ref={root} className="relative">
        {/* Connector rail */}
        <div
          aria-hidden
          className="absolute left-[27px] top-4 h-[calc(100%-2rem)] w-px bg-[color:var(--line)] md:left-0 md:top-[27px] md:h-px md:w-full"
        >
          <div
            data-progress
            className="h-full w-full origin-top bg-[linear-gradient(180deg,var(--cyan-300),var(--blue-500))] md:origin-left md:bg-[linear-gradient(90deg,var(--cyan-300),var(--blue-500))]"
            style={{ transform: "scaleY(0)" }}
          />
        </div>

        <ol className="grid gap-10 md:grid-cols-4 md:gap-6 lg:gap-10">
          {agentic.steps.map((step) => (
            <li key={step.k} data-step className="relative flex gap-5 opacity-0 md:block">
              {/* Node marker */}
              <div className="relative z-10 flex-shrink-0">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--line-hot)] bg-[#060c18] font-mono text-[0.72rem] tracking-[0.1em] text-blue-300 shadow-[0_0_28px_-8px_rgba(43,134,245,0.9)]">
                  {step.k}
                </span>
              </div>

              <div className="md:mt-7">
                <h3 className="mb-2.5 font-display text-[1.15rem] font-bold uppercase tracking-[0.06em] text-text">
                  {step.title}
                </h3>
                <p className="max-w-xs text-[0.85rem] leading-relaxed text-muted">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

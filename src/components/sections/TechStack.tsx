"use client";

import { stack } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";

export function TechStack() {
  return (
    <Section id="stack" tone="veil">
      <div className="mb-14 max-w-3xl lg:mb-20">
        <Reveal variant="fade">
          <SectionIndex index={stack.index} label={stack.eyebrow} />
        </Reveal>
        <DisplayHeading lines={stack.headline} accentFrom={1} className="mb-6" />
        <Reveal variant="up" delay={0.1}>
          <p className="max-w-xl leading-relaxed text-text-soft">{stack.body}</p>
        </Reveal>
      </div>

      <Reveal
        variant="up"
        stagger={0.09}
        className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {stack.groups.map((group) => (
          <div key={group.group}>
            <h3 className="mb-4 flex items-center gap-2.5 border-b border-[color:var(--line)] pb-3">
              <span className="h-1.5 w-1.5 rotate-45 bg-[color:var(--blue-400)]" />
              <span className="label-mono text-[0.62rem] text-text">{group.group}</span>
            </h3>
            <ul className="flex flex-col gap-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="group flex cursor-default items-center gap-2.5 text-[0.85rem] text-muted transition-colors duration-300 hover:text-text"
                >
                  <span className="h-px w-3 bg-[color:var(--line-hot)] transition-all duration-300 group-hover:w-5 group-hover:bg-[color:var(--cyan-300)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Reveal>

      {/* Marquee — a slow band of keywords tying the section together */}
      <div className="relative mt-20 overflow-hidden border-y border-[color:var(--line)] py-5">
        {/* Feathered edges so words fade rather than clip at the boundary */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-[linear-gradient(90deg,var(--ink-950),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-[linear-gradient(270deg,var(--ink-950),transparent)]" />
        <div className="marquee-track flex w-max items-center gap-10 sm:gap-14">
          {/* Doubled so the -50% translate loops seamlessly */}
          {[...stack.marquee, ...stack.marquee].map((word, i) => (
            <span key={i} className="flex items-center gap-10 sm:gap-14">
              <span className="font-display text-[clamp(1.1rem,2.4vw,1.9rem)] font-extrabold uppercase tracking-[0.02em] text-text-soft/35">
                {word}
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[color:var(--blue-500)]" />
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

"use client";

import { capabilities } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { ICON_MAP, ArrowRight } from "../ui/Icons";

export function WhatIBuild() {
  return (
    <Section id="build">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 xl:gap-24">
        {/* ---------- Intro ---------- */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal variant="fade">
            <SectionIndex index={capabilities.index} label={capabilities.eyebrow} />
          </Reveal>

          <DisplayHeading lines={capabilities.headline} accentFrom={1} className="mb-6" />

          <Reveal variant="up" delay={0.1}>
            <p className="mb-9 max-w-md leading-relaxed text-text-soft">{capabilities.body}</p>
          </Reveal>

          <Reveal variant="up" delay={0.18}>
            <Button href="#work" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
              See All Projects
            </Button>
          </Reveal>
        </div>

        {/* ---------- Capability cards ---------- */}
        <Reveal variant="up" stagger={0.1} className="grid gap-4 sm:grid-cols-2">
          {capabilities.items.map((item) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            return (
              <article
                key={item.title}
                className="group panel relative flex flex-col gap-4 overflow-hidden rounded-sm p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-[color:var(--line-hot)] sm:p-7"
              >
                {/* Light that follows the card up on hover */}
                <span className="pointer-events-none absolute inset-x-0 -bottom-24 h-32 bg-[radial-gradient(50%_100%_at_50%_100%,rgba(43,134,245,0.35),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative flex h-12 w-12 items-center justify-center rounded-sm border border-[color:var(--line)] bg-[rgba(43,134,245,0.08)] text-blue-300 transition-colors duration-500 group-hover:border-[color:var(--blue-400)] group-hover:text-cyan-300">
                  <Icon className="h-6 w-6" />
                </span>

                <div className="relative flex-1">
                  <h3 className="mb-2 font-display text-[1.05rem] font-bold uppercase tracking-[0.04em] text-text">
                    {item.title}
                  </h3>
                  <p className="text-[0.85rem] leading-relaxed text-muted">{item.desc}</p>
                  {/* Expands into the fuller explanation on hover */}
                  <p className="mt-0 max-h-0 overflow-hidden text-[0.82rem] leading-relaxed text-text-soft opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:max-h-32 group-hover:opacity-100">
                    {item.long}
                  </p>
                </div>

                <ArrowRight className="relative h-4 w-4 text-dim transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-blue-400" />
              </article>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}

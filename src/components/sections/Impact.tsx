"use client";

import { impact } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";

export function Impact() {
  return (
    <Section id="impact">
      <div className="grid gap-14 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20">
        {/* ---------- Intro + qualitative outcomes ---------- */}
        <div>
          <Reveal variant="fade">
            <SectionIndex index={impact.index} label={impact.eyebrow} />
          </Reveal>
          <DisplayHeading lines={impact.headline} accentFrom={1} className="mb-6" />
          <Reveal variant="up" delay={0.1}>
            <p className="mb-10 max-w-md leading-relaxed text-text-soft">{impact.body}</p>
          </Reveal>

          <Reveal variant="up" stagger={0.1} className="flex flex-col gap-5">
            {impact.outcomes.map((o) => (
              <div key={o.title} className="border-l border-[color:var(--line-hot)] pl-5">
                <h3 className="mb-1 text-[0.92rem] font-semibold text-text">{o.title}</h3>
                <p className="text-[0.82rem] leading-relaxed text-muted">{o.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* ---------- Timeline ---------- */}
        <Reveal variant="up" delay={0.15}>
          <div className="relative">
            {/* Spine — a sibling of the list, so <li> stays a direct child of <ol> */}
            <span
              aria-hidden
              className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-[linear-gradient(180deg,var(--cyan-300),var(--blue-600),transparent)] md:left-0 md:top-[7px] md:h-px md:w-full md:bg-[linear-gradient(90deg,var(--cyan-300),var(--blue-600),transparent)]"
            />

            <ol className="grid gap-9 md:grid-cols-4 md:gap-5">
              {impact.timeline.map((entry, i) => (
                <li key={entry.when} className="relative flex gap-5 md:block">
                  {/* Marker */}
                  <span className="relative z-10 mt-1 flex h-[15px] w-[15px] flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--blue-400)] bg-[#060c18]">
                    <span
                      className="h-[5px] w-[5px] rounded-full bg-[color:var(--cyan-300)]"
                      style={{ boxShadow: "0 0 10px 2px rgba(126,232,255,0.7)" }}
                    />
                  </span>

                  <div className="md:mt-6">
                    <span className="label-mono mb-1.5 block text-[0.62rem] text-blue-300">{entry.when}</span>
                    <h3 className="mb-1.5 font-display text-[0.98rem] font-bold uppercase leading-tight tracking-[0.03em] text-text">
                      {entry.title}
                    </h3>
                    <p className="max-w-[15rem] text-[0.79rem] leading-relaxed text-muted">{entry.desc}</p>
                  </div>

                  {/* Ordinal watermark */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 right-2 font-display text-5xl font-extrabold text-white/[0.03] md:right-4"
                  >
                    0{i + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

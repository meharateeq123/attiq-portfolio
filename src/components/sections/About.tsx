"use client";

import dynamic from "next/dynamic";
import { about } from "@/config/site";
import { usePerfTier } from "@/lib/use-perf-tier";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";
import { HoloFrame } from "../ui/HoloFrame";
import { ICON_MAP } from "../ui/Icons";

// Its own WebGL context, so it is loaded only in the browser and only when the
// device can afford it.
const LaptopCanvas = dynamic(() => import("../three/LaptopCanvas"), { ssr: false });

/** Chips that float around the schematic, echoing the hero's node labels. */
const FLOATING = [
  { label: "Python", pos: "left-[6%] top-[14%]", delay: "0s" },
  { label: "Next.js", pos: "left-[2%] top-[46%]", delay: "0.8s" },
  { label: "AI Agents", pos: "right-[6%] top-[22%]", delay: "1.6s" },
  { label: "APIs", pos: "left-[10%] bottom-[16%]", delay: "2.4s" },
  { label: "RAG", pos: "right-[10%] bottom-[12%]", delay: "3.2s" },
];

export function About() {
  const { isMobile, reducedMotion, ready } = usePerfTier();
  // Gated on device type rather than perf tier: this canvas is small and holds
  // one low-poly object, which any desktop handles comfortably. Phones and
  // reduced-motion users keep the SVG schematic, which costs nothing.
  const show3D = ready && !isMobile && !reducedMotion;

  return (
    <Section id="about" tone="veil">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        {/* ---------- Workstation ---------- */}
        <Reveal variant="scale" className="order-2 lg:order-1">
          <HoloFrame glow className="relative aspect-[4/3] overflow-hidden p-6 sm:p-8">
            {/* Blueprint grid */}
            <div className="grid-tex absolute inset-0 opacity-50" />
            {/* Sweeping scanline */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="scan-sweep absolute inset-x-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(87,166,255,0.14),transparent)]" />
            </div>

            {/* 3D laptop with code typing itself out on the screen */}
            {show3D && (
              <div className="absolute inset-0">
                <LaptopCanvas />
              </div>
            )}

            {/* Node schematic — the fallback when the laptop is not rendered */}
            {!show3D && (
            <svg
              viewBox="0 0 400 300"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="wire" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1566d6" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#57a6ff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#7ee8ff" stopOpacity="0.25" />
                </linearGradient>
                <filter id="soft">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>

              {/* Links */}
              <g stroke="url(#wire)" strokeWidth="1.1" fill="none">
                <path d="M80 90 L200 150 L320 90" />
                <path d="M80 210 L200 150 L320 210" />
                <path d="M80 90 L80 210M320 90 L320 210" />
                <path d="M200 40 L200 150 L200 260" />
              </g>

              {/* Core */}
              <circle cx="200" cy="150" r="26" fill="#0b1a33" stroke="#57a6ff" strokeWidth="1.2" />
              <circle cx="200" cy="150" r="26" fill="#2b86f5" opacity="0.28" filter="url(#soft)" />
              <text
                x="200"
                y="155"
                textAnchor="middle"
                className="font-display"
                fill="#dbeeff"
                fontSize="15"
                fontWeight="700"
                letterSpacing="1"
              >
                AI
              </text>

              {/* Satellites */}
              {[
                [80, 90],
                [320, 90],
                [80, 210],
                [320, 210],
                [200, 40],
                [200, 260],
              ].map(([cx, cy], i) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="9" fill="#7ee8ff" opacity="0.16" filter="url(#soft)" />
                  <circle cx={cx} cy={cy} r="3.6" fill="#9fdcff" />
                </g>
              ))}
            </svg>
            )}

            {/* Floating tech chips */}
            {FLOATING.map((chip) => (
              <span
                key={chip.label}
                style={{ animationDelay: chip.delay }}
                className={`float-chip absolute ${chip.pos} rounded-sm border border-[color:var(--line-hot)] bg-[rgba(10,20,38,0.8)] px-2.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-blue-300 backdrop-blur-sm`}
              >
                {chip.label}
              </span>
            ))}
          </HoloFrame>
        </Reveal>

        {/* ---------- Copy ---------- */}
        <div className="order-1 lg:order-2">
          <Reveal variant="fade">
            <SectionIndex index={about.index} label={about.eyebrow} />
          </Reveal>

          <DisplayHeading lines={about.headline} accentFrom={1} className="mb-7" />

          <Reveal variant="up" stagger={0.12} className="mb-10 space-y-4">
            {about.body.map((p) => (
              <p key={p} className="max-w-xl leading-relaxed text-text-soft">
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal
            variant="up"
            stagger={0.09}
            className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:gap-x-4"
          >
            {about.pillars.map((pillar) => {
              const Icon = ICON_MAP[pillar.icon as keyof typeof ICON_MAP];
              return (
                <div key={pillar.title} className="flex flex-col gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-[color:var(--line)] bg-[rgba(43,134,245,0.07)] text-blue-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  {/* Fixed two-line box so the notes below stay on one baseline
                      even when a title wraps. */}
                  <span className="flex min-h-[2.6em] items-start text-[0.86rem] font-medium leading-snug text-text">
                    {pillar.title}
                  </span>
                  <span className="text-[0.72rem] leading-snug text-muted">{pillar.note}</span>
                </div>
              );
            })}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

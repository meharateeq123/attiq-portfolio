"use client";

import { work } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";
import { ProjectVisual } from "../ui/ProjectVisual";
import { TiltCard } from "../ui/TiltCard";
import { ExternalLink, ArrowRight } from "../ui/Icons";

/** A `#` placeholder means "no link yet" — we hide the action rather than
 *  shipping a link that goes nowhere. */
const isLive = (href: string) => Boolean(href) && href !== "#";

export function SelectedWork() {
  return (
    <Section id="work">
      <div className="mb-14 grid gap-8 lg:mb-20 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
        <div>
          <Reveal variant="fade">
            <SectionIndex index={work.index} label={work.eyebrow} />
          </Reveal>
          <DisplayHeading lines={work.headline} accentFrom={1} />
        </div>
        <Reveal variant="up" delay={0.1}>
          <p className="max-w-md leading-relaxed text-text-soft lg:pb-2">{work.body}</p>
        </Reveal>
      </div>

      {/* Three across rather than four: at four the cards are narrow enough
          that a repo slug wraps, and the row no longer divides the project
          count evenly. */}
      <Reveal variant="up" stagger={0.12} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {work.projects.map((project, i) => (
          <TiltCard key={project.title} max={7}>
            <article
              className="group panel relative flex h-full flex-col overflow-hidden rounded-sm transition-[border-color,box-shadow] duration-500 hover:border-[color:var(--line-hot)] hover:shadow-[0_28px_60px_-30px_rgba(43,134,245,0.9)]"
            >
            {/* Preview */}
            <div className="relative aspect-[16/9] overflow-hidden border-b border-[color:var(--line-soft)]">
              <ProjectVisual
                variant={i}
                className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(5,9,18,0.55))]" />

              {isLive(project.demo) && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Open ${project.title}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-sm border border-[color:var(--line-hot)] bg-[rgba(6,12,24,0.8)] text-blue-300 backdrop-blur-sm transition-colors hover:bg-[rgba(43,134,245,0.28)] hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3.5 p-5">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-[1rem] font-bold uppercase leading-tight tracking-[0.02em] text-text transition-colors duration-300 group-hover:text-blue-300">
                  {project.title}
                </h3>
                {/* The repository this card actually points at. Shown because a
                    title is a label, and the slug is the thing you can go and
                    check for yourself. */}
                {project.repo && (
                  <span className="truncate font-mono text-[0.6rem] tracking-[0.06em] text-dim">
                    {project.repo}
                  </span>
                )}
              </div>
              <p className="flex-1 text-[0.8rem] leading-relaxed text-muted">{project.summary}</p>

              <ul className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-[color:var(--line-soft)] bg-white/[0.03] px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-dim"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {(isLive(project.demo) || isLive(project.code)) && (
                <div className="mt-1 flex items-center gap-5 border-t border-[color:var(--line-soft)] pt-3.5">
                  {isLive(project.demo) && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group/l inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-soft transition-colors hover:text-blue-300"
                    >
                      Live Demo
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/l:translate-x-1" />
                    </a>
                  )}
                  {isLive(project.code) && (
                    <a
                      href={project.code}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group/l inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-text-soft transition-colors hover:text-blue-300"
                    >
                      GitHub
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/l:translate-x-1" />
                    </a>
                  )}
                </div>
              )}
              </div>
            </article>
          </TiltCard>
        ))}
      </Reveal>
    </Section>
  );
}

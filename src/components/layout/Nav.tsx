"use client";

import { useEffect, useState } from "react";
import { nav } from "@/config/site";
import { useSmoothScroll } from "./SmoothScroll";
import { ArrowRight } from "../ui/Icons";

export function Nav() {
  const { scrollTo, stop, start } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [open, setOpen] = useState(false);

  // Solidify the bar once we leave the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active link. An observer beats a scroll handler here: no per-frame layout
  // reads, and it stays correct when Lenis flings past several sections.
  useEffect(() => {
    const ids = nav.map((n) => n.href.slice(1));
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      // A band across the middle of the viewport decides what counts as "here".
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  // Lock the page while the mobile sheet is open. Lenis owns the scroll
  // position, so we pause it rather than setting overflow:hidden — the two
  // approaches fight, and the CSS one lets the page jump on close.
  useEffect(() => {
    if (open) stop();
    else start();
  }, [open, stop, start]);

  const go = (href: string) => {
    setOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-[color:var(--line)] bg-[rgba(4,7,14,0.72)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-end px-5 sm:px-8 lg:px-14 xl:px-20">
          {/* Desktop links */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
            {nav.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  className={[
                    "relative py-1 text-[0.82rem] transition-colors duration-300",
                    isActive ? "text-white" : "text-muted hover:text-text-soft",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={[
                      "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-[color:var(--blue-400)]",
                      "transition-transform duration-500 ease-out",
                      isActive ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                go("#contact");
              }}
              className="group hidden items-center gap-2 rounded-sm border border-[color:var(--line-hot)] bg-[rgba(43,134,245,0.08)] px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-text transition-all duration-300 hover:bg-[rgba(43,134,245,0.2)] sm:inline-flex"
            >
              Let&apos;s Talk
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-sm border border-[color:var(--line)] md:hidden"
            >
              <span
                className={[
                  "h-px w-4 bg-text transition-transform duration-300",
                  open ? "translate-y-[3px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "h-px w-4 bg-text transition-transform duration-300",
                  open ? "-translate-y-[3px] -rotate-45" : "",
                ].join(" ")}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      <div
        className={[
          "fixed inset-0 z-40 flex flex-col justify-center gap-2 px-8 md:hidden",
          "bg-[rgba(3,5,11,0.96)] backdrop-blur-2xl transition-all duration-500",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        {nav.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              go(item.href);
            }}
            className="display-md border-b border-[color:var(--line-soft)] py-5 text-text transition-all duration-500"
            style={{
              transform: open ? "translateY(0)" : "translateY(24px)",
              opacity: open ? 1 : 0,
              transitionDelay: `${open ? 80 + i * 60 : 0}ms`,
            }}
          >
            <span className="eyebrow mr-4 text-blue-400">0{i + 1}</span>
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}

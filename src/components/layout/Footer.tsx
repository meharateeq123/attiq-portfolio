"use client";

import { profile, nav } from "@/config/site";
import { useSmoothScroll } from "./SmoothScroll";

export function Footer() {
  const { scrollTo } = useSmoothScroll();
  const year = new Date().getFullYear();

  return (
    <footer className="above relative border-t border-[color:var(--line)] bg-[rgba(3,5,11,0.86)] px-5 py-10 sm:px-8 lg:px-14 xl:px-20">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-base font-extrabold tracking-[0.14em] text-text">
            {profile.initials}
          </span>
          <span className="label-mono text-[0.58rem] text-dim">
            {profile.name} · {profile.role}
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.href);
              }}
              className="label-mono text-[0.6rem] text-muted transition-colors hover:text-blue-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="label-mono text-[0.58rem] text-dim">© {year} · All rights reserved</p>
      </div>
    </footer>
  );
}

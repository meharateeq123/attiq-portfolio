"use client";

import { useEffect, useState } from "react";
import { contact, profile } from "@/config/site";
import { Section, SectionIndex } from "../layout/Section";
import { DisplayHeading } from "../ui/DisplayHeading";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";
import { SOCIAL_MAP, Copy, Check, Mail } from "../ui/Icons";

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  // Reset the confirmation, and clear the timer if the user leaves first.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      // Clipboard is unavailable over plain http and in some embedded views —
      // select the text instead so the address can still be copied by hand.
      const el = document.getElementById("contact-email");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a
        id="contact-email"
        href={`mailto:${profile.email}`}
        className="text-[0.92rem] text-text-soft underline decoration-[color:var(--line-hot)] underline-offset-[6px] transition-colors hover:text-blue-300 sm:text-[1rem]"
      >
        {profile.email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email address copied" : "Copy email address"}
        className="flex h-8 w-8 items-center justify-center rounded-sm border border-[color:var(--line)] text-muted transition-colors hover:border-[color:var(--blue-400)] hover:text-blue-300"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-cyan-300" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}

export function Contact() {
  const socials = contact.socials.filter((s) => s.href);

  return (
    <Section id="contact" tone="veil" className="pb-16 lg:pb-24">
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-20">
        <div>
          <Reveal variant="fade">
            <SectionIndex index={contact.index} label={contact.eyebrow} />
          </Reveal>
          <DisplayHeading lines={contact.headline} accentFrom={1} size="display-lg" />
        </div>

        <div className="flex flex-col gap-8">
          <Reveal variant="up">
            <p className="max-w-md leading-relaxed text-text-soft">{contact.body}</p>
          </Reveal>

          <Reveal variant="up" delay={0.1} className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                href={`mailto:${profile.email}`}
                variant="solid"
                icon={<Mail className="h-4 w-4" />}
              >
                Send an Email
              </Button>
            </div>

            <CopyEmail />

            {socials.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {socials.map((social) => {
                  const Icon = SOCIAL_MAP[social.icon as keyof typeof SOCIAL_MAP];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-sm border border-[color:var(--line)] text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:var(--blue-400)] hover:bg-[rgba(43,134,245,0.12)] hover:text-blue-300"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

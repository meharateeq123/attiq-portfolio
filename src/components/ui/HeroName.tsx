"use client";

/**
 * The hero name, split down to individual glyphs so each one can be decrypted
 * into place.
 *
 * Markup only — the timeline lives in <Hero>, so the scramble and the rest of
 * the hero copy run off one clock rather than several components trying to stay
 * in step through matching delay props.
 *
 * The first line is set as a light, wide-tracked kicker and the rest as one
 * heavy block: lines at the same weight read as a paragraph, and the contrast
 * between them is what makes the name read as typography instead of as text.
 *
 * Every glyph renders its real character here. The scramble swaps the text
 * content at runtime, which means no-JS and reduced-motion visitors get the
 * finished name with no extra branch to maintain.
 */
export function HeroName({
  lines,
  className = "",
}: {
  lines: readonly string[];
  className?: string;
}) {
  const [kicker, ...rest] = lines;

  const glyphs = (text: string, accent: boolean) =>
    // Words are grouped in their own inline-block so a line only ever breaks
    // between words, never mid-word between two glyph spans.
    text.split(" ").map((word, wi, words) => (
      <span key={wi} className={`inline-block ${wi < words.length - 1 ? "mr-[0.22em]" : ""}`}>
        {Array.from(word).map((ch, ci) => (
          <span
            key={ci}
            data-name-char
            data-char={ch}
            className={`glyph ${accent ? "text-grad" : ""}`}
          >
            {ch}
          </span>
        ))}
      </span>
    ));

  return (
    <h1 className={className}>
      {/* The split is decorative; this is the accessible name. */}
      <span className="sr-only">{lines.join(" ")}</span>

      <span aria-hidden className="hero-kicker mb-[0.55em] block">
        {glyphs(kicker, false)}
      </span>

      {rest.map((line, i) => (
        <span aria-hidden key={i} className="hero-name block">
          {glyphs(line, true)}
        </span>
      ))}
    </h1>
  );
}

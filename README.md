# Muhammad Attiq ur Rehman — Agentic Developer

A cinematic 3D portfolio built with Next.js, React Three Fiber, GSAP and Lenis.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

## Editing the content

**Everything you'll want to change lives in one file: [`src/config/site.ts`](src/config/site.ts).**

Projects, statistics, section headings, the tech stack, the timeline and the
social links are all defined there — no component edits needed.

- **Projects** — add, remove or reorder entries in `work.projects`. Each has a
  `demo` and `code` URL; leave one as `"#"` and that link is hidden rather than
  shipped as a dead link.
- **Statistics** — `heroStats`. They're deliberately qualitative (`1+`, `AI`,
  `∞`) rather than invented metrics. Replace them with whatever is true.
- **Socials** — `contact.socials`. An empty `href` hides that icon.

Nothing in the config makes a factual claim about clients, revenue or results.
If you add numbers, make sure they're yours.

## How it's put together

```
src/
  config/site.ts          all editable content
  lib/
    gsap.ts               single plugin-registration point
    scene-state.ts        mutable state shared between the DOM and WebGL
    use-perf-tier.ts      device classification
  components/
    layout/               Nav, Footer, Section shell, Lenis + ScrollTrigger
    sections/             the eight page sections
    three/                the 3D system
    ui/                   Button, Reveal, DisplayHeading, TiltCard, icons
```

### The 3D system

One **fixed, full-viewport canvas** sits behind the whole page
(`three/SceneCanvas.tsx`). A single persistent WebGL context is what keeps this
affordable on mobile, and it lets the camera flow continuously through the
scroll instead of restarting per section.

The scene is composed in `three/AIScene.tsx` from independent modules — core,
node network, particles, data streams, grid floor, shards — each of which can
be swapped or removed on its own.

There is exactly one **second** context: `three/LaptopCanvas.tsx`, the coding
laptop in the About panel. It needs to sit inside a specific box in the layout,
which is far more robust with its own viewport than by aligning a world-space
object to a DOM element. Phones and reduced-motion users get an SVG schematic
instead.

### Performance

- Devices are classified once (`use-perf-tier.ts`) and particle, node, stream
  and shard counts plus DPR come from a per-tier budget in `scene-state.ts`.
- No postprocessing. Bloom means extra render targets and a blur chain every
  frame; additive glow sprites get the same look for effectively nothing.
- Scroll and pointer values live in a mutable module object, not React state —
  the scene samples them per frame without re-rendering the tree.
- Rendering stops entirely when the tab is hidden.
- `backdrop-filter` is desktop-only; a dozen blurred panels is the most
  expensive thing on the page.
- `prefers-reduced-motion` is honoured throughout: animations resolve to their
  final state rather than being skipped, so nothing is left invisible.

### Accessibility

Headlines are split into words for the reveal animation but carry an `sr-only`
full-text copy, so the split is never exposed to assistive tech. The 3D layer is
`aria-hidden` and purely decorative — the page reads completely without it.

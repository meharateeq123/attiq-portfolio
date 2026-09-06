import type { SVGProps } from "react";

/**
 * A small geometric icon set drawn on a 24-unit grid with a consistent 1.4
 * stroke, so icons sit together without one looking heavier than the next.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export type IconName = "cube" | "layers" | "gear" | "database" | "spark";

export const Cube = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 2.6 20.5 7v10L12 21.4 3.5 17V7z" />
    <path d="M3.5 7 12 11.6 20.5 7M12 11.6v9.8" />
  </svg>
);

export const Layers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3 21 7.8 12 12.6 3 7.8z" />
    <path d="M3 12.2 12 17l9-4.8M3 16.4 12 21.2l9-4.8" />
  </svg>
);

export const Gear = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.1" />
    <path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4" />
  </svg>
);

export const Database = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="6" rx="7.4" ry="3.2" />
    <path d="M4.6 6v6c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2V6" />
    <path d="M4.6 12v6c0 1.8 3.3 3.2 7.4 3.2s7.4-1.4 7.4-3.2v-6" />
  </svg>
);

export const Spark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 2.8c.6 4.6 2.6 6.6 7.2 7.2-4.6.6-6.6 2.6-7.2 7.2-.6-4.6-2.6-6.6-7.2-7.2 4.6-.6 6.6-2.6 7.2-7.2Z" />
    <path d="M18.4 16.2c.3 2 1.1 2.8 3.1 3.1-2 .3-2.8 1.1-3.1 3.1-.3-2-1.1-2.8-3.1-3.1 2-.3 2.8-1.1 3.1-3.1Z" />
  </svg>
);

export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const ArrowDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 4.5v15M6 13.5l6 6 6-6" />
  </svg>
);

export const ExternalLink = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M19 14.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V6.5A1.5 1.5 0 0 1 5 5h4.5" />
  </svg>
);

export const Copy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
    <path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" />
  </svg>
);

export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const Mail = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="5" width="18.4" height="14" rx="2" />
    <path d="m3.4 6.6 8.6 6 8.6-6" />
  </svg>
);

/* --- Brand marks: solid fills, no stroke ---------------------------------- */

const brand = { viewBox: "0 0 24 24", fill: "currentColor" } as const;

export const GitHub = (p: SVGProps<SVGSVGElement>) => (
  <svg {...brand} {...p}>
    <path d="M12 1.8a10.2 10.2 0 0 0-3.23 19.88c.51.1.7-.22.7-.49v-1.9c-2.84.62-3.44-1.2-3.44-1.2-.47-1.18-1.14-1.5-1.14-1.5-.93-.63.07-.62.07-.62 1.03.07 1.57 1.06 1.57 1.06.91 1.57 2.4 1.12 2.98.85.09-.66.36-1.12.65-1.37-2.27-.26-4.66-1.14-4.66-5.06 0-1.12.4-2.03 1.05-2.75-.1-.26-.46-1.3.1-2.7 0 0 .86-.28 2.8 1.05a9.7 9.7 0 0 1 5.1 0c1.94-1.33 2.8-1.05 2.8-1.05.56 1.4.2 2.44.1 2.7.65.72 1.05 1.63 1.05 2.75 0 3.93-2.4 4.8-4.68 5.05.37.32.7.94.7 1.9v2.82c0 .27.18.6.7.49A10.2 10.2 0 0 0 12 1.8Z" />
  </svg>
);

export const LinkedIn = (p: SVGProps<SVGSVGElement>) => (
  <svg {...brand} {...p}>
    <path d="M6.94 8.6H3.56V21h3.38V8.6ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.9c0-3.2-1.7-4.7-3.98-4.7-1.83 0-2.65 1.01-3.11 1.72V8.6H9.97c.04.95 0 12.4 0 12.4h3.38v-6.93c0-.3.02-.6.11-.82.24-.6.79-1.23 1.72-1.23 1.21 0 1.7.93 1.7 2.29V21h3.38l.18-7.1Z" />
  </svg>
);

export const XMark = (p: SVGProps<SVGSVGElement>) => (
  <svg {...brand} {...p}>
    <path d="M17.5 3h3.3l-7.2 8.24L22 21h-6.63l-5.2-6.8L4.23 21H.92l7.7-8.8L.6 3h6.8l4.7 6.22L17.5 3Zm-1.16 16h1.83L7.75 4.9H5.79L16.34 19Z" />
  </svg>
);

export const YouTube = (p: SVGProps<SVGSVGElement>) => (
  <svg {...brand} {...p}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
  </svg>
);

export const ICON_MAP = { cube: Cube, layers: Layers, gear: Gear, database: Database, spark: Spark };
export const SOCIAL_MAP = { github: GitHub, linkedin: LinkedIn, x: XMark, youtube: YouTube };

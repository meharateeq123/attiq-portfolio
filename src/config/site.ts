/* ============================================================================
 * SITE CONTENT — THE ONLY FILE YOU NEED TO EDIT
 * ----------------------------------------------------------------------------
 * Every headline, project, statistic and link on the site is defined here.
 * Nothing below is a real-world claim: the stats are deliberately qualitative
 * ("AI Focused", "Always Learning") and the projects describe *what you build*,
 * not clients you have worked for. Replace the placeholder `#` links with real
 * URLs as they become available, and swap any copy for your own.
 * ========================================================================== */

export const profile = {
  name: "Muhammad Attiq ur Rehman",
  /** Rendered as two stacked lines in the hero: white line, then gradient line. */
  nameLines: ["Muhammad", "Attiq ur Rehman"] as const,
  initials: "MAR",
  role: "Agentic Developer",
  tagline: "I build intelligent systems that think, act, and automate.",
  eyebrow: "Building a more intelligent tomorrow",
  email: "meharateeq501@gmail.com",
  location: "Available worldwide · Remote",
};

/** Right-edge vertical micro-text. One entry per section, keyed by section id. */
export const edgeMotifs: Record<string, string[]> = {
  hero: ["Code", "Automate", "Innovate", "Repeat"],
  about: ["Same", "Curiosity", "Bigger", "Possibilities"],
  build: ["Ideas", "Agents", "Automation", "Impact"],
  agentic: ["Perceive", "Reason", "Act", "Learn"],
  work: ["Design", "Build", "Ship", "Refine"],
  stack: ["Modern", "Tools", "Solid", "Foundations"],
  impact: ["A Small", "Step Today", "A Bigger", "Tomorrow"],
  contact: ["Good Ideas", "Better Systems", "Let's", "Build"],
};

export const nav = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

/* ---------------------------------------------------------------------------
 * HERO STATS — edit freely. Keep them qualitative rather than inventing metrics.
 * ------------------------------------------------------------------------- */
export const heroStats = [
  { value: "1+", label: "Years Experience" },
  { value: "AI", label: "Focused" },
  { value: "∞", label: "Always Learning" },
];

/** Floating holographic labels wired to the 3D core in the hero scene. */
export const coreNodes = ["Ideas", "Agents", "Automation", "Real Impact"];

/* ---------------------------------------------------------------------------
 * 01 · ABOUT
 * ------------------------------------------------------------------------- */
export const about = {
  index: "01",
  eyebrow: "About Me",
  headline: ["Turning ideas into", "intelligent systems"],
  body: [
    `I'm ${profile.name}, an Agentic Developer with a year of hands-on experience building AI-powered applications, automations, and full-stack solutions.`,
    "I enjoy working with modern technologies, exploring AI agents, and creating systems that solve real-world problems — the kind that keep working long after I close the laptop.",
  ],
  pillars: [
    { title: "AI Systems", note: "Agents that reason and act", icon: "cube" },
    { title: "Full-Stack Development", note: "End-to-end product work", icon: "layers" },
    { title: "Automation", note: "Removing the repetitive", icon: "gear" },
    { title: "Continuous Learning", note: "Always one build ahead", icon: "spark" },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * 02 · WHAT I BUILD
 * ------------------------------------------------------------------------- */
export const capabilities = {
  index: "02",
  eyebrow: "What I Build",
  headline: ["From prompts", "to real solutions"],
  body: "I create AI agents, automations, and full-stack products that make work easier and smarter.",
  items: [
    {
      title: "AI Agents",
      desc: "Autonomous systems that take action.",
      long: "Goal-driven agents that plan, call tools, recover from failure, and report back — not just chat.",
      icon: "cube",
    },
    {
      title: "Automations",
      desc: "Save time, reduce manual work.",
      long: "Workflows that quietly handle the repetitive tasks a person shouldn't have to think about.",
      icon: "gear",
    },
    {
      title: "RAG Systems",
      desc: "Intelligent access to your data.",
      long: "Retrieval pipelines that ground answers in your own documents, with citations you can trust.",
      icon: "database",
    },
    {
      title: "Full-Stack Apps",
      desc: "Modern, scalable web applications.",
      long: "Typed, fast, accessible products — from data model to the last pixel of the interface.",
      icon: "layers",
    },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * 03 · AGENTIC SYSTEMS — the loop that defines the work
 * ------------------------------------------------------------------------- */
export const agentic = {
  index: "03",
  eyebrow: "Agentic Systems",
  headline: ["Systems that", "close the loop"],
  body: "An agent is only useful when it can sense a situation, decide what to do, act on it, and get better next time. That loop is what I design around.",
  steps: [
    {
      k: "01",
      title: "Perceive",
      desc: "Ingest context — documents, APIs, events, user intent — and turn it into something a model can reason over.",
    },
    {
      k: "02",
      title: "Reason",
      desc: "Plan a route to the goal, break it into steps, and pick the right tool for each one.",
    },
    {
      k: "03",
      title: "Act",
      desc: "Call real tools and APIs with guardrails, retries, and a clear audit trail of every decision.",
    },
    {
      k: "04",
      title: "Learn",
      desc: "Evaluate the outcome, feed it back into the system, and make the next run sharper than the last.",
    },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * 04 · SELECTED WORK
 * ----------------------------------------------------------------------------
 * ADD / REMOVE / REORDER PROJECTS HERE. Set `demo` and `code` to real URLs when
 * you have them — a `#` value simply hides that link on the card.
 * ------------------------------------------------------------------------- */
export type Project = {
  title: string;
  summary: string;
  tags: string[];
  demo: string;
  code: string;
  /** Optional accent, defaults to the site blue. */
  accent?: string;
};

export const work = {
  index: "04",
  eyebrow: "Selected Work",
  headline: ["Projects", "that create impact"],
  body: "A showcase of recent work. Each project is built around real use cases, modern tooling, and a bias toward automation.",
  projects: [
    {
      title: "Autonomous Research Agent",
      summary:
        "An agent that researches a topic, analyses what it finds, and produces a structured report without supervision.",
      tags: ["Python", "LLM APIs", "Automation"],
      demo: "#",
      code: "#",
    },
    {
      title: "AI Workflow Automation",
      summary:
        "Repetitive multi-step processes handed over to coordinated agents and API integrations.",
      tags: ["Next.js", "Python", "APIs"],
      demo: "#",
      code: "#",
    },
    {
      title: "Intelligent RAG Assistant",
      summary:
        "A retrieval-augmented assistant that answers questions from custom documents and cites its sources.",
      tags: ["Python", "RAG", "Vector DB"],
      demo: "#",
      code: "#",
    },
    {
      title: "Full-Stack SaaS Platform",
      summary:
        "A complete SaaS foundation — auth, billing-ready architecture, and AI-powered features throughout.",
      tags: ["Next.js", "TypeScript", "AI"],
      demo: "#",
      code: "#",
    },
  ] satisfies Project[],
} as const;

/* ---------------------------------------------------------------------------
 * 05 · TECH STACK
 * ------------------------------------------------------------------------- */
export const stack = {
  index: "05",
  eyebrow: "Tech Stack",
  headline: ["Tools I reach", "for every day"],
  body: "A focused toolkit rather than a long list — the things I actually build with.",
  groups: [
    { group: "Languages", items: ["TypeScript", "Python", "JavaScript", "SQL"] },
    { group: "Frontend", items: ["Next.js", "React", "Tailwind CSS", "Three.js", "GSAP"] },
    { group: "AI & Agents", items: ["LLM APIs", "Agent Frameworks", "RAG", "Vector Databases", "Prompt Engineering"] },
    { group: "Backend & Data", items: ["Node.js", "FastAPI", "PostgreSQL", "REST APIs"] },
    { group: "Tooling", items: ["Git", "Docker", "Vercel", "Linux"] },
  ],
  /** Scrolling marquee under the stack grid. */
  marquee: ["Agents", "Automation", "RAG", "Full-Stack", "TypeScript", "Python", "Next.js", "LLM APIs"],
} as const;

/* ---------------------------------------------------------------------------
 * 06 · IMPACT — qualitative outcomes + an honest timeline. No invented metrics.
 * ------------------------------------------------------------------------- */
export const impact = {
  index: "06",
  eyebrow: "Impact",
  headline: ["One year in", "and still exploring"],
  body: "A year of hands-on building, working with modern technologies and continuously learning new tools across the AI and development space.",
  /** Qualitative outcome statements — edit to match your own experience. */
  outcomes: [
    { title: "Less manual work", desc: "Processes that used to need a person watching them now run on their own." },
    { title: "Faster from idea to build", desc: "Reusable agent and app foundations turn a concept into something running." },
    { title: "Answers you can trace", desc: "Retrieval systems that show where every answer came from." },
  ],
  timeline: [
    { when: "2023", title: "Started Learning", desc: "Programming fundamentals and the web platform." },
    { when: "2024", title: "Real Projects", desc: "Shipping full-stack applications end to end." },
    { when: "Now", title: "Building AI Systems", desc: "Agents, automations, and retrieval pipelines." },
    { when: "Next", title: "Greater Impact", desc: "Bigger systems, deeper autonomy, sharper craft." },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * 07 · CONTACT
 * ------------------------------------------------------------------------- */
export const contact = {
  index: "07",
  eyebrow: "Let's Connect",
  headline: ["Let's build something", "intelligent together."],
  body: "Have an idea, a project, or a workflow that should be automated? I'd love to hear about it.",
  /** Set any href to "" to hide that social link. */
  socials: [
    { label: "GitHub", href: "", icon: "github" },
    { label: "LinkedIn", href: "", icon: "linkedin" },
    { label: "X", href: "", icon: "x" },
    { label: "YouTube", href: "", icon: "youtube" },
  ],
} as const;

import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/config/site";

/* Display face carries the huge headlines; Inter handles body copy; the mono
   is reserved for the letterspaced eyebrow/label motif. */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const description = `${profile.role} — ${profile.tagline}`;

export const metadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description,
  keywords: [
    "Agentic Developer",
    "AI Agents",
    "Automation",
    "RAG",
    "Full-Stack Developer",
    "Next.js",
    "TypeScript",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description,
    type: "website",
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image", title: profile.name, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#03050b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Never block zoom — the type is large but users still need to pinch.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="grain relative bg-ink-950 text-text antialiased">{children}</body>
    </html>
  );
}

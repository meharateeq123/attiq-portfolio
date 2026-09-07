import type { NextConfig } from "next";

// GitHub Pages serves this repo at /attiq-portfolio/ rather than the domain
// root, so every asset and internal link needs that prefix baked in at build
// time — there is no server here to rewrite it at request time. Left off
// locally (npm run dev) so nothing on the dev server needs the prefix too.
const repoBase = process.env.GITHUB_PAGES ? "/attiq-portfolio" : "";

const nextConfig: NextConfig = {
  // No Node server on GitHub Pages: ship plain HTML/CSS/JS instead of relying
  // on the default server runtime.
  output: "export",
  basePath: repoBase,
  assetPrefix: repoBase,
  images: {
    // next/image's optimizer is a server feature; unused here anyway, but this
    // keeps a static export from failing if one is ever added.
    unoptimized: true,
  },
};

export default nextConfig;

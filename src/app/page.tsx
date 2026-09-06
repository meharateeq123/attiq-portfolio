import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Scene } from "@/components/three/SceneBoundary";

import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WhatIBuild } from "@/components/sections/WhatIBuild";
import { AgenticSystems } from "@/components/sections/AgenticSystems";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { TechStack } from "@/components/sections/TechStack";
import { Impact } from "@/components/sections/Impact";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <SmoothScroll>
      {/* Fixed WebGL environment behind every section */}
      <Scene />

      <Nav />

      <main id="main">
        <Hero />
        <About />
        <WhatIBuild />
        <AgenticSystems />
        <SelectedWork />
        <TechStack />
        <Impact />
        <Contact />
      </main>

      <Footer />
    </SmoothScroll>
  );
}

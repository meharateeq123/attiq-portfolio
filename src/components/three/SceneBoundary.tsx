"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";

/**
 * The 3D layer is decorative, so a WebGL failure must never take the page with
 * it. This catches context-creation errors (older devices, disabled hardware
 * acceleration, exhausted GPU memory) and falls back to the CSS ambience.
 */
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[scene] WebGL layer disabled:", error);
  }

  render() {
    if (this.state.failed) return <div className="scene-fallback" aria-hidden />;
    return this.props.children;
  }
}

// ssr:false — the scene measures the device before it builds anything, so
// there is nothing meaningful to render on the server.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => <div className="scene-fallback" aria-hidden />,
});

export function Scene() {
  return (
    <Boundary>
      <SceneCanvas />
    </Boundary>
  );
}

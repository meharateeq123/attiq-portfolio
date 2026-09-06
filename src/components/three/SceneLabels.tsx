"use client";

import { coreNodes } from "@/config/site";
import { labelRegistry, coreLabel } from "@/lib/scene-state";

/**
 * The holographic concept labels from the hero. They render as ordinary DOM
 * above the WebGL layer; NodeNetwork projects each tethered node to screen
 * space every frame and writes the transform straight onto these elements.
 */
export function SceneLabels() {
  return (
    <div className="scene-labels" aria-hidden>
      {/* The mark on the core itself */}
      <div
        ref={(el) => {
          coreLabel.el = el;
        }}
        className="core-mark"
      >
        AI
      </div>

      {coreNodes.map((label, i) => (
        <div
          key={label}
          ref={(el) => {
            labelRegistry[i] = el;
          }}
          className="node-chip"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

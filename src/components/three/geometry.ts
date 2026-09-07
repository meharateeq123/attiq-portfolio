import * as THREE from "three";

/**
 * Chamfered-block geometry helpers.
 *
 * Everything solid in this scene is an extruded rounded rectangle with a bevel
 * rather than a plain box. The bevel is what actually sells the volume: it
 * catches a thin specular line along every edge, so a block reads as milled
 * metal instead of a flat card standing on end. A `boxGeometry` has nothing for
 * a light to graze, which is why the old wireframe scene never looked solid.
 */

/** Rounded rectangle in the XY plane, centred on the origin. */
export function roundedRect(w: number, h: number, r: number) {
  const rr = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001));
  const x = w / 2 - rr;
  const y = h / 2 - rr;
  const s = new THREE.Shape();
  s.moveTo(-x, -y - rr);
  s.lineTo(x, -y - rr);
  s.absarc(x, -y, rr, -Math.PI / 2, 0, false);
  s.lineTo(x + rr, y);
  s.absarc(x, y, rr, 0, Math.PI / 2, false);
  s.lineTo(-x, y + rr);
  s.absarc(-x, y, rr, Math.PI / 2, Math.PI, false);
  s.lineTo(-x - rr, -y);
  s.absarc(-x, -y, rr, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Extrude a shape along +Z with a bevel on both caps, centred on its origin. */
export function extrudeRounded(shape: THREE.Shape, depth: number, bevel: number) {
  const b = Math.max(0.002, Math.min(bevel, depth / 2 - 0.002));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - b * 2,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b,
    bevelSegments: 2,
    curveSegments: 8,
  });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** Slab lying flat in the XZ plane: `w` across X, `d` across Z, `h` tall. */
export function roundedSlab(w: number, d: number, h: number, r: number, bevel = 0.016) {
  const g = extrudeRounded(roundedRect(w, d, r), h, bevel);
  g.rotateX(-Math.PI / 2);
  g.center();
  return g;
}

/** Upright panel in the XY plane: `w` across X, `h` tall, `t` thick in Z. */
export function roundedPanel(w: number, h: number, t: number, r: number, bevel = 0.012) {
  return extrudeRounded(roundedRect(w, h, r), t, bevel);
}

/** Flat rounded face in the XZ plane, for inlays sitting just above a surface. */
export function roundedFace(w: number, d: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, d, r), 8);
  g.rotateX(-Math.PI / 2);
  return g;
}

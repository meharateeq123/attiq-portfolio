import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The WebGL layer is built on react-three-fiber, whose entire model is
    // mutating retained GPU objects (materials, geometries, transforms) inside
    // the render loop. The React Compiler rules assume values captured by a
    // hook are immutable, which is exactly the opposite of how a useFrame
    // callback is meant to work — reallocating a material each frame instead of
    // writing to its uniforms would tank performance and thrash the GPU.
    // Scoped to this directory only; the rest of the app keeps the rules on.
    files: ["src/components/three/**/*.tsx", "src/components/three/**/*.ts"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;

import { defineConfig } from "tsup";

export default defineConfig([
  // Browser-safe entry point
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    dts: true,
    clean: true,
    banner: {
      js: '"use client";',
    },
    external: ["react", "react-dom"],
  },
  // Node.js-specific entry point (for testing environments)
  {
    entry: ["src/node.ts"],
    format: ["esm"],
    dts: true,
    clean: false, // Don't clean since index.ts already did
    external: ["react", "react-dom", "fs/promises", "path", "uilint-core"],
  },
]);

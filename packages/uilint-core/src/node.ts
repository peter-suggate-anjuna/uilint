/**
 * UILint Core - Node.js-specific exports
 * 
 * This entry point includes Node.js-only features like JSDOM parsing
 * and filesystem operations.
 */

// Re-export everything from main entry
export * from "./index.js";

// Node.js-specific: HTML parser with JSDOM
export {
  parseHTML,
  parseCLIInput,
  isJSON,
  readStdin,
  hasStdin,
} from "./scanner/html-parser.js";

// Node.js-specific: Filesystem operations
export {
  findStyleGuidePath,
  readStyleGuide,
  readStyleGuideFromProject,
  writeStyleGuide,
  getDefaultStyleGuidePath,
  styleGuideExists,
} from "./styleguide/reader.js";


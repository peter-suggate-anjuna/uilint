// Main component
export { UILint } from "./components/UILint";
export type { UILintProps } from "./components/UILint";

// Re-export core types for convenience
export type {
  UILintIssue,
  StyleGuide,
  ExtractedStyles,
  SerializedStyles,
  DOMSnapshot,
  AnalysisResult,
} from "uilint-core";

// Scanner utilities (browser-specific)
export { scanDOM } from "./scanner/dom-scanner";
export { isBrowser, isJSDOM, isNode } from "./scanner/environment";

// Note: JSDOMAdapter and runUILintInTest are available from "uilint-react/node"
// for Node.js/test environments only

// Re-export scanner utilities directly from core
export {
  extractStylesFromDOM,
  serializeStyles,
  createStyleSummary,
} from "uilint-core";

// LLM client for browser
export { LLMClient } from "./analyzer/llm-client";

// Styleguide utilities - re-export directly from core
export { parseStyleGuide } from "uilint-core";
export { generateStyleGuideFromStyles as generateStyleGuide } from "uilint-core";
export { createEmptyStyleGuide, mergeStyleGuides } from "uilint-core";

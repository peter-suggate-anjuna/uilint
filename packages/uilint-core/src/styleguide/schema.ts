/**
 * Style guide schema and utilities
 */

import type { StyleGuide, ColorRule, TypographyRule, SpacingRule, ComponentRule } from "../types.js";

/**
 * Creates an empty style guide structure
 */
export function createEmptyStyleGuide(): StyleGuide {
  return {
    colors: [],
    typography: [],
    spacing: [],
    components: [],
  };
}

/**
 * Validates a style guide object
 */
export function validateStyleGuide(guide: unknown): guide is StyleGuide {
  if (!guide || typeof guide !== "object") return false;

  const g = guide as Record<string, unknown>;

  return (
    Array.isArray(g.colors) &&
    Array.isArray(g.typography) &&
    Array.isArray(g.spacing) &&
    Array.isArray(g.components)
  );
}

/**
 * Merges detected styles into an existing style guide
 */
export function mergeStyleGuides(
  existing: StyleGuide,
  detected: Partial<StyleGuide>
): StyleGuide {
  return {
    colors: mergeColorRules(existing.colors, detected.colors || []),
    typography: mergeTypographyRules(existing.typography, detected.typography || []),
    spacing: mergeSpacingRules(existing.spacing, detected.spacing || []),
    components: mergeComponentRules(existing.components, detected.components || []),
  };
}

function mergeColorRules(existing: ColorRule[], detected: ColorRule[]): ColorRule[] {
  const merged = [...existing];
  detected.forEach((rule) => {
    const existingIndex = merged.findIndex(
      (e) => e.name === rule.name || e.value === rule.value
    );
    if (existingIndex === -1) {
      merged.push(rule);
    }
  });
  return merged;
}

function mergeTypographyRules(existing: TypographyRule[], detected: TypographyRule[]): TypographyRule[] {
  const merged = [...existing];
  detected.forEach((rule) => {
    const existingIndex = merged.findIndex((e) => e.element === rule.element);
    if (existingIndex === -1) {
      merged.push(rule);
    }
  });
  return merged;
}

function mergeSpacingRules(existing: SpacingRule[], detected: SpacingRule[]): SpacingRule[] {
  const merged = [...existing];
  detected.forEach((rule) => {
    const existingIndex = merged.findIndex(
      (e) => e.name === rule.name || e.value === rule.value
    );
    if (existingIndex === -1) {
      merged.push(rule);
    }
  });
  return merged;
}

function mergeComponentRules(existing: ComponentRule[], detected: ComponentRule[]): ComponentRule[] {
  const merged = [...existing];
  detected.forEach((rule) => {
    const existingIndex = merged.findIndex((e) => e.name === rule.name);
    if (existingIndex === -1) {
      merged.push(rule);
    }
  });
  return merged;
}

/**
 * Creates a color rule
 */
export function createColorRule(
  name: string,
  value: string,
  usage: string = ""
): ColorRule {
  return { name, value: value.toUpperCase(), usage };
}

/**
 * Creates a typography rule
 */
export function createTypographyRule(
  element: string,
  options: Partial<Omit<TypographyRule, "element">> = {}
): TypographyRule {
  return { element, ...options };
}

/**
 * Creates a spacing rule
 */
export function createSpacingRule(name: string, value: string): SpacingRule {
  return { name, value };
}

/**
 * Creates a component rule
 */
export function createComponentRule(name: string, styles: string[]): ComponentRule {
  return { name, styles };
}


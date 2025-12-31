import type { StyleGuide, ColorRule, TypographyRule, SpacingRule, ComponentRule } from '../types';

/**
 * Default empty style guide structure
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
  if (!guide || typeof guide !== 'object') return false;
  
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
export function mergeStyleGuides(existing: StyleGuide, detected: Partial<StyleGuide>): StyleGuide {
  return {
    colors: mergeRules(existing.colors, detected.colors || []),
    typography: mergeRules(existing.typography, detected.typography || []),
    spacing: mergeRules(existing.spacing, detected.spacing || []),
    components: mergeRules(existing.components, detected.components || []),
  };
}

function mergeRules<T extends { name?: string; value?: string }>(
  existing: T[],
  detected: T[]
): T[] {
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


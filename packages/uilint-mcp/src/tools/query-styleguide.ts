/**
 * Query style guide for specific rules
 * Uses uilint-core for parsing and optionally LLM for complex queries
 */

import { parseStyleGuide, extractStyleValues, OllamaClient } from "uilint-core";

/**
 * Queries the style guide and returns relevant information
 */
export async function queryStyleGuide(
  query: string,
  styleGuide: string | null
): Promise<string> {
  if (!styleGuide) {
    return "No style guide found. Create a .uilint/styleguide.md file to define your design system.";
  }

  // Try to answer simple queries without LLM
  const simpleAnswer = getSimpleAnswer(query, styleGuide);
  if (simpleAnswer) {
    return simpleAnswer;
  }

  // Use LLM for complex queries
  try {
    const client = new OllamaClient();
    const available = await client.isAvailable();
    
    if (!available) {
      return getFallbackAnswer(query, styleGuide);
    }

    return await client.queryStyleGuide(query, styleGuide);
  } catch {
    return getFallbackAnswer(query, styleGuide);
  }
}

/**
 * Attempts to answer simple queries without LLM
 */
function getSimpleAnswer(query: string, styleGuide: string): string | null {
  const lowerQuery = query.toLowerCase();
  const values = extractStyleValues(styleGuide);
  const parsed = parseStyleGuide(styleGuide);

  // Colors query
  if (lowerQuery.includes("color")) {
    if (parsed.colors.length > 0) {
      const colors = parsed.colors
        .map((c) => `  ${c.name}: ${c.value}${c.usage ? ` (${c.usage})` : ""}`)
        .join("\n");
      return `Colors in the style guide:\n${colors}`;
    }
    if (values.colors.length > 0) {
      return `Colors found: ${values.colors.join(", ")}`;
    }
    return "No colors defined in the style guide.";
  }

  // Font query
  if (lowerQuery.includes("font") && !lowerQuery.includes("size")) {
    if (values.fontFamilies.length > 0) {
      return `Font families: ${values.fontFamilies.join(", ")}`;
    }
    return "No font families defined in the style guide.";
  }

  // Font size query
  if (lowerQuery.includes("font size") || lowerQuery.includes("fontsize")) {
    if (values.fontSizes.length > 0) {
      return `Font sizes: ${values.fontSizes.join(", ")}`;
    }
    return "No font sizes defined in the style guide.";
  }

  // Spacing query
  if (
    lowerQuery.includes("spacing") ||
    lowerQuery.includes("padding") ||
    lowerQuery.includes("margin")
  ) {
    if (parsed.spacing.length > 0) {
      const spacing = parsed.spacing
        .map((s) => `  ${s.name}: ${s.value}`)
        .join("\n");
      return `Spacing values:\n${spacing}`;
    }
    return "No spacing values defined in the style guide.";
  }

  // Component query
  if (
    lowerQuery.includes("component") ||
    lowerQuery.includes("button") ||
    lowerQuery.includes("card")
  ) {
    if (parsed.components.length > 0) {
      const components = parsed.components
        .map((c) => `  ${c.name}: ${c.styles.join(", ")}`)
        .join("\n");
      return `Component styles:\n${components}`;
    }
    return "No component styles defined in the style guide.";
  }

  // Can't answer simply, need LLM
  return null;
}

/**
 * Returns a fallback answer when LLM is not available
 */
function getFallbackAnswer(query: string, styleGuide: string): string {
  const values = extractStyleValues(styleGuide);
  
  return `Style Guide Summary:
- Colors: ${values.colors.length > 0 ? values.colors.slice(0, 5).join(", ") : "None defined"}
- Font Sizes: ${values.fontSizes.length > 0 ? values.fontSizes.join(", ") : "None defined"}
- Font Families: ${values.fontFamilies.length > 0 ? values.fontFamilies.join(", ") : "None defined"}

For more specific queries, please ensure Ollama is running on localhost:11434.`;
}

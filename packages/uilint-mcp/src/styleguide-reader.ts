import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const STYLEGUIDE_PATHS = [
  '.uilint/styleguide.md',
  'styleguide.md',
  '.uilint/style-guide.md',
];

/**
 * Finds the style guide file in a project
 */
export function findStyleGuidePath(projectPath: string): string | null {
  for (const relativePath of STYLEGUIDE_PATHS) {
    const fullPath = join(projectPath, relativePath);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Reads the style guide content
 */
export async function readStyleGuide(path: string): Promise<string> {
  return readFile(path, 'utf-8');
}

/**
 * Parses sections from a Markdown style guide
 */
export function parseStyleGuideSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split('\n');

  let currentSection = 'intro';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
      }
      
      currentSection = headerMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection.toLowerCase()] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Extracts specific values from the style guide
 */
export function extractStyleValues(content: string): {
  colors: string[];
  fontSizes: string[];
  fontFamilies: string[];
  spacing: string[];
  borderRadius: string[];
} {
  const result = {
    colors: [] as string[],
    fontSizes: [] as string[],
    fontFamilies: [] as string[],
    spacing: [] as string[],
    borderRadius: [] as string[],
  };

  // Extract hex colors
  const colorMatches = content.matchAll(/#[A-Fa-f0-9]{6}\b/g);
  for (const match of colorMatches) {
    if (!result.colors.includes(match[0].toUpperCase())) {
      result.colors.push(match[0].toUpperCase());
    }
  }

  // Extract font sizes (e.g., 16px, 1.5rem)
  const fontSizeMatches = content.matchAll(/\b(\d+(?:\.\d+)?(?:px|rem|em))\b/g);
  for (const match of fontSizeMatches) {
    if (!result.fontSizes.includes(match[1])) {
      result.fontSizes.push(match[1]);
    }
  }

  // Extract font families (quoted strings in font context)
  const fontFamilyMatches = content.matchAll(/font-family:\s*["']?([^"',\n]+)/gi);
  for (const match of fontFamilyMatches) {
    const family = match[1].trim();
    if (!result.fontFamilies.includes(family)) {
      result.fontFamilies.push(family);
    }
  }

  return result;
}


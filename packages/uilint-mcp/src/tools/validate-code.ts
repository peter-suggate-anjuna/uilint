import { extractStyleValues, parseStyleGuideSections } from '../styleguide-reader.js';

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  line?: number;
  suggestion?: string;
}

/**
 * Validates code against the style guide
 */
export async function validateCode(
  code: string,
  styleGuide: string | null
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  if (!styleGuide) {
    return {
      valid: true,
      issues: [
        {
          type: 'warning',
          message: 'No style guide found. Create .uilint/styleguide.md to enable validation.',
        },
      ],
    };
  }

  const styleValues = extractStyleValues(styleGuide);

  // Check for color violations
  const codeColors = extractColorsFromCode(code);
  for (const color of codeColors) {
    if (!styleValues.colors.includes(color.toUpperCase())) {
      // Check if it's similar to an allowed color
      const similar = findSimilarColor(color, styleValues.colors);
      issues.push({
        type: 'warning',
        message: `Color ${color} is not in the style guide`,
        suggestion: similar
          ? `Consider using ${similar} instead`
          : `Add ${color} to the style guide if intentional`,
      });
    }
  }

  // Check for hardcoded pixel values (potential spacing violations)
  const hardcodedPixels = code.matchAll(/(?:margin|padding|gap)[-:].*?(\d+)px/gi);
  for (const match of hardcodedPixels) {
    const value = parseInt(match[1]);
    // Check if it follows a 4px grid
    if (value % 4 !== 0) {
      issues.push({
        type: 'warning',
        message: `Spacing value ${value}px doesn't follow the 4px grid`,
        suggestion: `Use ${Math.round(value / 4) * 4}px instead`,
      });
    }
  }

  // Check for inline styles (often a code smell)
  if (code.includes('style={{') || code.includes('style={')) {
    const inlineStyleCount = (code.match(/style=\{/g) || []).length;
    if (inlineStyleCount > 2) {
      issues.push({
        type: 'warning',
        message: `Found ${inlineStyleCount} inline styles. Consider using CSS classes for consistency.`,
      });
    }
  }

  return {
    valid: issues.filter((i) => i.type === 'error').length === 0,
    issues,
  };
}

function extractColorsFromCode(code: string): string[] {
  const colors: string[] = [];
  
  // Match hex colors
  const hexMatches = code.matchAll(/#[A-Fa-f0-9]{6}\b/g);
  for (const match of hexMatches) {
    colors.push(match[0].toUpperCase());
  }

  // Match Tailwind color classes
  const tailwindMatches = code.matchAll(/(?:bg|text|border)-(\w+)-(\d+)/g);
  for (const match of tailwindMatches) {
    // Convert Tailwind colors to a normalized form
    colors.push(`tailwind:${match[1]}-${match[2]}`);
  }

  return [...new Set(colors)];
}

function findSimilarColor(color: string, allowedColors: string[]): string | null {
  // Simple hex color distance check
  const colorRgb = hexToRgb(color);
  if (!colorRgb) return null;

  let closest: string | null = null;
  let closestDistance = Infinity;

  for (const allowed of allowedColors) {
    const allowedRgb = hexToRgb(allowed);
    if (!allowedRgb) continue;

    const distance = Math.sqrt(
      Math.pow(colorRgb.r - allowedRgb.r, 2) +
      Math.pow(colorRgb.g - allowedRgb.g, 2) +
      Math.pow(colorRgb.b - allowedRgb.b, 2)
    );

    if (distance < closestDistance && distance < 50) {
      closestDistance = distance;
      closest = allowed;
    }
  }

  return closest;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}


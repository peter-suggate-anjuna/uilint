import { extractStyleValues } from '../styleguide-reader.js';

export interface LintResult {
  issues: LintIssue[];
  summary: string;
}

export interface LintIssue {
  severity: 'error' | 'warning' | 'info';
  type: 'color' | 'spacing' | 'typography' | 'component' | 'accessibility';
  message: string;
  line?: number;
  code?: string;
  suggestion?: string;
}

/**
 * Lints a code snippet against the style guide
 */
export async function lintSnippet(
  code: string,
  styleGuide: string | null
): Promise<LintResult> {
  const issues: LintIssue[] = [];

  // Basic linting even without style guide
  issues.push(...lintBasicPatterns(code));

  // Style guide-based linting
  if (styleGuide) {
    issues.push(...lintAgainstStyleGuide(code, styleGuide));
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return {
    issues,
    summary:
      issues.length === 0
        ? 'No issues found'
        : `Found ${errorCount} errors and ${warningCount} warnings`,
  };
}

function lintBasicPatterns(code: string): LintIssue[] {
  const issues: LintIssue[] = [];

  // Check for magic numbers in styling
  const magicNumbers = code.matchAll(/(?:width|height|size):\s*(\d+)(?!px|rem|em|%)/g);
  for (const match of magicNumbers) {
    issues.push({
      severity: 'warning',
      type: 'spacing',
      message: `Magic number ${match[1]} found without unit`,
      code: match[0],
      suggestion: `Add a unit like ${match[1]}px or use a design token`,
    });
  }

  // Check for hardcoded colors in className strings
  const hardcodedTailwindColors = code.matchAll(
    /className=["'][^"']*(?:bg|text|border)-\[#[A-Fa-f0-9]+\][^"']*/g
  );
  for (const match of hardcodedTailwindColors) {
    issues.push({
      severity: 'warning',
      type: 'color',
      message: 'Hardcoded color in Tailwind arbitrary value',
      code: match[0],
      suggestion: 'Use a color from your Tailwind config or style guide',
    });
  }

  // Check for accessibility issues
  if (code.includes('<img') && !code.includes('alt=')) {
    issues.push({
      severity: 'error',
      type: 'accessibility',
      message: 'Image without alt attribute',
      suggestion: 'Add alt="" for decorative images or descriptive alt text',
    });
  }

  if (code.includes('<button') && !code.match(/<button[^>]*>.*\S.*<\/button>/s)) {
    issues.push({
      severity: 'warning',
      type: 'accessibility',
      message: 'Button may be missing accessible text',
      suggestion: 'Ensure button has visible text or aria-label',
    });
  }

  // Check for inconsistent quote styles
  const singleQuotes = (code.match(/className='/g) || []).length;
  const doubleQuotes = (code.match(/className="/g) || []).length;
  if (singleQuotes > 0 && doubleQuotes > 0) {
    issues.push({
      severity: 'info',
      type: 'component',
      message: 'Mixed quote styles in className attributes',
      suggestion: 'Use consistent quote style throughout',
    });
  }

  return issues;
}

function lintAgainstStyleGuide(code: string, styleGuide: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const values = extractStyleValues(styleGuide);

  // Check colors
  const codeColors = code.matchAll(/#[A-Fa-f0-9]{6}\b/g);
  for (const match of codeColors) {
    const color = match[0].toUpperCase();
    if (!values.colors.includes(color)) {
      issues.push({
        severity: 'warning',
        type: 'color',
        message: `Color ${color} not in style guide`,
        code: match[0],
        suggestion: `Allowed colors: ${values.colors.slice(0, 5).join(', ')}${values.colors.length > 5 ? '...' : ''}`,
      });
    }
  }

  // Check for non-standard spacing (not on 4px grid)
  const spacingValues = code.matchAll(/(?:p|m|gap)-(\d+)/g);
  for (const match of spacingValues) {
    const value = parseInt(match[1]);
    // Tailwind uses 4px base (1 = 4px, 2 = 8px, etc.)
    // Non-standard would be values like 5, 7, 9, etc. in the 1-12 range
    if (value > 12 && value % 4 !== 0) {
      issues.push({
        severity: 'info',
        type: 'spacing',
        message: `Spacing value ${match[0]} might not align with design system`,
        suggestion: 'Consider using standard Tailwind spacing values (1-12, 16, 20, 24...)',
      });
    }
  }

  return issues;
}


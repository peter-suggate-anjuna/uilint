import type { DOMSnapshot, ExtractedStyles } from '../types';
import { extractStyles, serializeStyles } from './style-extractor';

/**
 * Scans the DOM and extracts a snapshot of all styles
 */
export function scanDOM(root?: Element | Document): DOMSnapshot {
  const targetRoot = root || document.body;

  const styles = extractStyles(targetRoot);
  const html = targetRoot instanceof Element ? targetRoot.outerHTML : targetRoot.body?.outerHTML || '';

  return {
    html: truncateHTML(html, 50000), // Limit HTML size for LLM context
    styles,
    elementCount: targetRoot.querySelectorAll('*').length,
    timestamp: Date.now(),
  };
}

/**
 * Truncates HTML to a maximum length while trying to keep it valid
 */
function truncateHTML(html: string, maxLength: number): string {
  if (html.length <= maxLength) return html;

  // Simple truncation - in production, you'd want smarter truncation
  return html.slice(0, maxLength) + '<!-- truncated -->';
}

/**
 * Creates a summary of extracted styles for LLM analysis
 */
export function createStyleSummary(styles: ExtractedStyles): string {
  const lines: string[] = [];

  lines.push('## Detected Styles Summary\n');

  // Colors
  lines.push('### Colors');
  const sortedColors = [...styles.colors.entries()].sort((a, b) => b[1] - a[1]);
  sortedColors.slice(0, 20).forEach(([color, count]) => {
    lines.push(`- ${color}: ${count} occurrences`);
  });
  lines.push('');

  // Font sizes
  lines.push('### Font Sizes');
  const sortedFontSizes = [...styles.fontSizes.entries()].sort((a, b) => b[1] - a[1]);
  sortedFontSizes.forEach(([size, count]) => {
    lines.push(`- ${size}: ${count} occurrences`);
  });
  lines.push('');

  // Font families
  lines.push('### Font Families');
  const sortedFontFamilies = [...styles.fontFamilies.entries()].sort((a, b) => b[1] - a[1]);
  sortedFontFamilies.forEach(([family, count]) => {
    lines.push(`- ${family}: ${count} occurrences`);
  });
  lines.push('');

  // Font weights
  lines.push('### Font Weights');
  const sortedFontWeights = [...styles.fontWeights.entries()].sort((a, b) => b[1] - a[1]);
  sortedFontWeights.forEach(([weight, count]) => {
    lines.push(`- ${weight}: ${count} occurrences`);
  });
  lines.push('');

  // Spacing
  lines.push('### Spacing Values');
  const sortedSpacing = [...styles.spacing.entries()].sort((a, b) => b[1] - a[1]);
  sortedSpacing.slice(0, 15).forEach(([value, count]) => {
    lines.push(`- ${value}: ${count} occurrences`);
  });
  lines.push('');

  // Border radius
  lines.push('### Border Radius');
  const sortedBorderRadius = [...styles.borderRadius.entries()].sort((a, b) => b[1] - a[1]);
  sortedBorderRadius.forEach(([value, count]) => {
    lines.push(`- ${value}: ${count} occurrences`);
  });

  return lines.join('\n');
}

export { serializeStyles };


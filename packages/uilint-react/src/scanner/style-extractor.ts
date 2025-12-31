import type { ExtractedStyles } from '../types';

/**
 * Extracts all computed styles from elements in the document
 */
export function extractStyles(root: Element | Document): ExtractedStyles {
  const styles: ExtractedStyles = {
    colors: new Map(),
    fontSizes: new Map(),
    fontFamilies: new Map(),
    fontWeights: new Map(),
    spacing: new Map(),
    borderRadius: new Map(),
  };

  const elements = root.querySelectorAll('*');

  elements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;

    const computed = window.getComputedStyle(element);

    // Extract colors
    extractColor(computed.color, styles.colors);
    extractColor(computed.backgroundColor, styles.colors);
    extractColor(computed.borderColor, styles.colors);

    // Extract typography
    incrementMap(styles.fontSizes, computed.fontSize);
    incrementMap(styles.fontFamilies, normalizeFontFamily(computed.fontFamily));
    incrementMap(styles.fontWeights, computed.fontWeight);

    // Extract spacing
    extractSpacing(computed.margin, styles.spacing);
    extractSpacing(computed.padding, styles.spacing);
    incrementMap(styles.spacing, computed.gap);

    // Extract border radius
    incrementMap(styles.borderRadius, computed.borderRadius);
  });

  return styles;
}

function extractColor(color: string, map: Map<string, number>): void {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return;
  
  // Normalize to hex
  const hex = rgbToHex(color);
  if (hex) {
    incrementMap(map, hex);
  }
}

function extractSpacing(value: string, map: Map<string, number>): void {
  if (!value || value === '0px') return;
  
  // Split compound values (e.g., "10px 20px 10px 20px")
  const values = value.split(' ').filter((v) => v && v !== '0px');
  values.forEach((v) => incrementMap(map, v));
}

function incrementMap(map: Map<string, number>, value: string): void {
  if (!value || value === 'normal' || value === 'auto') return;
  map.set(value, (map.get(value) || 0) + 1);
}

function normalizeFontFamily(fontFamily: string): string {
  // Get the primary font (first in the stack)
  const primary = fontFamily.split(',')[0].trim();
  return primary.replace(/['"]/g, '');
}

function rgbToHex(rgb: string): string | null {
  // Handle hex values
  if (rgb.startsWith('#')) return rgb.toUpperCase();

  // Handle rgb/rgba values
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;

  const [, r, g, b] = match;
  const toHex = (n: string) => parseInt(n).toString(16).padStart(2, '0');
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Converts ExtractedStyles maps to plain objects for serialization
 */
export function serializeStyles(styles: ExtractedStyles): Record<string, Record<string, number>> {
  return {
    colors: Object.fromEntries(styles.colors),
    fontSizes: Object.fromEntries(styles.fontSizes),
    fontFamilies: Object.fromEntries(styles.fontFamilies),
    fontWeights: Object.fromEntries(styles.fontWeights),
    spacing: Object.fromEntries(styles.spacing),
    borderRadius: Object.fromEntries(styles.borderRadius),
  };
}


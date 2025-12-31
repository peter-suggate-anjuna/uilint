import { parseStyleGuideSections, extractStyleValues } from '../styleguide-reader.js';

/**
 * Answers queries about the style guide
 */
export async function queryStyleGuide(
  query: string,
  styleGuide: string | null
): Promise<string> {
  if (!styleGuide) {
    return 'No style guide found. Create .uilint/styleguide.md to define your design system.';
  }

  const lowerQuery = query.toLowerCase();
  const sections = parseStyleGuideSections(styleGuide);
  const values = extractStyleValues(styleGuide);

  // Color queries
  if (lowerQuery.includes('color')) {
    if (values.colors.length > 0) {
      return `Allowed colors:\n${values.colors.map((c) => `- ${c}`).join('\n')}\n\nFrom style guide:\n${sections['colors'] || 'No colors section found.'}`;
    }
    return sections['colors'] || 'No colors defined in style guide.';
  }

  // Font/Typography queries
  if (lowerQuery.includes('font') || lowerQuery.includes('typography')) {
    const response: string[] = [];
    
    if (values.fontFamilies.length > 0) {
      response.push(`Font families: ${values.fontFamilies.join(', ')}`);
    }
    
    if (values.fontSizes.length > 0) {
      response.push(`Font sizes: ${values.fontSizes.join(', ')}`);
    }
    
    if (sections['typography']) {
      response.push(`\nFrom style guide:\n${sections['typography']}`);
    }
    
    return response.length > 0 ? response.join('\n') : 'No typography defined in style guide.';
  }

  // Spacing queries
  if (lowerQuery.includes('spacing') || lowerQuery.includes('margin') || lowerQuery.includes('padding')) {
    return sections['spacing'] || 'No spacing defined in style guide. Common practice: use a 4px or 8px base unit.';
  }

  // Border radius queries
  if (lowerQuery.includes('border') || lowerQuery.includes('radius') || lowerQuery.includes('rounded')) {
    return sections['border radius'] || sections['components'] || 'No border radius defined in style guide.';
  }

  // Component queries
  if (lowerQuery.includes('component') || lowerQuery.includes('button') || lowerQuery.includes('card')) {
    return sections['components'] || 'No component patterns defined in style guide.';
  }

  // General/full style guide request
  if (lowerQuery.includes('all') || lowerQuery.includes('full') || lowerQuery.includes('everything')) {
    return styleGuide;
  }

  // Default: return the most relevant section or full guide
  return `Here's the style guide:\n\n${styleGuide}\n\nFor specific questions, try asking about colors, fonts, spacing, or components.`;
}


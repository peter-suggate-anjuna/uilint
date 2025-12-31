import type { StyleGuide, ColorRule, TypographyRule, SpacingRule, ComponentRule } from '../types';
import { createEmptyStyleGuide } from './schema';

/**
 * Parses a Markdown style guide into a structured object
 */
export function parseStyleGuide(markdown: string): StyleGuide {
  const guide = createEmptyStyleGuide();
  
  const sections = splitIntoSections(markdown);
  
  sections.forEach(({ title, content }) => {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('color')) {
      guide.colors = parseColorSection(content);
    } else if (lowerTitle.includes('typography') || lowerTitle.includes('font')) {
      guide.typography = parseTypographySection(content);
    } else if (lowerTitle.includes('spacing')) {
      guide.spacing = parseSpacingSection(content);
    } else if (lowerTitle.includes('component')) {
      guide.components = parseComponentSection(content);
    }
  });
  
  return guide;
}

interface Section {
  title: string;
  content: string;
}

function splitIntoSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split('\n');
  
  let currentTitle = '';
  let currentContent: string[] = [];
  
  lines.forEach((line) => {
    const headerMatch = line.match(/^##\s+(.+)$/);
    
    if (headerMatch) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n'),
        });
      }
      currentTitle = headerMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  });
  
  if (currentTitle) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n'),
    });
  }
  
  return sections;
}

function parseColorSection(content: string): ColorRule[] {
  const colors: ColorRule[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    // Match patterns like: - **Primary**: #3B82F6 (used in buttons)
    const match = line.match(/[-*]\s*\*?\*?([^*:]+)\*?\*?:\s*(#[A-Fa-f0-9]{6})\s*(?:\(([^)]+)\))?/);
    
    if (match) {
      colors.push({
        name: match[1].trim(),
        value: match[2].toUpperCase(),
        usage: match[3] || '',
      });
    }
  });
  
  return colors;
}

function parseTypographySection(content: string): TypographyRule[] {
  const typography: TypographyRule[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    // Match patterns like: - **Headings**: font-family: "Inter", font-size: 24px
    const elementMatch = line.match(/[-*]\s*\*?\*?([^*:]+)\*?\*?:\s*(.+)/);
    
    if (elementMatch) {
      const rule: TypographyRule = {
        element: elementMatch[1].trim(),
      };
      
      const props = elementMatch[2];
      
      const fontFamilyMatch = props.match(/font-family:\s*"?([^",]+)"?/);
      if (fontFamilyMatch) rule.fontFamily = fontFamilyMatch[1].trim();
      
      const fontSizeMatch = props.match(/font-size:\s*(\d+px)/);
      if (fontSizeMatch) rule.fontSize = fontSizeMatch[1];
      
      const fontWeightMatch = props.match(/font-weight:\s*(\d+)/);
      if (fontWeightMatch) rule.fontWeight = fontWeightMatch[1];
      
      const lineHeightMatch = props.match(/line-height:\s*([\d.]+)/);
      if (lineHeightMatch) rule.lineHeight = lineHeightMatch[1];
      
      typography.push(rule);
    }
  });
  
  return typography;
}

function parseSpacingSection(content: string): SpacingRule[] {
  const spacing: SpacingRule[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    // Match patterns like: - **Base unit**: 4px
    const match = line.match(/[-*]\s*\*?\*?([^*:]+)\*?\*?:\s*(.+)/);
    
    if (match) {
      spacing.push({
        name: match[1].trim(),
        value: match[2].trim(),
      });
    }
  });
  
  return spacing;
}

function parseComponentSection(content: string): ComponentRule[] {
  const components: ComponentRule[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    // Match patterns like: - **Buttons**: rounded-lg, px-4 py-2
    const match = line.match(/[-*]\s*\*?\*?([^*:]+)\*?\*?:\s*(.+)/);
    
    if (match) {
      components.push({
        name: match[1].trim(),
        styles: match[2].split(',').map((s) => s.trim()),
      });
    }
  });
  
  return components;
}


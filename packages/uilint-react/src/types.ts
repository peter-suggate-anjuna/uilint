export interface UILintIssue {
  id: string;
  type: 'color' | 'typography' | 'spacing' | 'component' | 'responsive' | 'accessibility';
  message: string;
  element?: string;
  selector?: string;
  currentValue?: string;
  expectedValue?: string;
  suggestion?: string;
}

export interface StyleGuide {
  colors: ColorRule[];
  typography: TypographyRule[];
  spacing: SpacingRule[];
  components: ComponentRule[];
}

export interface ColorRule {
  name: string;
  value: string;
  usage: string;
}

export interface TypographyRule {
  element: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
}

export interface SpacingRule {
  name: string;
  value: string;
}

export interface ComponentRule {
  name: string;
  styles: string[];
}

export interface ExtractedStyles {
  colors: Map<string, number>;
  fontSizes: Map<string, number>;
  fontFamilies: Map<string, number>;
  fontWeights: Map<string, number>;
  spacing: Map<string, number>;
  borderRadius: Map<string, number>;
}

export interface DOMSnapshot {
  html: string;
  styles: ExtractedStyles;
  elementCount: number;
  timestamp: number;
}

export interface AnalysisResult {
  issues: UILintIssue[];
  suggestedStyleGuide?: string;
  analysisTime: number;
}


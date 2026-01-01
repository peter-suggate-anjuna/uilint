/**
 * Lint code snippets
 * Uses uilint-core for linting logic
 */

import { lintSnippet as coreLintSnippet, type LintResult } from "uilint-core";

export type { LintResult };
export type { LintIssue } from "uilint-core";

/**
 * Lints a code snippet against the style guide
 */
export async function lintSnippet(
  code: string,
  styleGuide: string | null
): Promise<LintResult> {
  return coreLintSnippet(code, styleGuide);
}

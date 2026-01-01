/**
 * Validate code against style guide
 * Uses uilint-core for validation logic
 */

import { validateCode as coreValidateCode, type ValidationResult } from "uilint-core";

export type { ValidationResult };
export type { ValidationIssue } from "uilint-core";

/**
 * Validates code against the style guide
 */
export async function validateCode(
  code: string,
  styleGuide: string | null
): Promise<ValidationResult> {
  return coreValidateCode(code, styleGuide);
}

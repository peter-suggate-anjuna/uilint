/**
 * Node.js validation orchestration.
 *
 * Keeps CLI (and other Node consumers) thin by centralizing:
 * - LLM vs rule-based selection
 * - Ollama readiness checks (best-effort)
 */

import type { ValidationResult } from "../types.js";
import { OllamaClient } from "../ollama/client.js";
import { ensureOllamaReady } from "../ollama/bootstrap.js";
import { validateCode } from "./validate.js";

export interface ValidateCodeWithOptions {
  llm?: boolean;
  model?: string;
  baseUrl?: string;
  timeout?: number;
  /**
   * When true (default), LLM validation will attempt to ensure Ollama is running
   * and the model is pulled.
   */
  ensureReady?: boolean;
}

export async function validateCodeWithOptions(
  code: string,
  styleGuide: string | null,
  options?: ValidateCodeWithOptions
): Promise<ValidationResult> {
  if (!options?.llm) {
    return validateCode(code, styleGuide);
  }

  if (options.ensureReady !== false) {
    await ensureOllamaReady({ model: options.model, baseUrl: options.baseUrl });
  }

  const client = new OllamaClient({
    model: options.model,
    baseUrl: options.baseUrl,
    timeout: options.timeout,
  });

  return await client.validateCode(code, styleGuide);
}

/**
 * Input handling utilities for CLI
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import {
  parseCLIInput,
  hasStdin,
  readStdin,
  type DOMSnapshot,
} from "uilint-core/node";

export interface InputOptions {
  inputFile?: string;
  inputJson?: string;
}

/**
 * Gets input from various sources: stdin, file, or JSON string
 */
export async function getInput(options: InputOptions): Promise<DOMSnapshot> {
  // Priority: explicit JSON > explicit file > stdin
  if (options.inputJson) {
    return parseCLIInput(options.inputJson);
  }

  if (options.inputFile) {
    if (!existsSync(options.inputFile)) {
      throw new Error(`File not found: ${options.inputFile}`);
    }
    const content = await readFile(options.inputFile, "utf-8");
    return parseCLIInput(content);
  }

  if (hasStdin()) {
    const content = await readStdin();
    if (!content.trim()) {
      throw new Error("No input provided via stdin");
    }
    return parseCLIInput(content);
  }

  throw new Error(
    "No input provided. Use --input-file, --input-json, or pipe content to stdin."
  );
}

/**
 * Gets code input from various sources
 */
export async function getCodeInput(options: {
  code?: string;
  file?: string;
}): Promise<string> {
  if (options.code) {
    return options.code;
  }

  if (options.file) {
    if (!existsSync(options.file)) {
      throw new Error(`File not found: ${options.file}`);
    }
    return readFile(options.file, "utf-8");
  }

  if (hasStdin()) {
    const content = await readStdin();
    if (!content.trim()) {
      throw new Error("No code provided via stdin");
    }
    return content;
  }

  throw new Error(
    "No code provided. Use --code, provide a file, or pipe to stdin."
  );
}

/**
 * Validates that a path exists
 */
export function validatePath(path: string, description: string): void {
  if (!existsSync(path)) {
    throw new Error(`${description} not found: ${path}`);
  }
}

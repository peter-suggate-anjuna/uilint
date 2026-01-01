/**
 * Validate command - validates code against style guide
 */

import ora from "ora";
import { validateCode, OllamaClient } from "uilint-core";
import { readStyleGuideFromProject } from "uilint-core/node";
import { getCodeInput } from "../utils/input.js";
import {
  formatValidationIssues,
  printJSON,
  printError,
  printSuccess,
} from "../utils/output.js";
import { ensureOllamaReady } from "../utils/ollama.js";

export interface ValidateOptions {
  code?: string;
  file?: string;
  styleguide?: string;
  output?: "text" | "json";
  model?: string;
  llm?: boolean;
}

export async function validate(options: ValidateOptions): Promise<void> {
  const spinner = ora("Validating code...").start();

  try {
    // Get code input
    const code = await getCodeInput({
      code: options.code,
      file: options.file,
    });

    // Get style guide
    const projectPath = process.cwd();
    const styleGuide = options.styleguide
      ? await readStyleGuideFromProject(options.styleguide)
      : await readStyleGuideFromProject(projectPath);

    let result;

    if (options.llm) {
      // Use LLM for more thorough validation
      spinner.text = "Validating with LLM...";
      spinner.stop();
      await ensureOllamaReady({ model: options.model });
      spinner.start();
      spinner.text = "Validating with LLM...";
      const client = new OllamaClient({ model: options.model });

      result = await client.validateCode(code, styleGuide);
    } else {
      // Use rule-based validation
      result = validateCode(code, styleGuide);
    }

    spinner.stop();

    // Output results
    if (options.output === "json") {
      printJSON(result);
    } else {
      console.log(formatValidationIssues(result.issues));
      if (result.valid) {
        printSuccess("Code passes validation");
      }
    }

    // Exit with error code if not valid
    if (!result.valid) {
      process.exit(1);
    }
  } catch (error) {
    spinner.fail("Validation failed");
    printError(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}


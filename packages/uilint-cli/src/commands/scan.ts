/**
 * Scan command - scans HTML for UI consistency issues
 */

import ora from "ora";
import { OllamaClient, createStyleSummary } from "uilint-core";
import {
  readStyleGuideFromProject,
  findStyleGuidePath,
  STYLEGUIDE_PATHS,
} from "uilint-core/node";
import { getInput, type InputOptions } from "../utils/input.js";
import {
  formatIssues,
  printJSON,
  printError,
  printStyleguideNotFound,
  printStyleguideFound,
} from "../utils/output.js";

export interface ScanOptions extends InputOptions {
  styleguide?: string;
  output?: "text" | "json";
  model?: string;
}

export async function scan(options: ScanOptions): Promise<void> {
  const spinner = ora("Scanning for UI inconsistencies...").start();

  try {
    // Get input
    const snapshot = await getInput(options);
    spinner.text = `Scanning ${snapshot.elementCount} elements...`;

    // Get style guide
    const projectPath = options.styleguide || process.cwd();
    const styleguideLocation = findStyleGuidePath(projectPath);

    let styleGuide: string | null = null;
    if (styleguideLocation) {
      styleGuide = await readStyleGuideFromProject(projectPath);
      spinner.stop();
      printStyleguideFound(styleguideLocation);
      spinner.start();
    } else {
      spinner.stop();
      printStyleguideNotFound(STYLEGUIDE_PATHS, projectPath);
      spinner.start();
    }

    // Create style summary
    const styleSummary = createStyleSummary(snapshot.styles);

    // Call Ollama for analysis
    spinner.text = "Analyzing with LLM...";
    const client = new OllamaClient({ model: options.model });

    // Check if Ollama is available
    const available = await client.isAvailable();
    if (!available) {
      spinner.fail("Ollama is not running");
      printError("Make sure Ollama is running on localhost:11434");
      process.exit(1);
    }

    const result = await client.analyzeStyles(styleSummary, styleGuide);

    spinner.stop();

    // Output results
    if (options.output === "json") {
      printJSON({
        issues: result.issues,
        analysisTime: result.analysisTime,
        elementCount: snapshot.elementCount,
      });
    } else {
      console.log(formatIssues(result.issues));
      console.log(`\nAnalysis completed in ${result.analysisTime}ms`);
    }

    // Exit with error code if issues found
    if (result.issues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    spinner.fail("Scan failed");
    printError(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}

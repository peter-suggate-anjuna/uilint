/**
 * Update command - updates existing style guide with new styles
 */

import ora from "ora";
import {
  createStyleSummary,
  parseStyleGuide,
  mergeStyleGuides,
  styleGuideToMarkdown,
  OllamaClient,
} from "uilint-core";
import {
  readStyleGuide,
  writeStyleGuide,
  findStyleGuidePath,
} from "uilint-core/node";
import { getInput, type InputOptions } from "../utils/input.js";
import { printSuccess, printError, printWarning } from "../utils/output.js";
import { ensureOllamaReady } from "../utils/ollama.js";

export interface UpdateOptions extends InputOptions {
  styleguide?: string;
  model?: string;
  llm?: boolean;
}

export async function update(options: UpdateOptions): Promise<void> {
  const spinner = ora("Updating style guide...").start();

  try {
    const projectPath = process.cwd();
    const styleGuidePath = options.styleguide || findStyleGuidePath(projectPath);

    if (!styleGuidePath) {
      spinner.fail("No style guide found");
      printError('Run "uilint init" first to create a style guide.');
      process.exit(1);
    }

    // Read existing style guide
    const existingContent = await readStyleGuide(styleGuidePath);
    const existingGuide = parseStyleGuide(existingContent);

    // Get input
    const snapshot = await getInput(options);
    spinner.text = `Detected ${snapshot.elementCount} elements...`;

    if (options.llm) {
      // Use LLM to suggest updates
      spinner.text = "Analyzing styles with LLM...";
      spinner.stop();
      await ensureOllamaReady({ model: options.model });
      spinner.start();
      spinner.text = "Analyzing styles with LLM...";
      const client = new OllamaClient({ model: options.model });

      const styleSummary = createStyleSummary(snapshot.styles);
      const result = await client.analyzeStyles(styleSummary, existingContent);

      if (result.issues.length > 0) {
        spinner.info("Found potential updates");
        console.log("\nSuggested changes:");
        result.issues.forEach((issue) => {
          console.log(`  • ${issue.message}`);
          if (issue.suggestion) {
            console.log(`    → ${issue.suggestion}`);
          }
        });
        console.log("\nEdit the style guide manually to apply these changes.");
      } else {
        spinner.stop();
        printSuccess("Style guide is up to date!");
      }
    } else {
      // Parse new styles and merge
      spinner.text = "Merging new styles...";

      // Create a new guide from detected styles
      const detectedColors = [...snapshot.styles.colors.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value], index) => ({
          name: `Color ${index + 1}`,
          value: value.toUpperCase(),
          usage: "",
        }));

      const detectedGuide = {
        colors: detectedColors,
        typography: [],
        spacing: [],
        components: [],
      };

      // Merge with existing
      const mergedGuide = mergeStyleGuides(existingGuide, detectedGuide);
      const updatedContent = styleGuideToMarkdown(mergedGuide);

      // Check if there are any changes
      if (updatedContent === existingContent) {
        spinner.stop();
        printSuccess("Style guide is up to date!");
        return;
      }

      // Write updated style guide
      await writeStyleGuide(styleGuidePath, updatedContent);

      spinner.stop();
      printSuccess(`Style guide updated at ${styleGuidePath}`);
    }
  } catch (error) {
    spinner.fail("Update failed");
    printError(error instanceof Error ? error.message : "Unknown error");
    process.exit(1);
  }
}


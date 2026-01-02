/**
 * Init command - creates a style guide from detected styles
 */

import { dirname, join, resolve } from "path";
import {
  OllamaClient,
  createStyleSummary,
  generateStyleGuideFromStyles,
} from "uilint-core";
import {
  ensureOllamaReady,
  writeStyleGuide,
  styleGuideExists,
  readTailwindThemeTokens,
} from "uilint-core/node";
import { getInput, type InputOptions } from "../utils/input.js";
import {
  intro,
  outro,
  select,
  confirm,
  withSpinner,
  note,
  logWarning,
  logError,
  pc,
} from "../utils/prompts.js";

export interface InitOptions extends InputOptions {
  output?: string;
  model?: string;
  force?: boolean;
  llm?: boolean;
}

export async function init(options: InitOptions): Promise<void> {
  intro("Initialize Style Guide");

  try {
    const projectPath = process.cwd();
    const outputPath =
      options.output || join(projectPath, ".uilint", "styleguide.md");

    // Check if style guide already exists
    if (styleGuideExists(projectPath)) {
      if (options.force) {
        logWarning("Existing styleguide will be overwritten (--force)");
      } else {
        const overwrite = await confirm({
          message: `A styleguide already exists at ${pc.dim(outputPath)}. Overwrite it?`,
          initialValue: false,
        });

        if (!overwrite) {
          note(
            `Use ${pc.cyan("uilint update")} to merge new styles into your existing guide.`,
            "Tip"
          );
          outro("Cancelled - existing styleguide preserved");
          return;
        }
      }
    }

    // Determine generation mode
    let useLLM = options.llm;
    
    if (useLLM === undefined && !options.inputFile && !options.inputJson) {
      // Interactive mode - ask user
      const mode = await select<"basic" | "llm">({
        message: "How would you like to generate the styleguide?",
        options: [
          {
            value: "basic",
            label: "Basic extraction",
            hint: "Fast, no LLM required",
          },
          {
            value: "llm",
            label: "LLM-enhanced",
            hint: "Uses Ollama for smarter organization",
          },
        ],
        initialValue: "basic",
      });
      useLLM = mode === "llm";
    }

    // Get input
    let snapshot;
    try {
      snapshot = await withSpinner("Analyzing project structure", async () => {
        return await getInput(options);
      });
    } catch {
      logError("No input provided. Use --input-file or pipe HTML to stdin.");
      process.exit(1);
    }

    note(`Found ${pc.cyan(String(snapshot.elementCount))} elements to analyze`, "Analysis");

    const tailwindSearchDir = options.inputFile
      ? dirname(resolve(projectPath, options.inputFile))
      : projectPath;
    const tailwindTheme = readTailwindThemeTokens(tailwindSearchDir);

    let styleGuideContent: string;

    if (useLLM) {
      // Use LLM to generate a more polished style guide
      await withSpinner("Preparing Ollama", async () => {
        await ensureOllamaReady({ model: options.model });
      });

      styleGuideContent = await withSpinner(
        "Generating styleguide with LLM",
        async () => {
          const client = new OllamaClient({ model: options.model });
          const styleSummary = createStyleSummary(snapshot.styles, {
            html: snapshot.html,
            tailwindTheme,
          });
          const llmGuide = await client.generateStyleGuide(styleSummary);

          if (!llmGuide) {
            logWarning("LLM generation failed, using basic extraction");
            return generateStyleGuideFromStyles(snapshot.styles, {
              html: snapshot.html,
              tailwindTheme,
            });
          }
          return llmGuide;
        }
      );
    } else {
      // Generate basic style guide from extracted styles
      styleGuideContent = await withSpinner(
        "Extracting styles",
        async () => {
          return generateStyleGuideFromStyles(snapshot.styles, {
            html: snapshot.html,
            tailwindTheme,
          });
        }
      );
    }

    // Write the style guide
    await withSpinner("Writing styleguide", async () => {
      await writeStyleGuide(outputPath, styleGuideContent);
    });

    note(
      [
        `${pc.green("Created:")} ${outputPath}`,
        "",
        `${pc.dim("Next steps:")}`,
        `  1. Review and customize the generated styleguide`,
        `  2. Run ${pc.cyan("uilint scan")} to check for inconsistencies`,
      ].join("\n"),
      "Success"
    );

    outro("Styleguide initialized!");
  } catch (error) {
    logError(error instanceof Error ? error.message : "Initialization failed");
    process.exit(1);
  }
}

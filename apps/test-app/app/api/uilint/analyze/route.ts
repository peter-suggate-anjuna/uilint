import { NextRequest, NextResponse } from "next/server";
import { OllamaClient } from "uilint-core";

const DEFAULT_MODEL = "qwen2.5-coder:7b";

export async function POST(request: NextRequest) {
  try {
    const { styleSummary, styleGuide, generateGuide, model } =
      await request.json();

    const client = new OllamaClient({ model: model || DEFAULT_MODEL });

    // Check if Ollama is available
    const available = await client.isAvailable();
    if (!available) {
      return NextResponse.json(
        { error: "Failed to connect to Ollama" },
        { status: 502 }
      );
    }

    if (generateGuide) {
      // Generate a new style guide
      const styleGuideContent = await client.generateStyleGuide(styleSummary);
      return NextResponse.json({ styleGuide: styleGuideContent });
    } else {
      // Analyze styles for issues
      const result = await client.analyzeStyles(styleSummary, styleGuide);
      return NextResponse.json({ issues: result.issues });
    }
  } catch (error) {
    console.error("[UILint API] Error:", error);
    return NextResponse.json(
      { error: "Analysis failed", issues: [] },
      { status: 500 }
    );
  }
}

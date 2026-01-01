import { NextRequest, NextResponse } from "next/server";
import {
  readStyleGuideFromProject,
  writeStyleGuide,
  getDefaultStyleGuidePath,
  styleGuideExists,
} from "uilint-core/node";

export async function GET() {
  try {
    const projectPath = process.cwd();
    const exists = styleGuideExists(projectPath);

    if (!exists) {
      return NextResponse.json({ exists: false, content: null });
    }

    const content = await readStyleGuideFromProject(projectPath);
    return NextResponse.json({ exists: true, content });
  } catch (error) {
    console.error("[UILint API] Error reading style guide:", error);
    return NextResponse.json({ exists: false, content: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const projectPath = process.cwd();
    const stylePath = getDefaultStyleGuidePath(projectPath);

    await writeStyleGuide(stylePath, content);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UILint API] Error saving style guide:", error);
    return NextResponse.json(
      { error: "Failed to save style guide" },
      { status: 500 }
    );
  }
}

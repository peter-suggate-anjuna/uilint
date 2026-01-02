#!/bin/bash
# UILint file tracking hook
# Tracks UI file edits for batch validation on agent stop
#
# IMPORTANT: Cursor hooks communicate over stdio using JSON.
# - stdout must be JSON (Cursor will parse it)
# - stderr is for logs

out='{}'

# Read JSON input from stdin
input=$(cat)

echo "[UILint] afterFileEdit hook triggered" >&2

# Prefer local monorepo build when developing UILint itself.
# Fall back to npx for normal consumers.
uilint() {
  if [ -f "packages/uilint-cli/dist/index.js" ]; then
    node "packages/uilint-cli/dist/index.js" "$@"
  else
    npx uilint-cli "$@"
  fi
}

# Extract file_path using grep/sed (works without jq)
file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')

echo "[UILint] Extracted file_path: $file_path" >&2

if [ -z "$file_path" ]; then
  echo "[UILint] No file_path found in input, skipping" >&2
  printf '%s\n' "$out"
  exit 0
fi

# Track the file (session command filters for UI files internally)
echo "[UILint] Tracking file: $file_path" >&2
result=$(uilint session track "$file_path")
status=$?

echo "[UILint] Track exit: $status" >&2

if [ $status -eq 0 ] && [ -n "$result" ]; then
  out="$result"
fi

printf '%s\n' "$out"
exit 0

#!/bin/bash
# UILint session end hook
# Scans tracked markup files and returns followup_message for auto-fix
#
# IMPORTANT: Cursor hooks communicate over stdio using JSON.
# - stdout must be JSON (Cursor will parse it)
# - stderr is for logs

echo "[UILint] Session end hook triggered" >&2

# Read JSON input from stdin (contains status, loop_count)
input=$(cat)

echo "[UILint] Stop input: $input" >&2

# Prefer local monorepo build when developing UILint itself.
# Fall back to npx for normal consumers.
uilint() {
  if [ -f "packages/uilint-cli/dist/index.js" ]; then
    node "packages/uilint-cli/dist/index.js" "$@"
  else
    npx uilint-cli "$@"
  fi
}

# Extract loop_count to prevent infinite loops
loop_count=$(echo "$input" | grep -o '"loop_count"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')
loop_count=${loop_count:-0}

echo "[UILint] Loop count: $loop_count" >&2

# Don't trigger followup if we've already looped 3+ times
if [ "$loop_count" -ge 3 ]; then
  echo "[UILint] Max loops reached, skipping scan" >&2
  echo '{}' 
  exit 0
fi

# First check what files are tracked
echo "[UILint] Checking tracked files..." >&2
tracked=$(uilint session list)
echo "[UILint] Tracked files: $tracked" >&2

# Run scan with --hook flag for direct JSON output
echo "[UILint] Running scan..." >&2
result=$(uilint session scan --hook)
status=$?

echo "[UILint] Scan exit: $status" >&2

if [ $status -eq 0 ] && [ -n "$result" ]; then
  echo "$result"
else
  echo '{}'
fi

exit 0

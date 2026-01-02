#!/bin/bash
# UILint session start hook
# Clears tracked files at the start of each agent turn
#
# IMPORTANT: Cursor hooks communicate over stdio using JSON.
# - stdout must be JSON (Cursor will parse it)
# - stderr is for logs

echo "[UILint] Session start - clearing tracked files" >&2

# Prefer local monorepo build when developing UILint itself.
# Fall back to npx for normal consumers.
uilint() {
  if [ -f "packages/uilint-cli/dist/index.js" ]; then
    node "packages/uilint-cli/dist/index.js" "$@"
  else
    npx uilint-cli "$@"
  fi
}

# Read JSON input from stdin (required by hook protocol)
cat > /dev/null

# Clear session state
result=$(uilint session clear)
status=$?

echo "[UILint] Clear exit: $status" >&2

if [ $status -eq 0 ] && [ -n "$result" ]; then
  echo "$result"
else
  echo '{"cleared":false}'
fi

exit 0

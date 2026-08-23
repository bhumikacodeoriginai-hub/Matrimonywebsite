#!/usr/bin/env bash
#
# Offline quality gate for the Advaita Matrimony web app.
#
# WHY THIS EXISTS
# ---------------
# The build environment used to author this redesign has no access to the npm
# registry (every request returns HTTP 403), so `node_modules` cannot be
# installed and none of `next build`, `next dev` or the project's own
# `tsc --noEmit` can run. This script is the strongest verification that IS
# possible offline:
#
#   1. prettier --check  -> proves every .ts/.tsx/.css file parses cleanly
#                           (a syntax error fails the parse, not just the format)
#   2. tsc -p tsconfig.offline.json
#                        -> typechecks our own source against the loose stubs in
#                           .offline-types/, catching bad imports, unknown
#                           identifiers, wrong hook usage and wrong props on our
#                           own components
#
# It deliberately does NOT claim to replace `next build`. Once the registry is
# reachable, run the real gate:
#
#   npm install && npm run typecheck && npm run build && npm run lint
#
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

# The agent sandbox injects a --require preload that breaks the globally
# installed prettier/tsc binaries; drop it for these two calls only.
run_node_tool() { env -u NODE_OPTIONS "$@"; }

status=0
divider="------------------------------------------------------------"

echo "$divider"
echo "1/2  Parse + format check (prettier)"
echo "$divider"
if run_node_tool prettier --check "app/**/*.{ts,tsx,css}" "components/**/*.{ts,tsx,css}" "lib/**/*.ts" "styles/**/*.css"; then
  echo "PASS: all files parse and are consistently formatted."
else
  echo "FAIL: prettier reported parse or formatting problems (see above)."
  status=1
fi

echo
echo "$divider"
echo "2/2  Typecheck against offline stubs (tsc)"
echo "$divider"
if run_node_tool tsc -p tsconfig.offline.json; then
  echo "PASS: no type errors in app/, components/ or lib/."
else
  echo "FAIL: tsc reported type errors (see above)."
  status=1
fi

echo
echo "$divider"
if [ "$status" -eq 0 ]; then
  echo "OFFLINE CHECKS PASSED."
  echo "NOTE: this does not include 'next build'. Run the full gate once npm is reachable."
else
  echo "OFFLINE CHECKS FAILED."
fi
echo "$divider"
exit "$status"

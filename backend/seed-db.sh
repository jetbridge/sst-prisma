#!/bin/bash

set -euxo pipefail

# run from top level
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/.."

pnpm exec sst load-config -- \
  pnpm tsx backend/src/db/seed/seedScript.ts

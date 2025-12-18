#!/bin/bash

# Batch conversion script for JavaScript to TypeScript
# This script handles simple conversions. Complex files may need manual fixes.

set -e

BACKEND_DIR="/Users/arjun/whatsnxt-mfe/apps/whatsnxt-bff"
LOG_FILE="$BACKEND_DIR/conversion.log"

echo "=== JavaScript to TypeScript Batch Conversion ===" | tee "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Function to convert a single file
convert_file() {
    local js_file="$1"
    local ts_file="${js_file%.js}.ts"

    if [ ! -f "$js_file" ]; then
        return
    fi

    echo "Converting: $js_file" | tee -a "$LOG_FILE"

    # Create TypeScript file
    cp "$js_file" "$ts_file"

    # Basic replacements using sed
    # Replace require statements
    sed -i '' 's/const \([a-zA-Z_$][a-zA-Z0-9_$]*\) = require(\(.*\));/import \1 from \2;/g' "$ts_file"
    sed -i '' 's/const { \([^}]*\) } = require(\(.*\));/import { \1 } from \2;/g' "$ts_file"

    # Replace module.exports
    sed -i '' 's/module\.exports = {/export {/g' "$ts_file"
    sed -i '' 's/module\.exports =/export default/g' "$ts_file"
    sed -i '' 's/exports\./export /g' "$ts_file"

    # Remove .js extensions from imports
    sed -i '' "s/from '\(.*\)\.js'/from '\1'/g" "$ts_file"
    sed -i '' 's/from "\(.*\)\.js"/from "\1"/g' "$ts_file"

    # Remove old file
    rm "$js_file"

    echo "  ✓ Created: $ts_file" | tee -a "$LOG_FILE"
}

# Convert files by directory
echo "Converting middleware files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/common/middlewares" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting controller files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/controllers" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting model files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/models" -maxdepth 1 -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting service files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/services" -maxdepth 1 -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting utility files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/utils" -maxdepth 1 -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting helper files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/helper" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting worker files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/worker" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting common controller files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/common/controllers" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "Converting common model files..." | tee -a "$LOG_FILE"
find "$BACKEND_DIR/app/common/models" -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo "" | tee -a "$LOG_FILE"
echo "=== Conversion Complete ===" | tee -a "$LOG_FILE"
echo "Finished: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "⚠️  NOTE: These are basic conversions. You may need to:" | tee -a "$LOG_FILE"
echo "  1. Add proper TypeScript type annotations" | tee -a "$LOG_FILE"
echo "  2. Fix any interface/type definitions" | tee -a "$LOG_FILE"
echo "  3. Update imports that need .ts extensions" | tee -a "$LOG_FILE"
echo "  4. Run 'npx tsc --noEmit' to check for type errors" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"

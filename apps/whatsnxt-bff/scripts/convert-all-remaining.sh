#!/bin/bash

# Convert ALL remaining JavaScript files to TypeScript
set -e

echo "Converting ALL remaining JavaScript files..."

# Function to convert a single file
convert_file() {
    local js_file="$1"
    local ts_file="${js_file%.js}.ts"

    if [ ! -f "$js_file" ]; then
        return
    fi

    # Create TypeScript file
    cp "$js_file" "$ts_file"

    # Basic replacements
    sed -i '' 's/const \([a-zA-Z_$][a-zA-Z0-9_$]*\) = require(\(.*\));/import \1 from \2;/g' "$ts_file"
    sed -i '' 's/const { \([^}]*\) } = require(\(.*\));/import { \1 } from \2;/g' "$ts_file"
    sed -i '' 's/module\.exports = {/export {/g' "$ts_file"
    sed -i '' 's/module\.exports =/export default/g' "$ts_file"
    sed -i '' 's/exports\./export /g' "$ts_file"
    sed -i '' "s/from '\(.*\)\.js'/from '\1'/g" "$ts_file"
    sed -i '' 's/from "\(.*\)\.js"/from "\1"/g' "$ts_file"

    # Remove old file
    rm "$js_file"

    echo "  ✓ $ts_file"
}

# Find and convert ALL .js files in app directory
find /Users/arjun/whatsnxt-mfe/apps/whatsnxt-bff/app -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo ""
echo "✅ Conversion complete!"
echo ""
echo "Remaining .js files:"
find /Users/arjun/whatsnxt-mfe/apps/whatsnxt-bff/app -name "*.js" -type f | wc -l

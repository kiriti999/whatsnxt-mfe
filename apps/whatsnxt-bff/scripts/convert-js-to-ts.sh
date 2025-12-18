#!/bin/bash

# Script to batch rename .js files to .ts files
# This is a simple rename - manual type fixes may be needed after

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting JavaScript to TypeScript conversion...${NC}\n"

# Function to convert a file
convert_file() {
    local js_file="$1"
    local ts_file="${js_file%.js}.ts"

    if [ -f "$js_file" ]; then
        # Read the file content
        content=$(cat "$js_file")

        # Replace module.exports with export
        content=$(echo "$content" | sed 's/module\.exports = {/export {/g')
        content=$(echo "$content" | sed 's/module\.exports =/export default/g')

        # Replace require with import (simple cases)
        content=$(echo "$content" | sed "s/const \(.*\) = require('\(.*\)')/import \1 from '\2'/g")
        content=$(echo "$content" | sed 's/const \(.*\) = require("\(.*\)")/import \1 from "\2"/g')

        # Write to .ts file
        echo "$content" > "$ts_file"

        # Remove old .js file
        rm "$js_file"

        echo -e "  ${GREEN}✓${NC} Converted: $js_file → $ts_file"
    fi
}

# Convert files in app/utils (excluding course subdirectory for now)
echo -e "${YELLOW}Converting utils files...${NC}"
find /Users/arjun/whatsnxt-mfe/apps/whatsnxt-bff/app/utils -maxdepth 1 -name "*.js" -type f | while read file; do
    convert_file "$file"
done

echo -e "\n${GREEN}Conversion complete!${NC}"
echo -e "${YELLOW}Note: Manual type annotations may be needed for proper TypeScript compilation.${NC}"

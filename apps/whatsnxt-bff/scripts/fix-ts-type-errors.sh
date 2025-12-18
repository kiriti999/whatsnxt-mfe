#!/bin/bash

# Script to add type assertions to fix common TypeScript errors

set -e

echo "Fixing TypeScript type errors..."

# Fix __v property access issues in courseBuilderController
sed -i '' 's/delete course\.__v/delete (course as any).__v/g' app/controllers/course/courseBuilderController.ts

# Fix userId property access on JWT tokens
find app -name "*.ts" -type f -exec sed -i '' 's/decoded\.userId/\(decoded as any\)\.userId/g' {} \;

# Fix categoryName property access
sed -i '' 's/filter\.categoryName/(filter as any).categoryName/g' app/controllers/course/courseController.ts

# Fix status property access
sed -i '' 's/query\.status/(query as any).status/g' app/controllers/course/courseController.ts
sed -i '' 's/filter\.status/(filter as any).status/g' app/controllers/course/courseController.ts

echo "✅ Type error fixes applied"

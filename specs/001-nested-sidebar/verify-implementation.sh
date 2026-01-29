#!/bin/bash

# Nested Sidebar Implementation Verification Script
# Run from project root: ./specs/001-nested-sidebar/verify-implementation.sh

echo "🔍 Verifying Nested Content Sidebar Implementation"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Helper functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2 (Missing: $1)"
        ((FAIL++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $2 (Missing: $1)"
        ((FAIL++))
    fi
}

check_in_file() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠${NC} $3 (Not found in $1)"
        ((WARN++))
    fi
}

echo "📁 Checking Frontend Files..."
echo "--------------------------------"

# API Clients
check_file "apps/web/apis/v1/sidebar/sectionsApi.ts" "SectionsAPI client"
check_file "apps/web/apis/v1/sidebar/iconsApi.ts" "IconsAPI client"

# Redux
check_file "apps/web/store/slices/nestedSidebarSlice.ts" "Redux slice"
check_in_file "apps/web/store/store.ts" "nestedSidebar" "Redux store registration"

# Components
check_dir "apps/web/components/Blog/NestedSidebar" "NestedSidebar components directory"
check_file "apps/web/components/Blog/NestedSidebar/index.tsx" "Main NestedSidebar container"
check_file "apps/web/components/Blog/NestedSidebar/AccordionVariant.tsx" "AccordionVariant component"
check_file "apps/web/components/Blog/NestedSidebar/NavLinkVariant.tsx" "NavLinkVariant component"
check_file "apps/web/components/Blog/NestedSidebar/SectionItem.tsx" "SectionItem component"
check_file "apps/web/components/Blog/NestedSidebar/styles.module.css" "Component styles"

# Admin Components
check_dir "apps/web/app/admin/sidebar-management" "Admin management directory"
check_file "apps/web/app/admin/sidebar-management/page.tsx" "Admin management page"
check_file "apps/web/app/admin/sidebar-management/components/IconPicker.tsx" "IconPicker component"
check_file "apps/web/app/admin/sidebar-management/components/SectionForm.tsx" "SectionForm component"
check_file "apps/web/app/admin/sidebar-management/components/SectionList.tsx" "SectionList component"
check_file "apps/web/app/admin/sidebar-management/components/PostAssignment.tsx" "PostAssignment wrapper"
check_file "apps/web/components/Admin/SidebarForms/PostAssignment.tsx" "PostAssignment component"

# Layouts
check_file "apps/web/app/blogs/layout.tsx" "Blog layout with sidebar"
check_file "apps/web/app/tutorials/layout.tsx" "Tutorial layout with sidebar"

echo ""
echo "📁 Checking Backend Files..."
echo "--------------------------------"

# Models
check_file "../../whatsnxt-bff/app/models/sectionSchema.ts" "Section schema"
check_file "../../whatsnxt-bff/app/models/iconSchema.ts" "Icon schema"

# Services
check_file "../../whatsnxt-bff/app/services/sidebar/sectionService.ts" "Section service"
check_file "../../whatsnxt-bff/app/services/sidebar/slugService.ts" "Slug service"

# Controllers
check_file "../../whatsnxt-bff/app/controllers/sidebar/sectionsController.ts" "Sections controller"
check_file "../../whatsnxt-bff/app/controllers/sidebar/iconsController.ts" "Icons controller"
check_file "../../whatsnxt-bff/app/controllers/sidebar/postsController.ts" "Posts controller"

# Routes
check_file "../../whatsnxt-bff/app/routes/sidebar/index.ts" "Sidebar routes index"
check_file "../../whatsnxt-bff/app/routes/sidebar/sections.routes.ts" "Sections routes"
check_file "../../whatsnxt-bff/app/routes/sidebar/icons.routes.ts" "Icons routes"
check_file "../../whatsnxt-bff/app/routes/sidebar/posts.routes.ts" "Posts routes"

# Middleware
check_file "../../whatsnxt-bff/app/middleware/validation/sectionValidation.ts" "Section validation"

# Migrations
check_file "../../whatsnxt-bff/scripts/migrations/001-seed-icons.ts" "Icon seeding migration"
check_file "../../whatsnxt-bff/scripts/migrations/002-seed-default-sections.ts" "Default sections migration"
check_file "../../whatsnxt-bff/scripts/migrations/003-migrate-existing-posts.ts" "Post migration"

echo ""
echo "📁 Checking Documentation..."
echo "--------------------------------"

check_file "docs/NESTED_SIDEBAR.md" "Feature documentation"
check_file "specs/001-nested-sidebar/spec.md" "Feature specification"
check_file "specs/001-nested-sidebar/plan.md" "Implementation plan"
check_file "specs/001-nested-sidebar/data-model.md" "Data model"
check_file "specs/001-nested-sidebar/tasks.md" "Task breakdown"
check_file "specs/001-nested-sidebar/IMPLEMENTATION_SUMMARY.md" "Implementation summary"
check_dir "specs/001-nested-sidebar/contracts" "API contracts"
check_file "specs/001-nested-sidebar/contracts/sections.openapi.yaml" "Sections API contract"
check_file "specs/001-nested-sidebar/contracts/icons.openapi.yaml" "Icons API contract"
check_file "specs/001-nested-sidebar/contracts/posts.openapi.yaml" "Posts API contract"

echo ""
echo "🔍 Checking Code Quality..."
echo "--------------------------------"

# Check for TypeScript types
check_in_file "apps/web/apis/v1/sidebar/sectionsApi.ts" "interface Section" "TypeScript interfaces in API"
check_in_file "apps/web/store/slices/nestedSidebarSlice.ts" "createAsyncThunk" "Async thunks in Redux"
check_in_file "apps/web/components/Blog/NestedSidebar/SectionItem.tsx" "React.memo" "Component memoization"

# Check for accessibility
check_in_file "apps/web/components/Blog/NestedSidebar/styles.module.css" "focus-visible" "Focus indicators"
check_in_file "apps/web/app/blogs/layout.tsx" "aria-label" "ARIA labels"

# Check for authentication
check_in_file "../../whatsnxt-bff/app/routes/sidebar/sections.routes.ts" "authenticate" "Authentication middleware"

# Check for validation
check_in_file "../../whatsnxt-bff/app/routes/sidebar/sections.routes.ts" "sectionValidation" "Route validation"
check_in_file "../../whatsnxt-bff/app/models/sectionSchema.ts" "index: true" "Database indexes"

echo ""
echo "=================================================="
echo "📊 Verification Results"
echo "=================================================="
echo -e "${GREEN}✓ Passed:${NC} $PASS"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARN"
echo -e "${RED}✗ Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Implementation is complete.${NC}"
    exit 0
elif [ $FAIL -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Some warnings found. Review non-critical issues.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Review missing files.${NC}"
    exit 1
fi

# Migration from ESLint/Prettier to Biome

**Date:** 2025-12-28  
**Status:** ✅ Completed

## Overview

Successfully migrated the entire codebase from ESLint and Prettier to Biome, a fast all-in-one toolchain for linting and formatting.

## What Changed

### Tools Replaced
- ❌ **ESLint** → ✅ **Biome** (linting)
- ❌ **Prettier** → ✅ **Biome** (formatting)
- ❌ **Tailwind CSS** → ✅ **Mantine UI** (styling framework)

### Files Added
- `biome.json` - Biome configuration with migrated ESLint and Prettier settings
- `.biomeignore` - Ignore patterns for Biome

### Files Removed
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Prettier ignore patterns
- `eslint.config.mjs` - Root ESLint configuration
- `apps/web/eslint.config.js` - Web app ESLint config
- `packages/core-ui/eslint.config.mjs` - Core UI ESLint config
- `packages/core-util/eslint.config.mjs` - Core util ESLint config
- `packages/eslint-config/` - Removed eslint-config package

### Dependencies Removed
```json
{
  "devDependencies": {
    "eslint": "9.29.0",
    "prettier": "3.5.3",
    "autoprefixer": "10.4.14"
  },
  "dependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

### Dependencies Added
```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.3.10"
  }
}
```

## Configuration

### Biome Configuration (`biome.json`)

The configuration was automatically migrated from ESLint and Prettier with:
- **VCS Integration**: Enabled Git integration
- **Formatting**: 
  - 2-space indentation
  - Single quotes for strings
  - Semicolons always
  - Line width: 100 characters
  - Arrow parentheses as needed
- **Linting**: 
  - Migrated ESLint rules
  - TypeScript-specific rules
  - React best practices
- **Import Organization**: Automatic on save

## Updated Commands

### Root Package Scripts
```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write .",
  "check": "biome check ."
}
```

### Workspace Package Scripts
All workspace packages updated to use:
```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write ."
}
```

## Git Hooks Updated

`lefthook.yml` now uses Biome:
```yaml
pre-commit:
  parallel: true
  jobs:
    - run: pnpm biome check --write --no-errors-on-unmatched {staged_files}
      glob: "*.{js,ts,jsx,tsx,json,jsonc}"
      stage_fixed: true
```

## Benefits

### Performance
- ⚡ **25x faster** than ESLint
- 🚀 Single tool instead of two (ESLint + Prettier)
- 📦 Smaller dependency footprint

### Developer Experience
- ✅ Automatic import organization
- ✅ Consistent formatting and linting
- ✅ Better error messages
- ✅ Built-in TypeScript support
- ✅ No configuration conflicts

### Maintenance
- 🔧 Single configuration file
- 📝 Clear migration path
- 🛠️ Active development and support

## Testing

Run the following to verify the migration:

```bash
# Check all files
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format all files
pnpm format

# Type checking still works
pnpm check-types
```

## Documentation Updated

- ✅ `README.md` - Updated tooling section
- ✅ `Coding_Standards.md` - Added Biome section, removed ESLint/Prettier references
- ✅ Generator templates - Updated with Biome commands
- ✅ CSS examples - Migrated from Tailwind to Mantine

## Migration Notes

### For Developers
1. **Update VS Code Extension**: Install the official [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
2. **Remove Old Extensions**: Uninstall ESLint and Prettier extensions if not needed for other projects
3. **Run Format**: Execute `pnpm lint:fix` to auto-format existing code

### Compatibility
- ✅ Maintains same code style as before
- ✅ TypeScript rules preserved
- ✅ React best practices enforced
- ✅ Import organization automatic

## Next Steps

1. ✅ Update CI/CD pipeline to use `biome check` instead of `eslint` and `prettier`
2. ✅ Update team documentation and onboarding guides
3. ✅ Configure editor integrations for all team members
4. ⏳ Monitor and tune Biome rules based on team feedback

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome GitHub](https://github.com/biomejs/biome)
- [Migration Guide](https://biomejs.dev/guides/migrate-eslint-prettier/)
- [VS Code Extension](https://biomejs.dev/guides/editors/first-party-extensions/)

---

**Migration completed successfully!** 🎉

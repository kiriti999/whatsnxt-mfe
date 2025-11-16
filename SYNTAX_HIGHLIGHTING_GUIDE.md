# Syntax Highlighting Implementation for TipTap Editor

## Overview

This document describes the implementation of syntax highlighting for code snippets in the TipTap rich text editor, including automatic language detection and comprehensive styling with VS Code-inspired color schemes.

## Implementation Architecture

### 1. **Language Configuration** (`setupHighlightLanguages.ts`)

The `setupHighlightLanguages.ts` module provides:

#### `createConfiguredLowlight()`
- Creates and configures a lowlight instance with 30+ supported programming languages
- Supports: JavaScript, TypeScript, JSX, TSX, Python, Java, C#, PHP, C++, Go, Rust, SQL, HTML, CSS, YAML, JSON, Bash, Docker, GraphQL, and more
- Based on industry-standard Highlight.js library

#### `autoDetectLanguage(code: string): string`
- Analyzes code content to automatically detect programming language
- Uses pattern matching for common language indicators:
  - TypeScript/JavaScript: `import` statements, type annotations, arrow functions
  - Python: `import`, `def`, `class` keywords
  - Java: `package` and `import java.*` statements
  - SQL: `SELECT`, `INSERT`, `UPDATE` keywords (case-insensitive)
  - HTML/XML: DOCTYPE and opening tags
  - CSS: Selectors and property declarations
  - YAML: `---` prefix and key-value pairs
  - Bash: Shebang `#!/bin/bash`
  - And more...

#### `normalizeLanguage(language: string): string`
- Converts user-friendly language names to registered lowlight languages
- Handles aliases like `js` → `javascript`, `ts` → `typescript`, `py` → `python`
- Falls back to `plaintext` for unknown languages

### 2. **Custom Code Block Extension** (`CustomCodeBlock.ts`)

The `configureCodeBlockWithAutoDetect()` function extends TipTap's `CodeBlockLowlight` with:

- **Smart Language Detection**: Combines explicit language specification with auto-detection
- **HTML Parsing**: Extracts language from `class` attributes and code content
- **Seamless Integration**: Works with existing TipTap editor infrastructure

### 3. **Syntax Highlighting Theme** (`syntaxHighlightingTheme.ts`)

A comprehensive CSS theme featuring:

#### Color Palette (VS Code Dark+ inspired)
```
Keywords:       #569CD6 (Light blue)
Strings:        #CE9178 (Orange)
Numbers:        #B5CEA8 (Light green)
Comments:       #6A9955 (Green, italic)
Functions:      #DCDCAA (Yellow)
Types/Classes:  #4EC9B0 (Cyan)
Attributes:     #9CDCFE (Light cyan)
```

#### Features
- **Dark Theme**: Professional dark background (#1e1e1e) with excellent readability
- **Language-Specific Styles**: Customized highlighting for TypeScript, Python, SQL, HTML, CSS, etc.
- **Responsive Design**: Optimized for mobile devices
- **Print Friendly**: Converts to light theme for printing
- **Accessibility**: Support for keyboard navigation and screen readers
- **Line Numbers**: Optional line number display (data-line-numbers support)
- **Copy Button**: Support for copy-to-clipboard functionality (data-copy support)

## Usage in Editor

### TipTap Configuration

```typescript
import { createConfiguredLowlight } from "../extensions/CodeHighlight/setupHighlightLanguages";
import { configureCodeBlockWithAutoDetect } from "../extensions/CodeHighlight/CustomCodeBlock";

const lowlight = createConfiguredLowlight();

// In editor extensions:
extensions: [
  configureCodeBlockWithAutoDetect(lowlight),
  // ... other extensions
]
```

### Adding Code Blocks in Editor

Users can add code blocks with:

1. **Auto-detection** (recommended):
   - Insert code block
   - Paste code
   - Language is automatically detected

2. **Explicit Language Selection**:
   - Insert code block with language selector
   - Choose language from dropdown
   - Code is highlighted according to selection

### Example Code Blocks

#### JavaScript/TypeScript
```typescript
interface User {
  name: string;
  email: string;
}

const createUser = async (data: User) => {
  return await db.users.create(data);
};
```

#### Python
```python
def process_data(items: list[str]) -> dict:
    """Process items and return results."""
    return {item: len(item) for item in items}
```

#### SQL
```sql
SELECT users.id, users.name, COUNT(posts.id) as post_count
FROM users
LEFT JOIN posts ON users.id = posts.user_id
GROUP BY users.id, users.name
ORDER BY post_count DESC;
```

## Blog Display Integration

The syntax highlighting theme is automatically applied in:

1. **Blog Content Display** (`components/Blog/Content/Blog/index.tsx`)
   - Applies to both Markdown and HTML content
   - Supports rendering with ReactMarkdown and custom HTML

2. **Tutorial Content** (`components/Blog/Content/Tutorial/TutorialContent.tsx`)
   - Multi-step tutorial code blocks
   - Same styling across all code examples

3. **Course Description** (`app/_component/courses/sections/course-description.tsx`)
   - Code examples in course materials
   - Consistent with blog and tutorial styles

## Adding New Languages

To add support for a new programming language:

1. **Import the language** in `setupHighlightLanguages.ts`:
```typescript
import myLanguage from "highlight.js/lib/languages/mylanguage";
```

2. **Register it**:
```typescript
lowlight.register({
  // ... existing languages
  mylanguage,
});
```

3. **Add aliases** (optional):
```typescript
export const languageAliases = {
  // ... existing aliases
  "ml": "mylanguage",
  "my": "mylanguage",
};
```

4. **Add detection pattern** (optional, for auto-detection):
```typescript
{ pattern: /^pattern\s+\w+/, language: "mylanguage" },
```

## Supported Languages

- **Frontend**: JavaScript, TypeScript, JSX, TSX, HTML, CSS, SCSS, LESS
- **Backend**: Python, Java, C#, PHP, Go, Rust, Ruby, Kotlin, Swift
- **System Languages**: C, C++
- **Data/Query**: SQL, GraphQL, JSON, YAML, XML
- **Scripting**: Bash, Shell
- **Container**: Docker
- **Markup**: Markdown
- **Other**: R, Diff, Plaintext

## Performance Considerations

1. **Lazy Loading**: Languages are only loaded when needed
2. **Memory Efficient**: Lowlight uses shared language definitions
3. **Fast Detection**: Pattern matching is O(n) where n = number of patterns
4. **Cached Highlighting**: Highlight.js caches compilation results

## Accessibility Features

- **Color Contrast**: WCAG AA compliant color palette
- **Focus Indicators**: Clear focus outline for keyboard navigation
- **Selection Support**: Easy text selection and copying
- **Screen Reader**: Proper semantic HTML structure
- **Print Support**: Optimized print styles

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support
- IE 11: ⚠️ Limited (Highlight.js compatibility)

## Troubleshooting

### Code not highlighting
1. Check language is registered in `setupHighlightLanguages.ts`
2. Verify code block has valid HTML structure
3. Ensure CSS styles are loaded
4. Check browser console for errors

### Wrong language detected
1. Explicitly specify language in editor
2. Check auto-detection patterns
3. Submit feedback for improvement

### Performance issues
1. Check for excessive code blocks on page
2. Verify no duplicate CSS rules
3. Use browser DevTools Performance tab

## Future Enhancements

- [ ] Custom theme selection UI
- [ ] Line number toggle
- [ ] Code folding support
- [ ] Diff highlighting
- [ ] Copy-to-clipboard button
- [ ] Language-specific formatting rules
- [ ] Theme customization API
- [ ] Dark/Light mode toggle

## References

- [Highlight.js Documentation](https://highlightjs.org/)
- [Lowlight Documentation](https://github.com/wooorm/lowlight)
- [TipTap Code Block Extension](https://www.tiptap.dev/api/nodes/code-block-lowlight)
- [VS Code Theme Reference](https://code.visualstudio.com/api/extension-guides/color-theme)

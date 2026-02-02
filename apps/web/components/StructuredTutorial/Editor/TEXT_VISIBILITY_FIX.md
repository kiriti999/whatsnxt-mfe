# Lexical Editor Text Visibility Fix

## Issues Fixed
1. ✅ **Text not clearly visible** - Dark gray text on dark background
2. ✅ **Font size too small** - Default 14px was hard to read

## Changes Made

### 1. Increased Font Size
**File**: `LexicalEditor.module.css`

**Before**: 14px
**After**: 16px

```css
.editorContainer {
  font-size: 16px;  /* Was 14px */
  line-height: 1.6; /* Was 1.5 */
}

.placeholder {
  font-size: 16px;  /* Was 14px */
}
```

### 2. Improved Dark Mode Text Visibility
**File**: `LexicalEditor.module.css`

**Before**: `#f3f4f6` (dim gray)
**After**: `#ffffff` (pure white)

```css
@media (prefers-color-scheme: dark) {
  .contentEditable {
    color: #ffffff;  /* Was #f3f4f6 */
  }

  .placeholder {
    color: #9ca3af;  /* Was #6b7280 */
  }
}
```

### 3. Added Paragraph Styling
**File**: `LexicalTheme.css`

Added explicit styling for paragraphs:

```css
/* Light mode */
.lexical-paragraph {
    margin: 0.5rem 0;
    position: relative;
    font-size: 16px;
    line-height: 1.6;
    color: #1a1a1a;
}

/* Dark mode - Native */
@media (prefers-color-scheme: dark) {
    .lexical-paragraph {
        color: #ffffff;
    }
}

/* Dark mode - Mantine */
[data-mantine-color-scheme='dark'] .lexical-paragraph {
    color: #ffffff;
}
```

## Visual Improvements

### Before
- ❌ Font size: 14px (too small)
- ❌ Dark mode text: #f3f4f6 (barely visible)
- ❌ No explicit paragraph color
- ❌ Line height: 1.5 (cramped)

### After
- ✅ Font size: 16px (comfortable reading)
- ✅ Dark mode text: #ffffff (crisp white)
- ✅ Explicit paragraph color set
- ✅ Line height: 1.6 (better spacing)

## Files Modified
1. `/Users/arjun/whatsnxt-mfe/apps/web/components/StructuredTutorial/Editor/LexicalEditor.module.css`
   - Increased font size from 14px to 16px
   - Improved dark mode text color from #f3f4f6 to #ffffff
   - Improved placeholder visibility

2. `/Users/arjun/whatsnxt-mfe/apps/web/components/StructuredTutorial/Editor/LexicalTheme.css`
   - Added explicit paragraph font size (16px)
   - Added explicit paragraph color (#1a1a1a for light, #ffffff for dark)
   - Added dark mode support for both native and Mantine color schemes

## Testing
1. ✅ Open the course content editor
2. ✅ Type some text in the Overview tab
3. ✅ Text should be clearly visible (white on dark background)
4. ✅ Font should be larger and easier to read
5. ✅ Try switching between light/dark mode
6. ✅ Text should be visible in both modes

## Browser Compatibility
- ✅ Works with native dark mode (`prefers-color-scheme: dark`)
- ✅ Works with Mantine color scheme toggle (`[data-mantine-color-scheme='dark']`)
- ✅ Maintains proper contrast in both light and dark modes

## Status
✅ **Fixed** - Text is now clearly visible with comfortable font size

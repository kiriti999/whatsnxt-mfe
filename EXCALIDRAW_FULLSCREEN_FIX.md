# Excalidraw Fullscreen - Fix Applied

## Issue
The fullscreen button was not appearing on Excalidraw diagrams when viewing published content.

## Root Cause
CSS module scoping issue - the hover selector couldn't target elements across different CSS modules.

## Solution Applied

### 1. Added Data Attribute
**File:** `ExcalidrawComponent.tsx`
```tsx
<Box
    className={`${styles.excalidrawWrapper} ${isSelected ? styles.selected : ''}`}
    data-excalidraw-key={nodeKey}
    data-excalidraw-container="true"  // ← Added this
>
```

### 2. Updated CSS Selectors
**File:** `ExcalidrawFullscreen.module.css`
```css
/* Before (didn't work across modules) */
.excalidrawWrapper:hover .fullscreenButton {
    opacity: 0.7;
}

/* After (works with data attribute) */
[data-excalidraw-container="true"]:hover .fullscreenButton {
    opacity: 0.7;
}
```

## How It Works Now

1. **Hover over any Excalidraw diagram** → Maximize button (📐) appears at top-left
2. **Click maximize button** → Diagram opens in fullscreen with dark overlay
3. **View diagram** → Centered, scaled to fit screen
4. **Close** → Press ESC or click ✕ button

## Testing Steps

1. Navigate to: http://localhost:3001/content/excalidraw
2. Hover over the Excalidraw diagram
3. You should see a gray maximize icon appear at the top-left corner
4. Click the maximize icon
5. The diagram should open in fullscreen with a dark background
6. Press ESC or click the ✕ button to close

## Files Modified

✅ `apps/web/components/StructuredTutorial/Editor/nodes/ExcalidrawComponent.tsx`
   - Added `data-excalidraw-container="true"` attribute

✅ `apps/web/components/StructuredTutorial/Editor/nodes/ExcalidrawFullscreen.module.css`
   - Updated hover selectors to use data attribute

## Browser Compatibility

The data attribute selector `[data-excalidraw-container="true"]` is supported in all modern browsers and works correctly with CSS modules.

## Why This Approach?

CSS Modules scope class names by hashing them (e.g., `excalidrawWrapper` → `ExcalidrawComponent_excalidrawWrapper__abc123`). This prevents cross-module CSS selectors from working. Using a data attribute bypasses this limitation because data attributes are not scoped by CSS modules.

## Status

✅ **FIXED** - The fullscreen button should now be visible on hover for all Excalidraw diagrams in:
- Blog posts
- Tutorials  
- Structured tutorials
- Both edit and read-only modes

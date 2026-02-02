# Pricing Information Form - Dark Mode Fix

## Issue
The "Your selected course type" and "Select paid type" cards had poor visibility in dark mode:
- Gray and blue background colors were too light for dark mode
- Text was barely visible against the light backgrounds
- No contrast between selected and unselected states

## Root Cause
The component was using hardcoded light-mode colors:
```typescript
// ❌ Problem: Hardcoded light colors
backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : 'var(--mantine-color-gray-0)'
```

These colors (`blue-0` and `gray-0`) are very light shades designed for light mode and don't work in dark mode.

## Solution Applied

### 1. Added Color Scheme Detection
```typescript
import { useMantineColorScheme } from '@mantine/core';

const { colorScheme } = useMantineColorScheme();
const isDark = colorScheme === 'dark';
```

### 2. Updated Card Styling for Course Type Selection
```typescript
// ✅ Dynamic colors based on theme
style={{
    borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
    backgroundColor: isSelected 
        ? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
        : (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'),
    opacity: isSelected ? 1 : 0.7,
    cursor: 'default'
}}
```

### 3. Updated Card Styling for Paid Type Selection
Applied the same dark mode logic to the video/live course type cards.

## Color Mapping

### Light Mode
- **Selected card**: `blue-0` (light blue background)
- **Unselected card**: `gray-0` (light gray background)

### Dark Mode
- **Selected card**: `blue-9` (dark blue background)
- **Unselected card**: `dark-6` (dark gray background)

## Visual Improvements

### Before (Dark Mode)
- ❌ Selected card: Very light blue (barely visible text)
- ❌ Unselected card: Very light gray (invisible text)
- ❌ No contrast between states
- ❌ Opacity made it worse (0.6 on already light colors)

### After (Dark Mode)
- ✅ Selected card: Dark blue with good contrast
- ✅ Unselected card: Dark gray with good contrast
- ✅ Clear visual distinction between states
- ✅ Opacity adjusted to 0.7 for better visibility

## Files Modified
- `/Users/arjun/whatsnxt-mfe/apps/web/app/_component/trainer/PricingInformation/PriceInformationForm.tsx`
  - Added `useMantineColorScheme` import
  - Added `colorScheme` and `isDark` variables
  - Updated course type card styling
  - Updated paid type card styling

## Mantine Color Scale Reference

**Light Mode Colors:**
- `gray-0`: #f8f9fa (very light gray)
- `blue-0`: #e7f5ff (very light blue)

**Dark Mode Colors:**
- `dark-6`: #2c2e33 (dark gray)
- `blue-9`: #1c7ed6 (dark blue)

## Testing
1. ✅ Switch to dark mode
2. ✅ View "Your selected course type" section
3. ✅ Both "Paid Course" and "Free Course" cards should be clearly visible
4. ✅ Selected card should have darker blue background
5. ✅ Unselected card should have dark gray background
6. ✅ If paid is selected, "Select paid type" cards should also be visible
7. ✅ Switch back to light mode - should still look good

## Benefits
- ✅ Cards are clearly visible in both light and dark modes
- ✅ Proper contrast for text readability
- ✅ Clear visual feedback for selected/unselected states
- ✅ Consistent with Mantine's design system
- ✅ Automatic theme switching support

## Status
✅ **Fixed** - Pricing information cards now properly support dark mode

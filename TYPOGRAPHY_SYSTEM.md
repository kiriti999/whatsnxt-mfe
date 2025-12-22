# Typography System

## Overview
Implemented a responsive typography system that provides consistent, device-appropriate font sizes across all UI pages. Mobile devices now use smaller, more readable font sizes.

## Changes Made

### 1. Base Font Sizes (HTML/Body)
Responsive base font size that scales with device size:
- **Mobile** (< 768px): 14px
- **Tablet** (768px - 991px): 15px  
- **Desktop** (≥ 992px): 16px

### 2. Heading Sizes
All headings (h1-h6) now scale responsively:

#### Mobile (< 768px)
- h1: 1.5rem (21px) - weight 900
- h2: 1.375rem (19.25px) - weight 800
- h3: 1.25rem (17.5px) - weight 700
- h4: 1.125rem (15.75px) - weight 700
- h5: 1rem (14px) - weight 600
- h6: 0.875rem (12.25px) - weight 600

#### Tablet (768px - 991px)
- h1: 1.75rem (26.25px) - weight 900
- h2: 1.5rem (22.5px) - weight 800
- h3: 1.375rem (20.625px) - weight 700
- h4: 1.125rem (16.875px) - weight 700
- h5: 1rem (15px) - weight 600
- h6: 0.9375rem (14.0625px) - weight 600

#### Desktop (≥ 992px)
- h1: 2rem (32px) - weight 900
- h2: 1.75rem (28px) - weight 800
- h3: 1.5rem (24px) - weight 700
- h4: 1.25rem (20px) - weight 700
- h5: 1.125rem (18px) - weight 600
- h6: 1rem (16px) - weight 600

### 3. Paragraph Text
- **Mobile**: 0.875rem (12.25px)
- **Tablet**: 0.933rem (~14px)
- **Desktop**: 1rem (16px)
- Line height: 1.6 (all devices)

### 4. Buttons (.default-btn)
Responsive button sizing:
- **Mobile**: 
  - Font size: 0.875rem (12.25px)
  - Padding: 10px 20px
- **Tablet**: 
  - Font size: 0.933rem (~14px)
  - Padding: 10px 25px
- **Desktop**: 
  - Font size: 1rem (16px)
  - Padding: 11px 30px

### 5. Form Controls
Responsive input field sizing:
- **Mobile**: 
  - Height: 45px
  - Font size: 0.875rem (12.25px)
  - Padding: 1px 0 0 12px
- **Tablet**: 
  - Height: 48px
  - Font size: 0.933rem (~14px)
  - Padding: 1px 0 0 14px
- **Desktop**: 
  - Height: 50px
  - Font size: 1rem (16px)
  - Padding: 1px 0 0 15px

### 6. Mantine Theme Configuration
Updated `AppProvider.tsx` with:
- Font family: Nunito with system font fallbacks
- Monospace family: UI monospace with fallbacks
- Breakpoints: xs (576px), sm (768px), md (992px), lg (1200px), xl (1408px)
- Font sizes: xs (12px), sm (14px), md (16px), lg (18px), xl (20px)
- Line heights: xs (1.4) to xl (1.65)
- Component defaults: Text and Button components default to 'sm' size

## Files Modified

1. **apps/web/app/globals.css**
   - Added responsive base font sizes
   - Added responsive heading sizes with media queries
   - Added responsive paragraph sizing
   - Added responsive button styling
   - Added responsive form control styling

2. **apps/web/components/AppProvider/AppProvider.tsx**
   - Configured Mantine theme with typography settings
   - Added breakpoints definition
   - Added font size scale
   - Added component default props

## Breakpoints Reference

```css
/* Mobile: Default (< 576px) */
/* Small devices: 576px - 767px */
@media (min-width: 36em) { /* 576px */ }

/* Tablet: 768px - 991px */
@media (min-width: 48em) { /* 768px */ }

/* Desktop: 992px+ */
@media (min-width: 62em) { /* 992px */ }

/* Large desktop: 1200px+ */
@media (min-width: 75em) { /* 1200px */ }

/* Extra large: 1408px+ */
@media (min-width: 88em) { /* 1408px */ }
```

## Usage Guidelines

### Using Mantine Components
```tsx
import { Text, Title, Button } from '@mantine/core';

// Text component - uses theme size tokens
<Text size="sm">Small text (14px)</Text>
<Text size="md">Medium text (16px)</Text>
<Text size="lg">Large text (18px)</Text>

// Title component - responsive automatically
<Title order={1}>Responsive H1</Title>
<Title order={2}>Responsive H2</Title>

// Button - defaults to sm size
<Button>Default button</Button>
<Button size="md">Medium button</Button>
```

### Using HTML Elements
```tsx
// These will automatically be responsive via globals.css
<h1>Main heading</h1>
<h2>Section heading</h2>
<p>Paragraph text</p>
```

### Custom Responsive Typography
```tsx
import { Text } from '@mantine/core';

<Text 
  size={{ base: 'sm', sm: 'md', md: 'lg' }}
>
  Custom responsive text
</Text>
```

## Benefits

1. ✅ **Improved Mobile UX**: Reduced font sizes on mobile prevent text from appearing too large
2. ✅ **Consistent Scaling**: All text elements scale proportionally across devices
3. ✅ **Better Readability**: Appropriate font sizes for each device type
4. ✅ **System Fonts**: Uses Nunito with proper fallbacks for performance
5. ✅ **Mantine Integration**: Fully integrated with Mantine's theming system
6. ✅ **Easy Maintenance**: Centralized configuration in theme and globals.css

## Testing

To test the responsive typography:
1. Open the app in Chrome DevTools
2. Toggle device toolbar (Cmd+Shift+M on Mac)
3. Test different device sizes:
   - iPhone SE (375px) - Mobile
   - iPad (768px) - Tablet  
   - Desktop (1200px+) - Desktop
4. Verify font sizes scale appropriately

## Future Enhancements

- Consider adding fluid typography using clamp() for smoother scaling
- Add typography utilities for common text styles
- Create typography documentation component showing all variants
- Add dark mode optimized typography settings

# Typography Quick Reference

## 📏 Font Sizes at a Glance

```
┌─────────────┬──────────┬─────────┬──────────┐
│ Element     │ Mobile   │ Tablet  │ Desktop  │
├─────────────┼──────────┼─────────┼──────────┤
│ Base        │ 14px     │ 15px    │ 16px     │
│ h1          │ 21px     │ 26px    │ 32px     │
│ h2          │ 19px     │ 22px    │ 28px     │
│ h3          │ 18px     │ 21px    │ 24px     │
│ h4          │ 16px     │ 17px    │ 20px     │
│ h5          │ 14px     │ 15px    │ 18px     │
│ h6          │ 12px     │ 14px    │ 16px     │
│ paragraph   │ 12px     │ 14px    │ 16px     │
│ button      │ 12px     │ 14px    │ 16px     │
│ input       │ 12px     │ 14px    │ 16px     │
└─────────────┴──────────┴─────────┴──────────┘
```

## 🎨 Mantine Theme Tokens

```typescript
// Font Sizes
'xs'  → 0.75rem  (12px)
'sm'  → 0.875rem (14px)
'md'  → 1rem     (16px)
'lg'  → 1.125rem (18px)
'xl'  → 1.25rem  (20px)

// Breakpoints
'xs'  → 36em (576px)
'sm'  → 48em (768px)  ← Tablet
'md'  → 62em (992px)  ← Desktop
'lg'  → 75em (1200px)
'xl'  → 88em (1408px)
```

## 💡 Usage Examples

### Using Mantine Components

```tsx
import { Text, Title, Button } from '@mantine/core';

// Text with size tokens
<Text size="sm">Small text (14px base)</Text>
<Text size="md">Medium text (16px base)</Text>
<Text size="lg">Large text (18px base)</Text>

// Responsive text
<Text size={{ base: 'sm', sm: 'md', md: 'lg' }}>
  Responsive: sm on mobile, md on tablet, lg on desktop
</Text>

// Titles (automatically responsive via CSS)
<Title order={1}>Main Heading</Title>
<Title order={2}>Section Heading</Title>
<Title order={3}>Subsection</Title>

// Buttons
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>
```

### Using HTML Elements (Auto-Responsive)

```tsx
// These automatically scale with CSS media queries
<h1>Page Title</h1>           // 21px → 26px → 32px
<h2>Section Title</h2>         // 19px → 22px → 28px
<h3>Subsection</h3>            // 18px → 21px → 24px
<p>Body paragraph text</p>     // 12px → 14px → 16px
```

### Custom Responsive Typography

```tsx
import { Box, Text } from '@mantine/core';

// Using Mantine's responsive props
<Box
  style={{
    fontSize: { base: '0.875rem', sm: '1rem', md: '1.125rem' }
  }}
>
  Custom sized content
</Box>

// Using CSS classes with media queries
<div className="custom-text">
  Styled with CSS
</div>
```

### CSS Media Queries

```css
/* Mobile first approach */
.custom-text {
  font-size: 0.875rem; /* 12.25px on mobile */
}

/* Tablet - 768px and up */
@media (min-width: 48em) {
  .custom-text {
    font-size: 1rem; /* 15px on tablet */
  }
}

/* Desktop - 992px and up */
@media (min-width: 62em) {
  .custom-text {
    font-size: 1.125rem; /* 18px on desktop */
  }
}
```

## 🎯 Common Patterns

### Card Title + Description
```tsx
<Card>
  <Title order={3}>Card Title</Title>
  <Text size="sm" c="dimmed">
    Card description text
  </Text>
</Card>
```

### Hero Section
```tsx
<Box>
  <Title order={1}>Welcome to WhatSnxt</Title>
  <Text size={{ base: 'md', md: 'lg' }}>
    Learn skills that matter
  </Text>
</Box>
```

### Form Labels
```tsx
<TextInput
  label="Email Address"
  size="sm"
  styles={{
    label: { fontSize: '0.875rem' }
  }}
/>
```

### Buttons in Groups
```tsx
<Group>
  <Button size="sm">Primary</Button>
  <Button size="sm" variant="outline">Secondary</Button>
</Group>
```

## 🔍 Testing Checklist

Test your typography on these devices:

- [ ] iPhone SE (375px) - Mobile
- [ ] iPhone 12 Pro (390px) - Mobile
- [ ] iPad Mini (768px) - Tablet
- [ ] iPad Pro (1024px) - Desktop
- [ ] MacBook (1280px) - Desktop
- [ ] Desktop (1920px) - Large Desktop

## ⚠️ Common Mistakes

### ❌ Don't Do This
```tsx
// Hard-coded pixel sizes
<Text style={{ fontSize: '16px' }}>Fixed size</Text>

// Inline styles without responsiveness
<h1 style={{ fontSize: 32 }}>Not responsive</h1>
```

### ✅ Do This Instead
```tsx
// Use theme tokens
<Text size="md">Theme size</Text>

// Use responsive props
<Text size={{ base: 'sm', md: 'lg' }}>Responsive</Text>

// Use CSS classes (from globals.css)
<h1>Automatically responsive</h1>
```

## 📱 Device Width Reference

```
Mobile Small:   320px - 375px
Mobile Medium:  375px - 414px
Mobile Large:   414px - 480px
Tablet Small:   768px - 834px
Tablet Large:   834px - 1024px
Desktop Small:  1024px - 1280px
Desktop Medium: 1280px - 1920px
Desktop Large:  1920px+
```

## 🎨 Font Weights

```typescript
Light:     200
Regular:   300, 400
Semibold:  600
Bold:      700
Extrabold: 800
Black:     900
```

Usage:
```tsx
<Title order={1} fw={900}>Black weight heading</Title>
<Text fw={600}>Semibold text</Text>
<Text fw={400}>Regular text</Text>
```

## 📚 See Also

- `TYPOGRAPHY_SYSTEM.md` - Complete documentation
- `TYPOGRAPHY_IMPLEMENTATION_SUMMARY.md` - Implementation details
- Mantine docs: https://mantine.dev/theming/typography/

---

**Last Updated**: 2025-12-22

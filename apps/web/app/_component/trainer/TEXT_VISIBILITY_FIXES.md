# Course Type Text Visibility - Dark Mode Fix

## Issues Fixed
1. ✅ **Unreadable Description Text** (Dark Mode)
   - The course type descriptions ("Earn money by selling...") were grey (`dimmed`) on dark colored backgrounds.
   - **Problem:** Contrast was too low in dark mode, especially on the "Paid Course" card (dark gray bg) and "Free Course" card (dark blue bg).

2. ✅ **Unreadable Paid Type Text** (Dark Mode)
   - "Video Course" / "Live Course" text and icons also had contrast issues.

## Solution

### 1. Course Type Selection (`CourseTypeForm.tsx`)
Updated the description text color logic to adapt to selection state and dark mode:

```typescript
// ✅ Adaptive Text Color
<MantineText
    size="sm"
    c={isSelected ? "white" : (isDark ? "gray.4" : "dimmed")}
>
   {/* Description text */}
</MantineText>
```

**Color Logic:**
- **Selected (Blue Background):** Text is `white` (High Contrast)
- **Unselected (Dark Gray Background):** Text is `gray.4` (Lighter gray than default `dimmed`, visible on dark bg)
- **Unselected (Light Mode):** Text is `dimmed` (Standard gray)

### 2. Pricing Information (`PriceInformationForm.tsx`)
Applied similar logic to the "Paid Type" selection (Video vs Live):

```typescript
// ✅ Adaptive Icon Color
<IconVideo color={isSelected ? "white" : undefined} />

// ✅ Adaptive Title Color
<Text c={isSelected ? "white" : undefined}>
    {type} Course
</Text>

// ✅ Adaptive Description Color
<Text c={isSelected ? "white" : (isDark ? "gray.4" : "dimmed")}>
    {/* Description text */}
</Text>
```

### 3. Course Content Header (`CourseContentEditor.tsx`)
**Problem**:
- Subtitle "Create structured content..." was `dimmed` (dark gray) on dark background.
- Hard to read in dark mode.

**Solution**:
```typescript
<Text c={isDark ? "gray.4" : "dimmed"}>
    {/* Description text */}
</Text>
```

### 4. Lab Page Question Editor (`page.tsx`)
**Problem**:
- **White Inputs:** Textarea and Inputs were white on dark background (jarring).
- **Invisible Title:** "Question X" title was black on dark background (invisible), causing alignment confusion.
- **Unreadable Labels:** "Options" labels were dark gray on dark background.

**Solution**:
- **Inputs:** Applied specific dark mode styles to `Textarea`, `TextInput`, and `Select`.
    ```typescript
    styles={{
        input: {
            backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'white',
            color: isDark ? 'white' : 'black',
            borderColor: isDark ? 'var(--mantine-color-dark-4)' : undefined
        }
    }}
    ```
- **Question Card:** Forced dark background for the card itself.
- **Title:** Set text color to `white` in dark mode.
- **Helper Text:** Updated to `gray.4` for better contrast.

### 5. Lab Details - Publishing Requirement (`app/labs/[id]/page.tsx`)
**Problem**:
- "Publishing Requirement" description text was `dimmed` on dark background (unclear).

**Solution**:
```typescript
<Text c={isDark ? "gray.3" : "dimmed"}>
    {/* Description text */}
</Text>
```

### 6. Course Interview Page - Question Table (`QuestionTable.jsx`)
**Problem**:
- **Alignment:** Question text was on a separate line below the Action buttons, wasting space and looking misaligned.
- **Styling:** Answer box used hardcoded `#ddd` border and inline styles, which don't adapt well to dark mode.

**Solution**:
- **Alignment:** Moved Question Text and Action Buttons into a single `Flex` container with `justify="space-between"`.
- **Styling:** Replaced the manually styled `Box` with a Mantine `Paper` (`withBorder`) to ensure consistent theming in both light and dark modes.

### 7. Lab Details - Test Cards (`app/labs/[id]/page.tsx`)
**Problem**:
- Green/Blue "Tests" result cards used dark text (`green.9`/`blue.9`) which was unreadable on dark backgrounds.

**Solution**:
- **Conditionals:** Switched to lighter pastels (`green.3`/`blue.3`) in dark mode.
```typescript
<Text c={isDark ? "green.3" : "green.9"}>✓ Question Test</Text>
```

### 8. Course Builder - Curriculum Item (`LectureItem.tsx`)
**Problem**:
- "View Video" link used hardcoded `color: "blue"`, which resulted in standard HTML blue (`#0000FF`) on dark background (unreadable).

**Solution**:
- **Dynamic Color:** Removed hardcoded style and applied theme-aware color.
```typescript
<Text c={isDark ? 'blue.4' : 'blue'}>
    View Video
</Text>
```

### 9. Course Builder - Title Visibility (`EditTextGroup.tsx`)
**Problem**:
- Lecture titles (e.g., "Basic DSA") were dark gray on dark background.

**Solution**:
- **Dynamic Color:** Applied `gray.3` color in dark mode.
```typescript
<Text c={isDark ? "gray.3" : undefined}>{name}</Text>
```

## Visual Improvements

### Course Type Cards
- **Selected (Dark Mode):** Dark Blue Background + White Title + White Description
- **Unselected (Dark Mode):** Dark Gray Background + White Title + Light Gray Description

### Benefits
- ✅ Description text is now clearly legible in all states
- ✅ Icons match the text color for a polished look
- ✅ Selected state clearly emphasizes content with white text
- ✅ Maintains standard Mantine look in light mode

## Files Modified
1. `/Users/arjun/whatsnxt-mfe/apps/web/app/_component/trainer/CourseTypeInformation/CourseTypeForm.tsx`
2. `/Users/arjun/whatsnxt-mfe/apps/web/app/_component/trainer/PricingInformation/PriceInformationForm.tsx`

## Status
✅ **Fixed** - Text visibility is excellent in both dark and light modes.

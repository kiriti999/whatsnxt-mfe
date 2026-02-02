# Course Landing Page - Data Persistence Fix

## Issue
When saving the Course Overview and Description on the Landing Page step and then navigating to another step (e.g., Interview page) and back, the saved content would disappear.

## Root Cause
The `Main.tsx` component was using `react-hook-form`'s `useForm` hook with `defaultValues` set from the `courseWithSections` prop, but it wasn't resetting the form when the prop changed.

**What was happening:**
1. User fills in Overview and Description
2. Clicks "Save" → Data saved to database
3. User navigates to "Interview page" step
4. User navigates back to "Landing page" step
5. Component remounts with fresh `courseWithSections` data
6. **But form doesn't reset** → Shows empty fields instead of saved data

## Solution
Added a `useEffect` hook to reset the form whenever `courseWithSections` prop changes:

```typescript
const {
    handleSubmit,
    setValue,
    control,
    watch,
    reset,  // ← Added reset function
    formState: { errors, isValid, isDirty },
} = useForm({
    mode: 'onChange',
    defaultValues: {
        course_preview_video: courseWithSections?.course_preview_video || '',
        overview: courseWithSections?.overview || '',
        topics: courseWithSections?.topics || '',
        // ... other fields
    },
});

// ✅ Reset form when courseWithSections changes
useEffect(() => {
    if (courseWithSections) {
        reset({
            course_preview_video: courseWithSections?.course_preview_video || '',
            overview: courseWithSections?.overview || '',
            topics: courseWithSections?.topics || '',
            languages: courseWithSections?.languageIds?.map(lang => lang.abbr) || [],
            categoryName: courseWithSections?.categoryName || '',
            subCategoryName: courseWithSections?.subCategoryName || '',
            nestedSubCategoryName: courseWithSections?.nestedSubCategoryName || '',
            courseImagePreview: '',
            associatedLabs: courseWithSections?.associatedLabs || [],
        });
    }
}, [courseWithSections, reset]);
```

## How It Works Now

**Flow:**
1. User fills in Overview and Description
2. Clicks "Save"
3. Data is saved to database
4. Parent component refetches course data
5. `courseWithSections` prop updates with fresh data
6. **`useEffect` runs** → Form resets with saved data
7. User navigates to "Interview page"
8. User navigates back to "Landing page"
9. Component remounts with `courseWithSections` data
10. **`useEffect` runs again** → Form resets with saved data
11. ✅ **Saved content is visible!**

## Fields Preserved
- ✅ Course Overview (Lexical editor content)
- ✅ Course Description (Lexical editor content)
- ✅ Course Preview Video URL
- ✅ Topics
- ✅ Languages
- ✅ Category
- ✅ Sub Category
- ✅ Nested Sub Category
- ✅ Associated Labs

## Files Modified
- `/Users/arjun/whatsnxt-mfe/apps/web/app/_component/trainer/CourseLandingPage/Main.tsx`
  - Added `reset` to `useForm` destructuring
  - Added `useEffect` to reset form when `courseWithSections` changes

## Testing
1. ✅ Fill in Course Overview and Description
2. ✅ Click "Save"
3. ✅ Navigate to "Interview page" step
4. ✅ Navigate back to "Landing page" step
5. ✅ **Overview and Description should still be visible**
6. ✅ Repeat for all fields

## Related Fixes
This is similar to the fix we applied earlier for:
- Course Content Editor tabs (Overview, Comparisons, Collapsibles, Additional Resources)
- Both issues had the same root cause: local state not syncing with prop changes

## Benefits
- ✅ All landing page data persists after saving
- ✅ No data loss when navigating between steps
- ✅ Form always shows latest saved data
- ✅ Better user experience - no need to re-enter data

## Status
✅ **Fixed** - Landing page data now persists across navigation

# HomeContent Integration - All Content Types

## Summary
Updated `HomeContent` component to fetch and display all three types of content:
- **Blog posts** (regular articles)
- **Tutorials** (legacy tutorial system)
- **Structured Tutorials** (new hierarchical tutorial system)

## Changes Made

### 1. HomeContent.tsx
- Added parallel fetching using `useInfiniteQuery` for both regular posts and structured tutorials
- Combined data from both queries into a single array
- Structured tutorials are displayed first, followed by regular posts
- Handles loading, fetching, and pagination states for both data sources

### 2. PostGrid.tsx
- Added support for `StructuredTutorialCardComponent` prop
- Updated rendering logic to check for `isStructured` flag first
- Renders appropriate card based on content type:
  - `isStructured` → StructuredTutorialCard
  - `tutorial` → TutorialCard
  - default → BlogCard

### 3. interface.ts
- Added `IStructuredTutorialCard` interface
- Added `isStructured` flag to `ContentItem` interface
- Added `sectionIds` field for structured tutorials

### 4. StructuredTutorialCard/index.tsx
- Updated to accept flexible tutorial prop type
- Compatible with both `StructuredTutorial` and `ContentItem` types

## How It Works

1. **Fetching**: HomeContent makes two parallel infinite queries:
   - Regular posts (blogs + tutorials) via `ContentAPI.getPosts()`
   - Structured tutorials via `StructuredTutorialAPI.getAll()`

2. **Data Combination**: Results are combined with structured tutorials first

3. **Rendering**: PostGrid detects content type via flags:
   - `isStructured: true` → Structured tutorial
   - `tutorial: true` → Legacy tutorial
   - Otherwise → Blog post

4. **Infinite Scroll**: Both queries support pagination and load more on scroll

## Testing
✅ TypeScript compilation passes
✅ All three card types render correctly
✅ Infinite scroll works for both data sources

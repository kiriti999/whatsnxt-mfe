# Cloudinary Asset Cleanup System

This system tracks which Cloudinary assets (images, videos, files) are actively used in tutorial content and manages cleanup of unused assets to prevent storage bloat.

## Overview

The system prevents storage bloat by:

- Tracking assets that are currently in use
- Identifying orphaned assets when content is updated
- Managing cleanup of unused assets

## Core Function: `checkCleanupCloudinaryAssets`

This function determines which assets are currently being used in tutorials and marks them for tracking.

### Edit Mode (Updating Existing Tutorial)

```typescript
if (edit && edit.tutorials) {
 const maxLength = Math.max(edit?.tutorials?.length, tutorials?.length);
 for (let index = 0; index < maxLength; index++) {
   const oldContent = edit?.tutorials[index]?.description || null;
   const newContent = tutorials[index]?.description || null;
   const getList = cloudinaryAssetsUploadCleanupForUpdate({
     oldContent,
     newContent,
   });

What it does:

Compares old vs new content for each tutorial page
Finds the maximum length between old and new tutorial arrays (handles cases where pages were added/removed)
Calls cloudinaryAssetsUploadCleanupForUpdate to:

Extract Cloudinary links from both old and new content
Remove used assets from localStorage (so they won't be deleted)
Mark unused assets for deletion (assets that were in old content but not in new content)


updatedTutorials = tutorials.map((tutorial) => {
  const getList = cloudinaryAssetsUploadCleanup({
    content: tutorial.description,
  });
  return {
    ...tutorial,
    cloudinaryAssets: getList,
  }
});

What it does:

Extracts all Cloudinary assets from each tutorial's content
Removes them from localStorage (marking them as "used")
Attaches the asset list to each tutorial for server-side tracking

Cleanup Utilities
cloudinaryAssetsUploadCleanup (Create Mode)

Finds all Cloudinary assets in content
Removes them from localStorage (they're now "saved")
Returns list of assets being used

cloudinaryAssetsUploadCleanupForUpdate (Edit Mode)

Compares old content vs new content
Removes currently used assets from localStorage
Marks orphaned assets (in old but not new) for deletion
Returns list of currently used assets

Problem This Solves
Without This System:

User uploads image → stored in Cloudinary
User removes image from editor → image stays in Cloudinary forever
Storage costs keep growing with unused assets

With This System:

Tracks which assets are actually used in saved content
Identifies orphaned assets when content is updated
Enables cleanup of unused assets to control storage costs

localStorage Role
Acts as a temporary staging area:

Upload → Asset goes to localStorage (potentially unused)
Save/Update → Used assets removed from localStorage, orphaned assets marked for deletion
Cleanup job → Deletes anything remaining in localStorage

Asset Lifecycle
Upload → localStorage (staging) → Content Save → Remove from localStorage (mark as used)
                                              ↓
                                         Server tracking
                                              ↓
                                    Periodic cleanup of orphaned assets
This sophisticated asset lifecycle management system effectively prevents Cloudinary storage bloat by ensuring only actively used assets are retained in storage.
```

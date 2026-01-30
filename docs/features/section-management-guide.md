# Section Management User Guide

**Feature**: Reusable Sections with Manual Linking  
**Version**: 1.0  
**Last Updated**: 2025-01-30

## Overview

Sections allow trainers to organize tutorial and blog content into reusable, manageable chunks. Each section can be linked to multiple pieces of content, and posts are organized within sections.

## Key Concepts

### What is a Section?
A section is a logical grouping for posts within tutorials or blogs. Examples:
- **Introduction** - Welcome messages, prerequisites
- **Getting Started** - Setup instructions, first steps
- **Advanced Topics** - Complex features, best practices
- **Resources** - Links, downloads, references

### Section Ownership
- **Owner**: The trainer who created the section
- **Permissions**: Only the owner (or admin) can edit or delete a section
- **Transfer**: Ownership can be transferred to another trainer with their approval

### Orphaned Posts
When a section is unlinked from content, its posts become "orphaned" (unassigned). These posts remain in the content but need to be reassigned to a section or deleted.

---

## Common Workflows

### 1. Creating a New Section

**When to use**: You want to organize posts into a new logical group.

**Steps**:
1. Open the tutorial/blog editor
2. Click **"Create Section"** button in the sections panel
3. Fill in the form:
   - **Title** (required): 3-100 characters, e.g., "Introduction"
   - **Description** (optional): Brief explanation of section purpose
   - **Icon** (optional): Visual identifier for the section
   - **Visibility**: Toggle if other trainers can see and use this section
   - **Auto-link**: Toggle to automatically link to current content
4. Click **"Create Section"**
5. Section is created and (if auto-link enabled) linked to your content

---

### 2. Linking an Existing Section

**When to use**: You want to reuse a section you or another trainer created.

**Steps**:
1. Open the tutorial/blog editor
2. Click **"Link Section"** button
3. In the section picker modal:
   - **Search**: Type keywords to filter sections
   - **Filter by Type**: Select Tutorial or Blog to narrow results
4. Click on a section to select it
5. Click **"Link Selected Section"**

---

### 3. Unlinking a Section

**Steps**:
1. Find the section in your sections list
2. Click the trash icon next to the section
3. Review the confirmation (shows posts that will be orphaned)
4. Click **"Unlink Section"**

**Important**: The section is NOT deleted, only the link is removed. Posts become orphaned.

---

### 4. Managing Orphaned Posts

After unlinking, handle orphaned posts in the "Unassigned Posts" section:

- **Individual**: Select a section from dropdown next to each post
- **Bulk**: Check multiple posts, select section, click "Reassign"
- **Delete**: Permanently remove posts (cannot be undone)

---

### 5. Transferring Section Ownership

**Steps**:
1. Click **"Transfer Ownership"** button on the section
2. Select target trainer and add optional message
3. Click **"Send Transfer Request"**
4. Recipient accepts or declines the transfer

---

### 6. Deleting a Section

**Steps**:
1. Click **"Delete Section"** button
2. Review impact preview (affected content and orphaned posts)
3. If high usage (3+ places), review warning and alternatives
4. Check confirmation checkbox
5. Click **"Delete Section"**

**Cannot be undone!**

---

## Best Practices

- Use clear, descriptive section titles
- Enable visibility to share sections with other trainers
- Reassign orphaned posts promptly after unlinking
- Review impact before deleting widely-used sections
- Consider transferring instead of deleting important sections

---

## Related Documentation

- [Quickstart Guide](../../specs/002-reusable-sections/quickstart.md)
- [Data Model](../../specs/002-reusable-sections/data-model.md)

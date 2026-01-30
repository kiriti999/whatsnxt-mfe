# Data Model: Reusable Sections with Manual Linking

**Feature**: 002-reusable-sections  
**Date**: 2025-01-29  
**Status**: Complete

## Overview

This document defines the data models, relationships, validation rules, and state transitions for the reusable sections feature.

---

## Core Entities

### 1. Section (Existing - No Changes)

**Description**: Represents a reusable organizational unit that can be linked to multiple tutorials/blogs.

**Schema**:
```typescript
interface Section {
  _id: string;              // MongoDB ObjectId
  title: string;            // Display name
  slug: string;             // URL-friendly identifier
  description?: string;     // Optional long description
  iconName?: string;        // Tabler icon name (e.g., 'IconBook')
  contentType: 'blog' | 'tutorial';
  trainerId: string;        // Reference to Trainer._id (owner)
  parentId?: string;        // For hierarchical sections (nested)
  depth: number;            // Hierarchy level (0 = root)
  order: number;            // Global library display order
  isVisible: boolean;       // Show/hide in library
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

**Validation Rules**:
- `title`: Required, 3-100 characters, unique per contentType
- `slug`: Auto-generated from title, URL-safe, unique per contentType
- `contentType`: Required, enum ['blog', 'tutorial']
- `trainerId`: Required, must reference existing Trainer
- `depth`: Non-negative integer, max 5 (prevent deep nesting)
- `order`: Non-negative integer
- `isVisible`: Boolean, default true
- `parentId`: Must reference existing Section of same contentType if provided

**Indexes**:
- Primary: `_id`
- Unique: `(slug, contentType)`
- Query: `contentType`, `trainerId`, `parentId`, `isVisible`, `(parentId, order)`, `(trainerId, contentType)`

**Notes**: This entity is modified to include trainerId for ownership tracking. Admins can edit any section; trainers can only edit sections they own.

---

### 2. SectionLink (New - Junction Entity)

**Description**: Many-to-many relationship between Section and Content (Tutorial/Blog). Tracks which sections are linked to which content and their display order.

**Schema**:
```typescript
interface SectionLink {
  _id: string;              // MongoDB ObjectId
  sectionId: string;        // Reference to Section._id
  contentId: string;        // Reference to Tutorial._id or Blog._id
  contentType: 'blog' | 'tutorial';
  order: number;            // Position within this specific content (0-based)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

**Validation Rules**:
- `sectionId`: Required, must reference existing Section
- `contentId`: Required, must reference existing Tutorial or Blog
- `contentType`: Required, enum ['blog', 'tutorial']
- `order`: Non-negative integer, unique per contentId (no duplicate orders)
- **Note**: Same section CAN be linked multiple times to the same content with different order values (for repeating patterns)

**Indexes**:
- Primary: `_id`
- Query: `contentId, order` (for sidebar display)
- Query: `sectionId` (for usage statistics)
- Query: `(sectionId, contentId)` (for duplicate link checking at UI level only)

**Relationships**:
- Belongs to: Section (sectionId → Section._id)
- Belongs to: Content (contentId → Tutorial._id or Blog._id)
- One Section can have many SectionLinks (1:N)
- One Content can have many SectionLinks (1:N)
- Creates many-to-many relationship between Section and Content

**State Transitions**:
```
[None] --create()--> [Linked]
[Linked] --reorder()--> [Linked] (order changed)
[Linked] --delete()--> [None] (unlinked, orphans posts)
```

---

### 3. Post (Existing - Modified)

**Description**: Content items (blog articles or tutorial posts) that belong to both a specific content and optionally a specific section.

**Schema**:
```typescript
interface Post {
  _id: string;              // MongoDB ObjectId
  title: string;            // Post title
  slug: string;             // URL-friendly identifier
  contentType: 'blog' | 'tutorial';
  contentId: string;        // Reference to Tutorial._id or Blog._id
  sectionId: string | null; // Reference to Section._id (NULL = orphaned)
  sectionOrder: number;     // Position within section (0-based)
  // ... other fields (body, author, status, etc.)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

**Modifications**:
- ✅ `sectionId`: Changed from `string` to `string | null` (allow orphaned state)
- ✅ Add validation: If `sectionId` is not null, must verify section is linked to `contentId`

**Validation Rules**:
- `title`: Required, 3-200 characters
- `slug`: Auto-generated from title, URL-safe, unique per contentId
- `contentType`: Required, enum ['blog', 'tutorial']
- `contentId`: Required, must reference existing Tutorial or Blog
- `sectionId`: Optional, if provided must reference existing Section
- **Business Rule**: If `sectionId` is not null, a SectionLink must exist for `(sectionId, contentId)`
- `sectionOrder`: Non-negative integer, unique per (contentId, sectionId)

**Indexes**:
- Primary: `_id`
- Unique: `(slug, contentId)`
- Query: `(contentId, sectionId, sectionOrder)` (for sidebar post listing)
- Query: `contentId, sectionId=null` (for orphaned posts query)

**State Transitions**:
```
[Assigned to Section] --section unlinked--> [Orphaned] (sectionId = null)
[Orphaned] --reassign()--> [Assigned to Section] (sectionId = newSectionId)
[Orphaned] --delete()--> [Deleted]
[Assigned] --move()--> [Assigned] (different sectionId)
```

---

### 4. Tutorial/Blog (Existing - Reference Only)

**Description**: Content entities that contain posts organized into sections. Not modified by this feature, but included for relationship clarity.

**Relevant Fields**:
```typescript
interface Tutorial {
  _id: string;
  title: string;
  slug: string;
  // ... other fields
}

interface Blog {
  _id: string;
  title: string;
  slug: string;
  // ... other fields
}
```

**Relationships**:
- Has many: SectionLinks (1:N via contentId)
- Has many: Posts (1:N via contentId)

---

### 5. SectionOwnershipTransfer (New - Transfer Request Entity)

**Description**: Tracks pending and completed section ownership transfer requests between trainers.

**Schema**:
```typescript
interface SectionOwnershipTransfer {
  _id: string;              // MongoDB ObjectId
  sectionId: string;        // Reference to Section._id
  fromTrainerId: string;    // Reference to current owner's Trainer._id
  toTrainerId: string;      // Reference to target trainer's Trainer._id
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message?: string;         // Optional message from requesting trainer
  requestedAt: string;      // ISO 8601 timestamp
  respondedAt?: string;     // ISO 8601 timestamp (when accepted/declined)
  completedAt?: string;     // ISO 8601 timestamp (when ownership transferred)
}
```

**Validation Rules**:
- `sectionId`: Required, must reference existing Section
- `fromTrainerId`: Required, must match current Section.trainerId
- `toTrainerId`: Required, must reference existing Trainer, cannot equal fromTrainerId
- `status`: Required, enum ['pending', 'accepted', 'declined', 'cancelled']
- **Business Rule**: Only one pending transfer allowed per section at a time

**Indexes**:
- Primary: `_id`
- Query: `sectionId, status` (check for pending transfers)
- Query: `toTrainerId, status` (list trainer's pending requests)
- Query: `fromTrainerId, status` (list trainer's sent requests)

**State Transitions**:
```
[None] --create()--> [Pending] (transfer request created)
[Pending] --accept()--> [Accepted] (target trainer accepts)
[Pending] --decline()--> [Declined] (target trainer declines)
[Pending] --cancel()--> [Cancelled] (source trainer cancels)
[Accepted] --complete()--> [Completed] (ownership transferred)
```

**Relationships**:
- Belongs to: Section (sectionId → Section._id)
- Belongs to: Trainer (fromTrainerId → Trainer._id)
- Belongs to: Trainer (toTrainerId → Trainer._id)

---

## Derived Data / Computed Fields

### Section Usage Statistics

**Description**: Calculate how many and which tutorials/blogs use a section.

**Query** (computed at runtime, not stored):
```typescript
interface SectionUsageStats {
  sectionId: string;
  usageCount: number;
  usedIn: Array<{
    contentId: string;
    contentType: 'blog' | 'tutorial';
    contentTitle: string;
  }>;
}
```

**SQL/MongoDB Query Logic**:
```javascript
// MongoDB aggregation
db.sectionLinks.aggregate([
  { $match: { sectionId: targetSectionId } },
  { $group: {
      _id: "$sectionId",
      usageCount: { $sum: 1 },
      contentIds: { $push: "$contentId" }
  }}
]);
```

**Performance**: Indexed on `sectionId`, typical response <50ms for 1000 links

---

### Orphaned Posts Count

**Description**: Count of posts without section assignment for a specific content.

**Query** (computed at runtime):
```typescript
interface OrphanedPostsCount {
  contentId: string;
  contentType: 'blog' | 'tutorial';
  orphanedCount: number;
}
```

**SQL/MongoDB Query Logic**:
```javascript
// MongoDB query
db.posts.countDocuments({
  contentId: targetContentId,
  sectionId: null
});
```

**Performance**: Indexed on `(contentId, sectionId)`, typical response <20ms

---

## Entity Relationships Diagram

```
┌─────────────────┐
│    Trainer      │
│                 │
│ _id             │
│ name            │
│ email           │
└────────┬────────┘
         │
         │ 1:N (owns)
         │
         ▼
┌─────────────────┐         ┌──────────────────────────┐
│    Section      │         │ SectionOwnershipTransfer │
│   (Global)      │◄────────┤       (Requests)         │
│                 │         │                          │
│ _id             │         │ _id                      │
│ title           │         │ sectionId                │
│ slug            │         │ fromTrainerId            │
│ trainerId       │─┐       │ toTrainerId              │
│ contentType     │ │       │ status                   │
│ iconName        │ │       └──────────────────────────┘
│ isVisible       │ │
└────────┬────────┘ │
         │          │ N:1 (owned by)
         │ 1:N      │
         │          ▼
         ▼       ┌─────────────────┐
┌─────────────────┐         │    Trainer      │
│  SectionLink    │         │  (Target)       │
│  (Junction)     │         └─────────────────┘
│                 │
│ _id             │         ┌─────────────────┐
│ sectionId       │◄───────►│  Tutorial/Blog  │
│ contentId       │         │   (Content)     │
│ order           │  N:1    │                 │
└─────────────────┘         │ _id             │
                            │ title           │
                            │ slug            │
                            └────────┬────────┘
                                     │
                                     │ 1:N
                                     │
                                     ▼
                             ┌─────────────────┐
                             │      Post       │
                             │                 │
                             │ _id             │
                             │ title           │
                             │ contentId       │
                             │ sectionId       │← Can be NULL
                             │ sectionOrder    │
                             └─────────────────┘
```

**Key Relationships**:
1. Trainer → Section: 1:N (one trainer owns many sections)
2. Section → SectionLink: 1:N (one section, many links - can be linked multiple times to same content)
3. Content → SectionLink: 1:N (one content, many sections)
4. Content → Post: 1:N (one content, many posts)
5. Section → Post: 1:N (one section, many posts) **via sectionId**
6. Post → Section: Optional (sectionId can be null = orphaned)
7. Section → SectionOwnershipTransfer: 1:N (one section, many transfer requests over time)
8. Trainer → SectionOwnershipTransfer: 1:N (from/to relationships)

---

## Validation Rules Summary

### Business Rules

1. **BR-001**: A section can be linked multiple times to the same content
   - Allowed for: Repeating patterns (e.g., "Exercise" section after each chapter)
   - Constraint: Each link must have unique order value within that contentId

2. **BR-002**: Posts can only be assigned to sections that are linked to their content
   - Enforced by: API validation before `Post.sectionId` update
   - Query: `SELECT * FROM SectionLink WHERE sectionId = X AND contentId = Y`

3. **BR-003**: Section ordering must be unique within a content
   - Enforced by: Reorder operation updates all affected SectionLink.order values
   - No two SectionLinks with same contentId can have same order

4. **BR-004**: Post ordering must be unique within a section
   - Enforced by: Reorder operation updates all affected Post.sectionOrder values
   - No two Posts with same (contentId, sectionId) can have same sectionOrder

5. **BR-005**: Cannot delete a section that is currently linked to any content
   - Enforced by: API check before Section.delete()
   - Query: `SELECT COUNT(*) FROM SectionLink WHERE sectionId = X`
   - If count > 0, return 409 Conflict error

6. **BR-006**: Circular parent-child relationships are forbidden
   - Enforced by: API validation before `Section.parentId` update
   - Traverse parent chain, ensure no loops

7. **BR-007**: Section depth cannot exceed maximum (5 levels)
   - Enforced by: API validation before `Section.create()` or `Section.update()`
   - Calculate depth from root, reject if > 5

8. **BR-008**: Orphaned posts persist until explicitly deleted or reassigned
   - Enforced by: Unlink operation sets `Post.sectionId = null` (UPDATE, not DELETE)

9. **BR-009**: Trainers can only edit/delete sections they own; admins can edit/delete any section
   - Enforced by: API authorization check comparing `Section.trainerId` to current user
   - Admins bypass this check

10. **BR-010**: Only one pending ownership transfer allowed per section at a time
    - Enforced by: API validation before creating SectionOwnershipTransfer
    - Query: `SELECT COUNT(*) FROM SectionOwnershipTransfer WHERE sectionId = X AND status = 'pending'`
    - If count > 0, return 409 Conflict error

11. **BR-011**: Ownership transfer requires explicit acceptance from target trainer
    - Enforced by: Transfer remains in 'pending' state until target trainer calls accept endpoint
    - Automatic ownership change only occurs after acceptance

12. **BR-012**: When trainer is deleted, all their sections are cascade deleted
    - Enforced by: Backend service on Trainer.delete()
    - Side effect: All posts in those sections become orphaned across all tutorials/blogs

13. **BR-013**: No hard limit on section creation per trainer
    - System design must support scaling to thousands of sections per trainer
    - UI should implement pagination/virtual scrolling for large section libraries

---

### Field-Level Validation

| Entity | Field | Type | Constraints | Error Message |
|--------|-------|------|-------------|---------------|
| Section | title | string | Required, 3-100 chars | "Title must be 3-100 characters" |
| Section | slug | string | Auto-generated, unique per contentType | "Slug already exists" |
| Section | contentType | enum | Required, 'blog' or 'tutorial' | "Invalid content type" |
| Section | depth | number | 0-5 | "Maximum nesting depth exceeded" |
| SectionLink | sectionId | string | Required, must exist | "Section not found" |
| SectionLink | contentId | string | Required, must exist | "Content not found" |
| SectionLink | (sectionId, contentId) | composite | Unique | "Section already linked to this content" |
| SectionLink | order | number | >= 0, unique per contentId | "Invalid order value" |
| Post | title | string | Required, 3-200 chars | "Title must be 3-200 characters" |
| Post | sectionId | string\|null | If not null, must exist + be linked | "Section not linked to this content" |
| Post | sectionOrder | number | >= 0, unique per (contentId, sectionId) | "Invalid order value" |

---

## State Machines

### SectionLink Lifecycle

```
┌──────────┐
│  [NONE]  │ (No link exists)
└────┬─────┘
     │
     │ CREATE (POST /section-links)
     │ Validation: sectionId + contentId exist, no duplicate
     │
     ▼
┌──────────┐
│ [LINKED] │ (Active relationship)
└────┬─────┘
     │
     ├─ REORDER (PATCH /section-links/:id/order)
     │  Validation: order >= 0, recalculate other links
     │  → Stays in [LINKED]
     │
     ├─ DELETE (DELETE /section-links/:id)
     │  Side Effect: Orphan all posts with this (contentId, sectionId)
     │  → Transitions to [NONE]
     │
     └─ CASCADE DELETE (Content deleted)
        → Transitions to [NONE]
```

### Post Assignment Lifecycle

```
┌──────────────┐
│  [ASSIGNED]  │ (sectionId = <valid-id>)
└──────┬───────┘
       │
       ├─ SECTION UNLINKED (DELETE /section-links/:id)
       │  → Transitions to [ORPHANED] (sectionId = null)
       │
       ├─ REASSIGN (POST /posts/:id/reassign)
       │  Validation: Target section linked to content
       │  → Stays in [ASSIGNED] (sectionId = new-id)
       │
       └─ MOVE (PATCH /posts/:id)
          → Stays in [ASSIGNED] (sectionOrder changed)

┌──────────────┐
│  [ORPHANED]  │ (sectionId = null)
└──────┬───────┘
       │
       ├─ REASSIGN (POST /posts/:id/reassign)
       │  Validation: Target section linked to content
       │  → Transitions to [ASSIGNED]
       │
       ├─ DELETE (DELETE /posts/:id)
       │  → Transitions to [DELETED] (permanent)
       │
       └─ CONTENT DELETED (CASCADE)
          → Transitions to [DELETED]
```

---

## Data Integrity Constraints

### Foreign Key Relationships

| Child Table | Child Column | Parent Table | Parent Column | On Delete Action |
|-------------|--------------|--------------|---------------|------------------|
| SectionLink | sectionId | Section | _id | RESTRICT (prevent deletion) |
| SectionLink | contentId | Tutorial/Blog | _id | CASCADE (remove link) |
| Post | sectionId | Section | _id | SET NULL (orphan post) |
| Post | contentId | Tutorial/Blog | _id | CASCADE (delete post) |

**Notes**:
- MongoDB doesn't enforce FK constraints natively; must be handled at application level
- Backend API must validate relationships before mutations
- Use transactions for multi-table operations (link/unlink with post updates)

---

### Cascading Operations

**When Trainer is deleted**:
- ✅ All Sections with this trainerId → DELETE CASCADE
- ✅ All SectionLinks referencing deleted sections → DELETE CASCADE (via section deletion)
- ✅ All Posts in deleted sections → Set sectionId = null (orphan across all tutorials)
- ✅ All pending SectionOwnershipTransfers (from or to this trainer) → DELETE CASCADE

**When Section is deleted**:
- ❌ BLOCKED if any SectionLinks exist (BR-005) **unless** triggered by trainer deletion cascade
- Action: Return 409 Conflict with list of affected content
- User must manually unlink from all content first (or admin can force delete)
- Exception: Trainer deletion cascade bypasses this check

**When SectionLink is deleted** (section unlinked from content):
- ✅ Posts with this (contentId, sectionId) → Set sectionId = null
- ✅ Preserve posts (don't delete)
- ✅ Log orphaned post count for observability

**When Content is deleted**:
- ✅ All SectionLinks with this contentId → DELETE CASCADE
- ✅ All Posts with this contentId → DELETE CASCADE
- ⚠️ Section entities remain untouched (reusable)

**When Post is reassigned to new section**:
- ✅ Validate new sectionId is linked to post's contentId
- ✅ Update sectionOrder (append to end of new section)
- ✅ Recalculate sectionOrder of old section (fill gap)

**When Section ownership is transferred**:
- ✅ Update Section.trainerId to new owner
- ✅ Update SectionOwnershipTransfer.status to 'accepted' and set completedAt
- ✅ All existing SectionLinks remain unchanged (section stays linked to same tutorials)
- ✅ Original owner loses edit/delete permissions
- ✅ New owner gains edit/delete permissions

---

## Query Patterns & Performance

### Common Queries

**Q1: Get all sections linked to a tutorial** (for sidebar display)
```javascript
db.sectionLinks.find({
  contentId: tutorialId
}).sort({ order: 1 });
```
**Expected Performance**: <20ms, Index: (contentId, order)

---

**Q2: Get all posts in a section for a tutorial** (for sidebar post list)
```javascript
db.posts.find({
  contentId: tutorialId,
  sectionId: sectionId
}).sort({ sectionOrder: 1 });
```
**Expected Performance**: <30ms, Index: (contentId, sectionId, sectionOrder)

---

**Q3: Get orphaned posts for a tutorial** (for "Unassigned Posts" view)
```javascript
db.posts.find({
  contentId: tutorialId,
  sectionId: null
}).sort({ createdAt: -1 });
```
**Expected Performance**: <25ms, Index: (contentId, sectionId)

---

**Q4: Get usage statistics for a section** (for admin view)
```javascript
db.sectionLinks.aggregate([
  { $match: { sectionId: sectionId } },
  {
    $lookup: {
      from: "tutorials", // or "blogs"
      localField: "contentId",
      foreignField: "_id",
      as: "content"
    }
  },
  { $unwind: "$content" },
  {
    $project: {
      contentId: 1,
      contentType: 1,
      contentTitle: "$content.title"
    }
  }
]);
```
**Expected Performance**: <100ms, Index: sectionId

---

**Q5: Search sections by title** (for link modal)
```javascript
db.sections.find({
  contentType: "tutorial",
  isVisible: true,
  title: { $regex: searchTerm, $options: "i" }
}).sort({ title: 1 }).limit(20);
```
**Expected Performance**: <50ms, Index: (contentType, isVisible, title)

---

**Q6: Reorder section within content** (drag-drop)
```javascript
// Move section from order 2 to order 5
// Step 1: Get current order
const link = await db.sectionLinks.findOne({ _id: linkId });

// Step 2: Shift orders of affected links
await db.sectionLinks.updateMany(
  {
    contentId: link.contentId,
    order: { $gte: newOrder, $lte: oldOrder }
  },
  { $inc: { order: -1 } }
);

// Step 3: Update target link
await db.sectionLinks.updateOne(
  { _id: linkId },
  { $set: { order: newOrder } }
);
```
**Expected Performance**: <100ms (use transaction)

---

## Migration Strategy

### Phase 1: Add New Schema

**Actions**:
1. Create `SectionLink` collection/table with indexes
2. Modify `Post` schema to allow `sectionId: null`
3. Deploy backend with new endpoints (backward compatible)

**Validation**:
- Old API endpoints still work
- New endpoints return 404 or empty results (no data yet)

---

### Phase 2: Data Migration (if needed)

**Scenario**: If existing sections are already "linked" implicitly (e.g., sections created per tutorial)

**Migration Script** (pseudocode):
```javascript
// For each tutorial
const tutorials = await db.tutorials.find({});

for (const tutorial of tutorials) {
  // Find sections used by this tutorial's posts
  const usedSections = await db.posts.distinct("sectionId", {
    contentId: tutorial._id
  });

  // Create SectionLinks
  for (let i = 0; i < usedSections.length; i++) {
    await db.sectionLinks.insertOne({
      sectionId: usedSections[i],
      contentId: tutorial._id,
      contentType: "tutorial",
      order: i,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
```

**Rollback Plan**:
- Delete all SectionLinks
- Posts remain unchanged (sectionId still valid)

---

### Phase 3: Frontend Deployment

**Actions**:
1. Deploy new frontend with section management UI
2. Enable feature flag for beta users
3. Monitor for errors, orphaned posts accumulation
4. Full rollout after 1 week

---

## Sample Data

### Section
```json
{
  "_id": "section_001",
  "title": "Introduction",
  "slug": "introduction",
  "description": "Getting started with the topic",
  "iconName": "IconBook",
  "contentType": "tutorial",
  "parentId": null,
  "depth": 0,
  "order": 1,
  "isVisible": true,
  "createdAt": "2025-01-29T10:00:00Z",
  "updatedAt": "2025-01-29T10:00:00Z"
}
```

### SectionLink
```json
{
  "_id": "link_001",
  "sectionId": "section_001",
  "contentId": "tutorial_123",
  "contentType": "tutorial",
  "order": 0,
  "createdAt": "2025-01-29T12:00:00Z",
  "updatedAt": "2025-01-29T12:00:00Z"
}
```

### Post (Assigned)
```json
{
  "_id": "post_001",
  "title": "What is React?",
  "slug": "what-is-react",
  "contentType": "tutorial",
  "contentId": "tutorial_123",
  "sectionId": "section_001",
  "sectionOrder": 0,
  "body": "React is a JavaScript library...",
  "createdAt": "2025-01-29T14:00:00Z",
  "updatedAt": "2025-01-29T14:00:00Z"
}
```

### Post (Orphaned)
```json
{
  "_id": "post_002",
  "title": "Advanced Hooks",
  "slug": "advanced-hooks",
  "contentType": "tutorial",
  "contentId": "tutorial_123",
  "sectionId": null,
  "sectionOrder": 0,
  "body": "In this post we cover...",
  "createdAt": "2025-01-29T15:00:00Z",
  "updatedAt": "2025-01-29T15:00:00Z"
}
```

---

## Conclusion

This data model supports all functional requirements:
- ✅ Many-to-many Section ↔ Content relationship (FR-003)
- ✅ Per-content section ordering (FR-011, FR-012)
- ✅ Orphaned post tracking (FR-021, FR-022)
- ✅ Usage statistics (FR-010)
- ✅ Hierarchical sections (FR-014, existing feature)
- ✅ Circular reference prevention (FR-015)
- ✅ Referential integrity (FR-017)

**Ready for**: Contract design (Phase 1 continued) and task breakdown (Phase 2).

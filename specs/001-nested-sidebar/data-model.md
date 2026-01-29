# Data Model: Nested Content Sidebar

**Feature**: 001-nested-sidebar  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

This document defines the MongoDB schemas and data relationships for the nested sidebar feature. The model supports hierarchical organization of blog posts and tutorials through a self-referential section structure.

## Entity Relationship Diagram

```
┌─────────────────┐
│     Section     │
│  (hierarchy)    │
└────────┬────────┘
         │ 1
         │ has parent
         │ (self-referential)
         │ *
         ├─────────┐
         │         │
         │ 1       │ 1
         │         │
         │ *       │ *
    ┌────┴───┐  ┌─┴────────┐
    │  Blog  │  │ Tutorial │
    └────────┘  └──────────┘
         │           │
         │ *         │ *
         │           │
         │ 1         │ 1
    ┌────┴───────────┴────┐
    │        Icon         │
    └─────────────────────┘
```

## Schemas

### 1. Section Schema

**Collection**: `sections`  
**Purpose**: Organize blog posts and tutorials into hierarchical categories

```typescript
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sectionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
      match: /^[a-z0-9-]+$/,
      index: true,
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    
    iconName: {
      type: String,
      required: true,
      default: "IconFolder",
      // References icon names from Tabler Icons (e.g., "IconBook", "IconCode")
    },
    
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
      index: true,
    },
    
    order: {
      type: Number,
      required: true,
      default: 0,
      index: true,
    },
    
    contentType: {
      type: String,
      required: true,
      enum: ["blog", "tutorial"],
      index: true,
    },
    
    // Denormalized depth for quick validation (prevents deep nesting)
    depth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 3, // Max depth of 3 allows 4 levels (0, 1, 2, 3)
    },
    
    // Count of direct children (for UI display)
    childCount: {
      type: Number,
      default: 0,
    },
    
    // Count of posts directly assigned to this section
    postCount: {
      type: Number,
      default: 0,
    },
    
    // Visibility flag
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Admin metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: "sections",
  }
);

// Compound indexes for efficient queries
sectionSchema.index({ parentId: 1, order: 1 }); // Get children sorted
sectionSchema.index({ contentType: 1, parentId: 1 }); // Get top-level by type
sectionSchema.index({ contentType: 1, isVisible: 1 }); // Public sidebar query

// Virtual for children (populated dynamically)
sectionSchema.virtual("children", {
  ref: "Section",
  localField: "_id",
  foreignField: "parentId",
});

// Virtual for posts (populated dynamically)
sectionSchema.virtual("posts", {
  ref: "Tutorial", // Or "Blog" depending on contentType
  localField: "_id",
  foreignField: "sectionId",
});

// Pre-save middleware to calculate depth
sectionSchema.pre("save", async function (next) {
  if (this.isModified("parentId") || this.isNew) {
    if (this.parentId) {
      const parent = await mongoose.model("Section").findById(this.parentId);
      if (!parent) {
        return next(new Error("Parent section not found"));
      }
      this.depth = parent.depth + 1;
      
      if (this.depth > 3) {
        return next(new Error("Maximum nesting depth (4 levels) exceeded"));
      }
    } else {
      this.depth = 0;
    }
  }
  next();
});

// Pre-remove middleware to handle cascading
sectionSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  const childSections = await mongoose.model("Section").find({ parentId: this._id });
  
  if (childSections.length > 0) {
    return next(new Error("Cannot delete section with child sections. Delete children first."));
  }
  
  // Check for assigned posts
  const tutorialCount = await mongoose.model("Tutorial").countDocuments({ sectionId: this._id });
  // const blogCount = await mongoose.model("Blog").countDocuments({ sectionId: this._id });
  
  if (tutorialCount > 0) {
    return next(new Error(`Cannot delete section with ${tutorialCount} assigned tutorials. Reassign them first.`));
  }
  
  next();
});

// Update parent's childCount after save
sectionSchema.post("save", async function (doc) {
  if (doc.parentId) {
    await mongoose.model("Section").updateOne(
      { _id: doc.parentId },
      { $inc: { childCount: 1 } }
    );
  }
});

// Update parent's childCount after delete
sectionSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  if (doc.parentId) {
    await mongoose.model("Section").updateOne(
      { _id: doc.parentId },
      { $inc: { childCount: -1 } }
    );
  }
});

export const Section = mongoose.model("Section", sectionSchema);
export default Section;
```

### 2. Icon Schema

**Collection**: `icons`  
**Purpose**: Curated list of available icons for section selection

```typescript
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const iconSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Icon component name from Tabler Icons (e.g., "IconBook", "IconCode")
    },
    
    displayName: {
      type: String,
      required: true,
      trim: true,
      // Human-readable name (e.g., "Book", "Code")
    },
    
    category: {
      type: String,
      required: true,
      enum: [
        "general",
        "technology",
        "education",
        "business",
        "design",
        "communication",
        "media",
        "development",
        "science",
        "other"
      ],
      default: "general",
      index: true,
    },
    
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    usageCount: {
      type: Number,
      default: 0,
      // Track popularity for sorting
    },
  },
  {
    timestamps: true,
    collection: "icons",
  }
);

// Index for search
iconSchema.index({ displayName: "text", tags: "text" });
iconSchema.index({ category: 1, usageCount: -1 }); // Popular icons in category

export const Icon = mongoose.model("Icon", iconSchema);
export default Icon;
```

### 3. Tutorial Schema (Modified)

**Collection**: `tutorials`  
**Purpose**: Individual tutorial content - MODIFIED to add section reference

```typescript
import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Existing cloudinaryAssetSchema and tutorialSubdocumentSchema remain unchanged
// ... (keeping existing schema structure)

const tutorialSchema = new Schema(
  {
    // EXISTING FIELDS (unchanged)
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    nestedSubCategory: {
      type: String,
      trim: true,
    },
    tutorials: [tutorialSubdocumentSchema],
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    cloudinaryAssets: [cloudinaryAssetSchema],
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    
    // NEW FIELD: Section assignment for nested sidebar
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
      index: true,
      // Optional: allows gradual migration from old system
    },
    
    // NEW FIELD: Display order within section
    sectionOrder: {
      type: Number,
      default: 0,
      // Order relative to other posts in the same section
    },
  },
  {
    timestamps: true,
    collection: "tutorials",
  }
);

// NEW: Compound index for section-based queries
tutorialSchema.index({ sectionId: 1, sectionOrder: 1 });
tutorialSchema.index({ sectionId: 1, published: 1 });

// Update section's postCount when tutorial is assigned
tutorialSchema.post("save", async function (doc) {
  if (doc.sectionId) {
    await mongoose.model("Section").updateOne(
      { _id: doc.sectionId },
      { $inc: { postCount: 1 } }
    );
  }
});

// Decrement postCount when tutorial is removed or reassigned
tutorialSchema.pre("save", async function (next) {
  if (this.isModified("sectionId") && !this.isNew) {
    const original = await mongoose.model("Tutorial").findById(this._id);
    if (original && original.sectionId) {
      await mongoose.model("Section").updateOne(
        { _id: original.sectionId },
        { $inc: { postCount: -1 } }
      );
    }
  }
  next();
});

export const Tutorial = mongoose.model("Tutorial", tutorialSchema);
export default Tutorial;
```

### 4. Blog Schema (To Be Determined)

**Note**: The blog schema location needs to be identified in the codebase. Once found, it will receive the same modifications as the Tutorial schema:

```typescript
// MODIFICATIONS TO BE ADDED:
{
  // ... existing blog fields ...
  
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    default: null,
    index: true,
  },
  
  sectionOrder: {
    type: Number,
    default: 0,
  },
}

// INDEXES TO BE ADDED:
blogSchema.index({ sectionId: 1, sectionOrder: 1 });
blogSchema.index({ sectionId: 1, published: 1 });
```

## Data Relationships

### Section → Section (Self-Referential)
- **Type**: One-to-Many
- **Relationship**: `parentId` references another Section's `_id`
- **Cardinality**: One section can have many child sections
- **Constraints**: 
  - Top-level sections have `parentId: null`
  - Maximum depth: 4 levels (depth 0-3)
  - Circular references prevented by depth tracking

### Section → Tutorial
- **Type**: One-to-Many
- **Relationship**: Tutorial's `sectionId` references Section's `_id`
- **Cardinality**: One section can have many tutorials
- **Constraints**: 
  - A tutorial belongs to 0 or 1 section (`sectionId` optional)
  - Sorted by `sectionOrder` within section

### Section → Blog
- **Type**: One-to-Many
- **Relationship**: Blog's `sectionId` references Section's `_id`
- **Cardinality**: One section can have many blogs
- **Constraints**: Same as tutorials

### Section → Icon
- **Type**: Many-to-One
- **Relationship**: Section's `iconName` references Icon's `name` (soft reference)
- **Cardinality**: Many sections can use the same icon
- **Constraints**: Icon must exist in `icons` collection

## Field Validation Rules

### Section Entity

| Field       | Type     | Required | Validation                                                    |
| ----------- | -------- | -------- | ------------------------------------------------------------- |
| title       | String   | Yes      | 1-100 chars, trimmed                                          |
| slug        | String   | Yes      | Unique, lowercase, alphanumeric + hyphens, 1-150 chars        |
| description | String   | No       | 0-500 chars                                                   |
| iconName    | String   | Yes      | Must match Tabler Icon component name                         |
| parentId    | ObjectId | No       | Must reference existing Section, null for top-level           |
| order       | Number   | Yes      | Non-negative integer, unique within parent                    |
| contentType | Enum     | Yes      | "blog" or "tutorial"                                          |
| depth       | Number   | Yes      | 0-3 (auto-calculated from parent)                             |
| isVisible   | Boolean  | Yes      | Default true                                                  |
| childCount  | Number   | Auto     | Auto-maintained via hooks                                     |
| postCount   | Number   | Auto     | Auto-maintained via hooks                                     |

### Icon Entity

| Field       | Type     | Required | Validation                     |
| ----------- | -------- | -------- | ------------------------------ |
| name        | String   | Yes      | Unique, Tabler Icon name       |
| displayName | String   | Yes      | Human-readable label           |
| category    | Enum     | Yes      | One of predefined categories   |
| tags        | String[] | No       | Lowercase, for search          |
| isActive    | Boolean  | Yes      | Default true                   |
| usageCount  | Number   | Auto     | Incremented when icon selected |

### Tutorial/Blog Additions

| Field        | Type     | Required | Validation                               |
| ------------ | -------- | -------- | ---------------------------------------- |
| sectionId    | ObjectId | No       | Must reference existing Section          |
| sectionOrder | Number   | Yes      | Non-negative integer, default 0          |

## Query Patterns

### 1. Get Full Sidebar Hierarchy for Content Type

```javascript
// Get all sections for blog sidebar
const sections = await Section.find({
  contentType: "blog",
  isVisible: true
})
  .sort({ order: 1 })
  .lean();

// Build tree client-side (more efficient than recursive queries)
function buildTree(sections, parentId = null) {
  return sections
    .filter(s => s.parentId?.toString() === parentId?.toString())
    .map(section => ({
      ...section,
      children: buildTree(sections, section._id)
    }));
}

const tree = buildTree(sections);
```

### 2. Get Section with Posts

```javascript
// Get section with all assigned tutorials
const section = await Section.findById(sectionId)
  .populate({
    path: "posts",
    match: { published: true },
    options: { sort: { sectionOrder: 1 } }
  });
```

### 3. Get Breadcrumb Trail

```javascript
async function getBreadcrumb(sectionId) {
  const trail = [];
  let currentId = sectionId;
  
  while (currentId) {
    const section = await Section.findById(currentId).select("title parentId");
    if (!section) break;
    trail.unshift({ _id: section._id, title: section.title });
    currentId = section.parentId;
  }
  
  return trail;
}
```

### 4. Reorder Sections

```javascript
// Batch update order for multiple sections
async function reorderSections(updates) {
  const bulkOps = updates.map(({ _id, order }) => ({
    updateOne: {
      filter: { _id },
      update: { $set: { order } }
    }
  }));
  
  await Section.bulkWrite(bulkOps);
}
```

### 5. Search Icons

```javascript
// Full-text search with category filter
const icons = await Icon.find({
  $text: { $search: searchTerm },
  category: categoryFilter,
  isActive: true
})
  .sort({ usageCount: -1, displayName: 1 })
  .limit(50);
```

## Migration Scripts

### Initial Section Seeding

```javascript
// scripts/seed-sections.js
const defaultSections = [
  // Blog sections
  { 
    title: "Web Development", 
    iconName: "IconWorld", 
    contentType: "blog", 
    order: 1 
  },
  { 
    title: "Mobile Development", 
    iconName: "IconDeviceMobile", 
    contentType: "blog", 
    order: 2 
  },
  
  // Tutorial sections
  { 
    title: "Getting Started", 
    iconName: "IconRocket", 
    contentType: "tutorial", 
    order: 1 
  },
  { 
    title: "Advanced Topics", 
    iconName: "IconBrain", 
    contentType: "tutorial", 
    order: 2 
  },
];

for (const sectionData of defaultSections) {
  const slug = slugify(sectionData.title);
  await Section.create({ ...sectionData, slug });
}
```

### Icon Library Seeding

```javascript
// scripts/seed-icons.js
const curatedIcons = [
  { name: "IconBook", displayName: "Book", category: "education", tags: ["read", "learn"] },
  { name: "IconCode", displayName: "Code", category: "development", tags: ["programming", "dev"] },
  { name: "IconBrain", displayName: "Brain", category: "education", tags: ["think", "learn"] },
  { name: "IconRocket", displayName: "Rocket", category: "general", tags: ["start", "launch"] },
  { name: "IconWorld", displayName: "World", category: "general", tags: ["globe", "web"] },
  // ... add 45+ more commonly used icons
];

await Icon.insertMany(curatedIcons);
```

### Add sectionId to Existing Tutorials

```javascript
// scripts/migrate-tutorials-to-sections.js
const defaultSection = await Section.findOne({ 
  title: "Uncategorized", 
  contentType: "tutorial" 
});

if (!defaultSection) {
  const defaultSection = await Section.create({
    title: "Uncategorized",
    slug: "uncategorized",
    iconName: "IconFolder",
    contentType: "tutorial",
    order: 999
  });
}

await Tutorial.updateMany(
  { sectionId: { $exists: false } },
  { $set: { sectionId: defaultSection._id, sectionOrder: 0 } }
);
```

## Indexes Summary

### Section Collection
```javascript
db.sections.createIndex({ slug: 1 }, { unique: true });
db.sections.createIndex({ parentId: 1, order: 1 });
db.sections.createIndex({ contentType: 1, parentId: 1 });
db.sections.createIndex({ contentType: 1, isVisible: 1 });
db.sections.createIndex({ title: 1 });
db.sections.createIndex({ parentId: 1 });
db.sections.createIndex({ order: 1 });
db.sections.createIndex({ isVisible: 1 });
```

### Icon Collection
```javascript
db.icons.createIndex({ name: 1 }, { unique: true });
db.icons.createIndex({ category: 1, usageCount: -1 });
db.icons.createIndex({ displayName: "text", tags: "text" });
db.icons.createIndex({ isActive: 1 });
```

### Tutorial Collection (New)
```javascript
db.tutorials.createIndex({ sectionId: 1, sectionOrder: 1 });
db.tutorials.createIndex({ sectionId: 1, published: 1 });
```

### Blog Collection (New)
```javascript
db.blogs.createIndex({ sectionId: 1, sectionOrder: 1 });
db.blogs.createIndex({ sectionId: 1, published: 1 });
```

## Data Integrity Constraints

### Enforced at Application Level
1. **Circular Reference Prevention**: Section cannot be its own ancestor (checked via depth calculation)
2. **Orphan Prevention**: Deleting section requires reassigning or deleting child sections/posts
3. **Depth Limit**: Maximum 4 levels (depth 0-3) enforced via pre-save hook
4. **Slug Uniqueness**: Automatic numeric suffix if duplicate title

### Enforced at Database Level
1. **Unique Constraints**: `sections.slug`, `icons.name`
2. **Enum Constraints**: `contentType`, `icon.category`
3. **Reference Integrity**: ObjectId references (soft - no foreign keys in MongoDB)

## Performance Considerations

### Query Optimization
- Compound indexes for common query patterns
- Denormalized `childCount` and `postCount` for UI display (avoid count queries)
- Lean queries when full Mongoose documents not needed
- Client-side tree building (one query vs. N+1 recursive queries)

### Write Optimization
- Bulk operations for reordering
- Conditional hooks (only run when specific fields modified)
- Sparse unique index on `slug` (allows multiple null values during creation)

### Caching Strategy
- Cache full sidebar tree per content type (invalidate on section CRUD)
- Cache icon list (rarely changes)
- Use Redis if needed (existing infrastructure at `REDIS_PORT=6379`)

## Future Enhancements

### Potential Schema Extensions
1. **Section Metadata**: Add `metadata` JSONB field for custom attributes
2. **Access Control**: Add `permissions` array for role-based section visibility
3. **Versioning**: Add `version` field and archive old section structures
4. **Localization**: Add `translations` map for multi-language support
5. **Analytics**: Add `viewCount`, `clickCount` fields for popular sections

### Optimization Opportunities
1. **Materialized Path**: If query patterns change, consider adding `path` field (e.g., `/tech/javascript/react`)
2. **Full-Text Search**: Add `searchVector` field for advanced section search
3. **Soft Delete**: Add `deletedAt` field instead of hard deletes

---

**Next Steps**: 
- [x] Complete data model documentation
- [ ] Define API contracts (Phase 1)
- [ ] Write quickstart guide (Phase 1)
- [ ] Generate implementation tasks (Phase 2)

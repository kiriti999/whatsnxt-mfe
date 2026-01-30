# Quick Start Guide: Reusable Sections with Manual Linking

**Feature**: 002-reusable-sections  
**Audience**: Developers implementing this feature  
**Time to Read**: 10 minutes

## Overview

This guide provides a practical walkthrough for implementing and using the reusable sections feature. Trainers can create organizational sections (like "Introduction", "Best Practices") and link them to multiple tutorials/blogs while maintaining separate posts within each.

---

## Architecture at a Glance

```
┌────────────────────────────────────────────────┐
│              Frontend (Next.js)                │
│                                                │
│  ┌──────────────┐      ┌───────────────────┐ │
│  │  UI Layer    │──────│  API Client Layer │ │
│  │  (Mantine)   │      │  (xior/axios)     │ │
│  └──────────────┘      └─────────┬─────────┘ │
└──────────────────────────────────┼────────────┘
                                   │ HTTP
                        ┌──────────▼──────────┐
                        │  Backend (Express)  │
                        │  Port 4444          │
                        │                     │
                        │  ┌────────────────┐ │
                        │  │   MongoDB      │ │
                        │  │   Collections: │ │
                        │  │   - sections   │ │
                        │  │   - sectionLinks│ │
                        │  │   - posts      │ │
                        │  └────────────────┘ │
                        └─────────────────────┘
```

**Key Entities**:
- `Section`: Global reusable definition
- `SectionLink`: Many-to-many junction (Section ↔ Tutorial/Blog)
- `Post`: Content items, can be orphaned (sectionId = null)

---

## 5-Minute Implementation Checklist

### Backend (Separate Repository)

**Location**: `apps/whatsnxt-bff/`

1. **Create Model** (`app/models/SectionLink.js`):
```javascript
const mongoose = require('mongoose');

const sectionLinkSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['blog', 'tutorial'], required: true },
  order: { type: Number, required: true, default: 0 }
}, { timestamps: true });

// Unique constraint
sectionLinkSchema.index({ sectionId: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('SectionLink', sectionLinkSchema);
```

2. **Create Service** (`app/services/sectionLinkService.js`):
```javascript
const SectionLink = require('../models/SectionLink');
const Post = require('../models/Post');

exports.createLink = async (sectionId, contentId, contentType, order) => {
  // Check for duplicate
  const existing = await SectionLink.findOne({ sectionId, contentId });
  if (existing) throw new Error('DUPLICATE_LINK');
  
  return await SectionLink.create({ sectionId, contentId, contentType, order });
};

exports.deleteLink = async (linkId) => {
  const link = await SectionLink.findById(linkId);
  if (!link) throw new Error('NOT_FOUND');
  
  // Orphan posts
  const result = await Post.updateMany(
    { contentId: link.contentId, sectionId: link.sectionId },
    { $set: { sectionId: null } }
  );
  
  await link.deleteOne();
  return { orphanedCount: result.modifiedCount };
};
```

3. **Create Routes** (`app/routes/sectionLinks.js`):
```javascript
const express = require('express');
const router = express.Router();
const sectionLinkService = require('../services/sectionLinkService');

router.post('/section-links', async (req, res) => {
  const { sectionId, contentId, contentType, order } = req.body;
  const link = await sectionLinkService.createLink(sectionId, contentId, contentType, order);
  res.status(201).json({ success: true, data: link });
});

router.delete('/section-links/:linkId', async (req, res) => {
  const result = await sectionLinkService.deleteLink(req.params.linkId);
  res.json({ success: true, data: result });
});

module.exports = router;
```

---

### Frontend (This Repository)

**Location**: `apps/web/`

1. **Create API Client** (`apis/v1/sidebar/sectionLinksApi.ts`):
```typescript
import xior from 'xior';

const apiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true
});

export interface SectionLink {
  _id: string;
  sectionId: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  order: number;
}

export const SectionLinksAPI = {
  createLink: async (data: {
    sectionId: string;
    contentId: string;
    contentType: 'blog' | 'tutorial';
    order?: number;
  }): Promise<SectionLink> => {
    const response = await apiClient.post('/api/v1/sidebar/section-links', data);
    return response.data.data;
  },

  deleteLink: async (linkId: string): Promise<{ orphanedCount: number }> => {
    const response = await apiClient.delete(`/api/v1/sidebar/section-links/${linkId}`);
    return response.data.data;
  },

  getLinksForContent: async (contentId: string): Promise<SectionLink[]> => {
    const response = await apiClient.get(`/api/v1/sidebar/section-links?contentId=${contentId}`);
    return response.data.data;
  }
};
```

2. **Create Link Section Modal** (`components/Admin/LinkSectionModal.tsx`):
```typescript
import { Modal, TextInput, Button, Table } from '@mantine/core';
import { useState } from 'react';
import { SectionsAPI } from '@/apis/v1/sidebar/sectionsApi';
import { SectionLinksAPI } from '@/apis/v1/sidebar/sectionLinksApi';

interface Props {
  opened: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'blog' | 'tutorial';
}

export const LinkSectionModal = ({ opened, onClose, contentId, contentType }: Props) => {
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState([]);

  const handleLink = async (sectionId: string) => {
    await SectionLinksAPI.createLink({ sectionId, contentId, contentType });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Link Existing Section">
      <TextInput
        placeholder="Search sections..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        {sections.map(section => (
          <Table.Tr key={section._id}>
            <Table.Td>{section.title}</Table.Td>
            <Table.Td>
              <Button onClick={() => handleLink(section._id)}>Link</Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table>
    </Modal>
  );
};
```

3. **Add to Tutorial Editor**:
```typescript
// In tutorial editing page
import { LinkSectionModal } from '@/components/Admin/LinkSectionModal';

const [linkModalOpen, setLinkModalOpen] = useState(false);

return (
  <>
    <Button onClick={() => setLinkModalOpen(true)}>Add Existing Section</Button>
    
    <LinkSectionModal
      opened={linkModalOpen}
      onClose={() => setLinkModalOpen(false)}
      contentId={tutorialId}
      contentType="tutorial"
    />
  </>
);
```

---

## Common User Flows

### Flow 1: Link Section to Tutorial

**User Action**: Trainer clicks "Add Existing Section" in tutorial editor

**Steps**:
1. Open modal with searchable section list
2. Search for "Introduction"
3. Click "Link" button
4. Modal closes, section appears in sidebar
5. Trainer can now add posts to this section

**API Calls**:
```
GET /api/v1/sidebar/sections?contentType=tutorial
POST /api/v1/sidebar/section-links
  Body: { sectionId, contentId, contentType: 'tutorial' }
GET /api/v1/sidebar/section-links?contentId=<tutorialId>
```

---

### Flow 2: Unlink Section (with Posts)

**User Action**: Trainer clicks ✕ button next to "Advanced Topics" section

**Steps**:
1. Show confirmation modal: "3 posts will become unassigned"
2. Trainer clicks "Unlink Anyway"
3. Section removed from sidebar
4. Badge appears: "Unassigned Posts (3)"
5. Trainer can reassign posts to other sections

**API Calls**:
```
DELETE /api/v1/sidebar/section-links/<linkId>
  Response: { orphanedCount: 3 }
GET /api/v1/content/<tutorialId>/orphaned-posts
```

---

### Flow 3: Reassign Orphaned Post

**User Action**: Trainer clicks "Unassigned Posts (5)" in sidebar

**Steps**:
1. Expand to show 5 orphaned posts
2. Click dropdown next to "Advanced Hooks" post
3. Select "Best Practices" section
4. Post moves to "Best Practices" section
5. Badge updates to "Unassigned Posts (4)"

**API Calls**:
```
POST /api/v1/posts/<postId>/reassign
  Body: { sectionId: <bestPracticesSectionId> }
```

---

## Testing Guide

### Unit Tests (Vitest)

**Test API Client** (`__tests__/apis/sectionLinksApi.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { SectionLinksAPI } from '@/apis/v1/sidebar/sectionLinksApi';

describe('SectionLinksAPI', () => {
  it('should create a section link', async () => {
    const link = await SectionLinksAPI.createLink({
      sectionId: 'section123',
      contentId: 'tutorial456',
      contentType: 'tutorial'
    });
    
    expect(link).toHaveProperty('_id');
    expect(link.sectionId).toBe('section123');
  });

  it('should handle duplicate link error', async () => {
    await expect(
      SectionLinksAPI.createLink({
        sectionId: 'section123',
        contentId: 'tutorial456',
        contentType: 'tutorial'
      })
    ).rejects.toThrow('DUPLICATE_LINK');
  });
});
```

**Test Component** (`__tests__/components/LinkSectionModal.test.tsx`):
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LinkSectionModal } from '@/components/Admin/LinkSectionModal';

it('should link section on button click', async () => {
  render(
    <LinkSectionModal
      opened={true}
      onClose={jest.fn()}
      contentId="tutorial123"
      contentType="tutorial"
    />
  );
  
  const linkButton = screen.getByText('Link');
  fireEvent.click(linkButton);
  
  // Verify API was called
  expect(mockCreateLink).toHaveBeenCalledWith({
    sectionId: 'section123',
    contentId: 'tutorial123',
    contentType: 'tutorial'
  });
});
```

---

### Integration Tests

**Full Flow Test**:
```typescript
it('should handle section link lifecycle', async () => {
  // 1. Create tutorial
  const tutorial = await createTutorial('React Guide');
  
  // 2. Link section
  const link = await SectionLinksAPI.createLink({
    sectionId: 'intro-section',
    contentId: tutorial._id,
    contentType: 'tutorial'
  });
  
  // 3. Add post to section
  const post = await createPost({
    contentId: tutorial._id,
    sectionId: 'intro-section',
    title: 'What is React?'
  });
  
  // 4. Unlink section
  const result = await SectionLinksAPI.deleteLink(link._id);
  expect(result.orphanedCount).toBe(1);
  
  // 5. Verify post is orphaned
  const orphaned = await getOrphanedPosts(tutorial._id);
  expect(orphaned).toHaveLength(1);
  expect(orphaned[0]._id).toBe(post._id);
});
```

---

## Troubleshooting

### Issue: "Section already linked" error

**Cause**: Attempting to link the same section twice to the same content

**Solution**: Check existing links before showing section in modal
```typescript
const linkedSectionIds = links.map(l => l.sectionId);
const availableSections = allSections.filter(s => !linkedSectionIds.includes(s._id));
```

---

### Issue: Orphaned posts not appearing

**Cause**: Query filtering out posts with `sectionId: null`

**Solution**: Explicitly query for null sectionId
```typescript
const orphaned = await Post.find({
  contentId: tutorialId,
  sectionId: null  // Explicitly check for null
});
```

---

### Issue: Performance slow with 50+ sections

**Cause**: Missing database indexes

**Solution**: Create compound indexes
```javascript
// In SectionLink model
sectionLinkSchema.index({ contentId: 1, order: 1 });
sectionLinkSchema.index({ sectionId: 1 });

// In Post model
postSchema.index({ contentId: 1, sectionId: 1, sectionOrder: 1 });
```

---

## Performance Tips

1. **Use TanStack Query caching**:
```typescript
const { data: links } = useQuery({
  queryKey: ['sectionLinks', contentId],
  queryFn: () => SectionLinksAPI.getLinksForContent(contentId),
  staleTime: 5 * 60 * 1000 // 5 min cache
});
```

2. **Optimistic updates for reordering**:
```typescript
const mutation = useMutation({
  mutationFn: SectionLinksAPI.reorder,
  onMutate: async (newData) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries(['sectionLinks']);
    
    // Optimistically update UI
    queryClient.setQueryData(['sectionLinks', contentId], (old) => {
      return reorderArray(old, newData);
    });
  }
});
```

3. **Paginate large lists**:
```typescript
// For 50+ sections or orphaned posts
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['orphanedPosts', contentId],
  queryFn: ({ pageParam = 0 }) => 
    getOrphanedPosts(contentId, { page: pageParam, limit: 20 }),
  getNextPageParam: (lastPage) => lastPage.nextCursor
});
```

---

## Next Steps

1. ✅ Read [research.md](./research.md) for architectural decisions
2. ✅ Review [data-model.md](./data-model.md) for entity schemas
3. ✅ Check [contracts/](./contracts/) for API specifications
4. ⏭️ Run `/speckit.tasks` to generate implementation tasks
5. ⏭️ Begin implementation following generated tasks

---

**Questions?** Contact the backend team about database schema changes or refer to the constitution for architectural standards.

# Integration Guide for Reusable Sections Components

This guide covers how to integrate the newly created components into the existing application.

## T098: Add "Unassigned Posts" section to tutorial sidebar

The `OrphanedPostsView` component should be integrated into the tutorial/blog sidebar view. It should:
- Show a count badge of orphaned posts
- Be expandable to show the full OrphanedPostsView

### Integration Example:

```tsx
import { OrphanedPostsView } from '@/components/sections/OrphanedPostsView';
import { PostsAPI } from '@/apis/v1/sidebar/postsApi';

// In your sidebar component:
const [orphanedCount, setOrphanedCount] = useState(0);

useEffect(() => {
  const fetchOrphanedCount = async () => {
    const { total } = await PostsAPI.getOrphanedPosts(contentId);
    setOrphanedCount(total);
  };
  fetchOrphanedCount();
}, [contentId]);

// In the sidebar render:
{orphanedCount > 0 && (
  <Accordion>
    <Accordion.Item value="orphaned-posts">
      <Accordion.Control>
        <Group gap="xs">
          <IconAlertCircle size={16} color="orange" />
          <Text>Unassigned Posts</Text>
          <Badge color="orange" size="sm">{orphanedCount}</Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <OrphanedPostsView
          contentId={contentId}
          contentType={contentType}
          linkedSections={linkedSections}
          onPostsUpdated={() => {
            // Refresh sidebar
            refetchSections();
            fetchOrphanedCount();
          }}
        />
      </Accordion.Panel>
    </Accordion.Item>
  </Accordion>
)}
```

---

## T108: Add "Delete Section" button to section edit page

The `SectionDeleteConfirmModal` should be integrated with section edit/management pages.

### Integration Example (Admin Sidebar Management):

```tsx
// In apps/web/app/admin/sidebar-management/components/SectionList.tsx
import { SectionDeleteConfirmModal } from '@/components/sections/SectionDeleteConfirmModal';

const [deleteModalOpened, setDeleteModalOpened] = useState(false);
const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

const handleDeleteClick = (section: Section) => {
  setSectionToDelete(section);
  setDeleteModalOpened(true);
};

const handleConfirmDelete = async () => {
  if (!sectionToDelete) return;
  
  try {
    await SectionsAPI.deleteSection(sectionToDelete._id);
    notifications.show({
      title: 'Section Deleted',
      message: `Section "${sectionToDelete.title}" has been deleted`,
      color: 'green',
    });
    // Refresh sections list
    await fetchSections();
  } catch (error) {
    notifications.show({
      title: 'Delete Failed',
      message: 'Failed to delete section',
      color: 'red',
    });
  }
};

// In the render:
<ActionIcon onClick={() => handleDeleteClick(section)}>
  <IconTrash size={18} />
</ActionIcon>

<SectionDeleteConfirmModal
  opened={deleteModalOpened}
  onClose={() => {
    setDeleteModalOpened(false);
    setSectionToDelete(null);
  }}
  sectionId={sectionToDelete?._id || ''}
  sectionTitle={sectionToDelete?.title || ''}
  onConfirmDelete={handleConfirmDelete}
/>
```

---

## T109: Show warning banner if section is used in multiple places

This can be integrated with the delete button logic.

### Integration Example:

```tsx
import { SectionsAPI } from '@/apis/v1/sidebar/sectionsApi';

const [usageCount, setUsageCount] = useState<number>(0);

useEffect(() => {
  const fetchUsageCount = async () => {
    if (!section) return;
    const stats = await SectionsAPI.getUsageStats(section._id);
    setUsageCount(stats.count);
  };
  fetchUsageCount();
}, [section]);

// Before the delete button:
{usageCount >= 5 && (
  <Alert
    icon={<IconAlertTriangle size={16} />}
    color="yellow"
    variant="light"
    mb="md"
  >
    <Text size="sm" fw={600}>
      High Usage Warning
    </Text>
    <Text size="xs">
      This section is used in {usageCount} places. Deleting it will affect multiple
      tutorials/blogs. Consider carefully before proceeding.
    </Text>
  </Alert>
)}

<Button
  color="red"
  leftSection={<IconTrash size={16} />}
  onClick={handleDeleteClick}
>
  Delete Section
</Button>
```

---

## Section Ownership Actions Integration

The `SectionOwnershipActions` component should be added to section management pages.

### Integration Example:

```tsx
// In apps/web/app/admin/sidebar-management/components/SectionForm.tsx
import { SectionOwnershipActions } from '@/components/sections/SectionOwnershipActions';

// Add after the form buttons:
{section && (
  <Divider my="md" />
  <SectionOwnershipActions
    section={section}
    currentTrainerId={currentUser.id}
    isAdmin={currentUser.role === 'admin'}
    onEdit={() => {
      // Already in edit mode
    }}
    onDelete={() => handleDeleteClick(section)}
    onTransferInitiated={() => {
      // Refresh section data
      fetchSection();
    }}
    variant="buttons"
    showOwnerBadge={true}
  />
)}
```

---

## Transfer Requests Panel Integration

The `TransferRequestsPanel` should be added to the user dashboard or a dedicated management page.

### Integration Example (Dashboard Page):

```tsx
// In apps/web/app/dashboard/page.tsx or similar
import { TransferRequestsPanel } from '@/components/sections/TransferRequestsPanel';

// In the dashboard render:
<Grid>
  <Grid.Col span={12}>
    <TransferRequestsPanel
      trainerId={currentUser.id}
      onTransferAccepted={(sectionId) => {
        // Show success message, maybe navigate to section
        console.log('Transfer accepted for section:', sectionId);
      }}
      onTransferDeclined={(transferId) => {
        console.log('Transfer declined:', transferId);
      }}
      onTransferCancelled={(transferId) => {
        console.log('Transfer cancelled:', transferId);
      }}
    />
  </Grid.Col>
</Grid>
```

---

## Pending Transfers Badge Integration

The `PendingTransfersBadge` should be integrated into the header/navigation.

### Integration Example (Header Component):

```tsx
// In apps/web/components/layout/Header.tsx or similar
import { PendingTransfersBadge } from '@/components/sections/PendingTransfersBadge';
import { useRouter } from 'next/navigation';

const router = useRouter();

// In the header render (near notifications or user menu):
<PendingTransfersBadge
  trainerId={currentUser.id}
  variant="icon"
  pollingInterval={60000} // 1 minute
  onViewAllClick={() => {
    router.push('/dashboard/transfers');
  }}
  onRequestClick={(transferId) => {
    router.push(`/dashboard/transfers?highlight=${transferId}`);
  }}
/>
```

---

## Admin View Integration

When showing sections to admins, pass the `isAdmin` prop:

### Integration Example:

```tsx
// In any component that uses SectionPicker:
<SectionPicker
  opened={pickerOpened}
  onClose={() => setPickerOpened(false)}
  contentId={contentId}
  contentType={contentType}
  trainerId={currentUser.id}
  isAdmin={currentUser.role === 'admin'} // T103
  onSectionLinked={handleSectionLinked}
/>
```

---

## Summary

### Tasks Completed (Frontend Implementation Ready):
- ✅ T086-T093: Phase 10 - Ownership Transfer (All components created)
- ✅ T097, T099, T100: OrphanedPostsView with bulk operations
- ✅ T103, T104: Admin section management
- ✅ T107: Section Delete Confirmation Modal

### Tasks Requiring Integration:
- ⚠️ T098: Integrate OrphanedPostsView into sidebar
- ⚠️ T108: Integrate SectionDeleteConfirmModal into admin pages
- ⚠️ T109: Add high-usage warning before delete

These integration tasks should be done by developers familiar with the existing page structure and routing in the application.

---

## Backend Tasks (External Repository):

The following tasks are for the backend team in the `apps/whatsnxt-bff` repository:

**Phase 10 - Ownership Transfer Backend:**
- T076-T085: Section ownership transfer endpoints and service

**Phase 11 - Orphaned Posts & Admin Backend:**
- T094-T096: Orphaned posts endpoints
- T101-T102: Admin middleware and filtering
- T105-T106: Delete impact preview and cascade deletion
- T110-T112: Trainer deletion cascade logic

These must be implemented before the frontend components can be fully functional.

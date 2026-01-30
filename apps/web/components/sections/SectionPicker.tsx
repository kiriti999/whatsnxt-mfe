/**
 * SectionPicker Component
 * Feature: 002-reusable-sections
 * 
 * Modal component for selecting existing sections to link to content (tutorial/blog).
 * Filters sections by trainer ownership and shows usage statistics.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  LoadingOverlay,
  ScrollArea,
  rem,
  Select,
  Alert,
  ActionIcon,
  Tooltip,
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconLink, IconInfoCircle, IconFilter, IconUserCheck } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { SectionsAPI, Section } from '../../../apis/v1/sidebar/sectionsApi';
import { SectionLinksAPI } from '../../../apis/v1/sidebar/sectionLinksApi';
import type { CreateSectionLinkInput } from '../../../types/sectionLink';

interface SectionPickerProps {
  opened: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  trainerId: string;
  isAdmin?: boolean; // T103 - Show all sections for admins
  onSectionLinked?: () => void;
}

export const SectionPicker: React.FC<SectionPickerProps> = ({
  opened,
  onClose,
  contentId,
  contentType,
  trainerId,
  isAdmin = false, // T103 - Admin can see all sections
  onSectionLinked,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state (T058)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  // Debounce search query for better performance (T056 - 300ms debounce)
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);

  // Fetch sections owned by trainer
  useEffect(() => {
    if (opened && trainerId) {
      // Reset pagination when modal opens
      setPage(1);
      setSections([]);
      setHasMore(true);
      fetchSections(1, true);
    }
  }, [opened, trainerId, contentType]);

  // Reset pagination when filters change
  useEffect(() => {
    if (opened && (debouncedSearch || contentTypeFilter)) {
      setPage(1);
      setSections([]);
      setHasMore(true);
      fetchSections(1, true);
    }
  }, [debouncedSearch, contentTypeFilter]);

  const fetchSections = async (pageNum: number = 1, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // T103: Fetch all sections for admins, or only owned sections for trainers
      let data: Section[];
      if (isAdmin) {
        // Admin sees all sections regardless of trainer
        data = await SectionsAPI.getAllSections(contentType);
      } else {
        // Regular trainer sees only their sections
        data = await SectionsAPI.getByTrainer(trainerId, contentType);
      }
      
      // Apply filters first
      let filtered = data;
      
      if (contentTypeFilter && contentTypeFilter !== 'all') {
        filtered = filtered.filter((section) => section.contentType === contentTypeFilter);
      }
      
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        filtered = filtered.filter(
          (section) =>
            section.title.toLowerCase().includes(query) ||
            section.description?.toLowerCase().includes(query)
        );
      }
      
      // Simulate pagination
      const startIndex = (pageNum - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedData = filtered.slice(0, endIndex);
      
      if (reset) {
        setSections(paginatedData);
      } else {
        setSections((prev) => [...prev, ...paginatedData.slice(startIndex)]);
      }
      
      setHasMore(endIndex < filtered.length);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load sections. Please try again.',
        color: 'red',
      });
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSections(nextPage, false);
  };

  // Filter sections based on search query and content type (T056, T057)
  // Note: Filtering is now done server-side in fetchSections
  const displayedSections = sections;

  const handleLinkSection = async () => {
    if (!selectedSectionId) return;

    setLinking(true);
    try {
      const input: CreateSectionLinkInput = {
        sectionId: selectedSectionId,
        contentId,
        contentType,
      };

      await SectionLinksAPI.createLink(input);

      notifications.show({
        title: 'Success',
        message: 'Section linked successfully!',
        color: 'green',
      });

      // Reset state and close modal
      setSelectedSectionId(null);
      setSearchQuery('');
      onClose();

      // Notify parent component to refresh
      if (onSectionLinked) {
        onSectionLinked();
      }
    } catch (error: any) {
      console.error('Failed to link section:', error);
      notifications.show({
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to link section. Please try again.',
        color: 'red',
      });
    } finally {
      setLinking(false);
    }
  };

  const handleClose = () => {
    if (!linking) {
      setSelectedSectionId(null);
      setSearchQuery('');
      setContentTypeFilter(null);
      setShowFilters(false);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Link Existing Section"
      size="lg"
      closeOnClickOutside={!linking}
      closeOnEscape={!linking}
    >
      <Stack gap="md">
        {/* Search and Filter Controls */}
        <Group gap="xs" align="flex-start">
          <TextInput
            label="Search sections"
            placeholder="Search sections by title or description..."
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            disabled={loading || linking}
            style={{ flex: 1 }}
            aria-label="Search sections by title or description"
          />
          <Tooltip label={showFilters ? 'Hide filters' : 'Show filters'}>
            <ActionIcon
              variant={showFilters ? 'filled' : 'light'}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              disabled={loading || linking}
              aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            >
              <IconFilter style={{ width: rem(18), height: rem(18) }} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Content Type Filter (T057) */}
        {showFilters && (
          <Select
            label="Filter by Type"
            placeholder="All types"
            value={contentTypeFilter}
            onChange={setContentTypeFilter}
            data={[
              { value: 'all', label: 'All Types' },
              { value: 'tutorial', label: 'Tutorial' },
              { value: 'blog', label: 'Blog' },
            ]}
            clearable
            disabled={loading || linking}
          />
        )}

        {/* Stats Info */}
        {sections.length > 0 && (
          <Group gap="xs">
            <Badge size="sm" variant="light">
              {displayedSections.length} sections {hasMore ? '(more available)' : ''}
            </Badge>
            {debouncedSearch && (
              <Text size="xs" c="dimmed">
                Search results for "{debouncedSearch}"
              </Text>
            )}
          </Group>
        )}

        <ScrollArea h={400} type="scroll">
          <Stack gap="xs" pos="relative">
            {/* T120: Loading Skeletons */}
            {loading && (
              <Stack gap="xs">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Paper key={i} p="md" withBorder>
                    <Stack gap="xs">
                      <Group gap="xs">
                        <Skeleton height={20} width="60%" />
                        <Skeleton height={18} width={60} radius="xl" />
                      </Group>
                      <Skeleton height={14} width="80%" />
                      <Group gap="xs" mt="xs">
                        <Skeleton height={16} width={80} />
                        <Skeleton height={16} width={100} />
                      </Group>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
            
            {/* Empty State (T060) */}
            {!loading && displayedSections.length === 0 && (
              <Alert
                icon={<IconInfoCircle style={{ width: rem(20), height: rem(20) }} />}
                color="blue"
                variant="light"
                mt="md"
              >
                <Stack gap="xs">
                  <Text size="sm" fw={500}>
                    {searchQuery || contentTypeFilter
                      ? 'No sections found matching your criteria'
                      : 'No sections available to link'}
                  </Text>
                  {(searchQuery || contentTypeFilter) && (
                    <Text size="xs" c="dimmed">
                      Try adjusting your search or filters
                    </Text>
                  )}
                  {!searchQuery && !contentTypeFilter && (
                    <Text size="xs" c="dimmed">
                      Create a new section to get started
                    </Text>
                  )}
                </Stack>
              </Alert>
            )}

            {displayedSections.map((section) => {
              // T104: Show owner badge for admins when viewing sections owned by others
              const isOwnedByCurrentTrainer = section.trainerId === trainerId;
              const showOwnerBadge = isAdmin && !isOwnedByCurrentTrainer;
              
              return (
              <Paper
                key={section._id}
                p="md"
                withBorder
                role="button"
                tabIndex={0}
                aria-label={`Select section ${section.title}`}
                style={{
                  cursor: linking ? 'not-allowed' : 'pointer',
                  backgroundColor:
                    selectedSectionId === section._id
                      ? 'var(--mantine-color-blue-light)'
                      : undefined,
                  opacity: linking ? 0.6 : 1,
                }}
                onClick={() => !linking && setSelectedSectionId(section._id)}
                onKeyDown={(e) => {
                  if (!linking && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setSelectedSectionId(section._id);
                  }
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <div style={{ flex: 1 }}>
                    <Group gap="xs" mb="xs">
                      <Text fw={500}>{section.title}</Text>
                      
                      {/* Content Type Badge */}
                      <Badge size="xs" variant="dot" color={section.contentType === 'tutorial' ? 'blue' : 'green'}>
                        {section.contentType}
                      </Badge>
                      
                      {/* Owner Badge for Admin (T104) */}
                      {showOwnerBadge && (
                        <Tooltip label="Owned by another trainer (Admin view)">
                          <Badge size="xs" variant="light" color="blue" leftSection={<IconUserCheck size={12} />}>
                            Other Owner
                          </Badge>
                        </Tooltip>
                      )}
                      
                      {/* Post Count Badge (T059) */}
                      {section.postCount > 0 && (
                        <Badge size="sm" variant="light" color="gray">
                          {section.postCount} posts
                        </Badge>
                      )}
                    </Group>
                    {section.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {section.description}
                      </Text>
                    )}
                  </div>
                  {selectedSectionId === section._id && (
                    <IconLink style={{ width: rem(20), height: rem(20) }} color="var(--mantine-color-blue-6)" />
                  )}
                </Group>
              </Paper>
            )})}
            
            {/* Load More Button (T058) */}
            {hasMore && !loading && displayedSections.length > 0 && (
              <Group justify="center" mt="md">
                <Button
                  variant="light"
                  onClick={handleLoadMore}
                  loading={loadingMore}
                  disabled={linking}
                >
                  Load More Sections
                </Button>
              </Group>
            )}
          </Stack>
        </ScrollArea>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose} disabled={linking}>
            Cancel
          </Button>
          <Button
            onClick={handleLinkSection}
            disabled={!selectedSectionId}
            loading={linking}
          >
            Link Section
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

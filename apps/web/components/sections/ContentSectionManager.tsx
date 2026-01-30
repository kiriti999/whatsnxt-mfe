/**
 * ContentSectionManager Component
 * Feature: 002-reusable-sections
 * Tasks: T025, T026, T033, T039
 * 
 * Integrated section management for tutorial/blog content editing.
 * Displays linked sections and provides UI for linking, creating, and unlinking sections.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  ActionIcon,
  Badge,
  Tooltip,
  LoadingOverlay,
  Alert,
  Divider,
  Box,
  Skeleton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconLink,
  IconTrash,
  IconAlertCircle,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { SectionLinksAPI } from '../../apis/v1/sidebar/sectionLinksApi';
import { SectionPicker } from './SectionPicker';
import { CreateSectionModal } from './CreateSectionModal';
import { UnlinkConfirmationModal } from './UnlinkConfirmationModal';
import { OrphanedPostsView } from './OrphanedPostsView';
import type { SectionLinkWithDetails } from '../../types/sectionLink';
import type { Section } from '../../apis/v1/sidebar/sectionsApi';

interface ContentSectionManagerProps {
  contentId: string;
  contentType: 'blog' | 'tutorial';
  trainerId: string;
  isEditing?: boolean; // Only show management controls when editing
  showPostCounts?: boolean; // Show post counts per section
  showOrphanedPosts?: boolean; // Show unassigned posts section
}

export const ContentSectionManager: React.FC<ContentSectionManagerProps> = ({
  contentId,
  contentType,
  trainerId,
  isEditing = false,
  showPostCounts = false,
  showOrphanedPosts = true,
}) => {
  const [linkedSections, setLinkedSections] = useState<SectionLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [orphanedExpanded, setOrphanedExpanded] = useState(true);
  
  // Modal states
  const [pickerOpened, { open: openPicker, close: closePicker }] = useDisclosure(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [unlinkModalOpened, { open: openUnlinkModal, close: closeUnlinkModal }] = useDisclosure(false);
  
  // Selected section for unlinking
  const [selectedLinkForUnlink, setSelectedLinkForUnlink] = useState<{
    linkId: string;
    title: string;
  } | null>(null);

  // Fetch linked sections
  const fetchLinkedSections = useCallback(async () => {
    if (!contentId) return;
    
    setLoading(true);
    try {
      const links = await SectionLinksAPI.getLinksWithDetails(contentId);
      setLinkedSections(links);
    } catch (error) {
      console.error('Failed to fetch linked sections:', error);
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    fetchLinkedSections();
  }, [fetchLinkedSections]);

  const handleSectionLinked = () => {
    closePicker();
    fetchLinkedSections();
  };

  const handleSectionCreated = () => {
    closeCreateModal();
    fetchLinkedSections();
  };

  const handleUnlinkClick = (linkId: string, title: string) => {
    setSelectedLinkForUnlink({ linkId, title });
    openUnlinkModal();
  };

  const handleUnlinkSuccess = () => {
    closeUnlinkModal();
    setSelectedLinkForUnlink(null);
    fetchLinkedSections();
  };

  const handleUnlinkModalClose = () => {
    closeUnlinkModal();
    setSelectedLinkForUnlink(null);
  };

  const handlePostsUpdated = () => {
    fetchLinkedSections();
  };

  // Get sections for OrphanedPostsView
  const sectionsForOrphanedView: Section[] = linkedSections
    .filter((link) => link.section)
    .map((link) => link.section as Section);

  return (
    <>
      <Stack gap="md">
        {/* Sections Manager */}
        <Paper shadow="xs" p="md" radius="md" withBorder>
        <LoadingOverlay visible={loading} />

        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
              </ActionIcon>
              <Text fw={600} size="sm">
                Sections
              </Text>
              {linkedSections.length > 0 && (
                <Badge size="sm" variant="light">
                  {linkedSections.length}
                </Badge>
              )}
            </Group>

            {isEditing && (
              <Group gap="xs">
                <Tooltip label="Link existing section">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconLink size={14} />}
                    onClick={openPicker}
                  >
                    Link Section
                  </Button>
                </Tooltip>
                <Tooltip label="Create new section">
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={openCreateModal}
                  >
                    Create Section
                  </Button>
                </Tooltip>
              </Group>
            )}
          </Group>

          {expanded && (
            <>
              <Divider />

              {/* T120: Loading Skeletons for Sections */}
              {loading && (
                <Stack gap="xs">
                  {[1, 2, 3].map((i) => (
                    <Paper key={i} p="xs" withBorder radius="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm">
                          <Skeleton height={24} width={4} />
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Skeleton height={16} width="70%" />
                            <Skeleton height={12} width="50%" />
                          </Stack>
                        </Group>
                        <Skeleton height={20} width={60} />
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}

              {/* Linked Sections List */}
              {!loading && linkedSections.length === 0 ? (
                <Alert
                  icon={<IconAlertCircle size={18} />}
                  color="blue"
                  variant="light"
                >
                  <Text size="sm">
                    No sections linked to this {contentType} yet.
                    {isEditing && ' Click "Link Section" or "Create Section" to get started.'}
                  </Text>
                </Alert>
              ) : !loading ? (
                <Stack gap="xs">
                  {linkedSections.map((link) => (
                    <Paper key={link._id} p="xs" withBorder radius="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm">
                          <Box
                            style={{
                              width: 4,
                              height: 24,
                              backgroundColor: 'var(--mantine-color-blue-6)',
                              borderRadius: 2,
                            }}
                          />
                          <Stack gap={2}>
                            <Text size="sm" fw={500}>
                              {link.section?.title || 'Untitled Section'}
                            </Text>
                            {link.section?.description && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {link.section.description}
                              </Text>
                            )}
                          </Stack>
                        </Group>

                        <Group gap="xs">
                          {showPostCounts && link.section?.postCount !== undefined && (
                            <Badge size="sm" variant="light" color="gray">
                              {link.section.postCount} post(s)
                            </Badge>
                          )}
                          
                          {isEditing && (
                            <Tooltip label="Unlink section">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => handleUnlinkClick(link._id, link.section?.title || 'Untitled')}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : null}
            </>
          )}
        </Stack>
      </Paper>

      {/* Orphaned Posts Section */}
      {showOrphanedPosts && isEditing && sectionsForOrphanedView.length > 0 && (
        <OrphanedPostsView
          contentId={contentId}
          contentType={contentType}
          linkedSections={sectionsForOrphanedView}
          onPostsUpdated={handlePostsUpdated}
        />
      )}
      </Stack>

      {/* Section Picker Modal */}
      <SectionPicker
        opened={pickerOpened}
        onClose={closePicker}
        contentId={contentId}
        contentType={contentType}
        trainerId={trainerId}
        onSectionLinked={handleSectionLinked}
      />

      {/* Create Section Modal */}
      <CreateSectionModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        contentType={contentType}
        trainerId={trainerId}
        contentId={contentId}
        onSectionCreated={handleSectionCreated}
      />

      {/* Unlink Confirmation Modal */}
      {selectedLinkForUnlink && (
        <UnlinkConfirmationModal
          opened={unlinkModalOpened}
          onClose={handleUnlinkModalClose}
          sectionLinkId={selectedLinkForUnlink.linkId}
          sectionTitle={selectedLinkForUnlink.title}
          contentType={contentType}
          onUnlinkSuccess={handleUnlinkSuccess}
        />
      )}
    </>
  );
};

export default ContentSectionManager;

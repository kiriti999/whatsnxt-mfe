'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Container,
    Title,
    Text,
    Group,
    SimpleGrid,
    Paper,
    ThemeIcon,
    ActionIcon,
    Button,
    Tooltip,
    Modal,
    Stack,
    Badge,
    Skeleton,
} from '@mantine/core';
import {
    IconPalette,
    IconTrash,
    IconEye,
    IconPlus,
    IconCalendar,
    IconPhoto,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ShareOptions } from '@whatsnxt/core-ui';
import { VisualizerAPI } from '../../apis/v1/visualizer';
import type { DiagramData, DiagramType } from './types';
import { getRenderer } from './renderers';
import styles from './visualizer.module.css';
import useAuth from '@/hooks/Authentication/useAuth';

interface SavedDiagram {
    _id: string;
    title: string;
    diagramType: DiagramType;
    prompt: string;
    diagramData: DiagramData;
    aiModel?: string;
    createdAt: string;
    updatedAt: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    'step-content': { label: 'Step Content', color: '#22c55e' },
    'flow-diagram': { label: 'Flow Diagram', color: '#3b82f6' },
    'architecture': { label: 'Architecture', color: '#8b5cf6' },
    'comparison-grid': { label: 'Comparison', color: '#f59e0b' },
    'concept-explainer': { label: 'Concept', color: '#ec4899' },
    'pattern-catalog': { label: 'Patterns', color: '#06b6d4' },
};

export function DiagramGallery() {
    const router = useRouter();
    const { user } = useAuth();
    const [diagrams, setDiagrams] = useState<SavedDiagram[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteModal, setDeleteModal] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [previewModal, setPreviewModal] = useState<SavedDiagram | null>(null);
    const [exportingId, setExportingId] = useState<string | null>(null);

    const limit = 12;

    const fetchDiagrams = useCallback(async () => {
        setLoading(true);
        try {
            const res = await VisualizerAPI.getUserDiagrams(page, limit);
            if (res?.success) {
                setDiagrams(res.data?.diagrams || []);
                setTotal(res.data?.total || 0);
            }
        } catch (err) {
            console.error('Failed to load diagrams:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchDiagrams();
    }, [fetchDiagrams]);

    const handleDelete = useCallback(async () => {
        if (!deleteModal) return;
        setDeleting(true);
        try {
            await VisualizerAPI.deleteDiagram(deleteModal.id);
            setDiagrams((prev) => prev.filter((d) => d._id !== deleteModal.id));
            setTotal((t) => t - 1);
            setDeleteModal(null);
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(false);
        }
    }, [deleteModal]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const exportDiagramAsPNG = useCallback((diagram: SavedDiagram) => {
        setExportingId(diagram._id);
        try {
            const container = document.getElementById(`diagram-thumb-${diagram._id}`);
            const svgElement = container?.querySelector('svg') as SVGSVGElement | null;
            if (!svgElement) return;

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1200, 800];
            const svgWidth = viewBox[2] || 1200;
            const svgHeight = viewBox[3] || 800;
            const outWidth = 1200;
            const outHeight = 627;

            const canvas = document.createElement('canvas');
            canvas.width = outWidth;
            canvas.height = outHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outWidth, outHeight);

            const img = new Image();
            const svgBlob = new Blob(
                [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
                { type: 'image/svg+xml;charset=utf-8' },
            );
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                const svgAspect = svgWidth / svgHeight;
                const targetAspect = outWidth / outHeight;
                let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

                if (svgAspect > targetAspect) {
                    drawWidth = outWidth;
                    drawHeight = outWidth / svgAspect;
                    offsetX = 0;
                    offsetY = (outHeight - drawHeight) / 2;
                } else {
                    drawHeight = outHeight;
                    drawWidth = outHeight * svgAspect;
                    offsetX = (outWidth - drawWidth) / 2;
                    offsetY = 0;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `${diagram.title || 'diagram'}-${Date.now()}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    URL.revokeObjectURL(url);
                    setExportingId(null);
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                setExportingId(null);
            };

            img.src = url;
        } catch {
            setExportingId(null);
        }
    }, []);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className={styles.builderContainer}>
            <Container size="xl" py="xl">
                {/* Header */}
                <div className={styles.header}>
                    <Group justify="center" gap="xs" mb="xs">
                        <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: '#fa709a', to: '#fee140', deg: 135 }}
                        >
                            <IconPalette size={24} />
                        </ThemeIcon>
                        <Title order={1} size="h2" className={styles.headerTitle}>
                            My Diagrams
                        </Title>
                    </Group>
                    <Text className={styles.headerSubtitle} c="dimmed">
                        {total} diagram{total !== 1 ? 's' : ''} saved
                    </Text>
                </div>

                {/* Actions */}
                <Group justify="flex-end" mb="lg">
                    <Button
                        variant="gradient"
                        gradient={{ from: '#fa709a', to: '#fee140', deg: 135 }}
                        leftSection={<IconPlus size={16} />}
                        onClick={() => router.push('/form/visualizer')}
                        style={{ color: '#1a1a2e' }}
                    >
                        Create New
                    </Button>
                </Group>

                {/* Loading skeleton */}
                {loading && (
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} height={260} radius="md" animate />
                        ))}
                    </SimpleGrid>
                )}

                {/* Empty state */}
                {!loading && diagrams.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>🎨</div>
                        <Text className={styles.emptyStateText}>No diagrams yet</Text>
                        <Text className={styles.emptyStateSubtext}>
                            Create your first AI-generated diagram to see it here
                        </Text>
                        <Button
                            mt="md"
                            variant="gradient"
                            gradient={{ from: '#fa709a', to: '#fee140', deg: 135 }}
                            leftSection={<IconPlus size={16} />}
                            onClick={() => router.push('/form/visualizer')}
                            style={{ color: '#1a1a2e' }}
                        >
                            Create Diagram
                        </Button>
                    </div>
                )}

                {/* Cards grid */}
                {!loading && diagrams.length > 0 && (
                    <>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                            {diagrams.map((diagram) => {
                                const typeInfo = TYPE_LABELS[diagram.diagramType] || {
                                    label: diagram.diagramType,
                                    color: '#6b7280',
                                };
                                return (
                                    <Paper
                                        key={diagram._id}
                                        className={styles.galleryCard}
                                        shadow="sm"
                                        withBorder
                                        p={0}
                                    >
                                        {/* Thumbnail */}
                                        <div
                                            className={styles.galleryThumbnail}
                                            onClick={() => setPreviewModal(diagram)}
                                        >
                                            <div
                                                id={`diagram-thumb-${diagram._id}`}
                                                className={styles.galleryThumbnailInner}
                                            >
                                                {(() => {
                                                    const Renderer = getRenderer(
                                                        diagram.diagramType,
                                                    );
                                                    return (
                                                        <Renderer
                                                            data={diagram.diagramData}
                                                            width={600}
                                                            height={400}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            <div className={styles.galleryThumbnailOverlay}>
                                                <IconEye size={24} color="#fff" />
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div className={styles.galleryCardBody}>
                                            <Group justify="space-between" wrap="nowrap" mb={4}>
                                                <Text
                                                    size="sm"
                                                    fw={700}
                                                    truncate
                                                    style={{ flex: 1 }}
                                                >
                                                    {diagram.title}
                                                </Text>
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    color={typeInfo.color}
                                                    styles={{
                                                        root: {
                                                            flexShrink: 0,
                                                        },
                                                    }}
                                                >
                                                    {typeInfo.label}
                                                </Badge>
                                            </Group>

                                            <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                                                {diagram.prompt}
                                            </Text>

                                            <Group justify="space-between">
                                                <Group gap={4}>
                                                    <IconCalendar size={12} opacity={0.5} />
                                                    <Text size="xs" c="dimmed">
                                                        {formatDate(diagram.createdAt)}
                                                    </Text>
                                                </Group>
                                                <Group gap={4}>
                                                    <Tooltip label="Export PNG">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size="sm"
                                                            color="blue"
                                                            loading={exportingId === diagram._id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                exportDiagramAsPNG(diagram);
                                                            }}
                                                        >
                                                            <IconPhoto size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <ShareOptions
                                                            url={typeof window !== 'undefined' ? `${window.location.origin}/blogs` : '/blogs'}
                                                            title={diagram.title}
                                                            thumbnailUrn=""
                                                            description={diagram.prompt}
                                                            email={user?.email}
                                                        />
                                                    </div>
                                                    <Tooltip label="Delete">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size="sm"
                                                            color="red"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteModal({
                                                                    id: diagram._id,
                                                                    title: diagram.title,
                                                                });
                                                            }}
                                                        >
                                                            <IconTrash size={14} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Group>
                                        </div>
                                    </Paper>
                                );
                            })}
                        </SimpleGrid>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Group justify="center" mt="xl">
                                <Button
                                    variant="subtle"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Previous
                                </Button>
                                <Text size="sm" c="dimmed">
                                    Page {page} of {totalPages}
                                </Text>
                                <Button
                                    variant="subtle"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </Group>
                        )}
                    </>
                )}

                {/* Preview Modal */}
                <Modal
                    opened={!!previewModal}
                    onClose={() => setPreviewModal(null)}
                    size="xl"
                    title={previewModal?.title || 'Diagram Preview'}
                    centered
                    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
                >
                    {previewModal && (
                        <div style={{ minHeight: 400 }}>
                            {(() => {
                                const Renderer = getRenderer(previewModal.diagramType);
                                return (
                                    <Renderer
                                        data={previewModal.diagramData}
                                        width={1200}
                                        height={800}
                                    />
                                );
                            })()}
                        </div>
                    )}
                </Modal>

                {/* Delete confirmation */}
                <Modal
                    opened={!!deleteModal}
                    onClose={() => setDeleteModal(null)}
                    title="Delete Diagram"
                    centered
                    size="sm"
                >
                    <Stack>
                        <Text size="sm">
                            Are you sure you want to delete &quot;{deleteModal?.title}&quot;? This
                            action cannot be undone.
                        </Text>
                        <Group justify="flex-end" gap="sm">
                            <Button
                                variant="subtle"
                                onClick={() => setDeleteModal(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="red"
                                onClick={handleDelete}
                                loading={deleting}
                            >
                                Delete
                            </Button>
                        </Group>
                    </Stack>
                </Modal>
            </Container>
        </div>
    );
}

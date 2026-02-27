'use client';

import { Anchor, Badge, Box, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBooks,
    IconChevronRight,
    IconExternalLink,
    IconHierarchy2,
    IconLink,
    IconVideo,
} from '@tabler/icons-react';
import type { LearningLink } from '@whatsnxt/core-types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { DiagramState } from '@/utils/diagram-ai';
import { LexicalEditor } from '../../StructuredTutorial/Editor/LexicalEditor';
import styles from './LearningMaterialViewer.module.css';

const DiagramEditor = dynamic(
    () => import('../../architecture-lab/DiagramEditor'),
    { ssr: false },
);

export interface LearningMaterialViewerProps {
    learningContent?: string;
    learningVideoUrl?: string;
    learningLinks?: LearningLink[];
    learningDiagramState?: string;
}

/** Extract YouTube embed URL from watch/share/embed URL, or null if not YouTube. */
function getYouTubeEmbedUrl(url: string): string | null {
    try {
        const parsed = new URL(url);
        // Standard: youtube.com/watch?v=ID
        if (parsed.hostname.includes('youtube.com') && parsed.searchParams.get('v')) {
            return `https://www.youtube.com/embed/${parsed.searchParams.get('v')}`;
        }
        // Short: youtu.be/ID
        if (parsed.hostname === 'youtu.be') {
            return `https://www.youtube.com/embed${parsed.pathname}`;
        }
        // Already embed: youtube.com/embed/ID
        if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
            return url;
        }
        return null;
    } catch {
        return null;
    }
}

function isCloudinaryVideo(url: string): boolean {
    return url.includes('cloudinary.com') && /\.(mp4|webm|mov|ogv)/.test(url);
}

function hasContent(
    learningContent?: string,
    learningVideoUrl?: string,
    learningLinks?: LearningLink[],
    learningDiagramState?: string,
): boolean {
    return !!(
        learningContent ||
        learningVideoUrl ||
        (learningLinks && learningLinks.length > 0) ||
        learningDiagramState
    );
}

export function LearningMaterialViewer({
    learningContent,
    learningVideoUrl,
    learningLinks,
    learningDiagramState,
}: LearningMaterialViewerProps) {
    const hasMaterial = hasContent(learningContent, learningVideoUrl, learningLinks, learningDiagramState);

    const [opened, { toggle }] = useDisclosure(hasMaterial); // auto-expand when material exists

    const parsedDiagram = useMemo(() => {
        if (!learningDiagramState) return null;
        try { return JSON.parse(learningDiagramState) as DiagramState; } catch { return null; }
    }, [learningDiagramState]);

    if (!hasMaterial) return null;

    const youtubeEmbedUrl = learningVideoUrl ? getYouTubeEmbedUrl(learningVideoUrl) : null;
    const isCloudinary = learningVideoUrl ? isCloudinaryVideo(learningVideoUrl) : false;

    return (
        <Box className={styles.card} mb="lg">
            {/* Collapsible header */}
            <button
                type="button"
                className={styles.header}
                onClick={toggle}
                aria-expanded={opened}
                aria-label={opened ? 'Collapse learning material' : 'Expand learning material'}
            >
                <div className={styles.headerLeft}>
                    <IconBooks size={18} color="var(--mantine-color-violet-6)" />
                    <Text size="sm" fw={700} c="violet">
                        Learning Material
                    </Text>
                    <Badge size="xs" color="violet" variant="filled" radius="sm">
                        📚 Review before the test
                    </Badge>
                </div>
                <IconChevronRight
                    size={16}
                    className={`${styles.chevron} ${opened ? styles.chevronOpen : ''}`}
                />
            </button>

            {/* Body */}
            {opened && (
                <div className={styles.body}>
                    <Stack gap="xl">
                        {/* Rich text content */}
                        {learningContent && (
                            <Box>
                                <div className={styles.sectionTitle}>Explanation</div>
                                <div className={styles.contentWrap}>
                                    <LexicalEditor
                                        value={learningContent}
                                        readOnly
                                    />
                                </div>
                            </Box>
                        )}

                        {/* Architectural Diagram */}
                        {parsedDiagram && (
                            <Box>
                                <div className={styles.sectionTitle}>
                                    <IconHierarchy2 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Architecture Diagram
                                </div>
                                <div className={styles.diagramViewWrap}>
                                    <DiagramEditor
                                        initialGraph={parsedDiagram}
                                        mode="instructor"
                                        architectureTypes={[]}
                                    />
                                </div>
                            </Box>
                        )}

                        {/* Video */}
                        {learningVideoUrl && (
                            <Box>
                                <div className={styles.sectionTitle}>
                                    <IconVideo size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Video
                                </div>

                                {youtubeEmbedUrl ? (
                                    <div className={styles.videoWrap}>
                                        <iframe
                                            src={youtubeEmbedUrl}
                                            title="Learning video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    </div>
                                ) : isCloudinary ? (
                                    <video
                                        src={learningVideoUrl}
                                        controls
                                        style={{ width: '100%', borderRadius: 'var(--mantine-radius-sm)' }}
                                    >
                                        <track kind="captions" />
                                    </video>
                                ) : (
                                    <Anchor href={learningVideoUrl} target="_blank" rel="noopener noreferrer">
                                        <div className={styles.linkItem} style={{ display: 'flex' }}>
                                            <IconVideo size={16} color="var(--mantine-color-violet-5)" />
                                            <span className={styles.linkTitle}>{learningVideoUrl}</span>
                                            <IconExternalLink size={14} color="var(--mantine-color-dimmed)" />
                                        </div>
                                    </Anchor>
                                )}
                            </Box>
                        )}

                        {/* Links */}
                        {learningLinks && learningLinks.length > 0 && (
                            <Box>
                                <div className={styles.sectionTitle}>
                                    <IconLink size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                    Resources
                                </div>
                                <Stack gap="xs">
                                    {learningLinks.map((link, idx) => (
                                        <Anchor
                                            key={`${link.url}-${idx}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.linkItem}
                                            underline="never"
                                        >
                                            {link.type === 'internal' ? (
                                                <IconBooks size={15} color="var(--mantine-color-violet-5)" />
                                            ) : (
                                                <IconExternalLink size={15} color="var(--mantine-color-violet-5)" />
                                            )}
                                            <span className={styles.linkTitle}>{link.title || link.url}</span>
                                            {link.type === 'external' && (
                                                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                                                    External
                                                </Text>
                                            )}
                                        </Anchor>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </div>
            )}
        </Box>
    );
}

export default LearningMaterialViewer;

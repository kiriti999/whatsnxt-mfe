'use client';

import { Anchor, Badge, Box, Collapse, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconBooks,
    IconChevronRight,
    IconExternalLink,
    IconHierarchy2,
    IconLink,
    IconVideo,
} from '@tabler/icons-react';
import type { LearningLink } from '@whatsnxt/types';
import dynamic from 'next/dynamic';
import type React from 'react';
import { useMemo } from 'react';
import type { DiagramState } from '@/utils/diagram-ai';
import { LexicalEditor } from '../../StructuredTutorial/Editor/LexicalEditor';
import styles from './LearningMaterialViewer.module.css';

const DiagramEditor = dynamic(
    () => import('../../architecture-lab/DiagramEditor'),
    { ssr: false },
);

interface SubSectionProps {
    icon: React.ReactNode;
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function SubSection({ icon, title, defaultOpen = false, children }: SubSectionProps) {
    const [opened, { toggle }] = useDisclosure(defaultOpen);

    return (
        <Box className={styles.subCard}>
            <UnstyledButton onClick={toggle} className={styles.subHeader}>
                <Group gap="xs" wrap="nowrap">
                    {icon}
                    <Text size="xs" fw={600} c="violet.6" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                        {title}
                    </Text>
                </Group>
                <IconChevronRight
                    size={14}
                    className={`${styles.subChevron} ${opened ? styles.subChevronOpen : ''}`}
                />
            </UnstyledButton>
            <Collapse in={opened}>
                <Box className={styles.subBody}>
                    {children}
                </Box>
            </Collapse>
        </Box>
    );
}

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
                    <Stack gap="sm">
                        {/* Explanation sub-section */}
                        {learningContent && (
                            <SubSection
                                icon={<IconBooks size={14} color="var(--mantine-color-violet-5)" />}
                                title="Explanation"
                            >
                                <div className={styles.contentWrap}>
                                    <LexicalEditor value={learningContent} readOnly />
                                </div>
                            </SubSection>
                        )}

                        {/* Architecture Diagram sub-section */}
                        {parsedDiagram && (
                            <SubSection
                                icon={<IconHierarchy2 size={14} color="var(--mantine-color-violet-5)" />}
                                title="Architecture Diagram"
                            >
                                <div className={styles.diagramViewWrap}>
                                    <DiagramEditor
                                        initialGraph={parsedDiagram}
                                        mode="instructor"
                                        viewOnly
                                        architectureTypes={[]}
                                    />
                                </div>
                            </SubSection>
                        )}

                        {/* Video sub-section */}
                        {learningVideoUrl && (
                            <SubSection
                                icon={<IconVideo size={14} color="var(--mantine-color-violet-5)" />}
                                title="Video"
                            >
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
                            </SubSection>
                        )}

                        {/* Resources sub-section */}
                        {learningLinks && learningLinks.length > 0 && (
                            <SubSection
                                icon={<IconLink size={14} color="var(--mantine-color-violet-5)" />}
                                title="Resources"
                            >
                                <Stack gap="xs">
                                    {learningLinks.map((link, idx) => (
                                        <Anchor
                                            key={`${link.url}-${idx}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.linkItem}
                                            underline="never"
                                            onClick={(e) => {
                                                // Ensure the link opens in a new tab
                                                e.preventDefault();
                                                window.open(link.url, '_blank', 'noopener,noreferrer');
                                            }}
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
                            </SubSection>
                        )}
                    </Stack>
                </div>
            )}
        </Box>
    );
}

export default LearningMaterialViewer;

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Anchor,
    Badge,
    Button,
    Divider,
    Group,
    Modal,
    SegmentedControl,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import { IconCheck, IconCloudUpload, IconDownload, IconPackage } from '@tabler/icons-react';
import type { AnimationManifest } from '@whatsnxt/types';
import { VisualizerAPI, type DiagramRenderAnimationJobStatusResult } from '../../apis/v1/visualizer';
import type { DiagramData } from './types';
import styles from './visualizer.module.css';

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(['completed', 'failed']);

function buildDefaultManifest(data: DiagramData): AnimationManifest {
    const firstNode = data.nodes[0];
    const firstEdge = data.edges[0];
    const nodeId = firstNode?.id || 'n1';
    const segments: AnimationManifest['segments'] = [
        {
            id: 'intro',
            durationInFrames: 60,
            effect: 'fade',
            target: { kind: 'node', nodeId },
            label: data.title || 'Diagram',
        },
    ];
    if (firstEdge) {
        segments.push({
            id: 'edge-flow',
            durationInFrames: 90,
            effect: 'strokeReveal',
            target: { kind: 'edge', edgeId: firstEdge.id },
            label: firstEdge.label || 'Flow',
        });
    }
    const totalFrames = segments.reduce((a, s) => a + s.durationInFrames, 0) + 30;
    return {
        version: 1,
        compositionDurationInFrames: Math.min(600, Math.max(90, totalFrames)),
        segments,
    };
}

interface ExportAnimationModalProps {
    opened: boolean;
    onClose: () => void;
    diagramData: DiagramData;
    getSvgString: () => string | null;
}

export function ExportAnimationModal({
    opened,
    onClose,
    diagramData,
    getSvgString,
}: ExportAnimationModalProps) {
    const [animPrompt, setAnimPrompt] = useState('Animate the diagram to explain the main flow.');
    const [manifestJson, setManifestJson] = useState('');
    const [busy, setBusy] = useState(false);
    const [savedPath, setSavedPath] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [renderFormat, setRenderFormat] = useState<'mp4' | 'gif' | 'both'>('mp4');
    const [renderJob, setRenderJob] = useState<DiagramRenderAnimationJobStatusResult | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const defaultManifestStr = useMemo(
        () => JSON.stringify(buildDefaultManifest(diagramData), null, 2),
        [diagramData],
    );

    useEffect(() => {
        if (opened && !manifestJson) {
            setManifestJson(defaultManifestStr);
        }
    }, [opened, defaultManifestStr, manifestJson]);

    const handleGenerateManifest = useCallback(async () => {
        setBusy(true);
        setError(null);
        try {
            const res = await VisualizerAPI.generateAnimationManifest({
                diagramData: diagramData as unknown as Record<string, unknown>,
                prompt: animPrompt,
            });
            setManifestJson(JSON.stringify(res.manifest, null, 2));
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to generate manifest');
        } finally {
            setBusy(false);
        }
    }, [animPrompt, diagramData]);

    const handleSaveToGsap = useCallback(async () => {
        const svg = getSvgString();
        if (!svg) { setError('Could not read SVG from canvas.'); return; }
        let manifest: AnimationManifest;
        try {
            manifest = JSON.parse(manifestJson) as AnimationManifest;
        } catch {
            setError('Animation manifest JSON is invalid.');
            return;
        }
        setBusy(true);
        setError(null);
        setSavedPath(null);
        try {
            const result = await VisualizerAPI.saveAnimationBundle({
                manifest,
                svgContent: svg,
                diagramData: diagramData as unknown as Record<string, unknown>,
            });
            setSavedPath(result.path || 'Saved successfully');
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to save bundle');
        } finally {
            setBusy(false);
        }
    }, [getSvgString, manifestJson, diagramData]);

    const handleDownloadBundle = useCallback(async () => {
        const svg = getSvgString();
        if (!svg) { setError('Could not read SVG from canvas.'); return; }
        try {
            const JSZipModule = await import('jszip');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const JSZip = (JSZipModule as any).default || JSZipModule;
            const zip = new JSZip();
            const bundle = zip.folder('bundle');
            if (bundle) {
                bundle.file('manifest.json', manifestJson);
                bundle.file('diagram.svg', svg);
                bundle.file('diagramData.json', JSON.stringify(diagramData, null, 2));
            }
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${diagramData.title || 'diagram'}-animation-bundle.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            setError('Failed to create bundle. Please try again.');
        }
    }, [getSvgString, manifestJson, diagramData]);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const pollJobStatus = useCallback((jobId: string) => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const job = await VisualizerAPI.getRenderAnimationJob(jobId);
                setRenderJob(job);
                if (TERMINAL_STATUSES.has(job.status)) {
                    stopPolling();
                    setBusy(false);
                }
            } catch {
                stopPolling();
                setBusy(false);
            }
        }, POLL_INTERVAL_MS);
    }, [stopPolling]);

    useEffect(() => stopPolling, [stopPolling]);

    const handleStartRender = useCallback(async () => {
        const svg = getSvgString();
        if (!svg) { setError('Could not read SVG from canvas.'); return; }
        let manifest: AnimationManifest;
        try {
            manifest = JSON.parse(manifestJson) as AnimationManifest;
        } catch {
            setError('Animation manifest JSON is invalid.');
            return;
        }
        setBusy(true);
        setError(null);
        setRenderJob(null);
        try {
            const result = await VisualizerAPI.createRenderAnimationJob({
                diagramData: diagramData as unknown as Record<string, unknown>,
                svgContent: svg,
                animationManifest: manifest,
                format: renderFormat,
            });
            setRenderJob({ jobId: result.jobId, status: result.status });
            pollJobStatus(result.jobId);
        } catch (e: unknown) {
            setBusy(false);
            setError(e instanceof Error ? e.message : 'Failed to start render job');
        }
    }, [getSvgString, manifestJson, diagramData, renderFormat, pollJobStatus]);

    const renderStatusBadge = () => {
        if (!renderJob) return null;
        const colorMap: Record<string, string> = { pending: 'yellow', processing: 'blue', completed: 'green', failed: 'red' };
        return <Badge color={colorMap[renderJob.status] ?? 'gray'}>{renderJob.status}</Badge>;
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Export Animation"
            size="lg"
            classNames={{ body: styles.animationExportModalBody }}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    Generate an animation manifest with AI, then save to the GSAP player (
                    <strong>http://localhost:8080</strong>) for preview.
                </Text>

                <Textarea
                    label="Animation prompt"
                    minRows={2}
                    value={animPrompt}
                    onChange={(e) => setAnimPrompt(e.currentTarget.value)}
                />

                <Group>
                    <Button variant="light" onClick={handleGenerateManifest} loading={busy} disabled={busy}>
                        Generate manifest (AI)
                    </Button>
                </Group>

                <Textarea
                    label="Animation manifest (JSON)"
                    minRows={8}
                    className={styles.animationManifestTextarea}
                    value={manifestJson}
                    onChange={(e) => setManifestJson(e.currentTarget.value)}
                />

                <Group gap="sm">
                    <Button
                        variant="filled"
                        size="sm"
                        leftSection={<IconCheck size={16} />}
                        onClick={handleSaveToGsap}
                        loading={busy}
                        disabled={busy}
                    >
                        Save to GSAP Player
                    </Button>
                    <Button
                        variant="subtle"
                        size="sm"
                        leftSection={<IconPackage size={16} />}
                        onClick={handleDownloadBundle}
                    >
                        Download ZIP
                    </Button>
                </Group>

                {savedPath && (
                    <Text size="sm" c="green">
                        ✅ Saved! Reload <strong>http://localhost:8080</strong> and click Play.
                    </Text>
                )}

                {error && (
                    <Text size="sm" c="red">
                        {error}
                    </Text>
                )}

                <Divider label="Cloud Render (MP4 / GIF)" labelPosition="center" />

                <Text size="sm" c="dimmed">
                    Render a video using GSAP animation via Remotion Lambda. Requires backend render
                    configuration.
                </Text>

                <Group align="flex-end" gap="sm">
                    <Stack gap={4}>
                        <Text size="xs" fw={500}>Output format</Text>
                        <SegmentedControl
                            size="xs"
                            value={renderFormat}
                            onChange={(v) => setRenderFormat(v as typeof renderFormat)}
                            data={[
                                { label: 'MP4', value: 'mp4' },
                                { label: 'GIF', value: 'gif' },
                                { label: 'Both', value: 'both' },
                            ]}
                        />
                    </Stack>
                    <Button
                        size="sm"
                        leftSection={<IconCloudUpload size={16} />}
                        onClick={handleStartRender}
                        loading={busy && !!renderJob}
                        disabled={busy}
                    >
                        Start Render
                    </Button>
                </Group>

                {renderJob && (
                    <Stack gap={6}>
                        <Group gap="xs">
                            <Text size="sm">Job status:</Text>
                            {renderStatusBadge()}
                            <Text size="xs" c="dimmed">{renderJob.jobId}</Text>
                        </Group>
                        {renderJob.status === 'processing' && (
                            <Text size="xs" c="dimmed">Rendering… this may take 1–3 minutes.</Text>
                        )}
                        {renderJob.mp4Url && (
                            <Anchor href={renderJob.mp4Url} target="_blank" size="sm">
                                <Group gap={4}><IconDownload size={14} /> Download MP4</Group>
                            </Anchor>
                        )}
                        {renderJob.gifUrl && (
                            <Anchor href={renderJob.gifUrl} target="_blank" size="sm">
                                <Group gap={4}><IconDownload size={14} /> Download GIF</Group>
                            </Anchor>
                        )}
                        {renderJob.status === 'failed' && renderJob.error && (
                            <Text size="sm" c="red">Error: {renderJob.error}</Text>
                        )}
                    </Stack>
                )}
            </Stack>
        </Modal>
    );
}

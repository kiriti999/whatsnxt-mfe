'use client';

import React, { useCallback, useState } from 'react';
import { Button, Group, Menu, Text } from '@mantine/core';
import {
    IconDownload,
    IconPhoto,
    IconRefresh,
    IconDeviceFloppy,
    IconBrandLinkedin,
    IconBrandInstagram,
    IconBrandFacebook,
    IconDeviceDesktop,
    IconDeviceMobile,
    IconDeviceTablet,
    IconFileTypeSvg,
    IconChevronDown,
} from '@tabler/icons-react';
import { ShareOptions } from '@whatsnxt/core-ui';
import styles from './visualizer.module.css';

interface ExportPreset {
    key: string;
    label: string;
    width: number;
    height: number;
    icon: React.ReactNode;
    group: 'device' | 'social';
}

const EXPORT_PRESETS: ExportPreset[] = [
    // Device presets
    { key: 'web-landscape', label: 'Web / Desktop (1920×1080)', width: 1920, height: 1080, icon: <IconDeviceDesktop size={16} />, group: 'device' },
    { key: 'web-portrait', label: 'Web / Desktop Portrait (1080×1920)', width: 1080, height: 1920, icon: <IconDeviceDesktop size={16} />, group: 'device' },
    { key: 'tablet', label: 'Tablet (1024×768)', width: 1024, height: 768, icon: <IconDeviceTablet size={16} />, group: 'device' },
    { key: 'mobile', label: 'Mobile (390×844)', width: 390, height: 844, icon: <IconDeviceMobile size={16} />, group: 'device' },
    { key: 'large-display', label: 'Large Display (2560×1440)', width: 2560, height: 1440, icon: <IconDeviceDesktop size={16} />, group: 'device' },
    { key: '4k', label: '4K Display (3840×2160)', width: 3840, height: 2160, icon: <IconDeviceDesktop size={16} />, group: 'device' },
    // Social presets
    { key: 'linkedin', label: 'LinkedIn Original (1200×627)', width: 1200, height: 627, icon: <IconBrandLinkedin size={16} />, group: 'social' },
    { key: 'linkedin-square', label: 'LinkedIn Square 1:1 (1080×1080)', width: 1080, height: 1080, icon: <IconBrandLinkedin size={16} />, group: 'social' },
    { key: 'linkedin-4-1', label: 'LinkedIn 4:1 (1200×300)', width: 1200, height: 300, icon: <IconBrandLinkedin size={16} />, group: 'social' },
    { key: 'linkedin-3-4', label: 'LinkedIn 3:4 (810×1080)', width: 810, height: 1080, icon: <IconBrandLinkedin size={16} />, group: 'social' },
    { key: 'linkedin-16-9', label: 'LinkedIn 16:9 (1920×1080)', width: 1920, height: 1080, icon: <IconBrandLinkedin size={16} />, group: 'social' },
    { key: 'instagram-square', label: 'Instagram Square (1080×1080)', width: 1080, height: 1080, icon: <IconBrandInstagram size={16} />, group: 'social' },
    { key: 'instagram-portrait', label: 'Instagram Portrait (1080×1350)', width: 1080, height: 1350, icon: <IconBrandInstagram size={16} />, group: 'social' },
    { key: 'instagram-story', label: 'Instagram Story (1080×1920)', width: 1080, height: 1920, icon: <IconBrandInstagram size={16} />, group: 'social' },
    { key: 'facebook', label: 'Facebook Post (1200×630)', width: 1200, height: 630, icon: <IconBrandFacebook size={16} />, group: 'social' },
    { key: 'facebook-cover', label: 'Facebook Cover (820×312)', width: 820, height: 312, icon: <IconBrandFacebook size={16} />, group: 'social' },
];

interface ExportToolbarProps {
    onRegenerate: () => void;
    onSave?: () => void;
    isLoading: boolean;
    hasDiagram: boolean;
    diagramTitle?: string;
    prompt?: string;
    email?: string;
    savedBlogUrl?: string;
}

export function ExportToolbar({
    onRegenerate,
    onSave,
    isLoading,
    hasDiagram,
    diagramTitle,
    prompt,
    email,
    savedBlogUrl,
}: ExportToolbarProps) {
    const [exporting, setExporting] = useState<string | null>(null);

    const getSvgElement = useCallback((): SVGSVGElement | null => {
        return document.querySelector('#diagram-canvas svg') as SVGSVGElement | null;
    }, []);

    const serializeSvg = useCallback((svgElement: SVGSVGElement): string => {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svgElement);
    }, []);

    const downloadBlob = useCallback((blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    const exportAsSVG = useCallback(async () => {
        setExporting('svg');
        try {
            const svgElement = getSvgElement();
            if (!svgElement) {
                alert('No diagram to export');
                return;
            }

            const svgString = serializeSvg(svgElement);
            const svgBlob = new Blob(
                [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
                { type: 'image/svg+xml;charset=utf-8' }
            );
            downloadBlob(svgBlob, `diagram-${Date.now()}.svg`);
        } catch (error) {
            console.error('SVG export failed:', error);
            alert('Failed to export SVG');
        } finally {
            setExporting(null);
        }
    }, [getSvgElement, serializeSvg, downloadBlob]);

    const exportAsPNG = useCallback(async (targetWidth?: number, targetHeight?: number, presetKey?: string) => {
        const exportKey = presetKey || 'png';
        setExporting(exportKey);
        try {
            const svgElement = getSvgElement();
            if (!svgElement) {
                alert('No diagram to export');
                return;
            }

            const svgString = serializeSvg(svgElement);

            // Source dimensions from SVG
            const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1200, 800];
            const svgWidth = viewBox[2] || 1200;
            const svgHeight = viewBox[3] || 800;

            // Target dimensions — use preset or 2x scale
            const outWidth = targetWidth || svgWidth * 2;
            const outHeight = targetHeight || svgHeight * 2;

            const canvas = document.createElement('canvas');
            canvas.width = outWidth;
            canvas.height = outHeight;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                alert('Canvas not supported');
                return;
            }

            // White background for social/device exports
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, outWidth, outHeight);

            const img = new Image();
            const svgBlob = new Blob(
                [`<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`],
                { type: 'image/svg+xml;charset=utf-8' }
            );
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                // Scale to fit within target while maintaining aspect ratio
                const svgAspect = svgWidth / svgHeight;
                const targetAspect = outWidth / outHeight;

                let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;

                if (svgAspect > targetAspect) {
                    // SVG is wider — fit to width, center vertically
                    drawWidth = outWidth;
                    drawHeight = outWidth / svgAspect;
                    offsetX = 0;
                    offsetY = (outHeight - drawHeight) / 2;
                } else {
                    // SVG is taller — fit to height, center horizontally
                    drawHeight = outHeight;
                    drawWidth = outHeight * svgAspect;
                    offsetX = (outWidth - drawWidth) / 2;
                    offsetY = 0;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const suffix = presetKey ? `-${presetKey}` : '';
                        downloadBlob(blob, `diagram${suffix}-${Date.now()}.png`);
                    }
                    URL.revokeObjectURL(url);
                    setExporting(null);
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                setExporting(null);
                alert('Failed to export as PNG');
            };

            img.src = url;
        } catch (error) {
            console.error('PNG export failed:', error);
            alert('Failed to export PNG');
            setExporting(null);
        }
    }, [getSvgElement, serializeSvg, downloadBlob]);

    const devicePresets = EXPORT_PRESETS.filter((p) => p.group === 'device');
    const socialPresets = EXPORT_PRESETS.filter((p) => p.group === 'social');

    return (
        <div className={styles.exportToolbar}>
            <Group gap="sm">
                <Button
                    variant="light"
                    size="sm"
                    leftSection={<IconRefresh size={16} />}
                    onClick={onRegenerate}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    Regenerate
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    leftSection={<IconFileTypeSvg size={16} />}
                    onClick={exportAsSVG}
                    disabled={!hasDiagram || exporting === 'svg'}
                    loading={exporting === 'svg'}
                >
                    SVG
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    leftSection={<IconPhoto size={16} />}
                    onClick={() => exportAsPNG()}
                    disabled={!hasDiagram || exporting === 'png'}
                    loading={exporting === 'png'}
                >
                    PNG
                </Button>

                <Menu shadow="md" width={280} position="bottom-end">
                    <Menu.Target>
                        <Button
                            variant="outline"
                            size="sm"
                            leftSection={<IconDownload size={16} />}
                            rightSection={<IconChevronDown size={14} />}
                            disabled={!hasDiagram || !!exporting}
                        >
                            Export For
                        </Button>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>Devices</Menu.Label>
                        {devicePresets.map((preset) => (
                            <Menu.Item
                                key={preset.key}
                                leftSection={preset.icon}
                                onClick={() => exportAsPNG(preset.width, preset.height, preset.key)}
                                disabled={exporting === preset.key}
                            >
                                <Text size="sm">{preset.label}</Text>
                            </Menu.Item>
                        ))}

                        <Menu.Divider />

                        <Menu.Label>Social Media</Menu.Label>
                        {socialPresets.map((preset) => (
                            <Menu.Item
                                key={preset.key}
                                leftSection={preset.icon}
                                onClick={() => exportAsPNG(preset.width, preset.height, preset.key)}
                                disabled={exporting === preset.key}
                            >
                                <Text size="sm">{preset.label}</Text>
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>

                {onSave && (
                    <Button
                        variant="filled"
                        size="sm"
                        leftSection={<IconDeviceFloppy size={16} />}
                        onClick={onSave}
                        disabled={!hasDiagram}
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: '#1a1a2e',
                        }}
                    >
                        Save to History
                    </Button>
                )}

                {hasDiagram && (
                    <ShareOptions
                        url={typeof window !== 'undefined' ? `${window.location.origin}${savedBlogUrl || '/blogs'}` : (savedBlogUrl || '/blogs')}
                        title={diagramTitle || 'Diagram'}
                        thumbnailUrn=""
                        description={prompt}
                        email={email}
                    />
                )}
            </Group>
        </div>
    );
}

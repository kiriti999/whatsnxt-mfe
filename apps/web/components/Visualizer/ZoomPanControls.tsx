'use client';

import React from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import {
    IconZoomIn,
    IconZoomOut,
    IconZoomReset,
    IconMaximize,
} from '@tabler/icons-react';
import styles from './visualizer.module.css';

interface ZoomPanControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomReset: () => void;
    onFitToScreen: () => void;
}

export function ZoomPanControls({
    zoom,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onFitToScreen,
}: ZoomPanControlsProps) {
    const zoomPercent = Math.round(zoom * 100);

    return (
        <div className={styles.zoomControls}>
            <Group gap={4}>
                <Tooltip label="Zoom Out" position="top">
                    <ActionIcon
                        variant="subtle"
                        size="md"
                        onClick={onZoomOut}
                        disabled={zoom <= 0.25}
                    >
                        <IconZoomOut size={18} />
                    </ActionIcon>
                </Tooltip>

                <span className={styles.zoomLabel}>{zoomPercent}%</span>

                <Tooltip label="Zoom In" position="top">
                    <ActionIcon
                        variant="subtle"
                        size="md"
                        onClick={onZoomIn}
                        disabled={zoom >= 3}
                    >
                        <IconZoomIn size={18} />
                    </ActionIcon>
                </Tooltip>

                <div className={styles.zoomDivider} />

                <Tooltip label="Reset (100%)" position="top">
                    <ActionIcon variant="subtle" size="md" onClick={onZoomReset}>
                        <IconZoomReset size={18} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Fit to Screen" position="top">
                    <ActionIcon variant="subtle" size="md" onClick={onFitToScreen}>
                        <IconMaximize size={18} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        </div>
    );
}

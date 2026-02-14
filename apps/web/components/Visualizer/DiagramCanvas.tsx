'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Paper, Text } from '@mantine/core';
import type { DiagramData } from './types';
import { getRenderer } from './renderers';
import { ZoomPanControls } from './ZoomPanControls';
import styles from './visualizer.module.css';

interface DiagramCanvasProps {
    diagramData: DiagramData | null;
    diagramType: string;
    isLoading: boolean;
    error: string | null;
    onNodeSelect?: (nodeId: string | null) => void;
    selectedNodeId?: string | null;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

export function DiagramCanvas({
    diagramData,
    diagramType,
    isLoading,
    error,
    onNodeSelect,
    selectedNodeId,
}: DiagramCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const handleFitToScreen = useCallback(() => {
        if (!containerRef.current || !innerRef.current) return;
        const container = containerRef.current.getBoundingClientRect();
        const svg = innerRef.current.querySelector('svg');
        if (!svg) return;

        const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number);
        if (!viewBox || viewBox.length < 4) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
            return;
        }

        const svgW = viewBox[2];
        const svgH = viewBox[3];
        const scaleX = (container.width - 40) / svgW;
        const scaleY = (container.height - 40) / svgH;
        const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
        setZoom(Math.max(newZoom, MIN_ZOOM));
        setPan({ x: 0, y: 0 });
    }, []);

    // Mouse wheel zoom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
                setZoom((z) => Math.max(MIN_ZOOM, Math.min(z + delta, MAX_ZOOM)));
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    // Pan handlers
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Only pan on middle-click or when holding space
            if (e.button === 1 || e.altKey) {
                e.preventDefault();
                setIsPanning(true);
                panStart.current = {
                    x: e.clientX,
                    y: e.clientY,
                    panX: pan.x,
                    panY: pan.y,
                };
            }
        },
        [pan],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isPanning) return;
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setPan({
                x: panStart.current.panX + dx,
                y: panStart.current.panY + dy,
            });
        },
        [isPanning],
    );

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    // Click handler for node selection
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent) => {
            if (!onNodeSelect) return;

            // Check if click was on a node group
            const target = e.target as SVGElement;
            const group = target.closest('g[data-node-id]');
            if (group) {
                const nodeId = group.getAttribute('data-node-id');
                onNodeSelect(nodeId);
            } else {
                // Click on blank canvas → deselect
                onNodeSelect(null);
            }
        },
        [onNodeSelect],
    );

    if (isLoading) {
        return (
            <Paper className={styles.canvasContainer} shadow="sm" withBorder>
                <div className={styles.canvasLoading}>
                    <div className={styles.loadingSpinner} />
                    <Text className={styles.loadingText}>
                        AI is generating your diagram...
                    </Text>
                    <Text className={styles.loadingSubtext}>
                        This may take 10-30 seconds depending on complexity
                    </Text>
                </div>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper className={styles.canvasContainer} shadow="sm" withBorder>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>⚠️</div>
                    <Text className={styles.emptyStateText}>Generation Failed</Text>
                    <Text className={styles.emptyStateSubtext}>{error}</Text>
                </div>
            </Paper>
        );
    }

    if (!diagramData) {
        return (
            <Paper className={styles.canvasContainer} shadow="sm" withBorder>
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🎨</div>
                    <Text className={styles.emptyStateText}>No diagram yet</Text>
                    <Text className={styles.emptyStateSubtext}>
                        Describe what you want to visualize and click Generate
                    </Text>
                </div>
            </Paper>
        );
    }

    const Renderer = getRenderer(diagramType);

    return (
        <Paper
            className={`${styles.canvasContainer} ${styles.slideUp}`}
            shadow="sm"
            withBorder
            ref={containerRef}
            style={{ cursor: isPanning ? 'grabbing' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <ZoomPanControls
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomReset={handleZoomReset}
                onFitToScreen={handleFitToScreen}
            />
            <div
                className={styles.canvasInner}
                id="diagram-canvas"
                ref={innerRef}
                onClick={handleCanvasClick}
                style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                }}
            >
                <Renderer data={diagramData} width={1200} height={800} />
            </div>
        </Paper>
    );
}

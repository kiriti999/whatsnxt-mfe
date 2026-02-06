import { Modal, ActionIcon, Box, Group } from '@mantine/core';
import { IconMaximize, IconX, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react';
import { useState } from 'react';
import styles from './ExcalidrawFullscreen.module.css';

interface ExcalidrawFullscreenProps {
    svgContent: string;
    alt?: string;
}

export function ExcalidrawFullscreen({ svgContent, alt = 'Excalidraw diagram' }: ExcalidrawFullscreenProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200)); // Max 200%
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 50)); // Min 50%
    };

    const handleZoomReset = () => {
        setZoom(100);
    };

    const handleClose = () => {
        setIsFullscreen(false);
        setZoom(100); // Reset zoom when closing
    };

    return (
        <>
            <ActionIcon
                className={styles.fullscreenButton}
                onClick={() => setIsFullscreen(true)}
                variant="filled"
                color="gray"
                size="md"
                title="View fullscreen"
            >
                <IconMaximize size={16} />
            </ActionIcon>

            <Modal
                opened={isFullscreen}
                onClose={handleClose}
                fullScreen
                padding={0}
                withCloseButton={false}
                classNames={{
                    body: styles.modalBody,
                    content: styles.modalContent
                }}
            >
                <Box className={styles.fullscreenContainer}>
                    {/* Zoom Controls - Top Left */}
                    <Group className={styles.zoomControls} gap="xs">
                        <ActionIcon
                            onClick={handleZoomOut}
                            variant="filled"
                            color="dark"
                            size="md"
                            title="Zoom out"
                            disabled={zoom <= 50}
                        >
                            <IconZoomOut size={18} />
                        </ActionIcon>

                        <Box className={styles.zoomLevel}>
                            {zoom}%
                        </Box>

                        <ActionIcon
                            onClick={handleZoomIn}
                            variant="filled"
                            color="dark"
                            size="md"
                            title="Zoom in"
                            disabled={zoom >= 200}
                        >
                            <IconZoomIn size={18} />
                        </ActionIcon>

                        <ActionIcon
                            onClick={handleZoomReset}
                            variant="filled"
                            color="dark"
                            size="md"
                            title="Reset zoom"
                        >
                            <IconZoomReset size={18} />
                        </ActionIcon>
                    </Group>

                    {/* Close Button - Top Right */}
                    <ActionIcon
                        className={styles.closeButton}
                        onClick={handleClose}
                        variant="filled"
                        color="dark"
                        size="lg"
                        title="Close fullscreen"
                    >
                        <IconX size={20} />
                    </ActionIcon>

                    <Box className={styles.diagramWrapper}>
                        <div
                            className={styles.diagram}
                            style={{ transform: `scale(${zoom / 100})` }}
                            dangerouslySetInnerHTML={{ __html: svgContent }}
                        />
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

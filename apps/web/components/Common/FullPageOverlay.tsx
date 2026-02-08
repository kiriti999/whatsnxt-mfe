'use client';

import React from 'react';
import { Box, LoadingOverlay, type LoadingOverlayProps } from '@mantine/core';

interface FullPageOverlayProps {
    visible: boolean;
    loaderProps?: LoadingOverlayProps['loaderProps'];
    overlayOpacity?: number;
}

/**
 * A reusable full-page overlay component that covers the entire viewport
 * Useful for blocking interactions during async operations like CRUD operations
 */
export function FullPageOverlay({
    visible,
    loaderProps = { color: 'blue', type: 'bars', size: 'xl' },
    overlayOpacity = 0.5
}: FullPageOverlayProps) {
    if (!visible) return null;

    return (
        <Box
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <LoadingOverlay
                visible={true}
                zIndex={10000}
                overlayProps={{ radius: "sm", blur: 2, backgroundOpacity: 0 }}
                loaderProps={loaderProps}
            />
        </Box>
    );
}

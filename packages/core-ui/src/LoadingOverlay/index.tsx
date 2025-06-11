import { LoadingOverlay as MantineOverlay, Box } from '@mantine/core';
import React from 'react';

interface Props {
    children: React.ReactNode;
    visible: boolean;
}

const LoadingOverlay = ({ children, visible }: Props) => {
    return (
        <Box pos="relative">
            <MantineOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            <>
                {children}
            </>
        </Box>
    );
};

export default LoadingOverlay;

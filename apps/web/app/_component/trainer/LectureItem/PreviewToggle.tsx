import { Tooltip } from '@mantine/core';
import React from 'react';
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const PreviewToggle = ({ isPreview, size = 26, togglePreview }) => {
    return (
        <Tooltip label={isPreview ? "Preview mode On" : "Preview mode Off"}>
            {isPreview ? (
                <IconEye
                    size={size}
                    onClick={() => togglePreview(false)}
                    style={{ cursor: 'pointer' }}
                />
            ) : (
                <IconEyeOff
                    size={size}
                    onClick={() => togglePreview(true)}
                    style={{ cursor: 'pointer' }}
                />
            )}
        </Tooltip>
    );
};

export default PreviewToggle;

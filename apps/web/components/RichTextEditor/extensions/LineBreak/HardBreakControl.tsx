import React from 'react';
import { ActionIcon, Tooltip, Text, Box } from '@mantine/core';
import { IconArrowBarDown } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';

interface HardBreakControlProps {
    editor: Editor;
}

const HardBreakControl: React.FC<HardBreakControlProps> = ({ editor }) => {
    const insertHardBreak = () => {
        editor.chain().focus().setHardBreak().run();
    };

    // Custom tooltip content with shortcut info
    const tooltipContent = (
        <Box>
            <Text size="xs">Insert line break</Text>
            <Text size="xs" c="dimmed">Shortcut: Shift + Enter</Text>
        </Box>
    );

    return (
        <Tooltip label={tooltipContent} multiline>
            <ActionIcon
                variant="subtle"
                onClick={insertHardBreak}
                size="md"
                aria-label="Insert line break"
            >
                <IconArrowBarDown size={16} />
            </ActionIcon>
        </Tooltip>
    );
};


export default HardBreakControl;
import React from 'react';
import { ColorInput, Popover, Button, Group, Tooltip, ActionIcon } from '@mantine/core';
import { IconPalette } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';

interface HighlightColorPickerProps {
    editor: Editor;
}

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({ editor }) => {
    const [opened, setOpened] = React.useState(false);
    const [currentColor, setCurrentColor] = React.useState('#fef08a');

    const presetColors = [
        { color: '#fef08a', label: 'Yellow' },
        { color: '#bbf7d0', label: 'Green' },
        { color: '#fbcfe8', label: 'Pink' },
        { color: '#bfdbfe', label: 'Blue' },
        { color: '#fecaca', label: 'Red' },
        { color: '#d9f99d', label: 'Lime' },
        { color: '#c7d2fe', label: 'Indigo' },
        { color: '#fde68a', label: 'Amber' },
    ];

    const handleColorChange = (color: string) => {
        setCurrentColor(color);
        editor.chain().focus().toggleHighlight({ color }).run();
        setOpened(false);
    };

    return (
        <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            position="bottom"
            withArrow
        >
            <Popover.Target>
                <Tooltip label="Highlight color picker">
                    <ActionIcon
                        variant="subtle"
                        onClick={() => setOpened((o) => !o)}
                        style={{
                            color: editor.isActive('highlight') ? currentColor : undefined
                        }}
                    >
                        <IconPalette size={16} />
                    </ActionIcon>
                </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
                <Group gap="xs">
                    {presetColors.map((preset) => (
                        <Tooltip key={preset.color} label={preset.label}>
                            <ActionIcon
                                size="lg"
                                variant={currentColor === preset.color ? 'filled' : 'light'}
                                style={{
                                    backgroundColor: preset.color,
                                    color: 'white'
                                }}
                                onClick={() => handleColorChange(preset.color)}
                            >
                                {currentColor === preset.color ? '✓' : ''}
                            </ActionIcon>
                        </Tooltip>
                    ))}
                </Group>
                <ColorInput
                    value={currentColor}
                    onChange={handleColorChange}
                    placeholder="Custom color"
                    size="xs"
                />
                <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    onClick={() => {
                        editor.chain().focus().unsetHighlight().run();
                        setOpened(false);
                    }}
                    disabled={!editor.isActive('highlight')}
                >
                    Remove highlight
                </Button>
            </Popover.Dropdown>
        </Popover>
    );
};
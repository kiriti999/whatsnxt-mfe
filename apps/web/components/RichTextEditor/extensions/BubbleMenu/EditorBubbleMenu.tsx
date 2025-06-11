import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import {
    IconBold,
    IconItalic,
    IconUnderline,
    IconStrikethrough,
    IconLink,
    IconCode,
    IconHighlight,
    IconCodeDots,
    IconX,
    IconCopy
} from '@tabler/icons-react';

interface EditorBubbleMenuProps {
    editor: any;
}

const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = ({ editor }) => {
    // Check if selection is inside a code block
    const isInCodeBlock = editor.isActive('codeBlock');

    // Function to handle link button click
    const handleLinkClick = () => {
        const { state } = editor.view;
        const { from, to } = state.selection;

        // Only show link dialog if text is selected
        if (from !== to) {
            if (editor.isActive('link')) {
                // If already a link, remove it
                editor.chain().focus().unsetLink().run();
            } else {
                // Otherwise, prompt for URL
                const url = window.prompt('URL');
                if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                }
            }
        }
    };

    // Function to exit code block
    const handleExitCodeBlock = () => {
        // Convert code block content to paragraph
        editor.chain().focus().setNode('paragraph').run();
    };

    // Function to copy code block content
    const handleCopyCode = () => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        navigator.clipboard.writeText(text).then(() => {
            // Optional: Show a notification that text was copied
            console.log('Code copied to clipboard');
        });
    };

    // Define common ActionIcon props for consistency
    const actionIconProps = {
        size: 'sm',
        radius: 'md',
        variant: 'light' as const,
        styles: {
            root: {
                width: '28px',
                height: '28px',
                margin: '0 2px'
            }
        }
    };

    // If we're inside a code block, show code block specific controls
    if (isInCodeBlock) {
        return (
            <BubbleMenu
                editor={editor}
                tippyOptions={{
                    duration: 100,
                    placement: 'top'
                }}
            >
                <Group
                    className="bubble-menu code-block-menu"
                    gap={0}
                    p="xs"
                    style={{
                        backgroundColor: '#1e1e1e',
                        borderRadius: '4px',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
                        border: '1px solid #333'
                    }}
                >
                    <Tooltip label="Copy Code">
                        <ActionIcon
                            {...actionIconProps}
                            onClick={handleCopyCode}
                            color="blue"
                            variant="light"
                            style={{ color: '#d4d4d4' }}
                        >
                            <IconCopy size={16} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Exit Code Block">
                        <ActionIcon
                            {...actionIconProps}
                            onClick={handleExitCodeBlock}
                            color="red"
                            variant="light"
                            style={{ color: '#ff6b6b' }}
                        >
                            <IconX size={16} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Code Block">
                        <ActionIcon
                            {...actionIconProps}
                            color="blue"
                            variant="filled"
                        >
                            <IconCodeDots size={16} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </BubbleMenu>
        );
    }

    // Regular bubble menu for non-code block content
    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{
                duration: 100,
                placement: 'top'
            }}
        >
            <Group
                className="bubble-menu"
                gap={0}
                p="xs"
                style={{
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e0e0e0'
                }}
            >
                <Tooltip label="Bold">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        color={editor.isActive('bold') ? 'blue' : 'gray'}
                        variant={editor.isActive('bold') ? 'filled' : 'light'}
                    >
                        <IconBold size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Italic">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        color={editor.isActive('italic') ? 'blue' : 'gray'}
                        variant={editor.isActive('italic') ? 'filled' : 'light'}
                    >
                        <IconItalic size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Underline">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        color={editor.isActive('underline') ? 'blue' : 'gray'}
                        variant={editor.isActive('underline') ? 'filled' : 'light'}
                    >
                        <IconUnderline size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Strikethrough">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        color={editor.isActive('strike') ? 'blue' : 'gray'}
                        variant={editor.isActive('strike') ? 'filled' : 'light'}
                    >
                        <IconStrikethrough size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Inline Code">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => {
                            editor.commands.toggleCode();
                        }}
                        color={editor.isActive('code') ? 'blue' : 'gray'}
                        variant={editor.isActive('code') ? 'filled' : 'light'}
                    >
                        <IconCode size={16} />
                    </ActionIcon>
                </Tooltip>


                <Tooltip label={editor.isActive('link') ? "Remove link" : "Add link"}>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={handleLinkClick}
                        color={editor.isActive('link') ? 'blue' : 'gray'}
                        variant={editor.isActive('link') ? 'filled' : 'light'}
                    >
                        <IconLink size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Highlight">
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        color={editor.isActive('highlight') ? 'blue' : 'gray'}
                        variant={editor.isActive('highlight') ? 'filled' : 'light'}
                    >
                        <IconHighlight size={16} />
                    </ActionIcon>
                </Tooltip>

                {/* Can add more buttons based on your needs */}
            </Group>
        </BubbleMenu>
    );
};

export default EditorBubbleMenu;
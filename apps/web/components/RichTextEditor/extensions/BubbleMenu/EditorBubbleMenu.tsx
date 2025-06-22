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
                    appendTo: () => document.body,
                    duration: 100,
                    placement: 'top',
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
                        border: '1px solid #333',
                        position: 'relative',
                        // Add a small arrow pointing to the selected text
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1e1e1e'
                        }
                    }}
                >
                    <Tooltip label="Copy Code" withinPortal>
                        <ActionIcon
                            {...actionIconProps}
                            onClick={handleCopyCode}
                            color="blue"
                            variant="light"
                            style={{ color: '#d4d4d4' }}
                            aria-label="Copy code to clipboard"
                        >
                            <IconCopy size={16} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Exit Code Block" withinPortal>
                        <ActionIcon
                            {...actionIconProps}
                            onClick={handleExitCodeBlock}
                            color="red"
                            variant="light"
                            style={{ color: '#ff6b6b' }}
                            aria-label="Exit code block"
                        >
                            <IconX size={16} />
                        </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Code Block" withinPortal>
                        <ActionIcon
                            {...actionIconProps}
                            color="blue"
                            variant="filled"
                            aria-label="Code block active"
                            aria-pressed="true"
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
                appendTo: () => document.body,
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
                    border: '1px solid #e0e0e0',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid white'
                    }
                }}
            >
                <Tooltip label="Bold" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        color={editor.isActive('bold') ? 'blue' : 'gray'}
                        variant={editor.isActive('bold') ? 'filled' : 'light'}
                        aria-label="Toggle bold"
                        aria-pressed={editor.isActive('bold')}
                    >
                        <IconBold size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Italic" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        color={editor.isActive('italic') ? 'blue' : 'gray'}
                        variant={editor.isActive('italic') ? 'filled' : 'light'}
                        aria-label="Toggle italic"
                        aria-pressed={editor.isActive('italic')}
                    >
                        <IconItalic size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Underline" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        color={editor.isActive('underline') ? 'blue' : 'gray'}
                        variant={editor.isActive('underline') ? 'filled' : 'light'}
                        aria-label="Toggle underline"
                        aria-pressed={editor.isActive('underline')}
                    >
                        <IconUnderline size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Strikethrough" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        color={editor.isActive('strike') ? 'blue' : 'gray'}
                        variant={editor.isActive('strike') ? 'filled' : 'light'}
                        aria-label="Toggle strikethrough"
                        aria-pressed={editor.isActive('strike')}
                    >
                        <IconStrikethrough size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Inline Code" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => {
                            editor.commands.toggleCode();
                        }}
                        color={editor.isActive('code') ? 'blue' : 'gray'}
                        variant={editor.isActive('code') ? 'filled' : 'light'}
                        aria-label="Toggle inline code"
                        aria-pressed={editor.isActive('code')}
                    >
                        <IconCode size={16} />
                    </ActionIcon>
                </Tooltip>


                <Tooltip label={editor.isActive('link') ? "Remove link" : "Add link"} withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={handleLinkClick}
                        color={editor.isActive('link') ? 'blue' : 'gray'}
                        variant={editor.isActive('link') ? 'filled' : 'light'}
                        aria-label={editor.isActive('link') ? "Remove link" : "Add link"}
                        aria-pressed={editor.isActive('link')}
                    >
                        <IconLink size={16} />
                    </ActionIcon>
                </Tooltip>

                <Tooltip label="Highlight" withinPortal>
                    <ActionIcon
                        {...actionIconProps}
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        color={editor.isActive('highlight') ? 'blue' : 'gray'}
                        variant={editor.isActive('highlight') ? 'filled' : 'light'}
                        aria-label="Toggle highlight"
                        aria-pressed={editor.isActive('highlight')}
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
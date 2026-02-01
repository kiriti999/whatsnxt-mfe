'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { CodeHighlightPlugin } from './plugins/CodeHighlightPlugin';
import { ImagesPlugin } from './plugins/ImagesPlugin';
import { ImageNode } from './nodes/ImageNode';

import {
  EditorState,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { CodeHighlightNode, CodeNode, $createCodeNode, $isCodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { ListItemNode, ListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { HeadingNode, QuoteNode, $createQuoteNode, $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { TableNode, TableCellNode, TableRowNode, INSERT_TABLE_COMMAND } from '@lexical/table';
import { Stack, Paper, Text, Group, ActionIcon, Tooltip, Divider, Button, Menu, Select } from '@mantine/core';
import {
  IconCode,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconTable,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCodeDots,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconIndentIncrease,
  IconIndentDecrease,
  IconSuperscript,
  IconSubscript,
  IconHighlight,
  IconClearFormatting,
  IconMinus,
  IconChevronDown,
} from '@tabler/icons-react';
import { lexicalTheme, getCodeLanguageOptions } from './lexical-config';
import './LexicalTheme.css'; // Global styles for Lexical theme classes
import styles from './LexicalEditor.module.css';


interface LexicalEditorProps {
  value?: string; // Serialized Lexical state JSON
  onChange?: (state: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const execCommand = useCallback((command: any) => {
    editor.dispatchCommand(command, undefined);
  }, [editor]);

  const toggleTextFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const insertHeading = useCallback((level: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(level));
      }
    });
  }, [editor]);

  const insertList = useCallback((ordered: boolean) => {
    if (ordered) {
      execCommand(INSERT_ORDERED_LIST_COMMAND);
    } else {
      execCommand(INSERT_UNORDERED_LIST_COMMAND);
    }
  }, [execCommand]);

  const insertQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const insertCodeBlock = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
  }, [editor]);

  const insertTable = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: '3', columns: '3' });
  }, [editor]);

  const formatText = useCallback((format: 'superscript' | 'subscript' | 'highlight') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor]);

  const formatElement = useCallback((format: 'left' | 'center' | 'right' | 'justify') => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }, [editor]);

  const indent = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const outdent = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0); // Clear all formatting
          }
        });
      }
    });
  }, [editor]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>('plaintext');
  const [isCode, setIsCode] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === 'root'
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();

          if ($isCodeNode(element)) {
            setIsCode(true);
            setSelectedLanguage(element.getLanguage() || 'plaintext');
          } else {
            setIsCode(false);
          }
        }
      });
    });
  }, [editor]);

  const onLanguageChange = useCallback((value: string | null) => {
    if (!value) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element = anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

        if ($isCodeNode(element)) {
          element.setLanguage(value);
        }
      }
    });
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    // ... logic remains same if used
  }, [editor]);

  return (
    <Group gap={10} p={4} className={styles.toolbar} wrap="nowrap" justify="flex-start" align="center">
      {/* 1. History (Undo/Redo) */}
      <Group gap={2} wrap="nowrap">
        <Tooltip label="Undo (Ctrl+Z)">
          <ActionIcon variant="subtle" size="sm" onClick={() => execCommand(UNDO_COMMAND)}>
            <IconArrowBackUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Y)">
          <ActionIcon variant="subtle" size="sm" onClick={() => execCommand(REDO_COMMAND)}>
            <IconArrowForwardUp size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* 2. Block Type Dropdown */}
      <Menu shadow="md" width={180}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconH1 size={16} />}
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            Normal
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => insertHeading('h1')} leftSection={<IconH1 size={16} />}>Heading 1</Menu.Item>
          <Menu.Item onClick={() => insertHeading('h2')} leftSection={<IconH2 size={16} />}>Heading 2</Menu.Item>
          <Menu.Item onClick={() => insertHeading('h3')} leftSection={<IconH3 size={16} />}>Heading 3</Menu.Item>
          <Menu.Item onClick={insertQuote} leftSection={<IconQuote size={16} />}>Quote</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={20} />

      <Group gap={2} wrap="nowrap">
        <Tooltip label="Bullet List">
          <ActionIcon variant="subtle" size="sm" onClick={() => insertList(false)}>
            <IconList size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Numbered List">
          <ActionIcon variant="subtle" size="sm" onClick={() => insertList(true)}>
            <IconListNumbers size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" h={20} />

      {/* 3. Text Formatting Group */}
      <Group gap={2} wrap="nowrap">
        <Tooltip label="Bold">
          <ActionIcon variant="subtle" size="sm" onClick={() => toggleTextFormat('bold')}>
            <IconBold size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Italic">
          <ActionIcon variant="subtle" size="sm" onClick={() => toggleTextFormat('italic')}>
            <IconItalic size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Underline">
          <ActionIcon variant="subtle" size="sm" onClick={() => toggleTextFormat('underline')}>
            <IconUnderline size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Inline Code">
          <ActionIcon variant="subtle" size="sm" onClick={() => toggleTextFormat('code')}>
            <IconCode size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Code Block">
          <ActionIcon variant="subtle" size="sm" onClick={insertCodeBlock} color={isCode ? 'blue' : undefined}>
            <IconCodeDots size={18} />
          </ActionIcon>
        </Tooltip>

        {isCode && (
          <Select
            size="xs"
            placeholder="Language"
            data={getCodeLanguageOptions().map(([val, label]) => ({ value: val, label }))}
            value={selectedLanguage}
            onChange={onLanguageChange}
            style={{ width: 120 }}
            comboboxProps={{ withinPortal: true }}
          />
        )}
        <Tooltip label="Link">
          <ActionIcon variant="subtle" size="sm" onClick={() => execCommand(TOGGLE_LINK_COMMAND)}>
            <IconLink size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" h={20} />

      {/* 4. More Options Dropdown */}
      <Menu shadow="md" width={180}>
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm">
            <IconHighlight size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => formatText('superscript')} leftSection={<IconSuperscript size={16} />}>Superscript</Menu.Item>
          <Menu.Item onClick={() => formatText('subscript')} leftSection={<IconSubscript size={16} />}>Subscript</Menu.Item>
          <Menu.Item onClick={() => formatText('highlight')} leftSection={<IconHighlight size={16} />}>Highlight</Menu.Item>
          <Menu.Item onClick={() => toggleTextFormat('strikethrough')} leftSection={<IconStrikethrough size={16} />}>Strikethrough</Menu.Item>
          <Menu.Divider />
          <Menu.Item onClick={clearFormatting} leftSection={<IconClearFormatting size={16} />}>Clear Formatting</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={20} />

      {/* 5. Insert Dropdown */}
      <Menu shadow="md" width={150}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<Text size="sm" fw={700}>+</Text>}
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            Insert
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={insertTable} leftSection={<IconTable size={16} />}>Table</Menu.Item>
          <Menu.Item onClick={insertCodeBlock} leftSection={<IconCodeDots size={16} />}>Code Block</Menu.Item>
          <Menu.Item onClick={insertHorizontalRule} leftSection={<IconMinus size={16} />}>Horizontal Rule</Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={20} />

      {/* 6. Alignment Dropdown */}
      <Menu shadow="md" width={170}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconAlignLeft size={16} />}
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            Alignment
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item onClick={() => formatElement('left')} leftSection={<IconAlignLeft size={16} />}>Left Align</Menu.Item>
          <Menu.Item onClick={() => formatElement('center')} leftSection={<IconAlignCenter size={16} />}>Center Align</Menu.Item>
          <Menu.Item onClick={() => formatElement('right')} leftSection={<IconAlignRight size={16} />}>Right Align</Menu.Item>
          <Menu.Item onClick={() => formatElement('justify')} leftSection={<IconAlignJustified size={16} />}>Justify</Menu.Item>
          <Menu.Divider />
          <Menu.Item onClick={outdent} leftSection={<IconIndentDecrease size={16} />}>Outdent</Menu.Item>
          <Menu.Item onClick={indent} leftSection={<IconIndentIncrease size={16} />}>Indent</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

const OnChangePluginWrapper: React.FC<{ onChange?: (state: string) => void }> = ({
  onChange,
}) => {
  const handleChange = (editorState: EditorState) => {
    if (onChange) {
      const serialized = JSON.stringify(editorState.toJSON());
      onChange(serialized);
    }
  };

  return <OnChangePlugin onChange={handleChange} />;
};

const InitialStatePlugin: React.FC<{ value?: string }> = ({ value }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value === undefined || value === null) return;

    editor.update(() => {
      const currentEditorState = editor.getEditorState();
      const currentSerialized = JSON.stringify(currentEditorState.toJSON());

      if (value !== currentSerialized) {
        try {
          // If value is empty string, just clear
          if (value === '') {
            const root = $getRoot();
            root.clear();
            root.append($createParagraphNode());
            return;
          }

          const editorState = editor.parseEditorState(value);
          editor.setEditorState(editorState);
        } catch (e) {
          // Not valid Lexical JSON, fallback to treating it as plain text content
          // This helps load legacy description/content
          const root = $getRoot();
          root.clear();
          const p = $createParagraphNode();
          p.append($createTextNode(value));
          root.append(p);
          console.warn('LexicalEditor: Value is not valid JSON, loaded as plain text fallback.');
        }
      }
    });
  }, [value, editor]);

  return null;
};

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  readOnly = false,
}) => {
  const editorStateRef = useRef<string | undefined>(value);

  const initialConfig = {
    namespace: 'StructuredTutorialEditor',
    theme: lexicalTheme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      ImageNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
    editable: !readOnly,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Stack gap={0}>
        {!readOnly && <ToolbarPlugin />}
        <Paper p={0} className={styles.editorContainer}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={styles.contentEditable}
                spellCheck="true"
              />
            }
            placeholder={
              <div className={styles.placeholder}>{placeholder}</div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <CodeHighlightPlugin />
          <ImagesPlugin />
          {/* <CodeActionMenuPlugin /> */}
          <InitialStatePlugin value={value} />
          <OnChangePluginWrapper onChange={onChange} />
          <ClearEditorPlugin />
        </Paper>
      </Stack>
    </LexicalComposer>
  );
};

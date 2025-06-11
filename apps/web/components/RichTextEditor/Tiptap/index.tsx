
import React, { useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import FontFamily from "@tiptap/extension-font-family";
import Youtube from "@tiptap/extension-youtube";
import Typography from "@tiptap/extension-typography";
import Code from '@tiptap/extension-code';
import Paragraph from '@tiptap/extension-paragraph'
import Focus from "@tiptap/extension-focus";
import CharacterCount from "@tiptap/extension-character-count";
import { createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";
import Underline from "@tiptap/extension-underline";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconHighlight,
  IconTable,
  IconPlus,
  IconMinus,
  IconColumns,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconQuote,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCode,
  IconH5,
  IconH6,
  IconIndentDecrease,
  IconIndentIncrease,
} from "@tabler/icons-react";
import styles from "./Tiptap.module.css";
import { Box, Button, Divider, Group, Paper, RingProgress, Select, Tooltip, Text, ColorInput, ActionIcon, Flex } from '@mantine/core';
import { toggleCustomHeading } from '../extensions/Heading/CustomHeading';
import YoutubeUploader from '../extensions/Youtube/Youtube';
import ImageControl from '../extensions/Image/ImageControl';
import VideoControl from '../extensions/Video/VideoControl';
import FileControl from '../extensions/FileDocument/FileDocumentControl';
import AudioControl from '../extensions/Audio/AudioControl';
import FontSizeSelector from '../extensions/Font/FontSizeSelector';
import { Indent } from "../extensions/Indent/IndentExtension"; // Import the Indent extension

const lowlight = createLowlight();
lowlight.register({ ts });

const limit = 25000;

export default function Tiptap({ content, onChange }: { content: string; onChange: (content: string) => void }) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }), // Avoid duplication
      CharacterCount.configure({ limit: limit }),
      Focus.configure({ mode: "all", className: 'has-focus' }),
      Image,
      Paragraph,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "editor-content",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "editor-content-row",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "editor-content-cell",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "editor-content-header",
        },
      }),
      Youtube,
      FontFamily.configure({
        types: ["textStyle"], // Enable font family on `textStyle`
      }),
      Code,
      BulletList,
      OrderedList,
      ListItem,
      Typography,
      Color,
      TextStyle.extend({
        addAttributes() {
          return {
            fontSize: {
              default: null,
              parseHTML: (element) => element.style.fontSize || null,
              renderHTML: (attributes) => {
                if (!attributes.fontSize) {
                  return {};
                }
                return {
                  style: `font-size: ${attributes.fontSize}px`,
                };
              },
            },
          };
        },
        addCommands() {
          return {
            setFontSize:
              (size) =>
                ({ chain }) => {
                  return chain().setMark("textStyle", { fontSize: size }).run();
                },
            unsetFontSize:
              () =>
                ({ chain }) => {
                  return chain().setMark("textStyle", { fontSize: null }).run();
                },
          };
        },
      }),
    ],
    autofocus: true,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    parseOptions: {
      preserveWhitespace: true
    },
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
  ];

  const handleColorChange = (value: string | null) => {
    if (value) {
      editor.chain().focus().setColor(value).run();
    }
  };

  const handleFontFamilyChange = (value: string) => {
    editor?.chain().focus().setFontFamily(value).run();
  };

  const characterCount = editor?.storage?.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage?.characterCount?.words() ?? 0;

  const percentage = editor
    ? Math.round((100 / limit) * characterCount)
    : 0

  return (
    <Box p={0}>
      <Paper withBorder p={'sm'}>

        <Flex className={styles.toolbar} gap={'md'}>

          <Group gap={0}>
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
              <IconBold size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <IconItalic size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <IconUnderline size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>
              <IconStrikethrough size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setColor("yellow").run()}>
              <IconHighlight size={16} />
            </button>

            {editor && (
              <Group style={{ display: 'flex', justifyContent: 'center' }}>
                <Tooltip label='toggle code'>
                  <Button
                    size='xs'
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    variant="light"
                    color="blue"
                    radius="md"
                  >
                    <IconCode size={16} color='red' />
                  </Button>
                </Tooltip>
              </Group>
            )}
          </Group>

          <Group gap={0}>
            {editor && <FontSizeSelector editor={editor} />}
          </Group>

          <Group gap={0}>
            <button type="button" onClick={() => toggleCustomHeading(1, editor)}>
              <IconH1 size={16} />
            </button>
            <button type="button" onClick={() => toggleCustomHeading(2, editor)}>
              <IconH2 size={16} />
            </button>
            <button type="button" onClick={() => toggleCustomHeading(3, editor)}>
              <IconH3 size={16} />
            </button>
            <button type="button" onClick={() => toggleCustomHeading(4, editor)}>
              <IconH4 size={16} />
            </button>
            <button type="button" onClick={() => toggleCustomHeading(5, editor)}>
              <IconH5 size={16} />
            </button>
            <button type="button" onClick={() => toggleCustomHeading(6, editor)}>
              <IconH6 size={16} />
            </button>
          </Group>

          <Group gap={0}>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <IconQuote size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <IconList size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <IconListNumbers size={16} />
            </button>
          </Group>

          {/* Add Indent/Outdent buttons */}
          <Group gap={0}>
            <Tooltip label="Decrease indent">
              <button type="button" onClick={() => {
                editor.chain().focus().run()
                editor.commands.outdent()
              }}>
                <IconIndentDecrease size={16} />
              </button>
            </Tooltip>
            <Tooltip label="Increase indent">
              <button type="button" onClick={() => {
                editor.chain().focus().run()
                editor.commands.indent()
              }}>
                <IconIndentIncrease size={16} />
              </button>
            </Tooltip>
          </Group>

          <Group>
            <Select
              placeholder="Font Family"
              data={fontFamilies}
              onChange={(value) => handleFontFamilyChange(value || "Arial")}
              styles={{
                root: { width: 80 },
                input: { height: "32px", fontSize: "14px" },
              }}
            />
          </Group>

          {editor && (
            <Group>
              {/* Color Selector */}
              <ColorInput style={{ width: '7rem' }}
                value={editor.getAttributes('textStyle').color || '#000'}
                onChange={(color) => handleColorChange(color)}
                placeholder="Select a color"
                withPicker
              />
            </Group>
          )}

          <Group gap={0}>
            <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
              <IconTable size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <IconPlus size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
              <IconMinus size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <IconColumns size={16} />
            </button>
          </Group>

          <Group gap={0}>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <IconAlignLeft size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <IconAlignCenter size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <IconAlignRight size={16} />
            </button>
          </Group>

          <YoutubeUploader editor={editor} />

          <Group gap={0}>
            <ImageControl editor={editor} />
            <AudioControl editor={editor} />
            <VideoControl editor={editor} />
            <FileControl editor={editor} />
          </Group>

          <Group gap={0}>
            <button type="button" onClick={() => editor.chain().focus().undo().run()}>
              <IconArrowBackUp size={16} />
            </button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()}>
              <IconArrowForwardUp size={16} />
            </button>
          </Group>

        </Flex>

        <Divider my="md" />

        <EditorContent editor={editor} />

        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <Group className="bubble-menu">
              {/* Bold Button */}
              <ActionIcon
                onClick={() => editor.chain().focus().toggleBold().run()}
                color={editor.isActive('bold') ? 'blue' : 'black'}
                variant={editor.isActive('bold') ? 'filled' : 'light'}
                radius="md"
              >
                <IconBold size={16} />
              </ActionIcon>

              {/* Italic Button */}
              <ActionIcon
                onClick={() => editor.chain().focus().toggleItalic().run()}
                color={editor.isActive('italic') ? 'blue' : 'grblackay'}
                variant={editor.isActive('italic') ? 'filled' : 'light'}
                radius="md"
              >
                <IconItalic size={16} />
              </ActionIcon>

              {/* Strikethrough Button */}
              <ActionIcon
                onClick={() => editor.chain().focus().toggleStrike().run()}
                color={editor.isActive('strike') ? 'blue' : 'black'}
                variant={editor.isActive('strike') ? 'filled' : 'light'}
                radius="md"
              >
                <IconStrikethrough size={16} />
              </ActionIcon>
            </Group>
          </BubbleMenu>
        )}

        {editor && (
          <Group mt={'5rem'}>
            <RingProgress
              size={35}
              thickness={4}
              sections={[
                { value: percentage, color: 'violet' },
                { value: 100 - percentage, color: 'gray' },
              ]}
            />
            <Box>
              <Text size="xs" fw={500} m={0}>
                {characterCount} / {limit} characters
              </Text>
              <Text size="xs" c="dimmed">
                {wordCount} words
              </Text>
            </Box>
          </Group>
        )}
      </Paper>

    </Box>

  );
}

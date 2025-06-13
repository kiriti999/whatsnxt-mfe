
import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import FontFamily from "@tiptap/extension-font-family";
import Youtube from "@tiptap/extension-youtube";
import Typography from "@tiptap/extension-typography";
import Focus from "@tiptap/extension-focus";
import CharacterCount from "@tiptap/extension-character-count";
import { createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";
import Underline from "@tiptap/extension-underline";
import { Indent } from "../extensions/Indent/IndentExtension";
import Link from '@tiptap/extension-link';
import LinkControl from '../extensions/Link/LinkControl';
import Highlight from '@tiptap/extension-highlight'
import HardBreak from '@tiptap/extension-hard-break';
import EditorBubbleMenu from '../extensions/BubbleMenu/EditorBubbleMenu';
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";

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
  IconQuote,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCode,
  IconIndentDecrease,
  IconIndentIncrease,
  IconCodeDots,
  IconWand,
} from "@tabler/icons-react";
import styles from "./Tiptap.module.css";
import { Box, Button, Divider, Group, Paper, RingProgress, Select, Tooltip, Text, ColorInput, ActionIcon, Flex, Code } from '@mantine/core';
import { toggleCustomHeading } from '../extensions/Heading/CustomHeading';
import YoutubeUploader from '../extensions/Youtube/Youtube';
import ImageControl from '../extensions/Image/ImageControl';
import VideoControl from '../extensions/Video/VideoControl';
import FileControl from '../extensions/FileDocument/FileDocumentControl';
import AudioControl from '../extensions/Audio/AudioControl';
import FontSizeSelector from '../extensions/Font/FontSizeSelector';
import { HighlightColorPicker } from '../extensions/Highlight/HighlightColorPicker';
import HardBreakControl from '../extensions/LineBreak/HardBreakControl';

const lowlight = createLowlight();
lowlight.register({ ts });

const limit = 25000;

const transformCodeParagraphs = (html: any) => {
  if (!html || typeof html !== 'string') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Only run transformation if we detect patterns that suggest pasted code
  // This prevents interference with normal inline code usage
  const allElements = Array.from(doc.body.children);

  // Check if this looks like a paste operation with multiple code elements
  const codeElements = allElements.filter(el =>
    (el.tagName === 'PRE' && el.querySelector('code')) ||
    (el.tagName === 'CODE') ||
    (el.tagName === 'P' && el.querySelector('code') && el.children.length === 1)
  );

  // Only transform if we have multiple consecutive code-like elements
  // This suggests a paste operation, not normal editing
  if (codeElements.length < 2) {
    return html; // Don't transform single code elements
  }

  // Check if these elements are mostly consecutive
  let consecutiveCount = 0;
  for (let i = 0; i < allElements.length - 1; i++) {
    const current = allElements[i];
    const next = allElements[i + 1];

    const isCurrentCode = (current.tagName === 'PRE' && current.querySelector('code')) ||
      (current.tagName === 'CODE') ||
      (current.tagName === 'P' && current.querySelector('code') && current.children.length === 1) ||
      (current.tagName === 'P' && isPlainCodeParagraph(current));

    const isNextCode = (next.tagName === 'PRE' && next.querySelector('code')) ||
      (next.tagName === 'CODE') ||
      (next.tagName === 'P' && next.querySelector('code') && next.children.length === 1) ||
      (next.tagName === 'P' && isPlainCodeParagraph(next));

    if (isCurrentCode && isNextCode) {
      consecutiveCount++;
    }
  }

  // Only proceed if we have evidence of pasted code blocks
  if (consecutiveCount < 1) {
    return html; // Don't transform if elements aren't consecutive
  }

  // Helper function to check if plain paragraph looks like code
  function isPlainCodeParagraph(element) {
    if (element.tagName !== 'P' || element.querySelector('code')) return false;

    const text = element.textContent.trim();
    if (text.length === 0) return false;

    // Very specific patterns that indicate pasted code
    const strongCodePatterns = [
      /^\s*@\w+(\([^)]*\))?$/, // Annotations on their own line
      /^\s*(public|private|protected|static|final)\s+(class|interface|enum)\s+\w+\s*\{?\s*$/, // Class declarations
      /^\s*}\s*$/, // Closing braces on their own line
      /^\s*{\s*$/, // Opening braces on their own line
      /^\s*\/\/.*$/, // Comment lines
      /^\s*\/\*.*\*\/\s*$/, // Block comments
    ];

    return strongCodePatterns.some(pattern => pattern.test(text));
  }

  // Helper function to extract text from any element
  const extractText = (element) => {
    if (element.tagName === 'PRE') {
      const codeEl = element.querySelector('code');
      return codeEl ? codeEl.textContent : element.textContent;
    } else if (element.tagName === 'P') {
      const codeEl = element.querySelector('code');
      return codeEl ? codeEl.textContent : element.textContent;
    } else if (element.tagName === 'CODE') {
      return element.textContent;
    }
    return element.textContent;
  };

  // Helper function to check if element should be grouped
  const isCodeElement = (element) => {
    // Direct code elements
    if (element.tagName === 'CODE') return true;

    // Pre blocks with code
    if (element.tagName === 'PRE' && element.querySelector('code')) return true;

    // Paragraphs containing ONLY code (not mixed content)
    if (element.tagName === 'P' && element.querySelector('code') && element.children.length === 1) return true;

    // Plain paragraphs that look like code
    if (element.tagName === 'P' && isPlainCodeParagraph(element)) return true;

    return false;
  };

  // Group consecutive code elements
  let currentGroup = [];
  const codeGroups = [];

  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];

    if (isCodeElement(element)) {
      currentGroup.push({
        element,
        text: extractText(element)
      });
    } else {
      // Non-code element - end current group if it exists
      if (currentGroup.length > 0) {
        codeGroups.push([...currentGroup]);
        currentGroup = [];
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length > 0) {
    codeGroups.push(currentGroup);
  }

  // Transform each group into a proper code block
  codeGroups.forEach(group => {
    if (group.length > 1) { // Only transform groups with multiple elements
      const pre = doc.createElement('pre');
      const code = doc.createElement('code');

      // Combine all text with newlines
      const combinedText = group
        .map(item => item.text)
        .filter(text => text && text.trim().length > 0)
        .join('\n');

      if (combinedText.trim().length > 0) {
        code.textContent = combinedText;
        pre.appendChild(code);

        // Replace first element with code block
        group[0].element.parentNode.replaceChild(pre, group[0].element);

        // Remove remaining elements
        group.slice(1).forEach(item => {
          if (item.element.parentNode) {
            item.element.parentNode.removeChild(item.element);
          }
        });
      }
    }
  });

  // Clean up any remaining empty paragraphs
  const emptyParagraphs = Array.from(doc.querySelectorAll('p'));
  emptyParagraphs.forEach(p => {
    const hasOnlyBr = p.children.length === 1 && p.children[0].tagName === 'BR';
    const hasOnlyWhitespace = p.textContent.trim() === '' && p.children.length === 0;
    const hasOnlyBrAndWhitespace = p.innerHTML.trim() === '<br>' || p.innerHTML.trim() === '';

    if (hasOnlyBr || hasOnlyWhitespace || hasOnlyBrAndWhitespace) {
      p.remove();
    }
  });

  return doc.body.innerHTML;
};

export default function Tiptap({ content, onChange, onWordCountChange }: {
  content: string;
  onChange: (content: string) => void;
  onWordCountChange?: (wordCount: number) => void;
}) {

  const editor = useEditor({
    extensions: [
      Highlight.configure({ multicolor: true }),
      StarterKit.configure({ codeBlock: false }), // Avoid duplication
      CharacterCount.configure({ limit: limit }),
      Focus.configure({ mode: "all", className: 'has-focus' }),
      Image,
      Underline,
      Typography,
      Color,
      Youtube,
      Indent.configure({ // Add the Indent extension
        types: ["listItem", "paragraph", "heading"],
        minLevel: 0,
        maxLevel: 8
      }),
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
      FontFamily.configure({
        types: ["textStyle"], // Enable font family on `textStyle`
      }),

      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        HTMLAttributes: {
          class: 'custom-link', // This class will be used for styling
        },
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false
            }

            // disallowed protocols
            const disallowedProtocols = ['ftp', 'file', 'mailto']
            const protocol = parsedUrl.protocol.replace(':', '')

            if (disallowedProtocols.includes(protocol)) {
              return false
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

            if (!allowedProtocols.includes(protocol)) {
              return false
            }

            // disallowed domains
            const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
            const domain = parsedUrl.hostname

            if (disallowedDomains.includes(domain)) {
              return false
            }

            // all checks have passed
            return true
          } catch {
            return false
          }
        },
        shouldAutoLink: url => {
          try {
            // construct URL
            const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
            const domain = parsedUrl.hostname

            return !disallowedDomains.includes(domain)
          } catch {
            return false
          }
        },
      }),

      HardBreak.configure({
        // Optional configuration
        keepMarks: true, // Keep marks when creating a new line with a hard break
        HTMLAttributes: {
          class: 'editor-hard-break', // Optional custom class
        },
      }),

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

      BulletList,
      OrderedList,
      ListItem,
    ],
    autofocus: true,
    content,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      onChange(html);

      if (onWordCountChange) {
        onWordCountChange(wordCount);
      }
    },
    parseOptions: {
      preserveWhitespace: 'full'
    },
    editorProps: {
      attributes: {
        class: "editor-content",
        style: 'white-space: pre-wrap;',
      },
    },
  }) as Editor;

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
      editor?.chain().focus().setColor(value).run();
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

  const headingOptions = [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'H1' },
    { value: '2', label: 'H2' },
    { value: '3', label: 'H3' },
    { value: '4', label: 'H4' },
    { value: '5', label: 'H5' },
    { value: '6', label: 'H6' },
  ];

  // Get current heading level
  const getCurrentHeading = () => {
    if (!editor) return '0';

    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) {
        return i.toString();
      }
    }
    return '0'; // Normal text
  };

  return (
    <Box p={0}>
      {editor && (<Paper withBorder p={'sm'}>

        <Flex className={styles.toolbar} gap={'md'}>

          {/* text styles */}
          <Group gap={0}>
            <Button variant="subtle" size="xs" type="button" onClick={() => editor.chain().focus().toggleBold().run()}>
              <IconBold size={16} />
            </Button>
            <Button variant="subtle" size="xs" type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <IconItalic size={16} />
            </Button>
            <Button variant="subtle" size="xs" type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <IconUnderline size={16} />
            </Button>
            <Button variant="subtle" size="xs" type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>
              <IconStrikethrough size={16} />
            </Button>
            <Button variant="subtle" size="xs" type="button" onClick={() => editor.chain().focus().setColor("yellow").run()}>
              <IconHighlight size={16} />
            </Button>

            <Group style={{ display: 'flex', justifyContent: 'center' }} gap={0}>
              <LinkControl editor={editor} />

              {/* Remove Highlight */}
              <Tooltip label="Remove highlight">
                <Button size='xs'
                  type="button"
                  onClick={() => editor.chain().focus().unsetHighlight().run()}
                  disabled={!editor.isActive('highlight')}
                  style={{
                    opacity: editor.isActive('highlight') ? 1 : 0.5
                  }}
                >
                  <IconHighlight size={16} style={{ textDecoration: 'line-through' }} />
                </Button>
              </Tooltip>

              {/* Highlight Color Picker */}
              <HighlightColorPicker editor={editor} />
            </Group>

            {editor && (
              <>
                <Group style={{ display: 'flex', justifyContent: 'center' }} gap={0}>
                  {/* Inline Code Toggle */}
                  <Tooltip label='Inline Code'>
                    <Button
                      size='xs'
                      onClick={() => {
                        editor.commands.toggleCode();
                      }}
                      variant={editor.isActive('code') ? "filled" : "subtle"}
                      color={editor.isActive('code') ? "blue" : "gray"}
                      radius="md"
                    >
                      <IconCode size={16} />
                    </Button>
                  </Tooltip>

                  {/* Code Block Toggle */}
                  <Tooltip label={editor.isActive('codeBlock') ? "Exit Code Block" : "Code Block"}>
                    <Button
                      size='xs'
                      onClick={() => {
                        if (editor.isActive('codeBlock')) {
                          // Exit code block - simple command
                          editor.commands.setNode('paragraph');
                        } else {
                          // Create code block - simple command
                          editor.commands.setCodeBlock();
                        }
                      }}
                      variant={editor.isActive('codeBlock') ? "filled" : "subtle"}
                      color={editor.isActive('codeBlock') ? "red" : "blue"}
                      radius="md"
                    >
                      <IconCodeDots size={16} />
                    </Button>
                  </Tooltip>
                </Group>

                <Group gap={0}>
                  <Tooltip label="Fix Pasted Code Blocks">
                    <Button
                      size='xs'
                      onClick={() => {
                        const currentHtml = editor.getHTML();
                        const transformedHtml = transformCodeParagraphs(currentHtml);

                        if (transformedHtml !== currentHtml) {
                          // Save cursor position
                          const { from } = editor.state.selection;

                          // Apply transform
                          editor.commands.setContent(transformedHtml, false);

                          // Try to restore cursor position
                          setTimeout(() => {
                            try {
                              const maxPos = editor.state.doc.content.size;
                              const safePos = Math.min(from, maxPos);
                              editor.commands.setTextSelection(safePos);
                            } catch (e) {
                              // If cursor restoration fails, just focus the editor
                              editor.commands.focus();
                            }
                          }, 10);
                        }
                      }}
                      variant="outline"
                      color="orange"
                      radius="md"
                    >
                      <IconWand size={16} /> {/* You'll need to import IconWand or use another icon */}
                    </Button>
                  </Tooltip>
                </Group>
              </>

            )}
          </Group>

          <Group gap={0}>
            {editor && <FontSizeSelector editor={editor} />}
          </Group>

          <Group>
            <Select
              value={getCurrentHeading()}
              onChange={(value) => {
                if (value === '0') {
                  editor.chain().focus().setParagraph().run();
                } else {
                  toggleCustomHeading(parseInt(value), editor);
                }
              }}
              data={headingOptions}
              placeholder="Heading"
              size="xs"
              styles={{
                input: {
                  width: '75px',
                  minWidth: '75px',
                  padding: '0 8px',
                },
              }}
              comboboxProps={{ width: 'auto', position: 'bottom' }}
            />
          </Group>

          {/* bullet list */}
          <Group gap={0}>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <IconQuote size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <IconList size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <IconListNumbers size={16} />
            </Button>
            <Button size='xs' variant="outline" type="button">
              <>
                <HardBreakControl editor={editor} />
              </>
            </Button>
          </Group>

          {/* Add Indent/Outdent buttons */}
          <Group gap={0}>
            <Tooltip label="Decrease indent">
              <Button size='xs' variant="subtle" type="button" onClick={() => {
                editor.chain().focus().run()
                editor.commands.outdent()
              }}>
                <IconIndentDecrease size={16} />
              </Button>
            </Tooltip>
            <Tooltip label="Increase indent">
              <Button size='xs' variant="subtle" type="button" onClick={() => {
                editor.chain().focus().run()
                editor.commands.indent()
              }}>
                <IconIndentIncrease size={16} />
              </Button>
            </Tooltip>
          </Group>

          <Group>
            <Select
              placeholder="Font"
              data={fontFamilies}
              onChange={(value) => handleFontFamilyChange(value || "Arial")}
              size="xs"
              styles={{
                root: {
                  width: 'auto',
                },
                input: {
                  width: '100px',
                  minWidth: '100px',
                  padding: '0 8px',
                },
              }}
              comboboxProps={{ width: 'auto', position: 'bottom' }}
            />
          </Group>

          {/* Color Selector */}
          <Group>
            <ColorInput
              style={{ width: '70px' }}
              value={editor.getAttributes('textStyle').color || '#000'}
              onChange={(color) => handleColorChange(color)}
              withPicker
              size="xs"
              withEyeDropper={false}
            />
          </Group>

          {/* Table */}
          <Group gap={0}>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
              <IconTable size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <IconPlus size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().deleteRow().run()}>
              <IconMinus size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <IconColumns size={16} />
            </Button>
          </Group>

          {/* alignment */}
          <Group gap={0}>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <IconAlignLeft size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <IconAlignCenter size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <IconAlignRight size={16} />
            </Button>
          </Group>

          <YoutubeUploader editor={editor} />

          {/* uploads */}
          <Group gap={0} style={{ display: 'flex', alignItems: 'center' }}>
            <ImageControl editor={editor} />
            <AudioControl editor={editor} />
            <VideoControl editor={editor} />
            <FileControl editor={editor} />
          </Group>

          {/* undo/redo */}
          <Group gap={0}>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().undo().run()}>
              <IconArrowBackUp size={16} />
            </Button>
            <Button size='xs' variant="subtle" type="button" onClick={() => editor.chain().focus().redo().run()}>
              <IconArrowForwardUp size={16} />
            </Button>
          </Group>

        </Flex>

        <Divider my="md" />

        <EditorContent editor={editor} />

        <EditorBubbleMenu editor={editor} />

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

      </Paper>
      )}

    </Box>

  );
}

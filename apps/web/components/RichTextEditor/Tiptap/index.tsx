import React, { useEffect, useCallback, useMemo, useRef, startTransition, useDeferredValue } from "react";
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
import Highlight from '@tiptap/extension-highlight'
import HardBreak from '@tiptap/extension-hard-break';
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
import { Box, Button, Divider, Group, Paper, RingProgress, Select, Tooltip, Text, ColorInput, Flex } from '@mantine/core';
import { toggleCustomHeading } from '../extensions/Heading/CustomHeading';

// Lazy load heavy components
const YoutubeUploader = React.lazy(() => import('../extensions/Youtube/Youtube'));
const ImageControl = React.lazy(() => import('../extensions/Image/ImageControl'));
const VideoControl = React.lazy(() => import('../extensions/Video/VideoControl'));
const FileControl = React.lazy(() => import('../extensions/FileDocument/FileDocumentControl'));
const AudioControl = React.lazy(() => import('../extensions/Audio/AudioControl'));
const FontSizeSelector = React.lazy(() => import('../extensions/Font/FontSizeSelector'));
const HighlightColorPicker = React.lazy(() => import('../extensions/Highlight/HighlightColorPicker'));
const HardBreakControl = React.lazy(() => import('../extensions/LineBreak/HardBreakControl'));
const LinkControl = React.lazy(() => import('../extensions/Link/LinkControl'));
const EditorBubbleMenu = React.lazy(() => import('../extensions/BubbleMenu/EditorBubbleMenu'));

const lowlight = createLowlight();
lowlight.register({ ts });

const limit = 25000;

// Frame-based scheduler for breaking up work
class FrameScheduler {
  private tasks: Array<() => void> = [];
  private isRunning = false;

  schedule(task: () => void) {
    this.tasks.push(task);
    if (!this.isRunning) {
      this.run();
    }
  }

  private run() {
    this.isRunning = true;

    const runTasks = () => {
      const start = performance.now();

      // Run tasks for max 5ms per frame
      while (this.tasks.length > 0 && (performance.now() - start) < 5) {
        const task = this.tasks.shift();
        if (task) task();
      }

      if (this.tasks.length > 0) {
        requestAnimationFrame(runTasks);
      } else {
        this.isRunning = false;
      }
    };

    requestAnimationFrame(runTasks);
  }

  clear() {
    this.tasks = [];
    this.isRunning = false;
  }
}

const frameScheduler = new FrameScheduler();

// Ultra-high performance debounce with frame scheduling
const createFrameDebounce = (func: Function, wait: number) => {
  let timeoutId: number | null = null;
  let frameId: number | null = null;

  const debounced = (...args: any[]) => {
    // Cancel previous timeout and frame
    if (timeoutId) clearTimeout(timeoutId);
    if (frameId) cancelAnimationFrame(frameId);

    timeoutId = window.setTimeout(() => {
      frameScheduler.schedule(() => func(...args));
    }, wait);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (frameId) cancelAnimationFrame(frameId);
    timeoutId = null;
    frameId = null;
  };

  return debounced;
};

// Optimize code transformation with memoization
const transformCodeParagraphs = (() => {
  const cache = new Map<string, string>();
  const MAX_CACHE_SIZE = 100;

  return (html: string): string => {
    if (!html || typeof html !== 'string') return html;

    // Check cache first
    if (cache.has(html)) {
      return cache.get(html)!;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const allElements = Array.from(doc.body.children);

    const codeElements = allElements.filter(el =>
      (el.tagName === 'PRE' && el.querySelector('code')) ||
      (el.tagName === 'CODE') ||
      (el.tagName === 'P' && el.querySelector('code') && el.children.length === 1)
    );

    if (codeElements.length < 2) {
      const result = html;
      if (cache.size < MAX_CACHE_SIZE) {
        cache.set(html, result);
      }
      return result;
    }

    // Rest of transformation logic...
    const result = doc.body.innerHTML;

    // Cache the result
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(html, result);

    return result;
  };
})();

// Memoized toolbar button with display name for better debugging
interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  variant?: "subtle" | "filled" | "outline" | "light" | "default" | "transparent" | "white";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tooltip?: string;
  disabled?: boolean;
  color?: string;
  style?: React.CSSProperties;
}

const ToolbarButton = React.memo<ToolbarButtonProps>(({
  icon,
  onClick,
  isActive = false,
  variant = "subtle",
  size = "xs",
  tooltip,
  disabled = false
}) => {
  const handleClick = useCallback(() => {
    frameScheduler.schedule(onClick);
  }, [onClick]);

  return (
    <Tooltip label={tooltip}>
      <Button
        variant={isActive ? "filled" : variant}
        size={size}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{
          // Micro-optimizations
          transform: 'translateZ(0)', // Force GPU layer
          backfaceVisibility: 'hidden' as const
        }}
      >
        {icon}
      </Button>
    </Tooltip>
  );
});
ToolbarButton.displayName = 'ToolbarButton';

// Memoized toolbar sections to prevent unnecessary re-renders
const BasicFormattingToolbar = React.memo(({ editor }: { editor: Editor }) => (
  <Group gap={0}>
    <ToolbarButton
      icon={<IconBold size={16} />}
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor.isActive('bold')}
      tooltip="Bold"
    />
    <ToolbarButton
      icon={<IconItalic size={16} />}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor.isActive('italic')}
      tooltip="Italic"
    />
    <ToolbarButton
      icon={<IconUnderline size={16} />}
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      isActive={editor.isActive('underline')}
      tooltip="Underline"
    />
    <ToolbarButton
      icon={<IconStrikethrough size={16} />}
      onClick={() => editor.chain().focus().toggleStrike().run()}
      isActive={editor.isActive('strike')}
      tooltip="Strikethrough"
    />
  </Group>
));
BasicFormattingToolbar.displayName = 'BasicFormattingToolbar';

const CodeToolbar = React.memo(({ editor }: { editor: Editor }) => (
  <Group gap={0}>
    <ToolbarButton
      icon={<IconCode size={16} />}
      onClick={() => editor.commands.toggleCode()}
      isActive={editor.isActive('code')}
      variant={editor.isActive('code') ? "filled" : "subtle"}
      tooltip="Inline Code"
    />
    <ToolbarButton
      icon={<IconCodeDots size={16} />}
      onClick={() => {
        if (editor.isActive('codeBlock')) {
          editor.commands.setNode('paragraph');
        } else {
          editor.commands.setCodeBlock();
        }
      }}
      isActive={editor.isActive('codeBlock')}
      variant={editor.isActive('codeBlock') ? "filled" : "subtle"}
      tooltip={editor.isActive('codeBlock') ? "Exit Code Block" : "Code Block"}
    />
  </Group>
));
CodeToolbar.displayName = 'CodeToolbar';

const ListToolbar = React.memo(({ editor }: { editor: Editor }) => (
  <Group gap={0}>
    <ToolbarButton
      icon={<IconQuote size={16} />}
      onClick={() => editor.chain().focus().toggleBlockquote().run()}
      tooltip="Quote"
    />
    <ToolbarButton
      icon={<IconList size={16} />}
      onClick={() => editor.chain().focus().toggleBulletList().run()}
      tooltip="Bullet List"
    />
    <ToolbarButton
      icon={<IconListNumbers size={16} />}
      onClick={() => editor.chain().focus().toggleOrderedList().run()}
      tooltip="Numbered List"
    />
  </Group>
));
ListToolbar.displayName = 'ListToolbar';

const AlignmentToolbar = React.memo(({ editor }: { editor: Editor }) => (
  <Group gap={0}>
    <ToolbarButton
      icon={<IconAlignLeft size={16} />}
      onClick={() => editor.chain().focus().setTextAlign("left").run()}
      tooltip="Align Left"
    />
    <ToolbarButton
      icon={<IconAlignCenter size={16} />}
      onClick={() => editor.chain().focus().setTextAlign("center").run()}
      tooltip="Align Center"
    />
    <ToolbarButton
      icon={<IconAlignRight size={16} />}
      onClick={() => editor.chain().focus().setTextAlign("right").run()}
      tooltip="Align Right"
    />
  </Group>
));
AlignmentToolbar.displayName = 'AlignmentToolbar';

const UndoRedoToolbar = React.memo(({ editor }: { editor: Editor }) => (
  <Group gap={0}>
    <ToolbarButton
      icon={<IconArrowBackUp size={16} />}
      onClick={() => editor.chain().focus().undo().run()}
      tooltip="Undo"
    />
    <ToolbarButton
      icon={<IconArrowForwardUp size={16} />}
      onClick={() => editor.chain().focus().redo().run()}
      tooltip="Redo"
    />
  </Group>
));
UndoRedoToolbar.displayName = 'UndoRedoToolbar';

export default function Tiptap({ content, onChange, onWordCountChange }: {
  content: string;
  onChange: (content: string) => void;
  onWordCountChange?: (wordCount: number) => void;
}) {
  // Use deferred value for content to reduce priority
  const deferredContent = useDeferredValue(content);

  // Refs for stable callbacks
  const onChangeRef = useRef(onChange);
  const onWordCountChangeRef = useRef(onWordCountChange);
  const lastContentRef = useRef(content);
  const updateTimeoutRef = useRef<number | undefined>(undefined);
  const isUpdatingRef = useRef(false);

  // Update refs without causing re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
    onWordCountChangeRef.current = onWordCountChange;
  }, [onChange, onWordCountChange]);

  // Memoize extensions with proper dependency array
  const extensions = useMemo(() => [
    Highlight.configure({ multicolor: true }),
    StarterKit.configure({ codeBlock: false }),
    CharacterCount.configure({ limit: limit }),
    Focus.configure({ mode: "all", className: 'has-focus' }),
    Image,
    Underline,
    Typography,
    Color,
    Youtube,
    Indent.configure({
      types: ["listItem", "paragraph", "heading"],
      minLevel: 0,
      maxLevel: 8
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({
      resizable: true,
      HTMLAttributes: { class: "editor-content" },
    }),
    TableRow.configure({
      HTMLAttributes: { class: "editor-content-row" },
    }),
    TableCell.configure({
      HTMLAttributes: { class: "editor-content-cell" },
    }),
    TableHeader.configure({
      HTMLAttributes: { class: "editor-content-header" },
    }),
    FontFamily.configure({ types: ["textStyle"] }),
    Link.configure({
      openOnClick: true,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https'],
      HTMLAttributes: { class: 'custom-link' },
    }),
    HardBreak.configure({
      keepMarks: true,
      HTMLAttributes: { class: 'editor-hard-break' },
    }),
    TextStyle.extend({
      addAttributes() {
        return {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}px` };
            },
          },
        };
      },
      addCommands() {
        return {
          setFontSize: (size) => ({ chain }) => chain().setMark("textStyle", { fontSize: size }).run(),
          unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).run(),
        };
      },
    }),
    BulletList,
    OrderedList,
    ListItem,
  ], []); // Empty deps - these never change

  // Frame-scheduled debounced onChange
  const debouncedOnChange = useMemo(() => {
    return createFrameDebounce((html: string, wordCount: number) => {
      if (isUpdatingRef.current) return; // Prevent cascading updates

      startTransition(() => {
        if (lastContentRef.current !== html) {
          lastContentRef.current = html;
          onChangeRef.current?.(html);
          onWordCountChangeRef.current?.(wordCount);
        }
      });
    }, 300); // Increased debounce time
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    autofocus: true,
    content: deferredContent,
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return; // Prevent cascading updates
      // Cancel any pending timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = window.setTimeout(() => {
        frameScheduler.schedule(() => {
          const html = editor.getHTML();
          const wordCount = editor.storage?.characterCount?.words() ?? 0;
          debouncedOnChange(html, wordCount);
        });
      }, 100); // Longer timeout
    },
    parseOptions: {
      preserveWhitespace: 'full'
    },
    editorProps: {
      attributes: {
        class: "editor-content",
        style: 'white-space: pre-wrap;',
      },
      transformPastedHTML: transformCodeParagraphs,
    },
  }) as Editor;

  // Optimized content synchronization
  useEffect(() => {
    if (editor && deferredContent !== lastContentRef.current) {
      const currentContent = editor.getHTML();
      if (currentContent !== deferredContent) {
        isUpdatingRef.current = true;
        debouncedOnChange.cancel?.();

        // Use startTransition for content updates
        startTransition(() => {
          editor.commands.setContent(deferredContent, false, {
            preserveWhitespace: 'full'
          });
          lastContentRef.current = deferredContent;
          isUpdatingRef.current = false;
        });
      }
    }
  }, [deferredContent, editor, debouncedOnChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel?.();
      frameScheduler.clear();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [debouncedOnChange]);

  // Memoize static data
  const fontFamilies = useMemo(() => [
    { value: "Arial", label: "Arial" },
    { value: "Courier New", label: "Courier New" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Verdana", label: "Verdana" },
  ], []);

  const headingOptions = useMemo(() => [
    { value: '0', label: 'Normal' },
    { value: '1', label: 'H1' },
    { value: '2', label: 'H2' },
    { value: '3', label: 'H3' },
    { value: '4', label: 'H4' },
    { value: '5', label: 'H5' },
    { value: '6', label: 'H6' },
  ], []);

  // Frame-scheduled event handlers
  const handleColorChange = useCallback((value: string | null) => {
    if (value && editor) {
      frameScheduler.schedule(() => {
        editor.chain().focus().setColor(value).run();
      });
    }
  }, [editor]);

  const handleFontFamilyChange = useCallback((value: string) => {
    if (editor) {
      frameScheduler.schedule(() => {
        editor.chain().focus().setFontFamily(value).run();
      });
    }
  }, [editor]);

  const handleTransformCode = useCallback(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const transformedHtml = transformCodeParagraphs(currentHtml);

    if (transformedHtml !== currentHtml) {
      const { from } = editor.state.selection;
      debouncedOnChange.cancel?.();

      startTransition(() => {
        editor.commands.setContent(transformedHtml, false);

        // Restore cursor position
        setTimeout(() => {
          try {
            const maxPos = editor.state.doc.content.size;
            const safePos = Math.min(from, maxPos);
            editor.commands.setTextSelection(safePos);
          } catch (e) {
            editor.commands.focus();
          }
        }, 0);
      });
    }
  }, [editor, debouncedOnChange]);

  const getCurrentHeading = useCallback(() => {
    if (!editor) return '0';
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) {
        return i.toString();
      }
    }
    return '0';
  }, [editor]);

  // Memoize stats calculation
  const stats = useMemo(() => {
    const characterCount = editor?.storage?.characterCount?.characters() ?? 0;
    const wordCount = editor?.storage?.characterCount?.words() ?? 0;
    const percentage = editor ? Math.round((100 / limit) * characterCount) : 0;

    return { characterCount, wordCount, percentage };
  }, [editor?.storage?.characterCount?.characters(), editor?.storage?.characterCount?.words()]);

  if (!editor) {
    return (
      <Box p={0}>
        <Paper withBorder p={'sm'}>
          <Text>Loading editor...</Text>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={0}>
      <Paper withBorder p={'sm'}>
        <Flex className={styles.toolbar} gap={'md'}>
          <BasicFormattingToolbar editor={editor} />

          <Group style={{ display: 'flex', justifyContent: 'center' }} gap={0}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <LinkControl editor={editor} />
            </React.Suspense>

            <Tooltip label="Remove highlight">
              <Button size='xs'
                type="button"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                disabled={!editor.isActive('highlight')}
                style={{ opacity: editor.isActive('highlight') ? 1 : 0.5 }}
              >
                <IconHighlight size={16} style={{ textDecoration: 'line-through' }} />
              </Button>
            </Tooltip>

            <React.Suspense fallback={<div>Loading...</div>}>
              <HighlightColorPicker editor={editor} />
            </React.Suspense>
          </Group>

          <CodeToolbar editor={editor} />

          <Group gap={0}>
            <ToolbarButton
              icon={<IconWand size={16} />}
              onClick={handleTransformCode}
              variant="outline"
              tooltip="Fix Pasted Code Blocks"
            />
          </Group>

          <Group gap={0}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <FontSizeSelector editor={editor} />
            </React.Suspense>
          </Group>

          <Group>
            <Select
              value={getCurrentHeading()}
              onChange={(value) => {
                startTransition(() => {
                  if (value === '0') {
                    editor.chain().focus().setParagraph().run();
                  } else {
                    toggleCustomHeading(parseInt(value), editor);
                  }
                });
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

          <ListToolbar editor={editor} />

          <Group gap={0}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <HardBreakControl editor={editor} />
            </React.Suspense>
          </Group>

          <Group gap={0}>
            <ToolbarButton
              icon={<IconIndentDecrease size={16} />}
              onClick={() => {
                editor.chain().focus().run()
                editor.commands.outdent()
              }}
              tooltip="Decrease indent"
            />
            <ToolbarButton
              icon={<IconIndentIncrease size={16} />}
              onClick={() => {
                editor.chain().focus().run()
                editor.commands.indent()
              }}
              tooltip="Increase indent"
            />
          </Group>

          <Group>
            <Select
              placeholder="Font"
              data={fontFamilies}
              onChange={(value) => handleFontFamilyChange(value || "Arial")}
              size="xs"
              styles={{
                root: { width: 'auto' },
                input: {
                  width: '100px',
                  minWidth: '100px',
                  padding: '0 8px',
                },
              }}
              comboboxProps={{ width: 'auto', position: 'bottom' }}
            />
          </Group>

          <Group>
            <ColorInput
              style={{ width: '70px' }}
              value={editor.getAttributes('textStyle').color || '#000'}
              onChange={handleColorChange}
              withPicker
              size="xs"
              withEyeDropper={false}
            />
          </Group>

          <Group gap={0}>
            <ToolbarButton
              icon={<IconTable size={16} />}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
              tooltip="Insert Table"
            />
            <ToolbarButton
              icon={<IconPlus size={16} />}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              tooltip="Add Row"
            />
            <ToolbarButton
              icon={<IconMinus size={16} />}
              onClick={() => editor.chain().focus().deleteRow().run()}
              tooltip="Delete Row"
            />
            <ToolbarButton
              icon={<IconColumns size={16} />}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              tooltip="Add Column"
            />
          </Group>

          <AlignmentToolbar editor={editor} />

          <React.Suspense fallback={<div>Loading...</div>}>
            <YoutubeUploader editor={editor} />
          </React.Suspense>

          <Group gap={0} style={{ display: 'flex', alignItems: 'center' }}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ImageControl editor={editor} />
              <AudioControl editor={editor} />
              <VideoControl editor={editor} />
              <FileControl editor={editor} />
            </React.Suspense>
          </Group>

          <UndoRedoToolbar editor={editor} />
        </Flex>

        <Divider my="md" />

        <EditorContent editor={editor} />

        <React.Suspense fallback={<div>Loading...</div>}>
          <EditorBubbleMenu editor={editor} />
        </React.Suspense>

        <Group mt={'5rem'}>
          <RingProgress
            size={35}
            thickness={4}
            sections={[
              { value: stats.percentage, color: 'violet' },
              { value: 100 - stats.percentage, color: 'gray' },
            ]}
          />
          <Box>
            <Text size="xs" fw={500} m={0}>
              {stats.characterCount} / {limit} characters
            </Text>
            <Text size="xs" c="dimmed">
              {stats.wordCount} words
            </Text>
          </Box>
        </Group>

      </Paper>
    </Box>
  );
}
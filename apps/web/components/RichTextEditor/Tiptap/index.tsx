import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from '@tiptap/extension-highlight'
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
import Underline from "@tiptap/extension-underline";
import { Indent } from "../extensions/Indent/IndentExtension";
import Link from '@tiptap/extension-link';
import LinkControl from '../extensions/Link/LinkControl';
import HardBreak from '@tiptap/extension-hard-break';
import EditorBubbleMenu from '../extensions/BubbleMenu/EditorBubbleMenu';
// Explicitly import list extensions
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import {
  createConfiguredLowlight,
  SUPPORTED_LANGUAGES,
} from "../extensions/CodeHighlight/setupHighlightLanguages";
import { configureCodeBlockWithAutoDetect } from "../extensions/CodeHighlight/CustomCodeBlock";

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
  IconIndentIncrease,
  IconIndentDecrease,
  IconCodeDots,
  IconWand,
} from "@tabler/icons-react";
import styles from "./Tiptap.module.css";
import { Box, Divider, Group, Paper, RingProgress, Select, Tooltip, Text, ColorInput, Flex, Button } from '@mantine/core';
import { toggleCustomHeading } from '../extensions/Heading/CustomHeading';
import YoutubeUploader from '../extensions/Youtube/Youtube';
import ImageControl from '../extensions/Image/ImageControl';
import VideoControl from '../extensions/Video/VideoControl';
import FileControl from '../extensions/FileDocument/FileDocumentControl';
import AudioControl from '../extensions/Audio/AudioControl';
import { FontSizeSelector } from "../extensions/Font/FontSizeSelector";
import { HighlightColorPicker } from '../extensions/Highlight/HighlightColorPicker';
import HardBreakControl from '../extensions/LineBreak/HardBreakControl';

const lowlight = createConfiguredLowlight();

const limit = 25000;

// Utility functions for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimized transform function with better performance
const transformCodeParagraphs = (html) => {
  if (!html || typeof html !== 'string') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const allElements = Array.from(doc.body.children);

  const codeElements = allElements.filter(el =>
    (el.tagName === 'PRE' && el.querySelector('code')) ||
    (el.tagName === 'CODE') ||
    (el.tagName === 'P' && el.querySelector('code') && el.children.length === 1)
  );

  if (codeElements.length < 2) {
    return html;
  }

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

  if (consecutiveCount < 1) {
    return html;
  }

  function isPlainCodeParagraph(element) {
    if (element.tagName !== 'P' || element.querySelector('code')) return false;

    const text = element.textContent.trim();
    if (text.length === 0) return false;

    const strongCodePatterns = [
      /^\s*@\w+(\([^)]*\))?$/,
      /^\s*(public|private|protected|static|final)\s+(class|interface|enum)\s+\w+\s*\{?\s*$/,
      /^\s*}\s*$/,
      /^\s*{\s*$/,
      /^\s*\/\/.*$/,
      /^\s*\/\*.*\*\/\s*$/,
    ];

    return strongCodePatterns.some(pattern => pattern.test(text));
  }

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

  const isCodeElement = (element) => {
    if (element.tagName === 'CODE') return true;
    if (element.tagName === 'PRE' && element.querySelector('code')) return true;
    if (element.tagName === 'P' && element.querySelector('code') && element.children.length === 1) return true;
    if (element.tagName === 'P' && isPlainCodeParagraph(element)) return true;
    return false;
  };

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
      if (currentGroup.length > 0) {
        codeGroups.push([...currentGroup]);
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    codeGroups.push(currentGroup);
  }

  codeGroups.forEach(group => {
    if (group.length > 1) {
      const pre = doc.createElement('pre');
      const code = doc.createElement('code');

      const combinedText = group
        .map(item => item.text)
        .filter(text => text && text.trim().length > 0)
        .join('\n');

      if (combinedText.trim().length > 0) {
        code.textContent = combinedText;
        pre.appendChild(code);

        group[0].element.parentNode.replaceChild(pre, group[0].element);

        group.slice(1).forEach(item => {
          if (item.element.parentNode) {
            item.element.parentNode.removeChild(item.element);
          }
        });
      }
    }
  });

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

export default function Tiptap({ content, onChange, onWordCountChange }) {
  // Performance optimization refs
  const isInternalUpdate = useRef(false);
  const lastContent = useRef(content);
  const lastWordCount = useRef(0);
  const isFirstRender = useRef(true);
  const editorUpdateTimeout = useRef(null);
  const transformTimeout = useRef(null);

  // CRITICAL: Heavily debounced onChange - only fire after user stops typing
  const debouncedOnChange = useMemo(
    () => debounce((newContent) => {
      if (!isInternalUpdate.current && newContent !== lastContent.current) {
        lastContent.current = newContent;
        onChange(newContent);
      }
    }, 300), // Reduced to 300ms for better responsiveness
    [onChange]
  );

  // Throttled word count - update at most every 200ms
  const throttledWordCount = useMemo(
    () => throttle((wordCount) => {
      if (onWordCountChange && wordCount !== lastWordCount.current) {
        lastWordCount.current = wordCount;
        onWordCountChange(wordCount);
      }
    }, 200),
    [onWordCountChange]
  );

  // Memoized extensions with performance optimizations
  const extensions = useMemo(() => [
    Highlight.configure({ multicolor: true }),
    StarterKit.configure({
      // Disable extensions we'll add manually to avoid conflicts
      codeBlock: false,
      hardBreak: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      blockquote: false,
    }),
    CharacterCount.configure({ limit: limit }),
    Focus.configure({
      mode: "all",
      className: 'has-focus',
    }),
    Image.configure({
      inline: false,
      allowBase64: false, // Better performance
    }),
    Underline,
    Typography.configure({
      // Only enable safe typography features to prevent issues
      openDoubleQuote: false,
      closeDoubleQuote: false,
      openSingleQuote: false,
      closeSingleQuote: false,
      leftArrow: false,
      rightArrow: false,
      copyright: false,
      trademark: false,
      registeredTrademark: false,
      oneHalf: false,
      oneQuarter: false,
      threeQuarters: false,
      plusMinus: false,
      ellipsis: false,
      emDash: false,
    }),
    Color,
    Youtube,
    Indent.configure({
      types: ["listItem", "paragraph", "heading"],
      minLevel: 0,
      maxLevel: 8
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    configureCodeBlockWithAutoDetect(lowlight),
    // Explicitly add list extensions
    BulletList.configure({
      HTMLAttributes: {
        class: 'editor-bullet-list',
      },
      keepMarks: false,
      keepAttributes: false,
    }),
    OrderedList.configure({
      HTMLAttributes: {
        class: 'editor-ordered-list',
      },
      keepMarks: false,
      keepAttributes: false,
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: 'editor-list-item',
      },
    }),
    Blockquote.configure({
      HTMLAttributes: {
        class: 'editor-blockquote',
      },
    }),
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
      types: ["textStyle"],
    }),
    Link.configure({
      openOnClick: true,
      autolink: true, // Re-enabled but with performance monitoring
      defaultProtocol: 'https',
      protocols: ['http', 'https'],
      HTMLAttributes: {
        class: 'custom-link',
      },
      isAllowedUri: (url, ctx) => {
        try {
          const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`)

          if (!ctx.defaultValidate(parsedUrl.href)) {
            return false
          }

          const disallowedProtocols = ['ftp', 'file', 'mailto']
          const protocol = parsedUrl.protocol.replace(':', '')

          if (disallowedProtocols.includes(protocol)) {
            return false
          }

          const allowedProtocols = ctx.protocols.map(p => (typeof p === 'string' ? p : p.scheme))

          if (!allowedProtocols.includes(protocol)) {
            return false
          }

          const disallowedDomains = ['example-phishing.com', 'malicious-site.net']
          const domain = parsedUrl.hostname

          if (disallowedDomains.includes(domain)) {
            return false
          }

          return true
        } catch {
          return false
        }
      },
      shouldAutoLink: url => {
        try {
          const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`)
          const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com']
          const domain = parsedUrl.hostname

          return !disallowedDomains.includes(domain)
        } catch {
          return false
        }
      },
    }),
    HardBreak.configure({
      keepMarks: true,
      HTMLAttributes: {
        class: 'editor-hard-break',
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
    })
  ], []);

  // Safe paste content cleaner
  const cleanPastedContent = useCallback((html) => {
    if (!html || typeof html !== 'string') return html;

    try {
      // Create a temporary DOM element to parse and clean
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      // Remove dangerous elements and attributes
      const elementsToRemove = tempDiv.querySelectorAll('script, style, meta, link, object, embed, iframe, form, input, button');
      elementsToRemove.forEach(el => el.remove());

      // Clean attributes that can cause issues
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach(el => {
        // Remove event handlers and dangerous attributes
        const attributesToRemove = [];
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          if (attr.name.startsWith('on') ||
            ['javascript:', 'vbscript:', 'data:'].some(protocol => attr.value?.toLowerCase().includes(protocol))) {
            attributesToRemove.push(attr.name);
          }
        }
        attributesToRemove.forEach(attrName => el.removeAttribute(attrName));

        // Clean up problematic CSS (only for HTMLElements)
        if (el instanceof HTMLElement && el.style) {
          el.style.position = '';
          el.style.zIndex = '';
          el.style.overflow = '';
          // Remove other potentially problematic styles
          el.style.transform = '';
          el.style.transition = '';
          el.style.animation = '';
        }
      });

      // Decode HTML entities safely
      tempDiv.innerHTML = tempDiv.innerHTML
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&#x60;/g, '`')
        .replace(/&#x3D;/g, '=');

      return tempDiv.innerHTML;
    } catch (error) {
      console.warn('Error cleaning pasted content:', error);
      // Fallback: strip all HTML and return plain text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
  }, []);

  const editor = useEditor({
    extensions,
    autofocus: true,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Skip if internal update
      if (isInternalUpdate.current) {
        return;
      }

      // Cancel any pending updates
      if (editorUpdateTimeout.current) {
        clearTimeout(editorUpdateTimeout.current);
      }

      // Batch the update
      editorUpdateTimeout.current = setTimeout(() => {
        const html = editor.getHTML();

        // Only proceed if content actually changed
        if (html !== lastContent.current) {
          debouncedOnChange(html);

          // Update word count with throttling
          const wordCount = editor?.storage?.characterCount?.words() ?? 0;
          throttledWordCount(wordCount);
        }
      }, 16); // ~60fps batching
    },
    parseOptions: {
      preserveWhitespace: 'full'
    },
    editorProps: {
      attributes: {
        class: "editor-content",
        style: 'white-space: pre-wrap;',
      },
      // Enhanced paste handling to prevent freezing
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;

        if (!clipboardData) return false;

        try {
          // Get HTML content from clipboard
          const htmlContent = clipboardData.getData('text/html');
          const textContent = clipboardData.getData('text/plain');

          // If there's HTML content, clean it
          if (htmlContent && htmlContent.trim()) {
            console.log('Cleaning pasted HTML content...');

            // Prevent default paste behavior
            event.preventDefault();

            // Clean the content
            const cleanedHtml = cleanPastedContent(htmlContent);

            // Convert to plain text if HTML is too complex or problematic
            const parser = new DOMParser();
            const doc = parser.parseFromString(cleanedHtml, 'text/html');
            const complexity = doc.querySelectorAll('*').length;

            if (complexity > 100) {
              console.log('Complex content detected, using plain text...');
              const { from, to } = view.state.selection;
              view.dispatch(view.state.tr.replaceWith(from, to, view.state.schema.text(textContent || '')));
              return true;
            }

            // For simpler content, insert the cleaned HTML as text and let TipTap handle it
            const { from, to } = view.state.selection;
            const textToInsert = doc.body.textContent || doc.body.innerText || textContent || '';
            view.dispatch(view.state.tr.replaceWith(from, to, view.state.schema.text(textToInsert)));

            return true;
          }

          // Handle large plain text pastes
          if (textContent && textContent.length > 10000) {
            console.log('Large text paste detected, chunking...');
            event.preventDefault();

            // Insert in chunks to prevent freezing
            const chunkSize = 1000;
            const chunks = [];
            for (let i = 0; i < textContent.length; i += chunkSize) {
              chunks.push(textContent.slice(i, i + chunkSize));
            }

            let currentChunk = 0;
            const insertChunk = () => {
              if (currentChunk < chunks.length && view.state) {
                const { from } = view.state.selection;
                view.dispatch(view.state.tr.insertText(chunks[currentChunk], from));
                currentChunk++;
                // Use requestAnimationFrame to prevent blocking
                if (currentChunk < chunks.length) {
                  requestAnimationFrame(insertChunk);
                }
              }
            };

            insertChunk();
            return true;
          }

          // Let TipTap handle normal pastes
          return false;

        } catch (error) {
          console.error('Paste handling error:', error);

          // Fallback: insert as plain text
          event.preventDefault();
          const textContent = clipboardData.getData('text/plain');
          if (textContent) {
            const { from, to } = view.state.selection;
            view.dispatch(view.state.tr.replaceWith(from, to, view.state.schema.text(textContent)));
          }
          return true;
        }
      },

      // Additional event handlers for better performance
      handleDOMEvents: {
        // Prevent some events that can cause performance issues
        scroll: () => false,
        wheel: () => false,

        // Handle input events more efficiently
        beforeinput: (view, event) => {
          // Prevent certain input types that can cause issues
          const problematicTypes = ['insertFromPaste', 'insertFromDrop'];
          if (problematicTypes.includes(event.inputType) && event.data && event.data.length > 5000) {
            console.log('Large input detected, preventing default handling');
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },
  });

  // Optimized content updates
  useEffect(() => {
    if (!editor) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (editor.getHTML() === content) {
        lastContent.current = content;
        return;
      }
    }

    // Only update if significantly different
    if (content !== lastContent.current && content !== editor.getHTML()) {
      isInternalUpdate.current = true;

      // Clear any pending updates
      if (editorUpdateTimeout.current) {
        clearTimeout(editorUpdateTimeout.current);
      }

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(content, false);
          lastContent.current = content;

          setTimeout(() => {
            isInternalUpdate.current = false;
          }, 100);
        }
      });
    }
  }, [content, editor]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (editorUpdateTimeout.current) {
        clearTimeout(editorUpdateTimeout.current);
      }
      if (transformTimeout.current) {
        clearTimeout(transformTimeout.current);
      }
    };
  }, []);

  // Memoized handlers to prevent re-renders
  const handleColorChange = useCallback((value) => {
    if (value && editor) {
      editor.chain().focus().setColor(value).run();
    }
  }, [editor]);

  const handleFontFamilyChange = useCallback((value) => {
    if (editor) {
      editor.chain().focus().setFontFamily(value).run();
    }
  }, [editor]);

  // Optimized transform handler
  const handleCodeTransform = useCallback(() => {
    if (!editor || isInternalUpdate.current) return;

    // Prevent rapid clicking
    if (transformTimeout.current) {
      clearTimeout(transformTimeout.current);
    }

    transformTimeout.current = setTimeout(() => {
      isInternalUpdate.current = true;

      const currentHtml = editor.getHTML();
      const transformedHtml = transformCodeParagraphs(currentHtml);

      if (transformedHtml !== currentHtml) {
        const { from } = editor.state.selection;
        editor.commands.setContent(transformedHtml, false);

        setTimeout(() => {
          try {
            const maxPos = editor.state.doc.content.size;
            const safePos = Math.min(from, maxPos);
            editor.commands.setTextSelection(safePos);
          } catch (e) {
            editor.commands.focus();
          }
          isInternalUpdate.current = false;
        }, 100);
      } else {
        isInternalUpdate.current = false;
      }
    }, 100);
  }, [editor]);

  // Memoized font families
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

  const languageOptions = useMemo(() => {
    const labelMap: Record<string, string> = {
      plaintext: "Plain Text",
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      java: "Java",
      csharp: "C#",
      php: "PHP",
      cpp: "C++",
      c: "C",
      go: "Go",
      rust: "Rust",
      kotlin: "Kotlin",
      swift: "Swift",
      ruby: "Ruby",
      sql: "SQL",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      less: "Less",
      json: "JSON",
      yaml: "YAML",
      xml: "XML",
      bash: "Bash",
      shell: "Shell",
      markdown: "Markdown",
      r: "R",
      docker: "Dockerfile",
      graphql: "GraphQL",
      diff: "Diff",
    };
    return SUPPORTED_LANGUAGES.map((lang) => ({
      value: lang,
      label: labelMap[lang] || lang,
    }));
  }, []);

  const getCurrentCodeLanguage = useCallback(() => {
    const attrs = editor.getAttributes('codeBlock') as { language?: string };
    return (attrs?.language as string) || 'plaintext';
  }, [editor?.state?.selection]);

  // Memoized current heading
  const getCurrentHeading = useCallback(() => {
    if (!editor) return '0';
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) {
        return i.toString();
      }
    }
    return '0';
  }, [editor?.state?.selection]);

  // Get stats only when needed
  const characterCount = editor?.storage?.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage?.characterCount?.words() ?? 0;
  const percentage = editor ? Math.round((100 / limit) * characterCount) : 0;

  if (!editor) return null;

  return (
    <Box p={0}>
      <Paper withBorder p={'sm'}>
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

            <Group style={{ display: 'flex', justifyContent: 'center' }} gap={0}>
              {/* Inline Code Toggle */}
              <Tooltip label='Inline Code'>
                <Button
                  size='xs'
                  onClick={() => editor.commands.toggleCode()}
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
                      editor.commands.setNode('paragraph');
                    } else {
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
              <Select
                placeholder="Code Lang"
                value={editor.isActive('codeBlock') ? getCurrentCodeLanguage() : undefined}
                data={languageOptions}
                onChange={(value) => {
                  if (!value) return;
                  editor.chain().focus().updateAttributes('codeBlock', { language: value }).run();
                }}
                size="xs"
                disabled={!editor.isActive('codeBlock')}
                styles={{
                  input: {
                    width: '120px',
                    minWidth: '120px',
                    padding: '0 8px',
                  },
                }}
                comboboxProps={{ width: 'auto', position: 'bottom' }}
              />
            </Group>

            <Group gap={0}>
              <Tooltip label="Fix Pasted Code Blocks">
                <Button
                  size='xs'
                  onClick={handleCodeTransform}
                  variant="outline"
                  color="orange"
                  radius="md"
                >
                  <IconWand size={16} />
                </Button>
              </Tooltip>
            </Group>
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
              <HardBreakControl editor={editor} />
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
              onChange={handleColorChange}
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
    </Box>
  );
}
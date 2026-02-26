"use client";

import {
  $createCodeNode,
  $isCodeNode,
  CodeHighlightNode,
  CodeNode,
} from "@lexical/code";
import { $generateNodesFromDOM } from "@lexical/html";
import { AutoLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import {
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Loader,
  Menu,
  Paper,
  Select,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconBrandYoutube,
  IconCalendar,
  IconCaretRightFilled,
  IconChevronDown,
  IconClearFormatting,
  IconCode,
  IconCodeDots,
  IconColumns,
  IconGif,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconIndentDecrease,
  IconIndentIncrease,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconNote,
  IconPencil,
  IconPhoto,
  IconPlus,
  IconQuote,
  IconScissors,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconTable,
  IconTypography,
  IconUnderline,
} from "@tabler/icons-react";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type EditorState,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCodeLanguageOptions, lexicalTheme } from "./lexical-config";
import {
  $createCollapsibleContainerNode,
  $createCollapsibleContentNode,
  $createCollapsibleTitleNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
} from "./nodes/CollapsibleNodes";
import { $createDateNode, DateNode } from "./nodes/DateNode";
import { ExcalidrawNode } from "./nodes/ExcalidrawNode";
import { ImageNode } from "./nodes/ImageNode";
import {
  $createLayoutContainerNode,
  $createLayoutItemNode,
  LayoutContainerNode,
  LayoutItemNode,
} from "./nodes/LayoutNodes";
import { $createPageBreakNode, PageBreakNode } from "./nodes/PageBreakNode";
import { $createStickyNode, StickyNode } from "./nodes/StickyNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
import { CodeHighlightPlugin } from "./plugins/CodeHighlightPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import ExcalidrawPlugin, {
  INSERT_EXCALIDRAW_COMMAND,
} from "./plugins/ExcalidrawPlugin";
import { ImagesPlugin, INSERT_IMAGE_COMMAND } from "./plugins/ImagesPlugin";
import { INSERT_YOUTUBE_COMMAND, YouTubePlugin } from "./plugins/YouTubePlugin";
import "./LexicalTheme.css"; // Global styles for Lexical theme classes
import { unifiedUploadWebWorker } from "../../../utils/worker/assetManager";
import styles from "./LexicalEditor.module.css";

interface LexicalEditorProps {
  value?: string; // Serialized Lexical state JSON
  onChange?: (state: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
  ["22px", "22px"],
  ["24px", "24px"],
  ["26px", "26px"],
  ["28px", "28px"],
  ["30px", "30px"],
  ["32px", "32px"],
];

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/svg+xml"];
const ALLOWED_IMAGE_ACCEPT = ".png,.svg,image/png,image/svg+xml";

const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

  const execCommand = useCallback(
    (command: any) => {
      editor.dispatchCommand(command, undefined);
    },
    [editor],
  );

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor],
  );

  const updateFontSize = useCallback(
    (val: string) => {
      applyStyleText({ "font-size": val });
    },
    [applyStyleText],
  );

  const incrementFontSize = useCallback(
    (increment: number) => {
      const currentSize = parseInt(fontSize.replace("px", "")) || 15;
      const newSize = Math.max(8, Math.min(72, currentSize + increment));
      updateFontSize(`${newSize}px`);
    },
    [fontSize, updateFontSize],
  );

  const updateFontFamily = useCallback(
    (val: string) => {
      applyStyleText({ "font-family": val });
    },
    [applyStyleText],
  );

  const toggleTextFormat = useCallback(
    (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const insertHeading = useCallback(
    (level: "h1" | "h2" | "h3") => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(level));
        }
      });
    },
    [editor],
  );

  const insertList = useCallback(
    (ordered: boolean) => {
      if (ordered) {
        execCommand(INSERT_ORDERED_LIST_COMMAND);
      } else {
        execCommand(INSERT_UNORDERED_LIST_COMMAND);
      }
    },
    [execCommand],
  );

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
    editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: "3", columns: "3" });
  }, [editor]);

  const insertHorizontalRule = useCallback(() => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
  }, [editor]);

  const insertPageBreak = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createPageBreakNode()]);
      }
    });
  }, [editor]);

  const insertDate = useCallback(() => {
    const dateStr = new Date().toLocaleDateString();
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([$createDateNode(dateStr)]);
      }
    });
  }, [editor]);

  const insertStickyNote = useCallback(
    (color: "yellow" | "pink" | "blue" | "green" = "yellow") => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const stickyNode = $createStickyNode(color);
          const p = $createParagraphNode();
          stickyNode.append(p);
          selection.insertNodes([stickyNode]);
        }
      });
    },
    [editor],
  );

  const insertCollapsible = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const container = $createCollapsibleContainerNode(true);
        const title = $createCollapsibleTitleNode();
        const content = $createCollapsibleContentNode();

        title.append($createTextNode("Title"));
        content.append(
          $createParagraphNode().append($createTextNode("Content")),
        );

        container.append(title, content);
        selection.insertNodes([container]);
      }
    });
  }, [editor]);

  const insertLayout = useCallback(
    (columns: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const container = $createLayoutContainerNode(columns);
          const colCount = columns.split(" ").length;

          for (let i = 0; i < colCount; i++) {
            const item = $createLayoutItemNode();
            item.append($createParagraphNode());
            container.append(item);
          }

          selection.insertNodes([container]);
        }
      });
    },
    [editor],
  );

  const insertImage = useCallback(
    (src: string, alt: string) => {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src,
        altText: alt,
      });
    },
    [editor],
  );

  const insertYoutube = useCallback(
    (videoId: string) => {
      editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, { videoId });
    },
    [editor],
  );

  const formatText = useCallback(
    (format: "superscript" | "subscript" | "highlight") => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const formatElement = useCallback(
    (format: "left" | "center" | "right" | "justify") => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    },
    [editor],
  );

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

  const [selectedLanguage, setSelectedLanguage] = useState<string>("plaintext");
  const [isCode, setIsCode] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();

          if ($isCodeNode(element)) {
            setIsCode(true);
            setSelectedLanguage(element.getLanguage() || "plaintext");
          } else {
            setIsCode(false);
          }

          // Update font styles
          setFontSize(
            $getSelectionStyleValueForProperty(selection, "font-size", "15px"),
          );
          setFontFamily(
            $getSelectionStyleValueForProperty(
              selection,
              "font-family",
              "Arial",
            ),
          );

          // Update text formatting states
          setIsBold(selection.hasFormat("bold"));
          setIsItalic(selection.hasFormat("italic"));
          setIsUnderline(selection.hasFormat("underline"));
          setIsStrikethrough(selection.hasFormat("strikethrough"));

          // Link detection
          // const parent = anchorNode.getParent();
          // setIsLink($isLinkNode(parent) || $isLinkNode(anchorNode));

          // In Lexical, inline code is a text format, but block code is a node type.
          const isInlineCode = selection.hasFormat("code");
          setIsCode(isInlineCode || $isCodeNode(element));

          if ($isCodeNode(element)) {
            setSelectedLanguage(element.getLanguage() || "plaintext");
          }

          // Update block type state
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      });
    });
  }, [editor]);

  const onLanguageChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();

          if ($isCodeNode(element)) {
            element.setLanguage(value);
          }
        }
      });
    },
    [editor],
  );

  const triggerImageFileUpload = useCallback(() => {
    imageFileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // Reset input so the same file can be re-selected next time
      if (e.target) e.target.value = "";
      if (!file) return;

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        notifications.show({
          title: "Invalid file type",
          message: "Only PNG and SVG files are allowed.",
          color: "red",
        });
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        notifications.show({
          title: "File too large",
          message: "Maximum image size is 5 MB.",
          color: "red",
        });
        return;
      }

      setIsUploadingImage(true);
      try {
        const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API;
        const result = await unifiedUploadWebWorker({
          file,
          folder: "whatsnxt-tutorial",
          resource_type: "image",
          setProgress: () => { },
          rejectOnError: true,
          addToLocalStorage: false,
          bffApiUrl,
        });
        if (result?.secure_url) {
          insertImage(result.secure_url, file.name);
        }
      } catch {
        // Error notification is already shown by unifiedUploadWebWorker
      } finally {
        setIsUploadingImage(false);
      }
    },
    [insertImage],
  );

  const insertGifPrompt = useCallback(() => {
    const src = prompt("Enter GIF URL:");
    if (src) {
      insertImage(src, "GIF");
    }
  }, [insertImage]);

  const insertYoutubePrompt = useCallback(() => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
      if (videoId) insertYoutube(videoId);
    }
  }, [insertYoutube]);

  return (
    <Group
      gap={10}
      p={4}
      className={styles.toolbar}
      wrap="nowrap"
      justify="flex-start"
      align="center"
    >
      {/* 1. History (Undo/Redo) */}
      <Group gap={2} wrap="nowrap">
        <Tooltip label="Undo (Ctrl+Z)">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => execCommand(UNDO_COMMAND)}
          >
            <IconArrowBackUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo (Ctrl+Y)">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => execCommand(REDO_COMMAND)}
          >
            <IconArrowForwardUp size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 2. Font Family and Size */}
      <Group gap={4} wrap="nowrap">
        {/* Font Family */}
        <Menu shadow="md" width={180}>
          <Menu.Target>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconTypography size={18} />}
              rightSection={<IconChevronDown size={14} />}
              px={8}
              styles={{
                root: { minWidth: 100, justifyContent: "space-between" },
                label: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              }}
            >
              {fontFamily}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {FONT_FAMILY_OPTIONS.map(([value, label]) => (
              <Menu.Item
                key={value}
                onClick={() => updateFontFamily(value)}
                style={{
                  fontFamily: value,
                  fontWeight: value === fontFamily ? "bold" : "normal",
                }}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        <Divider orientation="vertical" h={24} mx={8} my={8} />

        {/* Font Size Stepper */}
        <Group gap={2} align="center" wrap="nowrap">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => incrementFontSize(-1)}
            disabled={parseInt(fontSize) <= 8}
          >
            <IconMinus size={14} stroke={2} />
          </ActionIcon>

          <Menu shadow="md" width={80} trigger="click">
            <Menu.Target>
              <Button
                variant="default"
                size="xs"
                h={26}
                w={46}
                px={0}
                bg="#ced1d8ff"
                c="#000000ff"
                styles={{
                  root: { borderColor: "#929aaaff" },
                  inner: {
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  label: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  },
                }}
              >
                {parseInt(fontSize) || 15}
              </Button>
            </Menu.Target>
            <Menu.Dropdown style={{ maxHeight: "200px", overflowY: "auto" }}>
              {FONT_SIZE_OPTIONS.map(([value, label]) => (
                <Menu.Item
                  key={value}
                  onClick={() => updateFontSize(value)}
                  style={{ fontWeight: value === fontSize ? "bold" : "normal" }}
                >
                  {label.replace("px", "")}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => incrementFontSize(1)}
            disabled={parseInt(fontSize) >= 72}
          >
            <IconPlus size={14} stroke={2} />
          </ActionIcon>
        </Group>
      </Group>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 3. Block Type Dropdown */}
      <Menu shadow="md" width={180}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={
              blockType === "h1" ? (
                <IconH1 size={16} />
              ) : blockType === "h2" ? (
                <IconH2 size={16} />
              ) : blockType === "h3" ? (
                <IconH3 size={16} />
              ) : blockType === "quote" ? (
                <IconQuote size={16} />
              ) : blockType === "ul" ? (
                <IconList size={16} />
              ) : blockType === "ol" ? (
                <IconListNumbers size={16} />
              ) : (
                <IconH1 size={16} />
              )
            }
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            {blockType === "h1"
              ? "Heading 1"
              : blockType === "h2"
                ? "Heading 2"
                : blockType === "h3"
                  ? "Heading 3"
                  : blockType === "quote"
                    ? "Quote"
                    : blockType === "ul"
                      ? "Bullet List"
                      : blockType === "ol"
                        ? "Numbered List"
                        : "Normal"}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => insertHeading("h1")}
            leftSection={<IconH1 size={16} />}
          >
            Heading 1
          </Menu.Item>
          <Menu.Item
            onClick={() => insertHeading("h2")}
            leftSection={<IconH2 size={16} />}
          >
            Heading 2
          </Menu.Item>
          <Menu.Item
            onClick={() => insertHeading("h3")}
            leftSection={<IconH3 size={16} />}
          >
            Heading 3
          </Menu.Item>
          <Menu.Item
            onClick={insertQuote}
            leftSection={<IconQuote size={16} />}
          >
            Quote
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      <Group gap={2} wrap="nowrap">
        <Tooltip label="Bullet List">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => insertList(false)}
          >
            <IconList size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Numbered List">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => insertList(true)}
          >
            <IconListNumbers size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 3. Text Formatting Group */}
      <Group gap={10} wrap="nowrap">
        <Tooltip label="Bold">
          <ActionIcon
            variant={isBold ? "light" : "subtle"}
            size="sm"
            onClick={() => toggleTextFormat("bold")}
            color={isBold ? "blue" : undefined}
          >
            <IconBold size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Italic">
          <ActionIcon
            variant={isItalic ? "light" : "subtle"}
            size="sm"
            onClick={() => toggleTextFormat("italic")}
            color={isItalic ? "blue" : undefined}
          >
            <IconItalic size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Underline">
          <ActionIcon
            variant={isUnderline ? "light" : "subtle"}
            size="sm"
            onClick={() => toggleTextFormat("underline")}
            color={isUnderline ? "blue" : undefined}
          >
            <IconUnderline size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Inline Code">
          <ActionIcon
            variant={isCode ? "light" : "subtle"}
            size="sm"
            onClick={() => toggleTextFormat("code")}
            color={isCode ? "blue" : undefined}
          >
            <IconCode size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Code Block">
          <ActionIcon
            variant={isCode ? "light" : "subtle"}
            size="sm"
            onClick={insertCodeBlock}
            color={isCode ? "blue" : undefined}
          >
            <IconCodeDots size={18} />
          </ActionIcon>
        </Tooltip>

        {isCode && (
          <Select
            size="xs"
            placeholder="Language"
            data={getCodeLanguageOptions().map(([val, label]) => ({
              value: val,
              label,
            }))}
            value={selectedLanguage}
            onChange={onLanguageChange}
            style={{ width: 120 }}
            comboboxProps={{ withinPortal: true }}
          />
        )}
        <Tooltip label="Link">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => execCommand(TOGGLE_LINK_COMMAND)}
          >
            <IconLink size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 4. More Options Dropdown */}
      <Menu shadow="md" width={180}>
        <Menu.Target>
          <ActionIcon variant="subtle" size="sm">
            <IconHighlight size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => formatText("superscript")}
            leftSection={<IconSuperscript size={16} />}
          >
            Superscript
          </Menu.Item>
          <Menu.Item
            onClick={() => formatText("subscript")}
            leftSection={<IconSubscript size={16} />}
          >
            Subscript
          </Menu.Item>
          <Menu.Item
            onClick={() => formatText("highlight")}
            leftSection={<IconHighlight size={16} />}
          >
            Highlight
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleTextFormat("strikethrough")}
            leftSection={<IconStrikethrough size={16} />}
          >
            Strikethrough
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={clearFormatting}
            leftSection={<IconClearFormatting size={16} />}
          >
            Clear Formatting
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 5. Insert Dropdown */}
      <Menu shadow="md" width={220}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={
              <Text size="sm" fw={500}>
                +
              </Text>
            }
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            Insert
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={insertHorizontalRule}
            leftSection={<IconMinus size={12} />}
          >
            Horizontal Rule
          </Menu.Item>
          <Menu.Item
            onClick={insertPageBreak}
            leftSection={<IconScissors size={12} />}
          >
            Page Break
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={triggerImageFileUpload}
            disabled={isUploadingImage}
            leftSection={
              isUploadingImage ? <Loader size={12} /> : <IconPhoto size={12} />
            }
          >
            {isUploadingImage ? "Uploading…" : "Image (PNG / SVG)"}
          </Menu.Item>
          <Menu.Item
            onClick={insertGifPrompt}
            leftSection={<IconGif size={12} />}
          >
            GIF
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={insertTable}
            leftSection={<IconTable size={12} />}
          >
            Table
          </Menu.Item>
          <Menu.Item
            onClick={() => insertLayout("1fr 1fr")}
            leftSection={<IconColumns size={12} />}
          >
            2 Columns
          </Menu.Item>
          <Menu.Item
            onClick={() => insertLayout("1fr 1fr 1fr")}
            leftSection={<IconColumns size={12} />}
          >
            3 Columns
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={() => insertStickyNote("yellow")}
            leftSection={<IconNote size={12} />}
          >
            Sticky Note
          </Menu.Item>
          <Menu.Item
            onClick={insertCollapsible}
            leftSection={<IconCaretRightFilled size={12} />}
          >
            Collapsible container
          </Menu.Item>
          <Menu.Item
            onClick={insertDate}
            leftSection={<IconCalendar size={12} />}
          >
            Date
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={insertYoutubePrompt}
            leftSection={<IconBrandYoutube size={12} />}
          >
            YouTube Video
          </Menu.Item>
          <Menu.Item
            onClick={() => execCommand(INSERT_EXCALIDRAW_COMMAND)}
            leftSection={<IconPencil size={12} />}
          >
            Excalidraw Drawing
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Divider orientation="vertical" h={24} mx={8} my={8} />

      {/* 6. Alignment Dropdown */}
      <Menu shadow="md" width={170}>
        <Menu.Target>
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconAlignLeft size={12} />}
            rightSection={<IconChevronDown size={14} />}
            px={8}
            className={styles.toolbarButton}
          >
            Alignment
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => formatElement("left")}
            leftSection={<IconAlignLeft size={16} />}
          >
            Left Align
          </Menu.Item>
          <Menu.Item
            onClick={() => formatElement("center")}
            leftSection={<IconAlignCenter size={16} />}
          >
            Center Align
          </Menu.Item>
          <Menu.Item
            onClick={() => formatElement("right")}
            leftSection={<IconAlignRight size={16} />}
          >
            Right Align
          </Menu.Item>
          <Menu.Item
            onClick={() => formatElement("justify")}
            leftSection={<IconAlignJustified size={16} />}
          >
            Justify
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            onClick={outdent}
            leftSection={<IconIndentDecrease size={16} />}
          >
            Outdent
          </Menu.Item>
          <Menu.Item
            onClick={indent}
            leftSection={<IconIndentIncrease size={16} />}
          >
            Indent
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {/* Hidden file input for image uploads */}
      <input
        ref={imageFileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        style={{ display: "none" }}
        onChange={handleImageFileChange}
      />
    </Group>
  );
};

const OnChangePluginWrapper: React.FC<{
  onChange?: (state: string) => void;
  onWordCountChange?: (count: number) => void;
}> = ({ onChange, onWordCountChange }) => {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      // Handle serialization for parent state
      if (onChange) {
        const serialized = JSON.stringify(editorState.toJSON());
        onChange(serialized);
      }

      // Handle word count
      if (onWordCountChange) {
        const textContent = $getRoot().getTextContent();
        // Match sequences of one or more non-whitespace characters
        const words = textContent.match(/\S+/g) || [];
        onWordCountChange(words.length);
      }
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
};

const InitialStatePlugin: React.FC<{ value?: string }> = ({ value }) => {
  const [editor] = useLexicalComposerContext();
  const hasLoadedInitialState = useRef(false);

  useEffect(() => {
    if (value === undefined || value === null) return;

    // Skip if we've already loaded the initial state and value hasn't meaningfully changed
    if (hasLoadedInitialState.current) {
      const currentSerialized = JSON.stringify(
        editor.getEditorState().toJSON(),
      );
      if (value === currentSerialized) {
        return;
      }
    }

    try {
      // If value is empty string, just clear
      if (value === "") {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        });
        hasLoadedInitialState.current = true;
        return;
      }

      const editorState = editor.parseEditorState(value);
      editor.setEditorState(editorState);
      hasLoadedInitialState.current = true;
    } catch (e) {
      // Not valid Lexical JSON
      // Check if it looks like HTML (contains tags)
      const isHTML = /<[a-z][\s\S]*>/i.test(value.trim());
      if (isHTML) {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const parser = new DOMParser();
          const dom = parser.parseFromString(value, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom.body);
          if (nodes && nodes.length > 0) {
            root.append(...nodes);
          } else {
            // Fallback to text if generation failed
            const p = $createParagraphNode();
            p.append($createTextNode(value));
            root.append(p);
          }
        });
        hasLoadedInitialState.current = true;
      } else {
        // Fallback to plain text
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          const p = $createParagraphNode();
          p.append($createTextNode(value));
          root.append(p);
        });
        hasLoadedInitialState.current = true;
        console.warn(
          "LexicalEditor: Value is not valid JSON, loaded as plain text fallback.",
          e,
        );
      }
    }
  }, [value, editor]);

  return null;
};

export const LexicalEditor: React.FC<LexicalEditorProps> = ({
  value,
  onChange,
  onWordCountChange,
  placeholder = "Start typing...",
  readOnly = false,
}) => {
  const editorStateRef = useRef<string | undefined>(value);

  const initialConfig = {
    namespace: "StructuredTutorialEditor",
    theme: lexicalTheme,
    onError: (error: Error) => {
      console.error("Lexical error:", error);
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
      YouTubeNode,
      ExcalidrawNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
      PageBreakNode,
      DateNode,
      StickyNode,
      CollapsibleContainerNode,
      CollapsibleTitleNode,
      CollapsibleContentNode,
      LayoutContainerNode,
      LayoutItemNode,
    ],
    editable: !readOnly,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Stack gap={0}>
        {!readOnly && <ToolbarPlugin />}
        <Paper
          p={0}
          className={styles.editorContainer}
          data-editable={!readOnly}
        >
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
          {!readOnly && (
            <>
              <HistoryPlugin />
              <AutoFocusPlugin />
              <DraggableBlockPlugin />
              <OnChangePluginWrapper
                onChange={onChange}
                onWordCountChange={onWordCountChange}
              />
              <ClearEditorPlugin />
            </>
          )}
          <ListPlugin />
          <LinkPlugin />
          <CodeHighlightPlugin />
          <ImagesPlugin />
          <YouTubePlugin />
          <ExcalidrawPlugin />
          <HorizontalRulePlugin />
          <InitialStatePlugin value={value} />
        </Paper>
      </Stack>
    </LexicalComposer>
  );
};

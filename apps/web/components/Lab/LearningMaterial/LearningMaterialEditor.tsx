"use client";

import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconBooks,
    IconChevronRight,
    IconHierarchy2,
    IconLink,
    IconPlus,
    IconTrash,
    IconVideo,
} from "@tabler/icons-react";
import type { LabPage } from "@whatsnxt/core-types";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
    buildDiagramAIPrompt,
    type DiagramState,
    parseAIDiagramResponse,
} from "@/utils/diagram-ai";
import { mapSubCategoryToArchitecture } from "@/utils/shape-libraries";
import labApi, { type LearningLinkRequest } from "../../../apis/lab.api";
import { AISuggestionButton } from "../../Common/AISuggestionButton";
import { LexicalEditor } from "../../StructuredTutorial/Editor/LexicalEditor";
import styles from "./LearningMaterialEditor.module.css";

const DiagramEditor = dynamic(
    () => import("../../architecture-lab/DiagramEditor"),
    { ssr: false },
);

interface LinkRow extends LearningLinkRequest {
    _id: string; // local unique id for React keys
}

export interface LearningMaterialEditorProps {
    labId: string;
    pageId: string;
    labType: string;
    subCategory?: string;
    nestedSubCategory?: string;
    diagramTestPrompt?: string;
    initialData?: Pick<
        LabPage,
        | "learningContent"
        | "learningVideoUrl"
        | "learningLinks"
        | "hasLearningMaterial"
        | "learningDiagramState"
    >;
    onSaved?: (updated: LabPage) => void;
}

function buildAIPrompt(
    labType: string,
    subCategory?: string,
    nestedSubCategory?: string,
    diagramTestPrompt?: string,
): string {
    const topic = [nestedSubCategory, subCategory, labType]
        .filter(Boolean)
        .join(" > ");
    const testHint = diagramTestPrompt
        ? `\n\nDiagram test context: "${diagramTestPrompt}"`
        : "";
    return (
        `Generate comprehensive educational content for a lab on: ${topic}.${testHint}\n\n` +
        "Structure the content with:\n" +
        "1. A brief overview of the topic\n" +
        "2. Key architectural components and their roles\n" +
        "3. How the components interconnect\n" +
        "4. Best practices to remember\n" +
        "5. Common pitfalls to avoid\n\n" +
        "Use clear headings and bullet points. Keep it practical and focused on the diagram test."
    );
}

function createEmptyLink(): LinkRow {
    return { _id: crypto.randomUUID(), title: "", url: "", type: "external" };
}

function useLinks(initial: LearningLinkRequest[] = []) {
    const [links, setLinks] = useState<LinkRow[]>(() =>
        initial.map((l) => ({ ...l, _id: crypto.randomUUID() })),
    );

    const addLink = useCallback(
        () => setLinks((ls) => [...ls, createEmptyLink()]),
        [],
    );

    const removeLink = useCallback(
        (_id: string) => setLinks((ls) => ls.filter((l) => l._id !== _id)),
        [],
    );

    const updateLink = useCallback(
        (_id: string, field: keyof LearningLinkRequest, value: string) =>
            setLinks((ls) =>
                ls.map((l) => (l._id === _id ? { ...l, [field]: value } : l)),
            ),
        [],
    );

    return { links, addLink, removeLink, updateLink };
}

export function LearningMaterialEditor({
    labId,
    pageId,
    labType,
    subCategory,
    nestedSubCategory,
    diagramTestPrompt,
    initialData,
    onSaved,
}: LearningMaterialEditorProps) {
    const [opened, { toggle }] = useDisclosure(false);
    const [editorKey, setEditorKey] = useState(0);
    const [editorInitialValue, setEditorInitialValue] = useState(
        initialData?.learningContent,
    );
    const [learningContent, setLearningContent] = useState(
        initialData?.learningContent,
    );
    const [videoUrl, setVideoUrl] = useState(initialData?.learningVideoUrl ?? "");
    const [diagramState, setDiagramState] = useState<DiagramState | null>(() => {
        const raw = initialData?.learningDiagramState;
        if (!raw) return null;
        try {
            return JSON.parse(raw) as DiagramState;
        } catch {
            return null;
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const { links, addLink, removeLink, updateLink } = useLinks(
        (initialData?.learningLinks as LearningLinkRequest[] | undefined) ?? [],
    );

    const hasMaterial =
        initialData?.hasLearningMaterial ||
        !!(learningContent || videoUrl || links.length > 0 || diagramState);

    const handleAISuggestion = useCallback((suggestion: string) => {
        setEditorInitialValue(suggestion);
        setEditorKey((k) => k + 1);
        setLearningContent(suggestion);
    }, []);

    const architectureType =
        mapSubCategoryToArchitecture(subCategory, nestedSubCategory) || labType;

    const diagramAIPrompt = buildDiagramAIPrompt(
        `${diagramTestPrompt || [nestedSubCategory, subCategory, labType].filter(Boolean).join(" > ")}`,
        architectureType,
    );

    const handleDiagramAISuggestion = useCallback(
        (suggestion: string) => {
            const parsed = parseAIDiagramResponse(suggestion, architectureType);
            if (parsed) setDiagramState(parsed);
        },
        [architectureType],
    );

    const handleGraphChange = useCallback((json: DiagramState) => {
        setDiagramState(json);
    }, []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const cleanLinks = links
                .filter((l) => l.title.trim() && l.url.trim())
                .map(({ _id: _, ...rest }) => rest);

            const result = await labApi.saveLearningMaterial(labId, pageId, {
                learningContent: learningContent || undefined,
                learningVideoUrl: videoUrl.trim() || undefined,
                learningLinks: cleanLinks,
                learningDiagramState: diagramState
                    ? JSON.stringify(diagramState)
                    : undefined,
            });

            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2500);

            notifications.show({
                position: "bottom-right",
                color: "green",
                title: "Saved",
                message: "Learning material saved successfully",
            });

            onSaved?.(result.data as LabPage);
        } catch (error: unknown) {
            const axiosError = error as {
                response?: { data?: { message?: string } };
            };
            const msg =
                axiosError?.response?.data?.message ??
                "Failed to save learning material";
            notifications.show({
                position: "bottom-right",
                color: "red",
                title: "Save Failed",
                message: msg,
            });
        } finally {
            setIsSaving(false);
        }
    }, [labId, pageId, learningContent, videoUrl, links, diagramState, onSaved]);

    const aiPrompt = buildAIPrompt(
        labType,
        subCategory,
        nestedSubCategory,
        diagramTestPrompt,
    );

    return (
        <Box mt="sm">
            {/* Collapsible header */}
            <button
                type="button"
                className={styles.header}
                onClick={toggle}
                aria-expanded={opened}
            >
                <div className={styles.headerLeft}>
                    <IconBooks size={16} color="var(--mantine-color-violet-6)" />
                    <Text size="sm" fw={600} c="violet">
                        Learning Material
                    </Text>
                    {hasMaterial && (
                        <Badge size="xs" color="violet" variant="filled">
                            Set
                        </Badge>
                    )}
                </div>
                <IconChevronRight
                    size={14}
                    className={`${styles.chevron} ${opened ? styles.chevronOpen : ""}`}
                />
            </button>

            {/* Body — only rendered when open */}
            {opened && (
                <Box pt="sm">
                    <Stack gap="md">
                        {/* Rich text section */}
                        <Box>
                            <Group mb={6} className={styles.sectionLabel}>
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                                    Content
                                </Text>
                                <AISuggestionButton
                                    prompt={aiPrompt}
                                    onSuggestion={handleAISuggestion}
                                    label="Generate explanation with AI"
                                    iconSize={14}
                                />
                            </Group>
                            <div className={styles.editorWrap}>
                                <LexicalEditor
                                    key={editorKey}
                                    value={editorInitialValue}
                                    onChange={setLearningContent}
                                    placeholder="Add an explanation, key concepts, or architectural overview for this test…"
                                />
                            </div>
                        </Box>

                        {/* Architectural Diagram section */}
                        <Box>
                            <Group mb={6} className={styles.sectionLabel}>
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                                    Architectural Diagram
                                </Text>
                                <AISuggestionButton
                                    prompt={diagramAIPrompt}
                                    onSuggestion={handleDiagramAISuggestion}
                                    label="Generate diagram with AI"
                                    iconSize={14}
                                />
                                {diagramState && (
                                    <ActionIcon
                                        size="xs"
                                        variant="subtle"
                                        color="red"
                                        title="Clear diagram"
                                        onClick={() => setDiagramState(null)}
                                    >
                                        <IconTrash size={12} />
                                    </ActionIcon>
                                )}
                            </Group>
                            {diagramState ? (
                                <div className={styles.diagramWrap}>
                                    <DiagramEditor
                                        initialGraph={diagramState}
                                        mode="instructor"
                                        onGraphChange={handleGraphChange}
                                        architectureTypes={[architectureType]}
                                    />
                                </div>
                            ) : (
                                <Box className={styles.diagramEmpty} onClick={() => { }}>
                                    <IconHierarchy2
                                        size={24}
                                        color="var(--mantine-color-violet-4)"
                                    />
                                    <Text size="xs" c="dimmed" ta="center" mt={6}>
                                        Click ✨ to generate an architectural diagram with AI, or it
                                        will appear here after generation.
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        {/* Video URL section */}
                        <Box>
                            <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
                                Video Link
                            </Text>
                            <TextInput
                                placeholder="YouTube or Cloudinary video URL (optional)"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.currentTarget.value)}
                                leftSection={<IconVideo size={14} />}
                            />
                        </Box>

                        {/* Links section */}
                        <Box>
                            <Group justify="space-between" mb={6}>
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                                    Links
                                </Text>
                                <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    color="violet"
                                    leftSection={<IconPlus size={12} />}
                                    onClick={addLink}
                                >
                                    Add Link
                                </Button>
                            </Group>

                            {links.length === 0 && (
                                <Text size="xs" c="dimmed" pl={2}>
                                    No links — click "Add Link" to attach a blog post or tutorial.
                                </Text>
                            )}

                            <Stack gap="xs">
                                {links.map((link) => (
                                    <div key={link._id} className={styles.linkRow}>
                                        <TextInput
                                            placeholder="Title"
                                            size="xs"
                                            value={link.title}
                                            leftSection={<IconLink size={12} />}
                                            onChange={(e) =>
                                                updateLink(link._id, "title", e.currentTarget.value)
                                            }
                                        />
                                        <TextInput
                                            placeholder="URL"
                                            size="xs"
                                            value={link.url}
                                            onChange={(e) =>
                                                updateLink(link._id, "url", e.currentTarget.value)
                                            }
                                        />
                                        <Select
                                            size="xs"
                                            value={link.type}
                                            data={[
                                                { value: "internal", label: "WhatsNxt" },
                                                { value: "external", label: "External" },
                                            ]}
                                            onChange={(val) =>
                                                updateLink(link._id, "type", val ?? "external")
                                            }
                                        />
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            size="sm"
                                            onClick={() => removeLink(link._id)}
                                            mt={1}
                                        >
                                            <IconTrash size={13} />
                                        </ActionIcon>
                                    </div>
                                ))}
                            </Stack>
                        </Box>

                        {/* Save row */}
                        <Group justify="flex-end">
                            {justSaved && (
                                <Badge
                                    color="green"
                                    variant="light"
                                    className={styles.savedBadge}
                                >
                                    ✓ Saved
                                </Badge>
                            )}
                            <Button
                                size="sm"
                                color="violet"
                                loading={isSaving}
                                onClick={handleSave}
                            >
                                Save Learning Material
                            </Button>
                        </Group>
                    </Stack>
                </Box>
            )}
        </Box>
    );
}

export default LearningMaterialEditor;

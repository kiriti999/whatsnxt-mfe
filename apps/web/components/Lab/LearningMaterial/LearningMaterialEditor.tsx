"use client";

import {
    Accordion,
    ActionIcon,
    Badge,
    Box,
    Button,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconBooks,
    IconChevronRight,
    IconHierarchy2,
    IconLink,
    IconPlus,
    IconSparkles,
    IconTrash,
    IconVideo,
} from "@tabler/icons-react";
import type { LabPage } from "@whatsnxt/types";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import {
    buildDiagramAIPrompt,
    buildDiagramValidationPrompt,
    type DiagramState,
    parseAIDiagramResponse,
} from "@/utils/diagram-ai";
import { mapSubCategoryToArchitecture } from "@/utils/shape-libraries";
import labApi, { type LearningLinkRequest } from "../../../apis/lab.api";
import { AISuggestions } from "../../../apis/v1/blog/aiSuggestions";
import { useAIConfig } from "../../../context/AIConfigContext";
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

function buildAIPrompt(topic: string): string {
    return (
        `Generate comprehensive educational content for a lab on: ${topic}\n\n` +
        "Structure the content with:\n" +
        "1. A brief overview of the topic\n" +
        "2. Key concepts and fundamentals\n" +
        "3. Important details and examples\n" +
        "4. Best practices to remember\n" +
        "5. Common pitfalls to avoid\n\n" +
        "Use clear headings and bullet points."
    );
}

function buildTopicGenerationPrompt(labType: string, subCategory?: string, nestedSubCategory?: string): string {
    const context = [nestedSubCategory, subCategory, labType].filter(Boolean).join(" > ");
    return `You are an expert educational content creator. Generate ONE relevant learning topic for a lab on: ${context}

The topic should be:
1. Specific and focused (not too broad, not too narrow)
2. Directly related to the lab subject matter
3. Educational and engaging
4. Suitable for students to learn about
5. 3-10 words in length

CRITICAL OUTPUT FORMAT:
- Return ONLY the topic text, nothing else
- No JSON, no markdown, no explanation, no preamble
- Just the topic sentence that could be used as a learning title`;
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
    const aiConfig = useAIConfig();
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
    const [contentAITopic, setContentAITopic] = useState("");
    const [isGeneratingContentAI, setIsGeneratingContentAI] = useState(false);
    const [diagramCustomPrompt, setDiagramCustomPrompt] = useState("");
    const [isDiagramValidating, setIsDiagramValidating] = useState(false);
    const [diagramKey, setDiagramKey] = useState(0);
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

    // Custom prompt takes priority; falls back to stripped lexical content then test prompt
    const getDiagramAIPrompt = useCallback(() => {
        if (diagramCustomPrompt.trim()) {
            return buildDiagramAIPrompt(diagramCustomPrompt.trim(), architectureType);
        }
        const plain = (learningContent ?? "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        return buildDiagramAIPrompt(
            plain ||
            diagramTestPrompt ||
            [nestedSubCategory, subCategory, labType].filter(Boolean).join(" > "),
            architectureType,
        );
    }, [
        diagramCustomPrompt,
        learningContent,
        diagramTestPrompt,
        nestedSubCategory,
        subCategory,
        labType,
        architectureType,
    ]);

    const handleDiagramAISuggestion = useCallback(
        async (suggestion: string) => {
            // Pass 1 — parse and render immediately so user sees progress
            const pass1 = parseAIDiagramResponse(suggestion, architectureType);
            if (!pass1) {
                notifications.show({
                    position: "bottom-right",
                    color: "orange",
                    title: "Diagram parse failed",
                    message: "AI response could not be parsed as a diagram. Try again.",
                });
                return;
            }
            setDiagramState(pass1);
            setDiagramKey((k) => k + 1);

            // Pass 2 — validate and auto-correct via AI
            setIsDiagramValidating(true);
            try {
                const originalPrompt = getDiagramAIPrompt();
                const messages = buildDiagramValidationPrompt(
                    originalPrompt,
                    suggestion,
                );
                const response = await AISuggestions.getSuggestionByAI({
                    messages,
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
                });
                if (response.status === 200 && response.data?.suggestion) {
                    const pass2 = parseAIDiagramResponse(
                        response.data.suggestion,
                        architectureType,
                    );
                    if (pass2) {
                        setDiagramState(pass2);
                        setDiagramKey((k) => k + 1);
                        notifications.show({
                            position: "bottom-right",
                            color: "teal",
                            title: "Diagram validated",
                            message: "AI reviewed and corrected the diagram for accuracy.",
                        });
                    }
                }
            } catch (err: unknown) {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                notifications.show({
                    position: "bottom-right",
                    color: "yellow",
                    title: "Validation skipped",
                    message: msg ?? "Could not run validation pass — diagram may have minor issues.",
                });
            } finally {
                setIsDiagramValidating(false);
            }
        },
        [architectureType, getDiagramAIPrompt, aiConfig],
    );

    const handleGraphChange = useCallback((json: DiagramState) => {
        setDiagramState(json);
    }, []);

    const handleGenerateContentAI = useCallback(async () => {
        setIsGeneratingContentAI(true);
        try {
            // Step 1: Generate topic from lab context
            const topicPrompt = buildTopicGenerationPrompt(labType, subCategory, nestedSubCategory);
            const topicResponse = await AISuggestions.getSuggestionByAI({
                question: topicPrompt,
                aiModel: aiConfig.selectedAI || 'openai',
                modelVersion: aiConfig.selectedModel || 'gpt-4-turbo',
            });

            if (topicResponse.status !== 200 || !topicResponse.data?.suggestion) {
                notifications.show({
                    position: "bottom-right",
                    color: "red",
                    title: "Topic generation failed",
                    message: "Could not generate a topic. Please try again.",
                });
                return;
            }

            const generatedTopic = topicResponse.data.suggestion.trim();
            setContentAITopic(generatedTopic);

            // Step 2: Generate content from the generated topic
            const contentPrompt = buildAIPrompt(generatedTopic);
            const contentResponse = await AISuggestions.getSuggestionByAI({
                question: contentPrompt,
                aiModel: aiConfig.selectedAI || 'openai',
                modelVersion: aiConfig.selectedModel || 'gpt-4-turbo',
            });

            if (contentResponse.status === 200 && contentResponse.data?.suggestion) {
                setEditorInitialValue(contentResponse.data.suggestion);
                setEditorKey((k) => k + 1);
                setLearningContent(contentResponse.data.suggestion);
                notifications.show({
                    position: "bottom-right",
                    color: "teal",
                    title: "Content generated",
                    message: `Generated topic: "${generatedTopic}"`,
                });
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || "Failed to generate content";
            notifications.show({
                position: "bottom-right",
                color: "red",
                title: "Generation failed",
                message: msg,
            });
        } finally {
            setIsGeneratingContentAI(false);
        }
    }, [labType, subCategory, nestedSubCategory, aiConfig]);

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
                        {/* Collapsible sub-sections */}
                        <Accordion multiple defaultValue={[]} variant="contained">
                            {/* Rich text section */}
                            <Accordion.Item value="content">
                                <Accordion.Control>
                                    <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                                        Content
                                    </Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Group mb={8} gap="xs" align="center">
                                        <TextInput
                                            style={{ flex: 1 }}
                                            size="xs"
                                            placeholder="Enter a topic to generate content (e.g. Kubernetes Pod scheduling)"
                                            value={contentAITopic}
                                            onChange={(e) => setContentAITopic(e.currentTarget.value)}
                                        />
                                        <ActionIcon
                                            size="xs"
                                            variant="subtle"
                                            color="violet"
                                            loading={isGeneratingContentAI}
                                            disabled={isGeneratingContentAI}
                                            onClick={handleGenerateContentAI}
                                            title="Generate topic and content with AI"
                                        >
                                            <IconSparkles size={14} />
                                        </ActionIcon>
                                        <AISuggestionButton
                                            prompt={() => buildAIPrompt(contentAITopic)}
                                            onSuggestion={handleAISuggestion}
                                            label="Generate explanation with AI"
                                            iconSize={14}
                                            disabled={!contentAITopic.trim()}
                                            onEmptyPrompt={() =>
                                                notifications.show({
                                                    position: "bottom-right",
                                                    color: "orange",
                                                    title: "Topic required",
                                                    message:
                                                        "Please enter a topic before generating content",
                                                })
                                            }
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
                                </Accordion.Panel>
                            </Accordion.Item>

                            {/* Architectural Diagram section */}
                            <Accordion.Item value="diagram">
                                <div className={styles.diagramAccordionRow}>
                                    <Accordion.Control className={styles.diagramAccordionControl}>
                                        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                                            Architectural Diagram
                                        </Text>
                                    </Accordion.Control>
                                    <Group gap="xs" className={styles.diagramAccordionActions}>
                                        {isDiagramValidating && (
                                            <Tooltip
                                                label="AI is validating diagram accuracy…"
                                                withArrow
                                            >
                                                <Group gap={4}>
                                                    <Loader size={12} color="violet" />
                                                    <Text size="xs" c="dimmed">
                                                        Validating
                                                    </Text>
                                                </Group>
                                            </Tooltip>
                                        )}
                                        <AISuggestionButton
                                            prompt={getDiagramAIPrompt}
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
                                </div>
                                <Accordion.Panel>
                                    <Group mb={8} gap="xs" align="center">
                                        <TextInput
                                            style={{ flex: 1 }}
                                            size="xs"
                                            placeholder="Optional: describe the diagram (overrides content)"
                                            value={diagramCustomPrompt}
                                            onChange={(e) =>
                                                setDiagramCustomPrompt(e.currentTarget.value)
                                            }
                                            leftSection={<IconHierarchy2 size={12} />}
                                        />
                                    </Group>
                                    {diagramState ? (
                                        <div className={styles.diagramWrap}>
                                            <DiagramEditor
                                                key={diagramKey}
                                                initialGraph={diagramState}
                                                mode="instructor"
                                                canvasPan
                                                onGraphChange={handleGraphChange}
                                                architectureTypes={[architectureType]}
                                            />
                                        </div>
                                    ) : (
                                        <Box className={styles.diagramEmpty}>
                                            <IconHierarchy2
                                                size={24}
                                                color="var(--mantine-color-violet-4)"
                                            />
                                            <Text size="xs" c="dimmed" ta="center" mt={6}>
                                                Click ✨ to generate an architectural diagram with AI,
                                                or it will appear here after generation.
                                            </Text>
                                        </Box>
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>

                            {/* Video URL section */}
                            <Accordion.Item value="video">
                                <Accordion.Control>
                                    <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                                        Video Link
                                    </Text>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <TextInput
                                        placeholder="YouTube or Cloudinary video URL (optional)"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.currentTarget.value)}
                                        leftSection={<IconVideo size={14} />}
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>

                            {/* Links section */}
                            <Accordion.Item value="links">
                                <div className={styles.diagramAccordionRow}>
                                    <Accordion.Control className={styles.diagramAccordionControl}>
                                        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                                            Links
                                        </Text>
                                    </Accordion.Control>
                                    <Group gap="xs" className={styles.diagramAccordionActions}>
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
                                </div>
                                <Accordion.Panel>
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
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>

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

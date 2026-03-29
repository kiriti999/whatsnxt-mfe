"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
    ActionIcon,
    Stack,
    TextInput,
    Button,
    Group,
    Select,
    Text,
    Box,
    Flex,
    Container,
    Paper,
    Title,
    ThemeIcon,
    Checkbox,
    Tabs,
    Divider,
    Switch,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconServer2, IconSparkles, IconHistory, IconCode, IconEye, IconCrown } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LexicalEditor } from "../StructuredTutorial/Editor/LexicalEditor";
import { AISuggestionButton } from "../Common/AISuggestionButton";
import { ApiDesignEditor } from "./ApiDesignEditor";
import { SystemDesignAPI } from "../../apis/v1/systemDesign";
import type {
    SystemDesignSection,
    SystemDesignDiagram,
} from "../../apis/v1/systemDesign";
import { MermaidDiagram } from "./MermaidDiagram";
import classes from "./SystemDesignForm.module.css";

const CATEGORIES = [
    "OOD (Abstract Problem)",
    "OOD (Realworld Application)",
    "Basic System Component",
    "Distributed Architecture",
    "Data Processing & Analytics",
    "Social Media",
    "Scheduling Service",
    "Transaction Service",
    "Proximity / Trie",
    "Messaging System",
    "Collaborative System",
    "Machine Learning",
    "Security System",
    "Cloud Infrastructure",
    "Miscellaneous",
];

const GENERAL_SECTIONS = [
    { key: "functional-requirements", title: "Functional Requirements", isRequired: true },
    { key: "non-functional-requirements", title: "Non-Functional Requirements", isRequired: true },
    { key: "high-level-architecture", title: "High Level Architecture", isRequired: false },
    { key: "traffic-estimation", title: "Traffic Estimation and Data Calculation", isRequired: false },
    { key: "detailed-components", title: "Detailed Components Design", isRequired: false },
    { key: "trade-off-discussion", title: "Trade-off Discussion", isRequired: false },
    { key: "entity-relationships", title: "Entity Relationships and Use Cases Establishment", isRequired: false },
    { key: "api-design", title: "API Design", isRequired: false },
    { key: "request-flows", title: "Request Flows Outline", isRequired: false },
    { key: "scalability", title: "Scalability and Flexibility Consideration", isRequired: false },
    { key: "tradeoffs", title: "Trade-offs Discussion", isRequired: false },
    { key: "failure-scenarios", title: "Failure Scenarios Analysis", isRequired: false },
];

const ML_SECTIONS = [
    { key: "model-selection", title: "Model / Algorithm Selection", isRequired: false },
    { key: "evaluation-metrics", title: "Evaluation Metrics", isRequired: false },
    { key: "data-pipeline", title: "Data Pipeline", isRequired: false },
    { key: "model-training", title: "Model Training", isRequired: false },
    { key: "model-deployment", title: "Model Deployment and Serving", isRequired: false },
];

const DIAGRAM_TABS = [
    { key: "High Level Architecture", title: "High Level Architecture" },
    { key: "Request Flow Sequence", title: "Request Flow Sequence" },
    { key: "API Design", title: "API Design" },
    { key: "Database Design", title: "Database Design" },
];



export function SystemDesignForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");
    const isViewMode = searchParams.get("mode") === "view";

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<string[]>(
        GENERAL_SECTIONS.filter((s) => s.isRequired).map((s) => s.key),
    );
    const [sectionContents, setSectionContents] = useState<Record<string, string>>({});
    const [diagramContents, setDiagramContents] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isContentCreated, setIsContentCreated] = useState(false);
    const [activeDiagramTab, setActiveDiagramTab] = useState<string | null>(DIAGRAM_TABS[0].key);
    const [diagramViewMode, setDiagramViewMode] = useState<Record<string, "preview" | "code">>({});
    const [practiceModes, setPracticeModes] = useState<Record<string, string>>(
        () => Object.fromEntries(DIAGRAM_TABS.map((d) => [d.key, "starter-blocks"])),
    );

    React.useEffect(() => {
        if (!editId) return;
        loadCourse(editId);
    }, [editId]);

    const loadCourse = useCallback(async (id: string) => {
        try {
            const response = await SystemDesignAPI.getById(id);
            const course = response.data;
            setTitle(course.title);
            setCategory(course.category);
            setIsPremium(course.isPremium ?? false);
            setSelectedKeys(course.sections.map((s) => s.key));

            const contents: Record<string, string> = {};
            for (const section of course.sections) {
                contents[section.key] = section.content;
            }
            setSectionContents(contents);

            const diagrams: Record<string, string> = {};
            const modes: Record<string, string> = {};
            for (const diagram of course.diagrams) {
                diagrams[diagram.key] = diagram.content;
                modes[diagram.key] = diagram.practiceMode || "starter-blocks";
            }
            setDiagramContents(diagrams);
            setPracticeModes((prev) => ({ ...prev, ...modes }));
            setIsContentCreated(true);
        } catch {
            notifications.show({
                position: "bottom-right",
                color: "red",
                title: "Error",
                message: "Failed to load course for editing",
            });
        }
    }, []);

    const allSections = useMemo(
        () => [...GENERAL_SECTIONS, ...ML_SECTIONS],
        [],
    );

    const selectedSections = useMemo(
        () =>
            allSections
                .filter((s) => selectedKeys.includes(s.key))
                .map((s, idx) => ({ ...s, sortOrder: idx })),
        [selectedKeys, allSections],
    );

    const handleCheckboxChange = useCallback(
        (key: string) => {
            const section = allSections.find((s) => s.key === key);
            if (section?.isRequired) return;

            setSelectedKeys((prev) =>
                prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
            );
        },
        [allSections],
    );

    const handleCreateContent = useCallback(() => {
        if (!title.trim()) {
            notifications.show({
                position: "bottom-right",
                color: "orange",
                title: "Title Required",
                message: "Please enter a title before creating content",
            });
            return;
        }
        setIsContentCreated(true);
    }, [title]);

    const updateSectionContent = useCallback((key: string, content: string) => {
        setSectionContents((prev) => ({ ...prev, [key]: content }));
    }, []);

    const updateDiagramContent = useCallback((key: string, content: string) => {
        setDiagramContents((prev) => ({ ...prev, [key]: content }));
    }, []);

    const buildSectionsPayload = useCallback((): SystemDesignSection[] => {
        return selectedSections.map((s) => ({
            key: s.key,
            title: s.title,
            content: sectionContents[s.key] || "",
            isRequired: s.isRequired,
            sortOrder: s.sortOrder,
        }));
    }, [selectedSections, sectionContents]);

    const buildDiagramsPayload = useCallback((): SystemDesignDiagram[] => {
        return DIAGRAM_TABS.map((d, idx) => ({
            key: d.key,
            title: d.title,
            content: diagramContents[d.key] || "",
            sortOrder: idx,
            practiceMode: (practiceModes[d.key] || "starter-blocks") as "starter-blocks" | "blank-canvas",
        }));
    }, [diagramContents, practiceModes]);

    const handleSave = useCallback(async () => {
        if (!title.trim() || !category) {
            notifications.show({
                position: "bottom-right",
                color: "orange",
                title: "Missing Fields",
                message: "Please fill in title and category",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                category,
                sections: buildSectionsPayload(),
                diagrams: buildDiagramsPayload(),
                isPremium,
            };

            if (editId) {
                await SystemDesignAPI.update(editId, payload);
                notifications.show({
                    position: "bottom-right",
                    color: "green",
                    title: "Updated",
                    message: "System design course updated successfully",
                });
            } else {
                await SystemDesignAPI.create(payload);
                notifications.show({
                    position: "bottom-right",
                    color: "green",
                    title: "Saved",
                    message: "System design course created successfully",
                });
            }

            router.push("/history/table");
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as Error)?.message ||
                "Failed to save";
            notifications.show({
                position: "bottom-right",
                color: "red",
                title: "Error",
                message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [title, category, editId, buildSectionsPayload, buildDiagramsPayload, isPremium, router]);

    const categoryOptions = useMemo(
        () => CATEGORIES.map((c) => ({ value: c, label: c })),
        [],
    );

    const buildSectionPrompt = useCallback(
        (sectionTitle: string) => {
            return () => {
                if (!title.trim()) return "";
                const sectionPrompts: Record<string, string> = {
                    "API Design": `For the system design topic "${title}", generate a complete API specification as a JSON object. Respond with ONLY valid JSON, no markdown fences, no explanation.\n\nUse this exact structure:\n{\n  "title": "API name",\n  "basePath": "/api",\n  "endpoints": [\n    {\n      "method": "POST",\n      "path": "/api/example",\n      "summary": "Short summary",\n      "description": "Detailed description of what this endpoint does",\n      "requestBody": [{ "name": "field", "type": "string", "required": true, "description": "Field desc" }],\n      "responseBody": [{ "name": "id", "type": "string", "required": true, "description": "Field desc" }],\n      "responseStatus": 200\n    }\n  ]\n}\n\nInclude all CRUD + domain-specific endpoints. Use types: string, number, integer, boolean, object, array, timestamp. Mark required/optional properly.`,
                };
                return sectionPrompts[sectionTitle]
                    || `For the system design topic "${title}", generate detailed content for the "${sectionTitle}" section. Provide comprehensive, well-structured content suitable for a system design course. Use bullet points and clear explanations.`;
            };
        },
        [title],
    );

    const buildCategoryPrompt = useCallback(() => {
        if (!title.trim()) return "";
        return `Given the system design topic "${title}", pick the single most appropriate category from EXACTLY these options:\n${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nRespond with ONLY the exact category name, nothing else.`;
    }, [title]);

    const handleCategorySuggestion = useCallback(
        (suggestion: string) => {
            const trimmed = suggestion.trim().replace(/^["']|["']$/g, "");
            const match = CATEGORIES.find(
                (c) => c.toLowerCase() === trimmed.toLowerCase(),
            );
            if (match) {
                setCategory(match);
            } else {
                const partial = CATEGORIES.find((c) =>
                    trimmed.toLowerCase().includes(c.toLowerCase()),
                );
                setCategory(partial || trimmed);
            }
        },
        [],
    );

    const buildDiagramPrompt = useCallback(
        (diagramType: string) => {
            return () => {
                if (!title.trim()) return "";
                const base = `You MUST respond with ONLY valid Mermaid diagram syntax. No markdown code fences, no explanation text before or after. Just the raw Mermaid code starting with the diagram type keyword.\n\n`;
                const promptMap: Record<string, string> = {
                    "High Level Architecture": `${base}Generate a Mermaid flowchart (graph TD) for the high-level architecture of "${title}". Show main components (Client, Load Balancer, API Gateway, Services, Databases, Cache, Message Queue, etc.) as nodes. Connect them with labeled arrows showing data flow. Use subgraph blocks to group related components (e.g., "Backend Services", "Data Layer"). Keep it clear and readable.`,
                    "Request Flow Sequence": `${base}Generate a Mermaid sequence diagram (sequenceDiagram) for "${title}". Show participants: Client, API Gateway, Service, Database, Cache, etc. Show numbered request/response flows with descriptive labels. Use activate/deactivate for processing spans. Use alt/opt blocks for conditional flows.`,
                    "API Design": `${base}Generate a Mermaid class diagram (classDiagram) for the API design of "${title}". Show API resource classes with methods formatted as "METHOD /path : ResponseType". Show request/response DTO classes with typed fields. Connect resources to DTOs with associations. Use stereotypes like <<Resource>> and <<DTO>>.`,
                    "Database Design": `${base}Generate a Mermaid ER diagram (erDiagram) for "${title}". Show entity tables with their columns and types using Mermaid ER syntax (string, int, boolean, datetime, etc.). Show relationships between tables using proper cardinality notation (||--o{, }|--|{, etc.). Add relationship labels.`,
                };
                return promptMap[diagramType] || "";
            };
        },
        [title],
    );

    const handleDiagramSuggestion = useCallback(
        (key: string, text: string) => {
            updateDiagramContent(key, text);
        },
        [updateDiagramContent],
    );

    const getDiagramViewMode = useCallback(
        (key: string): "preview" | "code" => diagramViewMode[key] || "preview",
        [diagramViewMode],
    );

    const toggleDiagramViewMode = useCallback((key: string) => {
        setDiagramViewMode((prev) => ({
            ...prev,
            [key]: prev[key] === "code" ? "preview" : "code",
        }));
    }, []);

    return (
        <Container size="xl" py={{ base: "xl", sm: "3rem" }}>
            <Stack gap="xl" align="center">
                {/* Header */}
                <Stack gap="xs" align="center" className={classes.header}>
                    <Group justify="center" gap="xs">
                        <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: "blue", to: "cyan", deg: 135 }}
                        >
                            <IconServer2 size={24} />
                        </ThemeIcon>
                        <Title order={1} size="h2" className={classes.headerTitle}>
                            System Design Course
                        </Title>
                    </Group>
                    <Text size="lg" className={classes.headerDescription}>
                        {isViewMode
                            ? "View system design course"
                            : "Create structured system design courses with AI-assisted content"}
                    </Text>
                    <Button
                        component={Link}
                        href="/history/table"
                        variant="subtle"
                        color="blue"
                        leftSection={<IconHistory size={16} />}
                        size="sm"
                    >
                        View History
                    </Button>
                </Stack>

                {/* Form */}
                <Paper shadow="sm" p="xl" radius="md" w="100%" className={classes.formPaper}>
                    <Stack gap="md">
                        {/* Title */}
                        <TextInput
                            label={
                                <Text className={classes.labelText}>
                                    Title{!isViewMode && (
                                        <Text component="span" className={classes.requiredStar}>
                                            {" "}*
                                        </Text>
                                    )}
                                </Text>
                            }
                            placeholder="e.g., Design a URL Shortener"
                            maxLength={200}
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                            readOnly={isViewMode}
                        />

                        {/* Category */}
                        <Flex align="flex-end" gap="xs">
                            <Select
                                label={
                                    <Text className={classes.labelText}>
                                        Category{!isViewMode && (
                                            <Text component="span" className={classes.requiredStar}>
                                                {" "}*
                                            </Text>
                                        )}
                                    </Text>
                                }
                                placeholder="Select a category"
                                data={categoryOptions}
                                value={category}
                                onChange={setCategory}
                                searchable
                                clearable
                                readOnly={isViewMode}
                                style={{ flex: 1 }}
                            />
                            {!isViewMode && (
                                <AISuggestionButton
                                    prompt={buildCategoryPrompt}
                                    onSuggestion={handleCategorySuggestion}
                                    label="Auto-select category"
                                    onEmptyPrompt={() =>
                                        notifications.show({
                                            position: "bottom-right",
                                            color: "orange",
                                            title: "Title Required",
                                            message: "Enter a title first so AI can pick the category",
                                        })
                                    }
                                />
                            )}
                        </Flex>

                        {/* Premium Toggle */}
                        <Switch
                            label={
                                <Group gap={6}>
                                    <IconCrown size={16} color="var(--mantine-color-yellow-6)" />
                                    <Text size="sm" fw={500}>Premium Course</Text>
                                </Group>
                            }
                            description="Students must purchase or subscribe to practice this course"
                            checked={isPremium}
                            onChange={(e) => setIsPremium(e.currentTarget.checked)}
                            disabled={isViewMode}
                        />

                        {/* Topic Section Checkboxes — hidden in view mode */}
                        {!isViewMode && (
                            <>
                                <Box className={classes.checkboxGroup}>
                                    <Text className={classes.checkboxGroupTitle}>Topic Sections</Text>
                                    <Stack gap="xs">
                                        {GENERAL_SECTIONS.map((section) => (
                                            <Checkbox
                                                key={section.key}
                                                label={section.title}
                                                checked={selectedKeys.includes(section.key)}
                                                onChange={() => handleCheckboxChange(section.key)}
                                                disabled={section.isRequired}
                                            />
                                        ))}
                                    </Stack>

                                    <Divider my="sm" label="ML Related Topics" labelPosition="left" />
                                    <Stack gap="xs">
                                        {ML_SECTIONS.map((section) => (
                                            <Checkbox
                                                key={section.key}
                                                label={section.title}
                                                checked={selectedKeys.includes(section.key)}
                                                onChange={() => handleCheckboxChange(section.key)}
                                            />
                                        ))}
                                    </Stack>
                                </Box>

                                {/* Create Content Button */}
                                {!isContentCreated && (
                                    <Group justify="flex-end">
                                        <Button
                                            onClick={handleCreateContent}
                                            leftSection={<IconSparkles size={18} />}
                                            variant="gradient"
                                            gradient={{ from: "blue", to: "cyan", deg: 135 }}
                                        >
                                            Create Content
                                        </Button>
                                    </Group>
                                )}
                            </>
                        )}

                        {/* Section Editors — shown after "Create Content" */}
                        {isContentCreated && (
                            <>
                                <Divider label="Content Sections" labelPosition="center" />
                                {selectedSections.map((section) => (
                                    <Box key={section.key} className={classes.sectionContent}>
                                        <Flex className={classes.sectionLabel}>
                                            <Text size="sm" fw={500} className={classes.sectionTitle}>
                                                {section.title}
                                                {!isViewMode && section.isRequired && (
                                                    <Text component="span" className={classes.requiredStar}>
                                                        {" "}
                                                        *
                                                    </Text>
                                                )}
                                            </Text>
                                            {!isViewMode && (
                                                <AISuggestionButton
                                                    prompt={buildSectionPrompt(section.title)}
                                                    onSuggestion={(text) =>
                                                        updateSectionContent(section.key, text)
                                                    }
                                                    label={`Generate ${section.title} with AI`}
                                                    onEmptyPrompt={() => {
                                                        notifications.show({
                                                            position: "bottom-right",
                                                            color: "orange",
                                                            title: "Title Required",
                                                            message:
                                                                "Please enter a title first to generate content",
                                                        });
                                                    }}
                                                />
                                            )}
                                        </Flex>
                                        {section.key === "api-design" ? (
                                            <ApiDesignEditor
                                                value={sectionContents[section.key] || ""}
                                                onChange={(val: string) =>
                                                    updateSectionContent(section.key, val)
                                                }
                                                readOnly={isViewMode}
                                            />
                                        ) : (
                                            <LexicalEditor
                                                value={sectionContents[section.key] || ""}
                                                onChange={(val: string) =>
                                                    updateSectionContent(section.key, val)
                                                }
                                                placeholder={`Enter ${section.title} content...`}
                                                readOnly={isViewMode}
                                            />
                                        )}
                                    </Box>
                                ))}

                                {/* Diagram Tabs */}
                                <Divider label="System Design Diagrams" labelPosition="center" />
                                <Tabs
                                    value={activeDiagramTab}
                                    onChange={setActiveDiagramTab}
                                    className={classes.diagramTabs}
                                >
                                    <Tabs.List>
                                        {DIAGRAM_TABS.map((tab) => (
                                            <Tabs.Tab key={tab.key} value={tab.key}>
                                                {tab.title}
                                            </Tabs.Tab>
                                        ))}
                                    </Tabs.List>

                                    {DIAGRAM_TABS.map((tab) => (
                                        <Tabs.Panel
                                            key={tab.key}
                                            value={tab.key}
                                            className={classes.diagramPanel}
                                        >
                                            <Flex className={classes.sectionLabel}>
                                                <Text size="sm" fw={500} className={classes.sectionTitle}>
                                                    {tab.title}
                                                </Text>
                                                <Group gap={4}>
                                                    {!isViewMode && (
                                                        <AISuggestionButton
                                                            prompt={buildDiagramPrompt(tab.key)}
                                                            onSuggestion={(text) =>
                                                                handleDiagramSuggestion(tab.key, text)
                                                            }
                                                            label={`Generate ${tab.title} with AI`}
                                                            onEmptyPrompt={() => {
                                                                notifications.show({
                                                                    position: "bottom-right",
                                                                    color: "orange",
                                                                    title: "Title Required",
                                                                    message:
                                                                        "Please enter a title first to generate diagram",
                                                                });
                                                            }}
                                                        />
                                                    )}
                                                    {!isViewMode && diagramContents[tab.key] && (
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size="sm"
                                                            onClick={() => toggleDiagramViewMode(tab.key)}
                                                            title={
                                                                getDiagramViewMode(tab.key) === "preview"
                                                                    ? "Edit Mermaid code"
                                                                    : "Preview diagram"
                                                            }
                                                        >
                                                            {getDiagramViewMode(tab.key) === "preview" ? (
                                                                <IconCode size={16} />
                                                            ) : (
                                                                <IconEye size={16} />
                                                            )}
                                                        </ActionIcon>
                                                    )}
                                                </Group>
                                            </Flex>
                                            {!isViewMode && (
                                                <Flex align="center" gap="xs" mb="xs">
                                                    <Text size="xs" c="dimmed">Practice Mode:</Text>
                                                    <Select
                                                        size="xs"
                                                        w={200}
                                                        value={practiceModes[tab.key] || "starter-blocks"}
                                                        onChange={(val) =>
                                                            setPracticeModes((prev) => ({ ...prev, [tab.key]: val || "starter-blocks" }))
                                                        }
                                                        data={[
                                                            { label: "Starter Blocks", value: "starter-blocks" },
                                                            { label: "Blank Canvas", value: "blank-canvas" },
                                                            { label: "Scrambled Diagram", value: "scrambled-diagram" },
                                                            { label: "Progressive (Easy)", value: "progressive-easy" },
                                                            { label: "Progressive (Hard)", value: "progressive-hard" },
                                                        ]}
                                                        allowDeselect={false}
                                                    />
                                                </Flex>
                                            )}
                                            {isViewMode && (
                                                <Text size="xs" c="dimmed" mb="xs">
                                                    Practice Mode: {practiceModes[tab.key] || "starter-blocks"}
                                                </Text>
                                            )}
                                            {(isViewMode || getDiagramViewMode(tab.key) === "preview") &&
                                                diagramContents[tab.key] ? (
                                                <MermaidDiagram code={diagramContents[tab.key]} />
                                            ) : (
                                                <textarea
                                                    className={classes.diagramCodeEditor}
                                                    value={diagramContents[tab.key] || ""}
                                                    onChange={(e) =>
                                                        updateDiagramContent(tab.key, e.target.value)
                                                    }
                                                    placeholder={`Mermaid code for ${tab.title} will appear here after AI generation...`}
                                                    rows={12}
                                                    readOnly={isViewMode}
                                                />
                                            )}
                                        </Tabs.Panel>
                                    ))}
                                </Tabs>

                                {/* Save Button — hidden in view mode */}
                                {!isViewMode && (
                                    <Group justify="flex-end" mt="md">
                                        <Button
                                            onClick={handleSave}
                                            loading={isSubmitting}
                                            leftSection={<IconSparkles size={18} />}
                                            variant="gradient"
                                            gradient={{ from: "blue", to: "cyan", deg: 135 }}
                                            size="md"
                                        >
                                            {editId ? "Update" : "Save"} System Design
                                        </Button>
                                    </Group>
                                )}
                            </>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}

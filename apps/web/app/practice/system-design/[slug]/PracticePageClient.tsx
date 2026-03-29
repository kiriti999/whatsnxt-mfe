"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Alert,
    Badge,
    Box,
    Button,
    Collapse,
    Container,
    Divider,
    Group,
    Loader,
    Paper,
    Progress,
    Stack,
    Tabs,
    Text,
    Title,
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
    IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconInfoCircle,
    IconLock,
    IconSparkles,
    IconX,
} from "@tabler/icons-react";
import { LexicalEditor } from "../../../../components/StructuredTutorial/Editor/LexicalEditor";
import { AIConfigModal } from "../../../../components/Common/AIConfigModal";
import { PremiumPaywall } from "../../../../components/Premium/PremiumPaywall";
import { useAIConfig } from "../../../../context/AIConfigContext";
import useAuth from "../../../../hooks/Authentication/useAuth";
import type {
    EvaluationResult,
    PracticeAttempt,
    SectionAttempt,
} from "../../../../apis/v1/practice";
import { PracticeAPI } from "../../../../apis/v1/practice";
import { premiumAPI } from "../../../../apis/v1/premium";
import { SystemDesignAPI } from "../../../../apis/v1/systemDesign";
import type { SystemDesignCourse } from "../../../../apis/v1/systemDesign";
import DiagramPractice from "./DiagramPractice";
import classes from "./PracticePage.module.css";

interface PendingEvaluate {
    key: string;
    content: string;
    type: "section" | "diagram";
}

interface PracticePageClientProps {
    slug: string;
}

function extractErrorMessage(error: unknown): string {
    const err = error as { response?: { data?: { message?: string; error?: string }; status?: number }; message?: string };
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.data?.error) return err.response.data.error;
    if (err?.response?.status === 429) {
        return "API rate limit exceeded. Please provide your own API key to continue.";
    }
    if (err?.response?.status === 401) {
        return "Authentication failed. Please provide a valid API key.";
    }
    return err?.message || "Failed to evaluate. Please provide your API key.";
}

function FeedbackDisplay({ result }: { result: EvaluationResult | null }) {
    const [open, setOpen] = useState(true);
    if (!result) return null;
    const feedbackClass = result.passed ? classes.feedbackPassed : classes.feedbackFailed;
    return (
        <Paper p="md" mt="sm" className={`${classes.feedbackCard} ${feedbackClass}`}>
            <UnstyledButton onClick={() => setOpen((v) => !v)} w="100%">
                <Group justify="space-between">
                    <Group gap="sm">
                        {result.passed ? (
                            <IconCheck size={20} color="var(--mantine-color-green-6)" />
                        ) : (
                            <IconX size={20} color="var(--mantine-color-orange-6)" />
                        )}
                        <Text fw={600} size="sm">
                            {result.passed ? "Passed" : "Needs Improvement"} — {result.score}%
                        </Text>
                    </Group>
                    {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                </Group>
            </UnstyledButton>
            <Collapse in={open}>
                <div
                    className={classes.feedbackContent}
                    dangerouslySetInnerHTML={{ __html: result.feedback }}
                />
            </Collapse>
        </Paper>
    );
}

function SectionPractice({
    section,
    onSave,
    onEvaluate,
    saving,
    evaluating,
    evaluationResult,
}: {
    section: SectionAttempt;
    onSave: (key: string, content: string) => void;
    onEvaluate: (key: string, content: string) => void;
    saving: boolean;
    evaluating: boolean;
    evaluationResult: EvaluationResult | null;
}) {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(section.content);

    const handleSave = useCallback(() => {
        onSave(section.key, content);
    }, [section.key, content, onSave]);

    return (
        <Paper className={classes.sectionCard} radius="md">
            <UnstyledButton
                onClick={() => setOpen((prev) => !prev)}
                className={classes.sectionHeader}
                w="100%"
            >
                <Group justify="space-between">
                    <Group gap="sm">
                        <Text size="sm" fw={600} className={classes.sectionTitle}>
                            {section.title}
                        </Text>
                        {section.evaluated && (
                            <Badge
                                size="sm"
                                variant="light"
                                color={section.passed ? "green" : "orange"}
                            >
                                {section.score}%
                            </Badge>
                        )}
                    </Group>
                    {open ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                </Group>
            </UnstyledButton>
            <Collapse in={open}>
                <Box pt="sm">
                    <Text size="xs" c="dimmed" mb="xs">
                        Write your answer for this section. Click Evaluate to get feedback.
                    </Text>
                    <LexicalEditor
                        value={content}
                        onChange={setContent}
                    />
                    <Group mt="sm" justify="flex-end">
                        <Button
                            size="xs"
                            variant="outline"
                            onClick={handleSave}
                            loading={saving}
                        >
                            Save
                        </Button>
                        <Button
                            size="xs"
                            leftSection={<IconSparkles size={14} />}
                            onClick={() => onEvaluate(section.key, content)}
                            loading={evaluating}
                            disabled={!content?.trim()}
                        >
                            Evaluate
                        </Button>
                    </Group>
                    {evaluationResult && <FeedbackDisplay result={evaluationResult} />}
                    {section.evaluated && !evaluationResult && (
                        <FeedbackDisplay
                            result={{
                                score: section.score ?? 0,
                                feedback: section.feedback,
                                passed: section.passed,
                            }}
                        />
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}

const PracticePageClient = ({ slug }: PracticePageClientProps) => {
    const { user, isAuthenticated } = useAuth();
    const aiConfig = useAIConfig();
    const [course, setCourse] = useState<SystemDesignCourse | null>(null);
    const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [evaluatingKey, setEvaluatingKey] = useState<string | null>(null);
    const [evaluationResults, setEvaluationResults] = useState<Record<string, EvaluationResult>>({});
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState("");
    const [premiumLocked, setPremiumLocked] = useState(false);
    const pendingEvaluateRef = useRef<PendingEvaluate | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        loadData();
    }, [isAuthenticated, slug]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const courseRes = await SystemDesignAPI.getBySlug(slug);
            setCourse(courseRes.data);

            if (courseRes.data.isPremium) {
                const statusRes = await premiumAPI.getStatus();
                const hasAccess = statusRes.data.isActive;
                if (!hasAccess) {
                    setPremiumLocked(true);
                    return;
                }
            }

            const attemptRes = await PracticeAPI.getOrCreate(courseRes.data._id);
            setAttempt(attemptRes.data);
        } catch {
            setCourse(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    const handleSaveSection = useCallback(
        async (sectionKey: string, content: string) => {
            if (!attempt || !course) return;
            setSavingKey(sectionKey);
            try {
                const res = await PracticeAPI.saveSection(course._id, sectionKey, content);
                setAttempt(res.data);
            } finally {
                setSavingKey(null);
            }
        },
        [attempt, course],
    );

    const handleEvaluateSection = useCallback(
        async (sectionKey: string, content: string) => {
            if (!course) return;
            setEvaluatingKey(sectionKey);
            try {
                await PracticeAPI.saveSection(course._id, sectionKey, content);
                const res = await PracticeAPI.evaluateSection(
                    course._id, sectionKey, aiConfig.selectedAI, aiConfig.selectedModel,
                );
                setEvaluationResults((prev) => ({ ...prev, [sectionKey]: res.data }));
                const attemptRes = await PracticeAPI.getOrCreate(course._id);
                setAttempt(attemptRes.data);
            } catch (error: unknown) {
                const errMsg = extractErrorMessage(error);
                setApiKeyError(errMsg);
                pendingEvaluateRef.current = { key: sectionKey, content, type: "section" };
                openModal();
            } finally {
                setEvaluatingKey(null);
            }
        },
        [course, aiConfig.selectedAI, aiConfig.selectedModel, openModal],
    );

    const handleSaveDiagram = useCallback(
        async (diagramKey: string, content: string) => {
            if (!course) return;
            setSavingKey(diagramKey);
            try {
                const res = await PracticeAPI.saveDiagram(course._id, diagramKey, content);
                setAttempt(res.data);
            } finally {
                setSavingKey(null);
            }
        },
        [course],
    );

    const handleEvaluateDiagram = useCallback(
        async (diagramKey: string, content: string) => {
            if (!course) return;
            setEvaluatingKey(diagramKey);
            try {
                await PracticeAPI.saveDiagram(course._id, diagramKey, content);
                const res = await PracticeAPI.evaluateDiagram(
                    course._id, diagramKey, aiConfig.selectedAI, aiConfig.selectedModel,
                );
                setEvaluationResults((prev) => ({ ...prev, [diagramKey]: res.data }));
                const attemptRes = await PracticeAPI.getOrCreate(course._id);
                setAttempt(attemptRes.data);
            } catch (error: unknown) {
                const errMsg = extractErrorMessage(error);
                setApiKeyError(errMsg);
                pendingEvaluateRef.current = { key: diagramKey, content, type: "diagram" };
                openModal();
            } finally {
                setEvaluatingKey(null);
            }
        },
        [course, aiConfig.selectedAI, aiConfig.selectedModel, openModal],
    );

    const retryPendingEvaluate = useCallback(() => {
        setApiKeyError("");
        closeModal();
        const pending = pendingEvaluateRef.current;
        if (!pending) return;
        pendingEvaluateRef.current = null;
        if (pending.type === "section") {
            handleEvaluateSection(pending.key, pending.content);
        } else {
            handleEvaluateDiagram(pending.key, pending.content);
        }
    }, [closeModal, handleEvaluateSection, handleEvaluateDiagram]);

    if (!isAuthenticated) {
        return (
            <Container size="sm" py="xl">
                <Paper radius="md" p="xl" className={classes.paper}>
                    <Stack align="center" gap="md" className={classes.loginMessage}>
                        <IconLock size={48} color="var(--mantine-color-gray-5)" />
                        <Title order={3}>Login Required</Title>
                        <Text c="dimmed">Please log in to practice system design courses.</Text>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container size="xl" py="xl">
                <Group justify="center" py="xl">
                    <Loader size="lg" />
                </Group>
            </Container>
        );
    }

    if (premiumLocked && course) {
        return (
            <Container size="sm" py="xl">
                <PremiumPaywall
                    tutorialId={course._id}
                    tutorialTitle={course.title}
                    contentType="course"
                    onAccessGranted={() => {
                        setPremiumLocked(false);
                        loadData();
                    }}
                />
            </Container>
        );
    }

    if (!course || !attempt) {
        return (
            <Container size="sm" py="xl">
                <Alert icon={<IconInfoCircle size={16} />} color="red">
                    Course not found or could not start practice session.
                </Alert>
            </Container>
        );
    }

    const totalItems = attempt.sections.length + attempt.diagrams.length;
    const evaluatedItems = [
        ...attempt.sections.filter((s) => s.evaluated),
        ...attempt.diagrams.filter((d) => d.evaluated),
    ].length;
    const progressPercent = totalItems > 0 ? Math.round((evaluatedItems / totalItems) * 100) : 0;

    return (
        <Container size="xl" py="xl" className={classes.wrapper}>
            <Paper radius="md" p="xl" className={classes.paper}>
                <Stack gap="xs" mb="xl" align="center">
                    <Title order={2} ta="center">
                        Practice: {course.title}
                    </Title>
                    <Group gap="sm">
                        <Badge variant="light" color="blue">
                            {course.category}
                        </Badge>
                        {attempt.overallScore !== null && (
                            <Badge
                                variant="filled"
                                color={attempt.overallScore >= 70 ? "green" : "orange"}
                            >
                                Overall: {attempt.overallScore}%
                            </Badge>
                        )}
                    </Group>
                    <Box w="100%" maw={400}>
                        <Text size="xs" c="dimmed" ta="center" mb={4}>
                            {evaluatedItems}/{totalItems} evaluated
                        </Text>
                        <Progress value={progressPercent} size="sm" radius="xl" />
                    </Box>
                </Stack>

                <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
                    Write your answers for each section. Click &quot;Evaluate&quot; to get feedback
                    with a score. 70% is the passing score.
                </Alert>

                {attempt.sections.length > 0 && (
                    <>
                        <Divider label="Content Sections" labelPosition="center" mb="md" />
                        <Stack gap="sm">
                            {attempt.sections.map((section) => (
                                <SectionPractice
                                    key={section.key}
                                    section={section}
                                    onSave={handleSaveSection}
                                    onEvaluate={handleEvaluateSection}
                                    saving={savingKey === section.key}
                                    evaluating={evaluatingKey === section.key}
                                    evaluationResult={evaluationResults[section.key] ?? null}
                                />
                            ))}
                        </Stack>
                    </>
                )}

                {attempt.diagrams.length > 0 && (
                    <>
                        <Divider label="Diagram Practice" labelPosition="center" my="md" />
                        <Tabs defaultValue={attempt.diagrams[0]?.key}>
                            <Tabs.List>
                                {attempt.diagrams.map((d) => (
                                    <Tabs.Tab key={d.key} value={d.key}>
                                        <Group gap={6}>
                                            {d.title}
                                            {d.evaluated && (
                                                <Badge
                                                    size="xs"
                                                    variant="light"
                                                    color={d.passed ? "green" : "orange"}
                                                >
                                                    {d.score}%
                                                </Badge>
                                            )}
                                        </Group>
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                            {attempt.diagrams.map((d) => (
                                <Tabs.Panel key={d.key} value={d.key} pt="md">
                                    <DiagramPractice
                                        diagram={d}
                                        onSave={handleSaveDiagram}
                                        onEvaluate={handleEvaluateDiagram}
                                        saving={savingKey === d.key}
                                        evaluating={evaluatingKey === d.key}
                                        evaluationResult={evaluationResults[d.key] ?? null}
                                    />
                                </Tabs.Panel>
                            ))}
                        </Tabs>
                    </>
                )}
            </Paper>
            <AIConfigModal
                opened={modalOpened}
                onClose={closeModal}
                selectedAI={aiConfig.selectedAI}
                selectedModel={aiConfig.selectedModel}
                onProviderChange={aiConfig.setSelectedAI}
                onModelChange={aiConfig.setSelectedModel}
                onGenerate={retryPendingEvaluate}
                onSaveKeyAndGenerate={retryPendingEvaluate}
                onNotification={(n) => {
                    notifications.show({
                        position: "bottom-right",
                        color: n.color,
                        message: n.message,
                    });
                }}
                error={apiKeyError}
            />
        </Container>
    );
};

export default PracticePageClient;

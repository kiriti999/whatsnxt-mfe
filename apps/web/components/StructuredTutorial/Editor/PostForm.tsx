'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Flex,
    FileInput,
    Paper,
    SegmentedControl,
    Stack,
    Switch,
    Text,
    TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLayoutGrid, IconPhoto, IconSparkles, IconWand } from '@tabler/icons-react';
import { LexicalEditor } from './LexicalEditor';
import { AISuggestionButton } from '../../Common/AISuggestionButton';
import { DiagramTypePicker } from '../../Visualizer/DiagramTypePicker';
import type { DiagramType } from '../../Visualizer/types';
import { wrapSvgsForLexical } from '../../../utils/wrapSvgsForLexical';
import styles from './PostForm.module.css';

interface PostFormData {
    title: string;
    description: string;
    includeDiagram?: boolean;
    diagramMode?: string | null;
    diagramType?: string | null;
}

/** Passed from the editor so AI post generation stays aligned with the course outline and taxonomy. */
export interface PostFormAiContext {
    tutorialTitle: string;
    /** CMS category path, e.g. "System Design › Foundations" */
    categoryPath: string;
    /** Sidebar module / section title for this post */
    sectionTitle: string;
}

interface PostFormProps {
    initialData?: Partial<PostFormData>;
    onSave: (data: PostFormData) => Promise<void>;
    onChange?: (data: Partial<PostFormData>) => void; // Real-time updates
    onCancel?: () => void;
    isSaving?: boolean;
    isNew?: boolean;
    aiContext?: PostFormAiContext;
}

function buildPostContentAiQuestion(postTitle: string, ctx?: PostFormAiContext): string {
    const title = postTitle.trim();
    if (!title) return "";

    const courseTitle = ctx?.tutorialTitle?.trim() || "Untitled course";
    const category =
        ctx?.categoryPath?.trim() ||
        "Not specified — infer reasonable system-design depth only from the titles below.";
    const moduleTitle = ctx?.sectionTitle?.trim() || "Not specified";

    return [
        "Generate rich instructional content for one lesson inside a structured SYSTEM DESIGN course.",
        "",
        "Use ALL of the following context so the lesson fits the course, module, and post intent:",
        `- Course title: ${courseTitle}`,
        `- Category / taxonomy: ${category}`,
        `- Module (section) title: ${moduleTitle}`,
        `- Post title: ${title}`,
        "",
        "Write the post body as HTML suitable for a rich text editor (headings h2/h3, lists, short paragraphs, emphasis where helpful).",
        "Stay aligned with system design interview preparation (requirements, scale, APIs, trade-offs, failure modes when relevant).",
        "Do not prepend a redundant title line if the post title already captures it; focus on substantive lesson content.",
    ].join("\n");
}

const MAX_AI_CONTEXT_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_AI_CONTEXT_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

function normalizeContextImageMime(mime: string): string {
    return mime.trim().toLowerCase().replace('image/jpg', 'image/jpeg');
}

function pickImageFileFromClipboardEvent(e: React.ClipboardEvent): File | null {
    const dt = e.clipboardData;
    if (!dt) return null;
    const items = dt.items;
    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind !== 'file') continue;
        const type = it.type.toLowerCase();
        if (!type.startsWith('image/')) continue;
        const file = it.getAsFile();
        if (file) return file;
    }
    const files = dt.files;
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.type.startsWith('image/')) return f;
    }
    return null;
}

function notifyAiContextImageRejected(reason: 'size' | 'type'): void {
    if (reason === 'size') {
        notifications.show({
            title: 'Image too large',
            message: 'Use an image under 4 MB for AI context.',
            color: 'orange',
            position: 'bottom-right',
        });
        return;
    }
    notifications.show({
        title: 'Unsupported image type',
        message: 'Use JPEG, PNG, WebP, or GIF.',
        color: 'orange',
        position: 'bottom-right',
    });
}

function commitAiContextImageFile(file: File | null, onAccept: (f: File) => void): void {
    if (!file) return;
    const mime = normalizeContextImageMime(file.type || '');
    if (!ALLOWED_AI_CONTEXT_MIME.has(mime)) {
        notifyAiContextImageRejected('type');
        return;
    }
    if (file.size > MAX_AI_CONTEXT_IMAGE_BYTES) {
        notifyAiContextImageRejected('size');
        return;
    }
    onAccept(file);
}

function readFileAsContextImage(file: File): Promise<{ mimeType: string; dataBase64: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            const m = /^data:([^;,]+);base64,([\s\S]+)$/.exec(dataUrl.trim());
            if (!m) {
                reject(new Error('Could not read image'));
                return;
            }
            const mimeType = m[1].trim().toLowerCase().replace('image/jpg', 'image/jpeg');
            resolve({ mimeType, dataBase64: m[2] });
        };
        reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
        reader.readAsDataURL(file);
    });
}

export const PostForm: React.FC<PostFormProps> = ({
    initialData,
    onSave,
    onChange,
    onCancel,
    isSaving,
    isNew = false,
    aiContext,
}) => {
    const { register, handleSubmit, reset, setValue, watch, formState: { isDirty } } = useForm<PostFormData>({
        defaultValues: {
            title: '',
            description: '',
            ...initialData,
        },
    });

    const formValues = watch();
    const description = watch('description');
    const [includeDiagram, setIncludeDiagram] = React.useState(
        initialData?.includeDiagram ?? false,
    );
    const [diagramMode, setDiagramMode] = React.useState<'auto' | 'manual'>(
        (initialData?.diagramMode as 'auto' | 'manual') || 'auto',
    );
    const [selectedDiagramType, setSelectedDiagramType] = React.useState<DiagramType | null>(
        (initialData?.diagramType as DiagramType) || null,
    );
    const [aiContextImageFile, setAiContextImageFile] = React.useState<File | null>(null);
    const aiContextPreviewUrl = React.useMemo(
        () => (aiContextImageFile ? URL.createObjectURL(aiContextImageFile) : null),
        [aiContextImageFile],
    );

    React.useEffect(() => {
        return () => {
            if (aiContextPreviewUrl) URL.revokeObjectURL(aiContextPreviewUrl);
        };
    }, [aiContextPreviewUrl]);

    // Track last saved values to prevent duplicate saves
    const lastSavedRef = useRef<string>('');

    // Refs for cleanup/unmount
    const formValuesRef = useRef(formValues);
    const isDirtyRef = useRef(isDirty);
    const onSaveRef = useRef(onSave);

    useEffect(() => {
        formValuesRef.current = formValues;
        isDirtyRef.current = isDirty;
        onSaveRef.current = onSave;
    }, [formValues, isDirty, onSave]);

    useEffect(() => {
        if (initialData) {
            reset({
                title: initialData.title || '',
                description: initialData.description || '',
            });
            // Update last saved ref when initialData changes
            lastSavedRef.current = JSON.stringify({
                title: initialData.title || '',
                description: initialData.description || '',
            });
        }
    }, [initialData, reset]);

    // Save on unmount
    useEffect(() => {
        return () => {
            const currentValues = JSON.stringify(formValuesRef.current);
            // Check refs at the time of unmount
            if (isDirtyRef.current && formValuesRef.current.title && currentValues !== lastSavedRef.current) {
                onSaveRef.current(formValuesRef.current as PostFormData).catch(() => { });
            }
        };
    }, []);

    // Notify parent of changes in real-time with debouncing and auto-save
    useEffect(() => {
        if (!onChange) return;

        const timeoutId = setTimeout(() => {
            const currentValues = JSON.stringify(formValues);

            // Only save if values have actually changed (isDirty) and title is not empty
            // Also check equality to avoid double saves if isDirty lingers
            if (isDirty && formValues.title && currentValues !== lastSavedRef.current) {
                onChange(formValues);
                // Auto-save to backend with diagram fields
                const payload = {
                    ...formValues,
                    includeDiagram,
                    diagramMode: includeDiagram ? diagramMode : null,
                    diagramType: includeDiagram && diagramMode === 'manual' ? selectedDiagramType : null,
                } as PostFormData;
                onSave(payload).then(() => {
                    lastSavedRef.current = currentValues;
                }).catch(() => {
                    // Silent fail for auto-save
                });
            }
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timeoutId);
    }, [formValues, isDirty]); // Include isDirty dependency

    const onSubmit = async (data: PostFormData) => {
        // Auto-save handles the saving logic
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={
                        <Text fz={15}>
                            Post Title <Text component="span" c="red">*</Text>
                        </Text>
                    }
                    placeholder="e.g., Introduction"
                    {...register('title', { required: 'Post title is required' })}
                />

                <div>
                    <Switch
                        label="Include AI Diagram"
                        description="AI will generate a visual diagram alongside the content"
                        checked={includeDiagram}
                        onChange={(e) => {
                            setIncludeDiagram(e.currentTarget.checked);
                            if (!e.currentTarget.checked) {
                                setSelectedDiagramType(null);
                                setDiagramMode('auto');
                            }
                        }}
                        thumbIcon={<IconSparkles size={12} />}
                        size="md"
                        mb="md"
                    />

                    {includeDiagram && (
                        <Box mb="md">
                            <SegmentedControl
                                value={diagramMode}
                                onChange={(val) => {
                                    setDiagramMode(val as 'auto' | 'manual');
                                    if (val === 'auto') setSelectedDiagramType(null);
                                }}
                                data={[
                                    {
                                        value: 'auto',
                                        label: (
                                            <Flex align="center" gap={6}>
                                                <IconWand size={16} />
                                                <span>AI Auto</span>
                                            </Flex>
                                        ),
                                    },
                                    {
                                        value: 'manual',
                                        label: (
                                            <Flex align="center" gap={6}>
                                                <IconLayoutGrid size={16} />
                                                <span>Choose Type</span>
                                            </Flex>
                                        ),
                                    },
                                ]}
                                mb="md"
                            />

                            {diagramMode === 'auto' && (
                                <Paper p="md" withBorder radius="md">
                                    <Flex align="center" gap="sm">
                                        <IconSparkles size={20} color="#7c3aed" />
                                        <Box>
                                            <Text size="sm" fw={600}>AI will choose the best diagram type</Text>
                                            <Text size="xs" c="dimmed">
                                                Based on your content, AI will automatically select and generate the most suitable diagram
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Paper>
                            )}

                            {diagramMode === 'manual' && (
                                <DiagramTypePicker
                                    selectedType={selectedDiagramType}
                                    onSelect={setSelectedDiagramType}
                                />
                            )}
                        </Box>
                    )}
                </div>

                <div>
                    <FileInput
                        label="AI reference image (optional)"
                        description="Diagram, screenshot, or slide — sent only when you generate post content with ✨. Max 4 MB. JPEG, PNG, WebP, or GIF. You can also paste below."
                        placeholder="Choose image…"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        clearable
                        leftSection={<IconPhoto size={18} />}
                        value={aiContextImageFile}
                        onChange={(file) => {
                            if (!file) {
                                setAiContextImageFile(null);
                                return;
                            }
                            commitAiContextImageFile(file, setAiContextImageFile);
                        }}
                        mb="xs"
                    />
                    <Box
                        className={styles.aiPasteZone}
                        tabIndex={0}
                        role="group"
                        aria-label="Paste AI reference image from clipboard"
                        mb="xs"
                        onPaste={(e) => {
                            const file = pickImageFileFromClipboardEvent(e);
                            if (!file) return;
                            e.preventDefault();
                            e.stopPropagation();
                            commitAiContextImageFile(file, setAiContextImageFile);
                        }}
                    >
                        <Flex align="center" gap="xs" wrap="wrap">
                            <IconPhoto size={16} aria-hidden />
                            <Text size="xs" c="dimmed">
                                Click here, then paste an image (Ctrl+V / ⌘V). Replaces the current reference image.
                            </Text>
                        </Flex>
                    </Box>
                    {aiContextPreviewUrl ? (
                        <Box mb="sm">
                            <Text size="xs" c="dimmed" mb={6}>
                                Preview (used as AI context only — not inserted into the post automatically)
                            </Text>
                            <Box
                                component="img"
                                src={aiContextPreviewUrl}
                                alt=""
                                className={styles.aiContextPreview}
                            />
                        </Box>
                    ) : null}

                    <Flex align="center" gap={4} mb="xs">
                        <Text size="sm" fw={500}>
                            Post Content <Text component="span" c="red">*</Text>
                        </Text>
                        <AISuggestionButton
                            prompt={() =>
                                buildPostContentAiQuestion(formValues.title || "", aiContext)
                            }
                            label={
                                aiContextImageFile
                                    ? 'Generate with AI (uses reference image)'
                                    : 'Generate with AI'
                            }
                            onSuggestion={(suggestion) => {
                                const processed = includeDiagram
                                    ? wrapSvgsForLexical(suggestion)
                                    : suggestion;
                                setValue('description', processed, { shouldDirty: true });
                            }}
                            getExtraParams={async () => {
                                const payload: Record<string, unknown> = {};
                                if (includeDiagram) {
                                    payload.diagramContext = {
                                        includeDiagram,
                                        diagramMode,
                                        diagramType:
                                            diagramMode === 'manual' ? selectedDiagramType : undefined,
                                    };
                                }
                                if (aiContextImageFile) {
                                    try {
                                        const { mimeType, dataBase64 } =
                                            await readFileAsContextImage(aiContextImageFile);
                                        const normalized = normalizeContextImageMime(mimeType);
                                        if (ALLOWED_AI_CONTEXT_MIME.has(normalized)) {
                                            payload.contextImages = [{ mimeType: normalized, dataBase64 }];
                                        }
                                    } catch {
                                        notifications.show({
                                            title: 'Could not read image',
                                            message: 'Pick another file or clear and try again.',
                                            color: 'red',
                                            position: 'bottom-right',
                                        });
                                    }
                                }
                                return payload;
                            }}
                        />
                    </Flex>
                    <LexicalEditor
                        value={description}
                        onChange={(state) => setValue('description', state, { shouldDirty: true })}
                        placeholder="Enter post description with rich text formatting..."
                    />
                </div>

                <Text size="sm" c="dimmed">
                    Note: Rich text content is automatically saved as you type.
                </Text>

                {isSaving && (
                    <Text size="sm" c="dimmed" ta="right">
                        Saving...
                    </Text>
                )}
            </Stack>
        </form>
    );
};

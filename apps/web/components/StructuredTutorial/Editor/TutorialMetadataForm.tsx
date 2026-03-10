"use client";

import {
    ActionIcon,
    Box,
    Button,
    FileInput,
    Flex,
    Group,
    Loader,
    Paper,
    SegmentedControl,
    Select,
    Stack,
    Switch,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCrown, IconDeviceFloppy, IconLayoutGrid, IconSparkles, IconUpload, IconWand } from "@tabler/icons-react";
import type { CategoryPath } from "@whatsnxt/core-ui";
import { CategorySearch } from "@whatsnxt/core-ui";
import Image from "next/image";
import React, { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { AISuggestions } from "../../../apis/v1/blog/aiSuggestions";
import { useAIConfig } from "../../../context/AIConfigContext";
import { AIConfigModal } from "../../Common/AIConfigModal";
import { AISuggestionButton } from "../../Common/AISuggestionButton";
import { DiagramTypePicker } from "../../Visualizer/DiagramTypePicker";
import type { DiagramType } from "../../Visualizer/types";
import { wrapSvgsForLexical } from "../../../utils/wrapSvgsForLexical";
import { IconPicker } from "../Form/IconPicker";
import { LexicalEditor } from "./LexicalEditor";

interface TutorialFormData {
    title: string;
    description: string;
    lexicalState?: any;
    categoryName: string;
    subCategory: string;
    nestedSubCategory: string;
    icon: string;
    imageUrl?: string;
    isPremium?: boolean;
    includeDiagram?: boolean;
    diagramMode?: string | null;
    diagramType?: string | null;
}

interface Category {
    value: string;
    label: string;
}

interface CategoryData {
    categoryName: string;
    subcategories: Array<{
        name: string;
        subcategories?: Array<{ name: string }>;
    }>;
}

interface TutorialMetadataFormProps {
    initialData?: Partial<TutorialFormData>;
    categories: Category[];
    categoriesData: CategoryData[]; // Raw category data with subcategories
    onSave: (data: TutorialFormData, imageFile?: File | null, aiImageAsset?: {
        imageUrl: string;
        cloudinaryAsset: { public_id: string; url: string; secure_url: string; format: string; resource_type: string };
    } | null) => Promise<void>;
    isSaving?: boolean;
}

export const TutorialMetadataForm: React.FC<TutorialMetadataFormProps> = ({
    initialData,
    categories,
    categoriesData,
    onSave,
    isSaving,
}) => {
    const { register, handleSubmit, control, reset, watch, setValue } =
        useForm<TutorialFormData>({
            defaultValues: {
                title: "",
                description: "",
                categoryName: "",
                subCategory: "",
                nestedSubCategory: "",
                icon: "IconBook",
                isPremium: false,
                ...initialData,
            },
        });

    const [tutorialImage, setTutorialImage] = React.useState<File | null>(null);
    const [imagePreview, setImagePreview] = React.useState<string | null>(
        initialData?.imageUrl || null,
    );
    const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);
    const [aiGeneratedAsset, setAiGeneratedAsset] = React.useState<{
        imageUrl: string;
        cloudinaryAsset: { public_id: string; url: string; secure_url: string; format: string; resource_type: string };
    } | null>(null);
    const [configModalOpened, { open: openConfigModal, close: closeConfigModal }] =
        useDisclosure(false);
    const [apiKeyError, setApiKeyError] = React.useState("");
    const aiConfig = useAIConfig();
    const [includeDiagram, setIncludeDiagram] = React.useState(
        initialData?.includeDiagram ?? false,
    );
    const [diagramMode, setDiagramMode] = React.useState<"auto" | "manual">(
        (initialData?.diagramMode as "auto" | "manual") || "auto",
    );
    const [selectedDiagramType, setSelectedDiagramType] = React.useState<DiagramType | null>(
        (initialData?.diagramType as DiagramType) || null,
    );

    const selectedCategory = watch("categoryName");
    const selectedSubCategory = watch("subCategory");

    // Derive subcategories from selected category
    const subcategoryOptions = useMemo(() => {
        if (!selectedCategory || !categoriesData) return [];
        const categoryData = categoriesData.find(
            (cat) => cat.categoryName === selectedCategory,
        );
        if (categoryData && categoryData.subcategories) {
            const seen = new Set<string>();
            return categoryData.subcategories
                .filter((subcat) => {
                    if (seen.has(subcat.name)) return false;
                    seen.add(subcat.name);
                    return true;
                })
                .map((subcat) => ({
                    value: subcat.name,
                    label: subcat.name,
                    subcategories: subcat.subcategories,
                }));
        }
        return [];
    }, [selectedCategory, categoriesData]);

    // Derive nested subcategories from selected subcategory
    const nestedSubcategoryOptions = useMemo(() => {
        if (!selectedSubCategory || subcategoryOptions.length === 0) return [];
        const subCategoryData = subcategoryOptions.find(
            (sub: any) => sub.value === selectedSubCategory,
        );
        if (subCategoryData && (subCategoryData as any).subcategories) {
            const seen = new Set<string>();
            return (subCategoryData as any).subcategories
                .filter((nested: any) => {
                    if (seen.has(nested.name)) return false;
                    seen.add(nested.name);
                    return true;
                })
                .map((nested: any) => ({
                    value: nested.name,
                    label: nested.name,
                }));
        }
        return [];
    }, [selectedSubCategory, subcategoryOptions]);

    useEffect(() => {
        console.log("🚀 :: TutorialMetadataForm :: initialData:", initialData);
        if (initialData) {
            // Priority for description in Lexical editor:
            // 1. lexicalState (as JSON string)
            // 2. description field if it looks like JSON
            // 3. description field as HTML fallback
            let initialDescription = "";
            if (initialData.lexicalState) {
                initialDescription =
                    typeof initialData.lexicalState === "string"
                        ? initialData.lexicalState
                        : JSON.stringify(initialData.lexicalState);
            } else if (initialData.description?.trim().startsWith("{")) {
                initialDescription = initialData.description;
            } else {
                initialDescription = initialData.description || "";
            }

            reset({
                title: initialData.title || "",
                description: initialDescription,
                categoryName: initialData.categoryName || "",
                subCategory: initialData.subCategory || "",
                nestedSubCategory: initialData.nestedSubCategory || "",
                icon: initialData.icon || "IconBook",
                isPremium: initialData.isPremium ?? false,
            });
            if (initialData.imageUrl) {
                setImagePreview(initialData.imageUrl);
            }
        }
    }, [initialData, reset]);

    const handleImageChange = (file: File | null) => {
        setAiGeneratedAsset(null);
        if (!file) {
            setTutorialImage(null);
            setImagePreview(null);
            return;
        }

        setTutorialImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateAIImage = React.useCallback(async () => {
        const title = watch("title");
        if (!title?.trim()) {
            notifications.show({
                position: "bottom-right",
                color: "orange",
                title: "Missing Title",
                message: "Please enter a tutorial title first",
            });
            return;
        }

        setIsGeneratingImage(true);
        try {
            const response = await AISuggestions.generateTutorialImage({ title });
            if (response?.data?.success && response.data.imageUrl) {
                setImagePreview(response.data.imageUrl);
                setAiGeneratedAsset({
                    imageUrl: response.data.imageUrl,
                    cloudinaryAsset: response.data.cloudinaryAsset,
                });
                setTutorialImage(null);
                notifications.show({
                    position: "bottom-right",
                    color: "green",
                    title: "Image Generated",
                    message: "AI-generated image is ready",
                });
            } else {
                notifications.show({
                    position: "bottom-right",
                    color: "red",
                    title: "Generation Failed",
                    message: response?.data?.message || "Failed to generate image",
                });
            }
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as Error)?.message ||
                "Failed to generate AI image";
            const isAuthError =
                errorMessage.includes("API key") ||
                errorMessage.includes("401") ||
                errorMessage.includes("Incorrect API key");

            if (isAuthError) {
                setApiKeyError("Image generation requires an Anthropic API key. Please enter a valid Anthropic key.");
                aiConfig.setSelectedAI("anthropic");
                aiConfig.setSelectedModel("claude-haiku-4-5");
                openConfigModal();
            } else {
                notifications.show({
                    position: "bottom-right",
                    color: "red",
                    title: "Error",
                    message: errorMessage,
                });
            }
        } finally {
            setIsGeneratingImage(false);
        }
    }, [watch]);

    const onSubmit = async (data: TutorialFormData) => {
        await onSave(
            {
                ...data,
                includeDiagram,
                diagramMode: includeDiagram ? diagramMode : null,
                diagramType: includeDiagram && diagramMode === "manual" ? selectedDiagramType : null,
            },
            tutorialImage,
            aiGeneratedAsset,
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
                <TextInput
                    label={
                        <Text fz={15}>
                            Title{" "}
                            <Text component="span" c="red">
                                *
                            </Text>
                        </Text>
                    }
                    placeholder="Enter tutorial title"
                    {...register("title", { required: "Title is required" })}
                />

                <Switch
                    label="Include AI Diagram"
                    description="AI will generate a visual diagram alongside the content"
                    checked={includeDiagram}
                    onChange={(e) => {
                        setIncludeDiagram(e.currentTarget.checked);
                        if (!e.currentTarget.checked) {
                            setSelectedDiagramType(null);
                            setDiagramMode("auto");
                        }
                    }}
                    thumbIcon={<IconSparkles size={12} />}
                    size="md"
                />

                {includeDiagram && (
                    <Box>
                        <SegmentedControl
                            value={diagramMode}
                            onChange={(val) => {
                                setDiagramMode(val as "auto" | "manual");
                                if (val === "auto") setSelectedDiagramType(null);
                            }}
                            data={[
                                {
                                    value: "auto",
                                    label: (
                                        <Flex align="center" gap={6}>
                                            <IconWand size={16} />
                                            <span>AI Auto</span>
                                        </Flex>
                                    ),
                                },
                                {
                                    value: "manual",
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

                        {diagramMode === "auto" && (
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

                        {diagramMode === "manual" && (
                            <DiagramTypePicker
                                selectedType={selectedDiagramType}
                                onSelect={setSelectedDiagramType}
                            />
                        )}
                    </Box>
                )}

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <Box>
                            <Flex align="center" gap={4} mb="xs">
                                <Text size="sm" fw={500}>
                                    Description
                                </Text>
                                <AISuggestionButton
                                    prompt={() => watch("title") || ""}
                                    onSuggestion={(suggestion) => {
                                        const processed = includeDiagram
                                            ? wrapSvgsForLexical(suggestion)
                                            : suggestion;
                                        field.onChange(processed);
                                    }}
                                    extraParams={includeDiagram ? {
                                        diagramContext: {
                                            includeDiagram,
                                            diagramMode,
                                            diagramType: diagramMode === "manual" ? selectedDiagramType : undefined,
                                        },
                                    } : undefined}
                                />
                            </Flex>
                            <LexicalEditor
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Describe your tutorial..."
                            />
                        </Box>
                    )}
                />

                <CategorySearch
                    categories={categoriesData}
                    onSelect={(path: CategoryPath) => {
                        setValue("categoryName", path.category);
                        setValue("subCategory", path.subCategory);
                        setValue("nestedSubCategory", path.nestedSubCategory);
                    }}
                />

                <Controller
                    name="categoryName"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Category"
                            placeholder="Select a category"
                            data={categories}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                // Reset dependent fields when category changes by user
                                setValue("subCategory", "");
                                setValue("nestedSubCategory", "");
                            }}
                            searchable
                            clearable
                        />
                    )}
                />

                <Controller
                    name="subCategory"
                    control={control}
                    render={({ field }) => (
                        <Select
                            label="Subcategory"
                            placeholder="Select a subcategory"
                            data={subcategoryOptions}
                            value={field.value}
                            onChange={(value) => {
                                field.onChange(value);
                                // Reset dependent fields when subcategory changes by user
                                setValue("nestedSubCategory", "");
                            }}
                            searchable
                            clearable
                            disabled={!selectedCategory || subcategoryOptions.length === 0}
                        />
                    )}
                />

                {nestedSubcategoryOptions.length > 0 && (
                    <Controller
                        name="nestedSubCategory"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Nested Subcategory"
                                placeholder="Select a nested subcategory"
                                data={nestedSubcategoryOptions}
                                value={field.value}
                                onChange={field.onChange}
                                searchable
                                clearable
                            />
                        )}
                    />
                )}

                <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                        <IconPicker
                            label="Tutorial Icon"
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />

                <FileInput
                    label={
                        <Flex align="center" gap={4}>
                            <Text fw={500} size="sm">Tutorial Image</Text>
                            <Tooltip label="Generate image with AI" withArrow>
                                <ActionIcon
                                    variant="subtle"
                                    color="violet"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleGenerateAIImage();
                                    }}
                                    disabled={isGeneratingImage}
                                >
                                    {isGeneratingImage ? <Loader size={14} /> : <IconSparkles size={16} />}
                                </ActionIcon>
                            </Tooltip>
                        </Flex>
                    }
                    placeholder={isGeneratingImage ? "Generating image with AI..." : "Upload an image"}
                    accept="image/*"
                    leftSection={isGeneratingImage ? <Loader size={16} /> : <IconUpload size={16} />}
                    onChange={handleImageChange}
                    disabled={isGeneratingImage}
                />

                <Controller
                    name="isPremium"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            label="Premium Content"
                            description="Mark this tutorial as premium. Only subscribers can access it."
                            checked={field.value || false}
                            onChange={(event) => field.onChange(event.currentTarget.checked)}
                            thumbIcon={
                                field.value ? <IconCrown size={12} color="orange" /> : undefined
                            }
                            color="yellow"
                        />
                    )}
                />

                {imagePreview && (
                    <Box>
                        <Text size="sm" fw={500} mb="xs">
                            Image Preview
                        </Text>
                        <Image
                            src={imagePreview}
                            alt="Tutorial preview"
                            width={300}
                            height={200}
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                        />
                    </Box>
                )}

                <Group justify="flex-end" mt="md">
                    <Button
                        type="submit"
                        leftSection={<IconDeviceFloppy size={18} />}
                        loading={isSaving}
                    >
                        Save Tutorial Info
                    </Button>
                </Group>
            </Stack>

            <AIConfigModal
                opened={configModalOpened}
                onClose={closeConfigModal}
                selectedAI="anthropic"
                selectedModel="claude-haiku-4-5"
                onProviderChange={aiConfig.setSelectedAI}
                onModelChange={aiConfig.setSelectedModel}
                onGenerate={() => {
                    setApiKeyError("");
                    closeConfigModal();
                    handleGenerateAIImage();
                }}
                onSaveKeyAndGenerate={() => {
                    setApiKeyError("");
                    aiConfig.updateConfig(aiConfig.selectedAI, aiConfig.selectedModel);
                    closeConfigModal();
                    handleGenerateAIImage();
                }}
                onNotification={(n) => {
                    notifications.show({
                        position: "bottom-right",
                        color: n.color,
                        title: "API Key Saved",
                        message: n.message,
                    });
                }}
                error={apiKeyError}
            />
        </form>
    );
};

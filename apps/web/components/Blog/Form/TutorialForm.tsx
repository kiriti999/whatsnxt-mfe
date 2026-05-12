import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Container,
  FileInput,
  Flex,
  Grid,
  Group,
  Input,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconLayoutGrid, IconSparkles, IconUpload, IconWand } from "@tabler/icons-react";
import type { CategoryPath } from "@whatsnxt/core-ui";
import {
  CategorySearch
} from "@whatsnxt/core-ui";
import { LoadingOverlay as CustomLoadingOverlay } from "@mantine/core";
import { default as NextImage } from "next/image";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FullPageOverlay } from "@/components/Common/FullPageOverlay";
import {
  cloudinaryAssetsUploadCleanup,
  cloudinaryAssetsUploadCleanupForUpdate,
} from "@/components/RichTextEditor/common";
import { FormAPI, HistoryAPI } from "../../../apis/v1/blog";
import { AISuggestions } from "../../../apis/v1/blog/aiSuggestions";
import { useSaved } from "../../../hooks/saved";
import { useImageSafety } from "../../../hooks/useImageSafety";
import type {
  Category,
  CategoryData,
  Detail,
  Tutorial,
} from "../../../types/form";
import { getCategoryId } from "../../../utils/form";
import {
  DEFAULT_VALIDATION_OPTIONS,
  formatFileSize,
  validateFile,
} from "../../../utils/imageValidation";
import { lexicalToHtml } from "../../../utils/lexicalToHtml";
import { AISuggestionButton } from "../../Common/AISuggestionButton";
import Pagination from "../../Common/Pagination";
import { LexicalEditor } from "../../StructuredTutorial/Editor/LexicalEditor";
import { ImageRequirements } from "./ImageRequirements";
import { uploadImage } from "./util";
import { DiagramTypePicker } from "../../Visualizer/DiagramTypePicker";
import type { DiagramType } from "../../Visualizer/types";
import { wrapSvgsForLexical } from "../../../utils/wrapSvgsForLexical";
import { openCardImageAiGenerateModal, type CardImageAiGenerateOptions } from "@/components/Common/CardImageAiGenerateModal";
import { CARD_IMAGE_CONTENT_KIND } from "@whatsnxt/constants";

interface TutorialFormProps {
  categories: Category[];
  edit?: {
    id: string;
    title: string;
    categoryName: string;
    description: any;
    subCategory: string;
    nestedSubCategory: string;
    tutorials: Tutorial[];
    imageUrl?: string;
    cloudinaryAssets:
    | {
      public_id: string;
      url: string;
      secure_url: string;
      format: string;
      resource_type: string;
    }[]
    | null;
    lexicalState?: Record<string, any> | null;
    includeDiagram?: boolean;
    diagramMode?: string;
    diagramType?: string;
  };
}

const TutorialForm: React.FC<TutorialFormProps> = (props) => {
  const { categories, edit } = props;
  const [visible, { open, close }] = useDisclosure(false);
  const [categoryData, setCategoryData] = useState<CategoryData>({
    imageUrl: "",
    text: "",
  });

  const [isAlert, setIsAlert] = useState(false);
  const [showAlertMessage, setShowAlertMessage] = useState<any>({});
  const [details, setDetails] = useState<Detail | null>(null);

  const [detailed, setDetailed] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [tutorials, setTutorials] = useState<Tutorial[]>([
    { title: "", description: "" },
  ]);
  const [active, setActive] = useState<number>(1);
  const [unsaved, setUnsaved] = useState<boolean>(true);
  const [isAssetsUploading, setIsAssetsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<any[]>([]);
  const [tutorialImage, setTutorialImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(
    null,
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiGeneratedAsset, setAiGeneratedAsset] = useState<{
    imageUrl: string;
    pngImageUrl?: string;
    cloudinaryAsset: { public_id: string; url: string; secure_url: string; format: string; resource_type: string };
  } | null>(null);
  const [includeDiagram, setIncludeDiagram] = useState(false);
  const [diagramMode, setDiagramMode] = useState<"auto" | "manual">("auto");
  const [selectedDiagramType, setSelectedDiagramType] = useState<DiagramType | null>(null);

  // Image safety hook
  const {
    scanImageClientSide,
    preloadModel,
    isScanning,
    isModelLoading,
    error: scanError,
    clearError,
  } = useImageSafety();

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      tutorialName: "",
      title: details ? details.title : "",
      categoryName: details?.categoryName || "",
      subCategory: details?.subCategory || "",
      nestedSubCategory: details?.nestedSubCategory || "",
      tutorialImagePreview: "",
    },
    resetOptions: {
      keepDirtyValues: true,
      keepErrors: true,
    },
  });

  const router = useRouter();
  useSaved(unsaved);

  // Preload AI model on component mount for better UX
  useEffect(() => {
    preloadModel().catch(console.warn);
  }, [preloadModel]);

  useEffect(() => {
    if (edit) {
      setDetails({
        title: edit.title,
        categoryId: getCategoryId(categories, edit.categoryName),
        categoryName: edit.categoryName,
        subCategory: edit?.subCategory || "",
        nestedSubCategory: edit?.nestedSubCategory || "",
        published: false,
      });
      setTutorials(edit.tutorials);
      setValue("tutorialName", edit.title);
      setValue("categoryName", edit.categoryName);
      setValue("subCategory", edit.subCategory);
      setValue("nestedSubCategory", edit.nestedSubCategory);

      const selectedCategory = categories.find(
        (cat) => cat.categoryName === edit.categoryName,
      );
      if (selectedCategory?.subcategories) {
        const mappedSubCategories = selectedCategory.subcategories.map(
          (sub) => ({
            value: sub.name,
            label: sub.name,
            subcategories: sub.subcategories,
          }),
        );
        setSubCategories(mappedSubCategories);

        const selectedSubCategory = mappedSubCategories.find(
          (sub) => sub.value === edit.subCategory,
        );
        if (selectedSubCategory?.subcategories) {
          const mappedNestedSubCategories =
            selectedSubCategory.subcategories.map((nested) => ({
              value: nested.name,
              label: nested.name,
            }));
          setNestedSubCategories(mappedNestedSubCategories);
        }
      }

      if (edit.subCategory) {
        setValue("subCategory", edit.subCategory);
      }

      if (edit.nestedSubCategory) {
        setValue("nestedSubCategory", edit.nestedSubCategory);
      }

      // Set existing image preview if editing
      if (edit.imageUrl) {
        setImagePreview(edit.imageUrl);
      }

      // Restore diagram toggle state if editing
      if (edit.includeDiagram) {
        setIncludeDiagram(true);
        const mode = (edit.diagramMode as "auto" | "manual") || "auto";
        setDiagramMode(mode);
        setSelectedDiagramType((edit.diagramType as DiagramType) || null);
      }

      // Set description for first page - load lexicalState if available from top-level edit prop
      if (edit.lexicalState) {
        setDescription(JSON.stringify(edit.lexicalState));
      } else if (edit.description) {
        setDescription(edit.description);
      }
    }
  }, [edit]);

  const categoryValue = watch("categoryName");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAlert(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isAlert]);

  useEffect(() => {
    if (active > 0) {
      const activeTutorial = tutorials[active - 1];
      setValue("title", activeTutorial?.title || "");

      // Initialize with lexicalState if available, otherwise use description HTML
      let descriptionValue = "";
      if (activeTutorial?.lexicalState) {
        // lexicalState already exists as object
        try {
          descriptionValue = JSON.stringify(activeTutorial.lexicalState);
          console.log("✅ Using lexicalState");
        } catch (e) {
          console.warn("Failed to stringify lexicalState:", e);
          descriptionValue = activeTutorial?.description || "";
        }
      } else if (
        activeTutorial?.description &&
        typeof activeTutorial.description === "string" &&
        activeTutorial.description.trim().startsWith("{")
      ) {
        // description is JSON string (from previous saves), use it as-is for editor
        console.log("✅ Using description as JSON string");
        descriptionValue = activeTutorial.description;
      } else {
        // description is HTML, use as fallback
        console.log("⚠️ Using description as HTML");
        descriptionValue = activeTutorial?.description || "";
      }
      console.log(
        "Description value (first 100 chars):",
        descriptionValue.substring(0, 100),
      );
      setDescription(descriptionValue);
    }
  }, [tutorials, active, setValue]);

  const validationOptions = {
    tutorialName: { required: "Tutorial name is required", maxLength: 250 },
    title: { required: "Title is required", maxLength: 250 },
    description: { required: "Description is required" },
  };

  const runGenerateAiImage = useCallback(
    async (
      genOpts: CardImageAiGenerateOptions,
      contentKind: typeof CARD_IMAGE_CONTENT_KIND.BLOG | typeof CARD_IMAGE_CONTENT_KIND.TUTORIAL,
    ) => {
      const title = getValues("tutorialName");
      if (!title?.trim()) {
        return;
      }

      setIsGeneratingImage(true);
      setValidationError(null);
      setValidationSuccess(null);

      try {
        let existingPublicId = aiGeneratedAsset?.cloudinaryAsset?.public_id;
        if (!existingPublicId && edit?.cloudinaryAssets?.length) {
          existingPublicId = edit.cloudinaryAssets[0].public_id;
        }

        const response = await AISuggestions.generateTutorialImage({
          title,
          publicId: existingPublicId,
          imageMode: genOpts.imageMode,
          visualType: genOpts.visualType,
          contentKind,
        });

        if (response?.data?.success && response.data.imageUrl) {
          setImagePreview(response.data.imageUrl);
          setAiGeneratedAsset({
            imageUrl: response.data.imageUrl,
            pngImageUrl: response.data.pngImageUrl,
            cloudinaryAsset: response.data.cloudinaryAsset,
          });
          setTutorialImage(null);
          setValidationSuccess("AI image generated and uploaded to Cloudinary");
          notifications.show({
            position: "bottom-right",
            color: "green",
            title: "Image Generated",
            message: "AI-generated image is ready. It will be used as the tutorial image.",
          });
        } else {
          const errorMsg = response?.data?.message || "Failed to generate image";
          setValidationError(errorMsg);
        }
      } catch (error: unknown) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (error as Error)?.message ||
          "Failed to generate AI image";
        setValidationError(errorMessage);
      } finally {
        setIsGeneratingImage(false);
      }
    },
    [getValues, edit, aiGeneratedAsset],
  );

  const handleImageChange = async (file: File | null) => {
    // Clear previous states
    setValidationError(null);
    setValidationSuccess(null);
    setAiGeneratedAsset(null);
    clearError();

    if (!file) {
      setTutorialImage(null);
      setImagePreview(null);
      return;
    }

    try {
      console.log("🔍 Starting validation and safety scan for:", file.name);

      // Step 1: Basic file validation using the shared utility
      const validationOptions = {
        ...DEFAULT_VALIDATION_OPTIONS.BLOG_TUTORIAL,
        setValidationError, // Add the setValidationError function to options
      };

      const isValid = await validateFile(file, validationOptions);
      if (!isValid) {
        return; // Error already set by validateFile
      }

      // Step 2: Safety scanning
      console.log("🔍 Running AI safety scan...");
      const safetyResult = await scanImageClientSide(file);

      if (!safetyResult.safe) {
        setValidationError(
          `Image blocked by AI safety scan: ${safetyResult.blockedReasons.join(", ")}`,
        );
        console.error("❌ Image failed safety check:", safetyResult);
        return;
      }

      // Step 3: All checks passed - set the image
      console.log("✅ Image passed all validation checks");
      setTutorialImage(file);
      setValidationSuccess(
        `Image validated successfully (${formatFileSize(file.size)})`,
      );

      // Step 4: Create preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      fileReader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ Image validation failed:", error);
      setValidationError(
        `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const addTutorial = useCallback(
    handleSubmit((data) => {
      setUnsaved(true);
      const copy = [...tutorials];
      if (active > 0) {
        // Parse lexicalState from description if it's JSON
        let lexicalJson = null;
        try {
          lexicalJson = JSON.parse(description);
        } catch (e) {
          lexicalJson = null;
        }
        copy[active - 1] = {
          title: getValues("title"),
          description,
          lexicalState: lexicalJson,
        };
      }
      copy.push({ title: "", description: "" });
      setActive(copy.length);
      setTutorials(copy);
    }),
    [tutorials, description, active, getValues],
  );

  const submitDetails = useCallback(() => {
    const categoryName: any = getValues("categoryName");
    setDetails({
      title: getValues("title"),
      categoryId: getCategoryId(categories, categoryName),
      categoryName: categoryName,
      subCategory: getValues("subCategory") || "",
      nestedSubCategory: getValues("nestedSubCategory") || "",
      published: false,
    });

    setDetailed(true);
    if (tutorials.length === 0) addTutorial();
  }, [categories, tutorials, getValues, addTutorial]);

  const deleteTutorial = useCallback(() => {
    if (tutorials.length === 1) return;
    setUnsaved(true);
    const copy = tutorials.filter((_, i) => i !== active - 1);
    setActive(copy.length);
    setTutorials(copy);
  }, [tutorials, active]);

  const navPage = useCallback(
    (page: number) => {
      if (active > 0) {
        const copy = [...tutorials];
        // Parse lexicalState from description if it's JSON
        let lexicalJson = null;
        try {
          lexicalJson = JSON.parse(description);
        } catch (e) {
          lexicalJson = null;
        }
        copy[active - 1] = {
          title: getValues("title"),
          description,
          lexicalState: lexicalJson,
        };
        setTutorials(copy);
      } else {
        submitDetails();
      }
      setActive(page);
    },
    [tutorials, description, active, getValues, submitDetails],
  );

  const checkValidationEachPage = (tutorials: Tutorial[]) => {
    const validationErrors: string[] = [];
    tutorials.forEach((tutorial, index) => {
      if (!tutorial.title) {
        validationErrors.push(`Page ${index + 1} title is required`);
      }
    });

    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors);
      return true;
    }

    return false;
  };

  const checkCleanupCloudinaryAssets = (tutorials: Tutorial[]) => {
    let updatedTutorials: Tutorial[] = [];
    if (edit && edit.tutorials) {
      const maxLength = Math.max(edit?.tutorials?.length, tutorials?.length);
      for (let index = 0; index < maxLength; index++) {
        const oldContent = edit?.tutorials[index]?.description || null;
        const newContent = tutorials[index]?.description || null;
        const getList = cloudinaryAssetsUploadCleanupForUpdate({
          oldContent,
          newContent,
        });
        if (index < tutorials.length) {
          updatedTutorials.push({
            ...tutorials[index],
            cloudinaryAssets: getList,
          });
        }
      }

      return updatedTutorials;
    }

    updatedTutorials = tutorials.map((tutorial) => {
      const getList = cloudinaryAssetsUploadCleanup({
        content: tutorial.description,
      });
      return {
        ...tutorial,
        cloudinaryAssets: getList,
      };
    });

    return updatedTutorials;
  };

  const handleFormSubmit = useCallback(
    async (formData: any) => {
      const copyTutorial = [...tutorials];
      // Convert Lexical content to HTML and capture JSON state
      const htmlDescription = lexicalToHtml(description);
      let lexicalJson = null;
      try {
        lexicalJson = JSON.parse(description);
      } catch (e) {
        lexicalJson = null;
      }
      copyTutorial[active - 1] = {
        title: getValues("title"),
        description: htmlDescription,
        lexicalState: lexicalJson,
      };
      setTutorials(copyTutorial);

      if (checkValidationEachPage(copyTutorial)) {
        return;
      }
      const updatedTutorialsList = checkCleanupCloudinaryAssets(copyTutorial);

      // Normalize all tutorial descriptions: ensure each has HTML in description and lexicalState as object
      const normalizedTutorialsList = updatedTutorialsList.map((tutorial) => {
        let normalizedDescription = tutorial.description || "";
        let normalizedLexicalState = tutorial.lexicalState || null;

        // If description looks like JSON (starts with {), parse it as lexicalState and convert to HTML
        if (
          typeof normalizedDescription === "string" &&
          normalizedDescription.trim().startsWith("{")
        ) {
          try {
            const parsedState = JSON.parse(normalizedDescription);
            normalizedLexicalState = parsedState;
            normalizedDescription = lexicalToHtml(normalizedDescription);
          } catch (e) {
            // If parsing fails, keep as-is (likely already HTML)
          }
        }

        return {
          ...tutorial,
          description: normalizedDescription,
          lexicalState: normalizedLexicalState,
        };
      });

      const categoryName: any = getValues("categoryName");

      let imageUrl = edit?.imageUrl || "";
      let cloudinaryAssets = edit?.cloudinaryAssets || [];

      // Only upload new image if one was selected
      if (tutorialImage) {
        // Upload image via worker
        const addToLocalStorage = false;
        const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API;
        const { secure_url, asset } = await uploadImage(
          tutorialImage,
          "whatsnxt-tutorial",
          addToLocalStorage,
          bffApiUrl,
        );
        if (secure_url && asset) {
          imageUrl = secure_url;
          cloudinaryAssets = [asset];
        }
      } else if (aiGeneratedAsset) {
        // Use AI-generated image that was already uploaded to Cloudinary
        imageUrl = aiGeneratedAsset.imageUrl;
        cloudinaryAssets = [aiGeneratedAsset.cloudinaryAsset];
      }

      const details = {
        title: getValues("tutorialName"),
        description: htmlDescription,
        contentFormat: "LEXICAL",
        lexicalState: lexicalJson,
        categoryId: getCategoryId(categories, categoryName),
        categoryName,
        subCategory: formData.subCategory,
        nestedSubCategory: formData.nestedSubCategory,
        imageUrl: imageUrl,
        published: false,
        cloudinaryAssets,
        includeDiagram,
        diagramMode: includeDiagram ? diagramMode : null,
        diagramType: includeDiagram && diagramMode === "manual" ? selectedDiagramType : null,
      };

      setUnsaved(false);
      open();

      try {
        const payload = { ...details, tutorials: normalizedTutorialsList };

        console.log("TutorialForm:: payload:", payload);

        const response = edit
          ? await FormAPI.updateTutorial(edit.id, payload)
          : await FormAPI.createTutorial(payload);

        if (response.success) {
          if (edit) {
            await HistoryAPI.publishDraft(edit.id, false); // unpublish on edit
          }

          notifications.show({
            title: `Tutorial ${edit ? "Updated" : "Created"}`,
            message: `Tutorial successfully ${edit ? "updated" : "created"}`,
            color: "green",
          });

          router.push("/history/table");
        }
        if (!response.success) {
          notifications.show({
            title: `Tutorial ${edit ? "Update" : "Create"} Error`,
            message: response[0]
              ? response[0].message
              : `Tutorial failed to ${edit ? "update" : "create"}`,
            color: "red",
          });
        }
      } catch (error) {
        const isConflict =
          error?.status === 409 || error?.response?.status === 409;
        if (isConflict) {
          modals.open({
            title: "Duplicate Title Detected",
            centered: true,
            children: (
              <Box>
                <Text size="sm" mb="md">
                  {error?.message ||
                    "A tutorial with a similar title already exists."}
                </Text>
                <Text size="xs" c="dimmed">
                  Please change your title and try again.
                </Text>
                <Group justify="flex-end" mt="md">
                  <Button onClick={() => modals.closeAll()}>OK</Button>
                </Group>
              </Box>
            ),
          });
        } else {
          notifications.show({
            title: `Tutorial ${edit ? "Update" : "Create"} Error`,
            message: `${error.message}`,
            color: "red",
          });
        }
      } finally {
        close();
      }
    },
    [
      tutorials,
      description,
      active,
      details,
      detailed,
      edit,
      getValues,
      submitDetails,
      tutorialImage,
      aiGeneratedAsset,
    ],
  );

  // Update subcategories when a category is selected
  const handleCategoryChange = useCallback(
    (value: string) => {
      const selectedCategory = categories.find(
        (cat) => cat.categoryName === value,
      );
      const selectedCategoriesToUpdate =
        selectedCategory?.subcategories?.map((sub) => ({
          value: sub.name,
          label: sub.name,
          subcategories: sub.subcategories,
        })) || [];

      selectedCategoriesToUpdate.push({
        value: "",
        label: "",
        subcategories: [],
      });

      setSubCategories(selectedCategoriesToUpdate);
      setNestedSubCategories([]); // Reset nested subcategories
    },
    [categories],
  );

  // Update nested subcategories when a subcategory is selected
  const handleSubCategoryChange = useCallback(
    (value: string) => {
      const selectedSubCategory = subCategories.find(
        (sub) => sub.value === value,
      );
      setNestedSubCategories(
        selectedSubCategory?.subcategories?.map((nested) => ({
          value: nested.name,
          label: nested.name,
        })) || [],
      );
    },
    [subCategories],
  );

  return (
    <Container size="xl" py="xl">
      <FullPageOverlay visible={visible} />
      <Box>
        <Title order={2} mb="xl" fw={600}>
          {edit ? "Edit tutorial details" : "Post a tutorial"}
        </Title>

        {isAlert && <Alert withCloseButton>{showAlertMessage.message}</Alert>}
        {validationErrors.length > 0 && (
          <Alert mb={"1em"} mt={"2px"} title="Validation Errors" color="red">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <CustomLoadingOverlay visible={visible}>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Stack gap="lg">
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Tutorial name{" "}
                  <Text component="span" c="red" fw={600}>
                    *
                  </Text>
                </Text>
                <Input
                  tabIndex={1}
                  placeholder="Enter tutorial name"
                  size="md"
                  {...register("tutorialName", validationOptions.tutorialName)}
                />
                {errors?.tutorialName && (
                  <Text c="red" size="sm">
                    {errors.tutorialName?.message?.toString() ||
                      "Max length exceeded"}
                  </Text>
                )}
              </Stack>

              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Page name{" "}
                  <Text component="span" c="red" fw={600}>
                    *
                  </Text>
                </Text>
                <Input
                  tabIndex={2}
                  placeholder="Page name"
                  size="md"
                  {...register("title", validationOptions.title)}
                />
                {errors?.title && (
                  <Text c="red" size="sm">
                    {errors.title?.message?.toString() || "Max length exceeded"}
                  </Text>
                )}
              </Stack>

              {/* AI Diagram Toggle */}
              <Switch
                label="Include AI Diagram"
                description="AI will generate a visual diagram alongside the blog content"
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

              {/* Diagram Mode + Type Picker */}
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

              {detailed && (
                <Stack gap="xs">
                  <Flex align="center" gap={4}>
                    <Text fw={500} size="sm">
                      Description
                    </Text>
                    <AISuggestionButton
                      prompt={() => getValues("title") || ""}
                      onSuggestion={(suggestion) => {
                        const processed = includeDiagram
                          ? wrapSvgsForLexical(suggestion)
                          : suggestion;
                        setDescription(processed);
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
                    value={description}
                    onChange={setDescription}
                    placeholder="Write tutorial description here..."
                  />
                </Stack>
              )}

              <Stack gap="md">
                <Grid gutter="lg">
                  {/* Find My Category Search */}
                  <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                    <CategorySearch
                      categories={categories}
                      onSelect={(path: CategoryPath) => {
                        setValue("categoryName", path.category);
                        setValue("subCategory", path.subCategory);
                        setValue("nestedSubCategory", path.nestedSubCategory);
                        handleCategoryChange(path.category);
                        if (path.subCategory) {
                          handleSubCategoryChange(path.subCategory);
                        }
                      }}
                    />
                  </Grid.Col>

                  {/* Categories */}
                  <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                    <Controller
                      name="categoryName"
                      control={control}
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <Select
                          label={
                            <Text fw={500} size="sm">
                              Category{" "}
                              <Text component="span" c="red" fw={600}>
                                *
                              </Text>
                            </Text>
                          }
                          placeholder="Select a category"
                          size="md"
                          data={categories.map((cat) => ({
                            value: cat.categoryName,
                            label: cat.categoryName,
                          }))}
                          value={field.value}
                          onChange={(value) => {
                            setValue("subCategory", "");
                            setValue("nestedSubCategory", "");
                            field.onChange(value);
                            handleCategoryChange(value);
                          }}
                          searchable
                        />
                      )}
                    />
                    {errors.categoryName && (
                      <Text c="red" size="sm" mt="xs">
                        {errors.categoryName?.message}
                      </Text>
                    )}
                  </Grid.Col>

                  {/* Subcategories */}
                  {categoryValue && (
                    <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                      <Controller
                        name="subCategory"
                        control={control}
                        rules={{ required: "SubCategory is required" }}
                        render={({ field }) => (
                          <Select
                            label={
                              <Text fw={500} size="sm">
                                Subcategory{" "}
                                <Text component="span" c="red" fw={600}>
                                  *
                                </Text>
                              </Text>
                            }
                            placeholder="Select a subcategory"
                            size="md"
                            data={subCategories}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              setValue("nestedSubCategory", "");
                              handleSubCategoryChange(value);
                            }}
                            searchable
                          />
                        )}
                      />
                      {errors.subCategory && (
                        <Text c="red" size="sm" mt="xs">
                          {errors.subCategory.message}
                        </Text>
                      )}
                    </Grid.Col>
                  )}

                  {/* Nested Subcategories */}
                  {nestedSubCategories.length > 0 && (
                    <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                      <Controller
                        name="nestedSubCategory"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label={
                              <Text fw={500} size="sm">
                                Nested Subcategory{" "}
                                <Text component="span" c="red" fw={600}>
                                  *
                                </Text>
                              </Text>
                            }
                            placeholder="Select a nested subcategory"
                            size="md"
                            data={nestedSubCategories}
                            value={field.value}
                            onChange={field.onChange}
                            searchable
                          />
                        )}
                      />
                    </Grid.Col>
                  )}
                </Grid>
              </Stack>

              {/* Tutorial Image Upload */}
              <Stack gap="xs">
                <Controller
                  name="tutorialImagePreview"
                  control={control}
                  rules={{
                    required: (edit || aiGeneratedAsset) ? false : "Tutorial Image is required",
                  }}
                  render={({ field }) => (
                    <Box>
                      <FileInput
                        clearable
                        label={
                          <Flex align="center" gap={4}>
                            <Text fw={500} size="sm">
                              Tutorial Image{" "}
                              <Text component="span" c="red" fw={600}>
                                *
                              </Text>
                            </Text>
                            <Tooltip label="Generate image with AI" withArrow>
                              <ActionIcon
                                variant="subtle"
                                color="violet"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openCardImageAiGenerateModal({
                                    getTitle: () => getValues("tutorialName"),
                                    missingTitleMessage: "Please enter a tutorial name first",
                                    onGenerate: async (genOpts) => {
                                      await runGenerateAiImage(
                                        genOpts,
                                        CARD_IMAGE_CONTENT_KIND.TUTORIAL,
                                      );
                                    },
                                  });
                                }}
                                disabled={isGeneratingImage || isScanning || isModelLoading}
                              >
                                {isGeneratingImage ? <Loader size={14} /> : <IconSparkles size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          </Flex>
                        }
                        placeholder={
                          isScanning
                            ? "🔍 Scanning image..."
                            : isModelLoading
                              ? "🤖 Loading AI model..."
                              : "Select tutorial image"
                        }
                        size="md"
                        leftSection={
                          isScanning || isModelLoading ? (
                            <Loader size={16} />
                          ) : (
                            <IconUpload size={16} />
                          )
                        }
                        value={tutorialImage}
                        onChange={(e) => {
                          handleImageChange(e);
                          field.onChange(e);
                        }}
                        accept=".png,.jpg,.jpeg"
                        disabled={isScanning || isModelLoading}
                      />

                      {/* Status messages */}
                      {(validationError || scanError) && (
                        <Alert
                          icon={<IconAlertCircle size={16} />}
                          color="red"
                          mt="xs"
                          variant="light"
                        >
                          {validationError || scanError}
                        </Alert>
                      )}

                      {validationSuccess && !validationError && !scanError && (
                        <Alert
                          icon={<IconCheck size={16} />}
                          color="green"
                          mt="xs"
                          variant="light"
                        >
                          {validationSuccess}
                        </Alert>
                      )}

                      {/* Scanning status */}
                      {isScanning && (
                        <Group gap="xs" mt="xs">
                          <Loader size="xs" />
                          <Text size="xs" c="blue">
                            Running AI safety scan...
                          </Text>
                        </Group>
                      )}

                      {/* AI image generation status */}
                      {isGeneratingImage && (
                        <Group gap="xs" mt="xs">
                          <Loader size="xs" />
                          <Text size="xs" c="violet">
                            Generating image with AI...
                          </Text>
                        </Group>
                      )}

                      {/* Model loading status */}
                      {isModelLoading && (
                        <Group gap="xs" mt="xs">
                          <Loader size="xs" />
                          <Text size="xs" c="gray">
                            Loading AI model in browser...
                          </Text>
                        </Group>
                      )}
                    </Box>
                  )}
                />
                {errors.tutorialImagePreview && (
                  <Text c="red" size="sm">
                    {errors.tutorialImagePreview.message}
                  </Text>
                )}
              </Stack>

              {/* Tutorial Image Technical Requirements */}
              <ImageRequirements />

              {/* Image Preview */}
              {imagePreview && !validationError && !scanError && (
                <Box>
                  <Text fw={500} size="sm" mb="xs">
                    Image Preview:
                  </Text>
                  <Box
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      overflow: "hidden",
                      display: "inline-block",
                    }}
                  >
                    <NextImage
                      alt="tutorial image preview"
                      width={300}
                      height={200}
                      sizes="(max-width: 480px) 300px, (max-width: 768px) 320px, 340px"
                      src={imagePreview}
                      style={{
                        display: "block",
                      }}
                    />
                  </Box>
                </Box>
              )}

              <Box mt="xl">
                <Pagination
                  disabled={isAssetsUploading}
                  nPages={tutorials.length}
                  currentPage={active}
                  setCurrentPage={navPage}
                />
              </Box>

              {/* Action Buttons */}
              <Box mt="xl" mb="xl">
                <Grid gutter="md">
                  {tutorials.length > 0 && (
                    <>
                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Button
                          fullWidth
                          variant="outline"
                          color="red"
                          size="md"
                          type="button"
                          onClick={deleteTutorial}
                        >
                          Delete this page
                        </Button>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, sm: 4 }}>
                        <Button
                          fullWidth
                          variant="light"
                          size="md"
                          disabled={isAssetsUploading}
                          type="button"
                          onClick={addTutorial}
                        >
                          Add new page
                        </Button>
                      </Grid.Col>
                    </>
                  )}

                  <Grid.Col
                    span={{ base: 12, sm: tutorials.length > 0 ? 4 : 12 }}
                  >
                    <Button
                      fullWidth
                      size="md"
                      disabled={
                        isAssetsUploading ||
                        isScanning ||
                        isModelLoading ||
                        isGeneratingImage ||
                        validationError !== null ||
                        scanError !== null
                      }
                      type="submit"
                    >
                      {edit ? "Update" : "Create"}
                    </Button>
                  </Grid.Col>
                </Grid>
              </Box>
            </Stack>
          </form>
        </CustomLoadingOverlay>
      </Box>
    </Container>
  );
};

export default TutorialForm;

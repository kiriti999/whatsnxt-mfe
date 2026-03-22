"use client";

import {
  Accordion,
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import {
  useDebouncedCallback,
  useDisclosure,
  useMediaQuery,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconDeviceDesktop,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import labApi from "@/apis/lab.api";
import { AISuggestions } from "@/apis/v1/blog/aiSuggestions";
import DiagramEditor from "@/components/architecture-lab/DiagramEditor";
import { AISuggestionButton } from "@/components/Common/AISuggestionButton";
import { FullPageOverlay } from "@/components/Common/FullPageOverlay";
import HintsEditor from "@/components/Lab/HintsEditor";
import { LearningMaterialViewer } from "@/components/Lab/LearningMaterial/LearningMaterialViewer";
import { StudentTestRunner } from "@/components/Lab/StudentTestRunner";
import { useAIConfig } from "@/context/AIConfigContext";
import useAuth from "@/hooks/Authentication/useAuth";
import { useAutoPageCreation } from "@/hooks/useAutoPageCreation";
import { usePageMapping } from "@/hooks/usePageMapping";
import {
  buildDiagramAIPrompt,
  buildDiagramValidationPrompt,
  type DiagramValidationIssue,
  parseAIDiagramResponse,
  parseAIValidationResponse,
} from "@/utils/diagram-ai";
import {
  getArchitectureSelectOptions,
  L2_ARCHITECTURE_TYPES,
  L3_ARCHITECTURE_TYPES,
  MAX_ADDITIONAL_SELECTIONS,
  mapSubCategoryToArchitecture,
} from "@/utils/shape-libraries";

// Get architecture types dynamically from centralized registry

interface Question {
  id: string;
  questionText: string;
  type: "MCQ" | "True/False" | "Fill in the blank";
  options: string[];
  correctAnswer: string;
  isEditing?: boolean;
  isSaved?: boolean;
  isPreview?: boolean;
}

const QUESTION_TYPES = [
  { value: "MCQ", label: "Multiple Choice" },
  { value: "True/False", label: "True/False" },
  { value: "Fill in the blank", label: "Fill in the blank" },
];

/**
 * Build a prompt for the AI to generate answer/options for a question.
 * Adapts based on question type (MCQ, True/False, Fill in the blank).
 */
const buildQuestionAIPrompt = (
  questionText: string,
  questionType: string,
): string => {
  const typeInstructions: Record<string, string> = {
    MCQ: `This is a Multiple Choice Question.
Generate 4 plausible options (one correct, three distractors) and identify the correct answer.

Respond ONLY with valid JSON in this exact format:
{
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A"
}

Rules:
- The correct answer must exactly match one of the options.
- Distractors should be plausible but clearly wrong.
- Keep options concise (under 100 characters each).`,

    "True/False": `This is a True/False Question.
Determine whether the statement is True or False.

Respond ONLY with valid JSON in this exact format:
{
  "options": ["True", "False"],
  "correctAnswer": "True"
}

Rules:
- The correctAnswer must be exactly "True" or "False".`,

    "Fill in the blank": `This is a Fill in the Blank Question.
Provide the correct answer that fills the blank.

Respond ONLY with valid JSON in this exact format:
{
  "options": [],
  "correctAnswer": "the correct answer here"
}

Rules:
- Keep the answer concise and precise.
- No options are needed for fill-in-the-blank.`,
  };

  const instructions =
    typeInstructions[questionType] || typeInstructions["MCQ"];

  return `You are an educational assessment expert. Given the following question, generate the answer.

Question: "${questionText}"
Question Type: ${questionType}

${instructions}

IMPORTANT: Respond ONLY with the JSON object. No markdown, no explanation, no extra text.`;
};

/**
 * Parse the AI response for a question answer into { options, correctAnswer }.
 */
const parseAIQuestionResponse = (
  rawResponse: string,
): { options: string[]; correctAnswer: string } | null => {
  try {
    // Strip markdown code fences if present
    let jsonStr = rawResponse.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonStr);

    if (typeof parsed.correctAnswer !== "string") {
      console.error("AI response missing correctAnswer");
      return null;
    }

    // Options: return as array
    const options = Array.isArray(parsed.options) ? parsed.options : [];

    return {
      options,
      correctAnswer: parsed.correctAnswer,
    };
  } catch (err) {
    console.error("Failed to parse AI question response:", err, rawResponse);
    return null;
  }
};

const LabPageEditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const labId = params.id as string;
  const pageId = params.pageId as string;
  const returnPage = searchParams.get("returnPage") || "1";
  const isPreviewRequest = searchParams.get("preview") === "true";

  // Determine user role
  const isStudent = isAuthenticated && user?.role === "student";
  const isTrainer = isAuthenticated && user?.role === "trainer";
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [enablePracticeTest, setEnablePracticeTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [labStatus, setLabStatus] = useState<"draft" | "published">("draft");
  const [diagramTestData, setDiagramTestData] = useState<any>(null);
  const [isPreviewDiagram, setIsPreviewDiagram] = useState(false);
  const [isFormCancelled, setIsFormCancelled] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [totalLabPages, setTotalLabPages] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [
    deleteQuestionModalOpened,
    { open: openDeleteQuestionModal, close: closeDeleteQuestionModal },
  ] = useDisclosure(false);
  const [
    deleteDiagramModalOpened,
    { open: openDeleteDiagramModal, close: closeDeleteDiagramModal },
  ] = useDisclosure(false);
  const [questionToDelete, setQuestionToDelete] = useState<{
    id: string;
    isSaved: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [learningData, setLearningData] = useState<{
    learningContent?: string;
    learningVideoUrl?: string;
    learningLinks?: Array<{
      title: string;
      url: string;
      type: "internal" | "external";
    }>;
    learningDiagramState?: string;
  } | null>(null);

  const QUESTIONS_PER_PAGE = 3;

  // Derive isPublished from labStatus
  const isPublished = labStatus === "published";
  // Can edit only if draft
  const canEditContent = !isPublished;

  // Initialize page mapping hook for pagination navigation (feature 004)
  const {
    getPageId,
    isLoading: isMappingLoading,
    error: mappingError,
    refreshMapping,
  } = usePageMapping(labId);

  // Initialize auto-page-creation hook (feature 003)
  const { isCreatingPage, onQuestionSaved } = useAutoPageCreation({
    labId,
    currentPageId: pageId,
    currentPageNumber,
    enabled: canEditContent, // Enable for draft labs or owner of published labs
  });

  // Diagram test state
  const [architectureType, setArchitectureType] = useState("Generic");
  const [additionalSubCatArchTypes, setAdditionalSubCatArchTypes] = useState<
    string[]
  >([]);
  const [additionalNestedArchTypes, setAdditionalNestedArchTypes] = useState<
    string[]
  >([]);
  const [prompt, setPrompt] = useState("");
  const [expectedDiagramState, setExpectedDiagramState] = useState<any>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [isDiagramValidating, setIsDiagramValidating] = useState(false);
  const [validationIssues, setValidationIssues] = useState<
    DiagramValidationIssue[]
  >([]);
  const [validationSummary, setValidationSummary] = useState<string>("");
  const [
    validationModalOpened,
    { open: openValidationModal, close: closeValidationModal },
  ] = useDisclosure(false);
  const { selectedAI, selectedModel } = useAIConfig();

  // Combine primary + additional architecture types for DiagramEditor
  const allArchitectureTypes = [
    architectureType,
    ...additionalSubCatArchTypes,
    ...additionalNestedArchTypes,
  ];

  useEffect(() => {
    setIsFormCancelled(false); // T008: Reset cancel flag on page navigation (allows auto-show on new page)
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // Fetch lab status and total pages count
      const labResponse = await labApi.getLabById(labId);
      const labData = labResponse.data;
      setLabStatus(labData.status || "draft");

      // Derive architecture type from lab's sub-category and nested sub-category
      const derivedArchType = mapSubCategoryToArchitecture(
        labData.subCategory,
        labData.nestedSubCategory,
      );

      // Extract total pages from lab response (feature 004)
      if (labData.pages) {
        setTotalLabPages(labData.pages.length);
      }

      const response = await labApi.getLabPageById(
        labId,
        pageId,
        isPreviewRequest,
      );
      const pageData = response.data as any;

      // Set current page number for auto-page-creation (feature 003) and pagination (feature 004)
      if (pageData.pageNumber) {
        setCurrentPageNumber(pageData.pageNumber);
      }

      // If page has questions, populate the form
      if (pageData.questions && pageData.questions.length > 0) {
        const loadedQuestions = pageData.questions.map((q: any) => {
          // Backend stores as 'MCQ', 'True/False', 'Fill in the blank' (same as frontend)
          return {
            id: q.id || Date.now().toString(),
            questionText: q.questionText || "",
            type: q.type as "MCQ" | "True/False" | "Fill in the blank",
            options:
              Array.isArray(q.options) && q.options.length > 0
                ? q.options.map((opt: any) => opt.text || opt)
                : [],
            correctAnswer: q.correctAnswer || "",
            isEditing: false,
            isSaved: true,
            isPreview: q.isPreview ?? false,
          };
        });

        setQuestions(loadedQuestions);
      }

      // If page has a diagram test, populate the form
      if (pageData.diagramTest) {
        const dt = pageData.diagramTest;
        setPrompt(dt.prompt || "");
        setArchitectureType(derivedArchType);
        setAdditionalSubCatArchTypes(dt.additionalSubCatArchTypes || []);
        setAdditionalNestedArchTypes(dt.additionalNestedArchTypes || []);
        setHints(dt.hints || []); // Load hints from backend
        setIsPreviewDiagram(dt.isPreview ?? false); // Load preview flag from backend

        // Store diagram test data for student mode
        setDiagramTestData(dt);

        // Transform backend format (shapes/connections) to DiagramEditor format (nodes/links)
        if (dt.expectedDiagramState) {
          console.log(
            "Loading diagram state from backend:",
            dt.expectedDiagramState,
          );
          const transformedState = {
            nodes: (dt.expectedDiagramState.shapes || []).map((shape: any) => {
              console.log("Transforming shape:", shape);
              return {
                id: shape.shapeId,
                shapeId: shape.shapeId,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                rotation: shape.rotation || 0,
                label: shape.label || "",
                // Restore ALL rendering properties from metadata
                type: shape.metadata?.type,
                fill: shape.metadata?.fill,
                stroke: shape.metadata?.stroke,
                strokeWidth: shape.metadata?.strokeWidth,
                strokeDashArray: shape.metadata?.strokeDashArray,
                pathData: shape.metadata?.pathData,
                rx: shape.metadata?.rx,
                metadata: shape.metadata || {},
              };
            }),
            links: (dt.expectedDiagramState.connections || []).map(
              (conn: any) => ({
                id: conn.id,
                source: conn.sourceShapeId,
                target: conn.targetShapeId,
                type: conn.type || "arrow",
                label: conn.label || "",
                waypoints: conn.metadata?.waypoints || [],
              }),
            ),
          };
          console.log("Transformed state for DiagramEditor:", transformedState);
          setExpectedDiagramState(transformedState);
        } else {
          setExpectedDiagramState(null);
        }
      }

      // If no diagram test exists yet, use derived architecture from lab sub-category
      if (!pageData.diagramTest) {
        setArchitectureType(derivedArchType);
      }

      // Extract learning material data for student viewer
      if (pageData.hasLearningMaterial) {
        setLearningData({
          learningContent: pageData.learningContent,
          learningVideoUrl: pageData.learningVideoUrl,
          learningLinks: pageData.learningLinks,
          learningDiagramState: pageData.learningDiagramState,
        });
      }
    } catch (error: any) {
      console.error("Failed to load page data:", error);

      // Check if it's an access control error
      const isAccessError =
        error?.response?.status === 403 ||
        error?.response?.data?.requiresAccess;

      // Show error notification
      notifications.show({
        title: isAccessError ? "Access Required" : "Error Loading Page",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load page data. Please ensure the lab and page exist.",
        color: isAccessError ? "yellow" : "red",
      });

      // If access error, redirect back to lab detail page
      if (isAccessError && isStudent) {
        setTimeout(() => {
          router.push(`/labs/${labId}?tab=details`);
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle page navigation with debouncing (Feature 004)
   * Navigates to a different page in the lab by looking up the page ID
   */
  const handlePageChange = async (pageNumber: number) => {
    try {
      setIsNavigating(true);

      // Get page ID for target page number
      const targetPageId = getPageId(pageNumber);

      if (!targetPageId) {
        notifications.show({
          title: "Navigation Error",
          message: `Unable to navigate to page ${pageNumber}`,
          color: "red",
        });
        return;
      }

      // Navigate to target page
      router.push(`/labs/${labId}/pages/${targetPageId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      notifications.show({
        title: "Navigation Error",
        message: "Unable to load page. Please try again.",
        color: "red",
      });
    } finally {
      setIsNavigating(false);
    }
  };

  /**
   * Debounced page change to prevent rapid navigation clicks (Feature 004)
   */
  const debouncedPageChange = useDebouncedCallback(handlePageChange, 300);

  /**
   * Monitor auto-page-creation and refresh pagination when new page is created (Feature 004 - US3)
   */
  useEffect(() => {
    if (!isCreatingPage && labId) {
      // Page creation completed, refresh page mapping to update total pages
      refreshMapping();
    }
  }, [isCreatingPage, labId, refreshMapping]);

  const addQuestion = () => {
    // Check if we've reached the limit
    if (questions.length >= 30) {
      notifications.show({
        title: "Limit Reached",
        message: "Maximum 30 questions allowed per page",
        color: "orange",
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: "",
      type: "MCQ",
      options: ["", "", "", ""],
      correctAnswer: "",
      isEditing: true,
      isSaved: false,
    };
    setQuestions([...questions, newQuestion]);
    // Navigate to last page if adding would overflow current page
    const newTotalPages = Math.ceil(
      (questions.length + 1) / QUESTIONS_PER_PAGE,
    );
    setCurrentPage(newTotalPages);
  };

  const confirmDeleteQuestion = (id: string, isSaved: boolean) => {
    setQuestionToDelete({ id, isSaved });
    openDeleteQuestionModal();
  };

  const removeQuestion = async () => {
    if (!questionToDelete) return;

    const { id, isSaved } = questionToDelete;
    setIsDeleting(true);

    if (isSaved) {
      // If question is saved on backend, delete it from backend
      try {
        await labApi.deleteQuestion(labId, pageId, id);
        notifications.show({
          title: "Success",
          message: "Question deleted successfully!",
          color: "green",
        });
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete question.";
        notifications.show({
          title: "Error",
          message: errorMessage,
          color: "red",
        });
        console.error("Failed to delete question:", error);
        setIsDeleting(false);
        return;
      }
    }

    // Remove from local state
    setQuestions(questions.filter((q) => q.id !== id));
    closeDeleteQuestionModal();
    setQuestionToDelete(null);
    setIsDeleting(false);
  };

  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: string | boolean | string[],
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const toggleEditQuestion = (id: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, isEditing: !q.isEditing } : q,
      ),
    );
  };

  const saveIndividualQuestion = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    // Validation
    if (!question.questionText.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Question text is required",
        color: "red",
      });
      return;
    }

    if (question.questionText.trim().length < 5) {
      notifications.show({
        title: "Validation Error",
        message: "Question text must be at least 10 characters",
        color: "red",
      });
      return;
    }

    if (question.questionText.trim().length > 1000) {
      notifications.show({
        title: "Validation Error",
        message: "Question text cannot exceed 1000 characters",
        color: "red",
      });
      return;
    }

    if (question.type === "MCQ") {
      const validOptions = question.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        notifications.show({
          title: "Validation Error",
          message: "Please provide at least 2 options",
          color: "red",
        });
        return;
      }
    }

    if (!question.correctAnswer.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Correct answer is required",
        color: "red",
      });
      return;
    }

    setSavingQuestionId(questionId);
    try {
      // Parse options from array
      let optionsArray: any[] = [];

      if (question.type === "MCQ") {
        optionsArray = question.options
          .filter((opt) => opt.trim())
          .map((opt) => ({ text: opt.trim() }));
      } else if (question.type === "True/False") {
        optionsArray = [{ text: "True" }, { text: "False" }];
      }

      // Backend expects 'MCQ', 'True/False', or 'Fill in the blank' (same as frontend)
      const response = await labApi.saveQuestion(labId, pageId, {
        type: question.type, // Send type as-is, no conversion needed
        questionText: question.questionText.trim(),
        options: optionsArray,
        correctAnswer: question.correctAnswer.trim(),
        questionId: question.isSaved ? question.id : undefined, // Include questionId if updating
        isPreview: question.isPreview ?? false,
      });

      // Determine if this was an edit or new question
      const isEdit = question.isSaved;

      // Update question state with the returned ID and mark as saved
      setQuestions(
        questions.map((q) =>
          q.id === questionId
            ? { ...q, id: response.data.id, isEditing: false, isSaved: true }
            : q,
        ),
      );

      notifications.show({
        title: "Success",
        message: "Question saved successfully!",
        color: "green",
      });

      // Trigger auto-page-creation check (feature 003)
      await onQuestionSaved(response.data, isEdit);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save question.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to save question:", error);
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleBackToTestsAndQuestions = () => {
    router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please add at least one question",
        color: "red",
      });
      return;
    }

    // Validate the first question (we'll save only the first one for now)
    const question = questions[0];

    if (!question.questionText.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Question text is required",
        color: "red",
      });
      return;
    }

    if (question.type === "MCQ") {
      const validOptions = question.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        notifications.show({
          title: "Validation Error",
          message: "Please provide at least 2 options",
          color: "red",
        });
        return;
      }
    }

    if (!question.correctAnswer.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Correct answer is required",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      // Parse options from array
      const optionsArray =
        question.type === "MCQ"
          ? question.options
            .filter((opt) => opt.trim())
            .map((opt) => ({ text: opt.trim() }))
          : [];

      await labApi.saveQuestion(labId, pageId, {
        type: question.type,
        questionText: question.questionText.trim(),
        options: optionsArray,
        correctAnswer: question.correctAnswer.trim(),
      });

      notifications.show({
        title: "Success",
        message: "Question saved successfully!",
        color: "green",
      });

      // Navigate back to lab detail page
      router.push(`/labs/${labId}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save question.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to save question:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiagramTest = async () => {
    // Validation
    if (!prompt || prompt.trim().length < 10) {
      notifications.show({
        title: "Validation Error",
        message: "Prompt must be at least 10 characters",
        color: "red",
      });
      return;
    }

    if (prompt.trim().length > 2000) {
      notifications.show({
        title: "Validation Error",
        message: "Prompt cannot exceed 2000 characters",
        color: "red",
      });
      return;
    }

    // Validate diagram is not empty (T089) - REMOVED
    // Allow saving empty diagrams for future editing

    setSaving(true);
    try {
      console.log("Saving diagram state:", expectedDiagramState);

      // Transform DiagramEditor format (nodes/links) to backend format (shapes/connections)
      // Handle empty diagram case
      const shapes =
        expectedDiagramState?.nodes?.map((node: any) => ({
          shapeId: node.shapeId || node.id,
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
          rotation: node.rotation || 0,
          label: node.label || "",
          metadata: {
            // Store ALL node properties needed for rendering
            type: node.type,
            fill: node.fill,
            stroke: node.stroke,
            strokeWidth: node.strokeWidth,
            strokeDashArray: node.strokeDashArray,
            pathData: node.pathData,
            rx: node.rx,
            ...node.metadata,
          },
        })) || [];

      // Build a set of valid shapeIds for filtering orphaned connections
      const validShapeIds = new Set(shapes.map((s: any) => s.shapeId));

      const transformedDiagramState = {
        shapes,
        connections: (
          expectedDiagramState?.links?.map((link: any) => ({
            id: link.id || `${link.source}-${link.target}`,
            sourceShapeId: link.source,
            targetShapeId: link.target,
            type: link.type || "arrow",
            label: link.label || "",
            metadata: { waypoints: link.waypoints || [] },
          })) || []
        ).filter(
          (conn: any) =>
            validShapeIds.has(conn.sourceShapeId) &&
            validShapeIds.has(conn.targetShapeId),
        ),
        metadata: {},
      };

      console.log(
        "Transformed diagram state for backend:",
        transformedDiagramState,
      );

      // Sanitize hints: trim whitespace, filter empty hints
      const sanitizedHints = hints
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      // Only include hints if there are valid ones
      const hintsToSave =
        sanitizedHints.length > 0 ? sanitizedHints : undefined;

      await labApi.saveDiagramTest(labId, pageId, {
        prompt: prompt.trim(),
        expectedDiagramState: transformedDiagramState,
        additionalSubCatArchTypes:
          additionalSubCatArchTypes.length > 0
            ? additionalSubCatArchTypes
            : undefined,
        additionalNestedArchTypes:
          additionalNestedArchTypes.length > 0
            ? additionalNestedArchTypes
            : undefined,
        hints: hintsToSave, // Include sanitized hints
        isPreview: isPreviewDiagram,
      });

      notifications.show({
        title: "Success",
        message: "Diagram test saved successfully!",
        color: "green",
      });

      // Navigate back to lab detail page with tab and page params
      router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save diagram test.";
      const details =
        error?.response?.data?.errors || error?.response?.data?.details;

      notifications.show({
        title: "Error",
        message: details
          ? `${errorMessage}: ${JSON.stringify(details)}`
          : errorMessage,
        color: "red",
        autoClose: 8000,
      });
      console.error("Failed to save diagram test:", error);
      console.error("Error details:", error?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiagramTest = async () => {
    setIsDeleting(true);
    try {
      await labApi.deleteDiagramTest(labId, pageId);

      notifications.show({
        title: "Success",
        message: "Diagram test deleted successfully!",
        color: "green",
      });

      closeDeleteDiagramModal();
      // Navigate back to lab detail page
      router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete diagram test.";

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Student submission handler
  const handleStudentSubmit = async (submission: {
    questionAnswers?: Record<string, string>;
    diagramAnswer?: any;
    score: number;
    passed: boolean;
  }) => {
    if (!user?._id) {
      notifications.show({
        title: "Error",
        message: "You must be logged in to submit",
        color: "red",
      });
      return;
    }

    try {
      await labApi.submitTest(labId, pageId, {
        studentId: user._id,
        ...submission,
      });

      notifications.show({
        title: "Success",
        message: "Your test has been submitted successfully!",
        color: "green",
      });
    } catch (error: any) {
      console.error("Failed to submit test:", error);
      throw error; // Re-throw to be handled by StudentTestRunner
    }
  };

  // Search and filter questions
  const filteredQuestions = questions.filter((question) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      question.questionText.toLowerCase().includes(query) ||
      question.type.toLowerCase().includes(query) ||
      question.correctAnswer.toLowerCase().includes(query) ||
      question.options?.some((opt) => opt.toLowerCase().includes(query))
    );
  });

  // Pagination calculations (on filtered questions)
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // ===============================================
  // Auto-Show Question Form Feature (002-auto-show-question-form)
  // ===============================================
  // Automatically displays the question form when instructor lands on an empty page editor,
  // reducing clicks and saving 3-5 seconds per lab creation.
  //
  // T007: Derived state - determines if form should auto-display
  // Conditions: Page loaded (!loading) AND no questions (length === 0) AND user hasn't cancelled (!isFormCancelled)
  const shouldAutoShowForm =
    !loading && questions.length === 0 && !isFormCancelled;

  // T009: Auto-create empty question when shouldAutoShowForm becomes true
  // This triggers the form to display with an editable empty question
  useEffect(() => {
    if (shouldAutoShowForm && questions.length === 0) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        questionText: "",
        type: "MCQ",
        options: ["", "", "", ""],
        correctAnswer: "",
        isEditing: true, // Form is in edit mode
        isSaved: false, // Question not yet saved to backend
      };
      setQuestions([newQuestion]);
    }
  }, [shouldAutoShowForm]);
  // ===============================================

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  // Student mode - show test runner for students viewing published labs
  if (isStudent && isPublished) {
    // Transform questions for StudentTestRunner
    const transformedQuestions = questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      type: q.type,
      options: q.options
        ? q.options
          .filter((opt) => opt.trim())
          .map((opt) => ({ text: opt.trim() }))
        : [],
      correctAnswer: q.correctAnswer,
      isPreview: q.isPreview ?? false,
    }));

    const diagramTestForStudent = diagramTestData
      ? {
        id: diagramTestData.id || pageId,
        prompt: diagramTestData.prompt || "",
        architectureTypes: allArchitectureTypes, // Derived from lab categories
        expectedDiagramState: expectedDiagramState,
        hints: diagramTestData.hints, // Pass hints to student
        isPreview: diagramTestData.isPreview ?? false,
      }
      : undefined;

    return (
      <>
        {learningData && (
          <Container size="xl" pt="xl" pb={0}>
            <LearningMaterialViewer
              learningContent={learningData.learningContent}
              learningVideoUrl={learningData.learningVideoUrl}
              learningLinks={learningData.learningLinks}
              learningDiagramState={learningData.learningDiagramState}
            />
          </Container>
        )}
        <StudentTestRunner
          labId={labId}
          pageId={pageId}
          questions={transformedQuestions}
          diagramTest={diagramTestForStudent}
          isPreviewMode={isPreviewRequest}
          onSubmit={handleStudentSubmit}
        />
      </>
    );
  }

  return (
    <>
      <FullPageOverlay visible={isCreatingPage} />
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <Button variant="subtle" onClick={handleBackToTestsAndQuestions}>
            ← Back to Lab
          </Button>
        </Group>

        {/* Pagination Controls - Show only if multiple pages exist (Feature 004) */}
        {totalLabPages > 1 && (
          <Paper shadow="xs" p="md" mb="lg" withBorder>
            <Group justify="space-between" align="center">
              {/* Page Position Indicator (US1) */}
              <Text size="sm" fw={500}>
                Page {currentPageNumber} of {totalLabPages}
              </Text>

              {/* Pagination Component (US2, US4, US5, US6) */}
              <Pagination
                total={totalLabPages}
                value={currentPageNumber}
                onChange={debouncedPageChange}
                disabled={isNavigating || isMappingLoading}
                siblings={isMobile ? 0 : 1}
                boundaries={isMobile ? 1 : 2}
                size={isMobile ? "sm" : "md"}
                aria-label="Page navigation"
              />
            </Group>
          </Paper>
        )}

        <Paper shadow="sm" p="xl" withBorder>
          <Tabs defaultValue="question-test">
            <Tabs.List>
              <Tabs.Tab value="question-test">Question Test</Tabs.Tab>
              <Tabs.Tab value="diagram-test">Diagram Test</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="question-test" pt="md">
              <Stack gap="xl">
                {/* Back to Tests & Questions Button */}
                <Group justify="flex-start">
                  <Button
                    variant="subtle"
                    onClick={handleBackToTestsAndQuestions}
                    leftSection="←"
                  >
                    Back to Tests & Questions
                  </Button>
                </Group>

                {/* Questions Section Header with Add Button */}
                {canEditContent && (
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="lg" fw={600}>
                        Questions ({filteredQuestions.length}/{questions.length}
                        )
                      </Text>
                      <Text size="sm" c="dimmed">
                        {searchQuery
                          ? `Showing ${filteredQuestions.length} of ${questions.length} questions`
                          : "Add up to 30 questions for this page"}
                      </Text>
                    </Box>
                    <Button
                      variant="outline"
                      onClick={addQuestion}
                      leftSection="+"
                      disabled={questions.length >= 30}
                    >
                      Add Question
                    </Button>
                  </Group>
                )}

                {/* Search Bar */}
                {questions.length > 0 && (
                  <TextInput
                    placeholder="Search questions by text, type, answer, or options..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                      searchQuery && (
                        <ActionIcon
                          variant="subtle"
                          onClick={() => setSearchQuery("")}
                          size="sm"
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      )
                    }
                    size="md"
                  />
                )}

                {/* Questions List */}
                {questions.length === 0 ? (
                  <Paper
                    shadow="sm"
                    p="xl"
                    withBorder
                    bg="gray.0"
                    data-testid="empty-state"
                  >
                    <Stack align="center" gap="md">
                      <Text size="xl" c="dimmed">
                        No questions yet
                      </Text>
                      <Text c="dimmed" ta="center">
                        Click "Add Question" above to create your first question
                      </Text>
                    </Stack>
                  </Paper>
                ) : filteredQuestions.length === 0 ? (
                  <Paper shadow="sm" p="xl" withBorder bg="gray.0">
                    <Stack align="center" gap="md">
                      <IconSearch size={48} color="gray" />
                      <Text size="xl" c="dimmed">
                        No questions found
                      </Text>
                      <Text c="dimmed" ta="center">
                        No questions match your search "{searchQuery}"
                      </Text>
                      <Button
                        variant="subtle"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </Stack>
                  </Paper>
                ) : (
                  <Stack gap="xl">
                    {paginatedQuestions.map((question) => {
                      // Calculate the actual question number from the original list
                      const originalIndex = questions.findIndex(
                        (q) => q.id === question.id,
                      );
                      const questionNumber = originalIndex + 1;
                      const isEditable =
                        canEditContent &&
                        (question.isEditing || !question.isSaved);
                      return (
                        <Paper
                          key={question.id}
                          p="lg"
                          withBorder
                          data-testid={
                            !question.isSaved ? "auto-question-form" : undefined
                          }
                          data-auto-displayed={
                            !question.isSaved ? "true" : undefined
                          }
                        >
                          <Group justify="space-between" mb="md">
                            <Group gap="xs">
                              <Text fw={600}>Question {questionNumber}</Text>
                              {question.isSaved && (
                                <Badge size="sm" color="green" variant="light">
                                  Saved
                                </Badge>
                              )}
                              {question.isSaved && question.isPreview && (
                                <Badge size="sm" color="orange" variant="light">
                                  👁 Preview
                                </Badge>
                              )}
                            </Group>
                            <Group gap="xs">
                              {canEditContent && question.isSaved && (
                                <Switch
                                  size="xs"
                                  label="Preview"
                                  checked={question.isPreview ?? false}
                                  onChange={(e) => {
                                    updateQuestion(
                                      question.id,
                                      "isPreview",
                                      e.currentTarget.checked,
                                    );
                                    // Auto-save the preview toggle change
                                    const updatedQuestion = {
                                      ...question,
                                      isPreview: e.currentTarget.checked,
                                    };
                                    const optionsArray =
                                      updatedQuestion.type === "MCQ"
                                        ? updatedQuestion.options
                                          .filter((opt) => opt.trim())
                                          .map((opt) => ({
                                            text: opt.trim(),
                                          }))
                                        : updatedQuestion.type === "True/False"
                                          ? [
                                            { text: "True" },
                                            { text: "False" },
                                          ]
                                          : [];
                                    labApi
                                      .saveQuestion(labId, pageId, {
                                        type: updatedQuestion.type,
                                        questionText:
                                          updatedQuestion.questionText.trim(),
                                        options: optionsArray,
                                        correctAnswer:
                                          updatedQuestion.correctAnswer.trim(),
                                        questionId: updatedQuestion.id,
                                        isPreview: e.currentTarget.checked,
                                      })
                                      .catch(() => {
                                        notifications.show({
                                          title: "Error",
                                          message:
                                            "Failed to update preview status",
                                          color: "red",
                                        });
                                      });
                                  }}
                                />
                              )}
                              {canEditContent &&
                                question.isSaved &&
                                !question.isEditing && (
                                  <Button
                                    size="xs"
                                    variant="subtle"
                                    onClick={() =>
                                      toggleEditQuestion(question.id)
                                    }
                                  >
                                    Edit
                                  </Button>
                                )}
                              {canEditContent && (
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() =>
                                    confirmDeleteQuestion(
                                      question.id,
                                      question.isSaved || false,
                                    )
                                  }
                                  title="Delete Question"
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>
                              )}
                            </Group>
                          </Group>

                          <Stack gap="md">
                            <Box>
                              <Group gap="xs" mb={4}>
                                <Text size="sm" fw={500}>
                                  Question Text{" "}
                                  <span style={{ color: "red" }}>*</span>
                                </Text>
                                {isEditable && (
                                  <AISuggestionButton
                                    prompt={() =>
                                      buildQuestionAIPrompt(
                                        question.questionText,
                                        question.type,
                                      )
                                    }
                                    label="Generate answer with AI"
                                    disabled={
                                      !question.questionText.trim() ||
                                      question.questionText.trim().length < 10
                                    }
                                    onEmptyPrompt={() => {
                                      notifications.show({
                                        title: "Question Required",
                                        message:
                                          "Please enter a question (at least 10 characters) before generating an answer.",
                                        color: "orange",
                                      });
                                    }}
                                    onSuggestion={(suggestion) => {
                                      const result =
                                        parseAIQuestionResponse(suggestion);
                                      if (result) {
                                        // Batch both options + correctAnswer into a single state update
                                        // to avoid stale closure overwrite (updateQuestion reads from
                                        // the same snapshot, so sequential calls drop earlier updates)
                                        setQuestions((prev) =>
                                          prev.map((q) => {
                                            if (q.id !== question.id) return q;
                                            const updates: Partial<Question> = {
                                              correctAnswer:
                                                result.correctAnswer,
                                            };
                                            if (
                                              question.type === "MCQ" &&
                                              result.options
                                            ) {
                                              updates.options = result.options;
                                            }
                                            if (
                                              question.type === "True/False"
                                            ) {
                                              updates.options = [
                                                "True",
                                                "False",
                                              ];
                                            }
                                            return { ...q, ...updates };
                                          }),
                                        );
                                        notifications.show({
                                          title: "Answer Generated",
                                          message: `AI generated the ${question.type === "MCQ" ? "options and " : ""}correct answer.`,
                                          color: "teal",
                                        });
                                      } else {
                                        notifications.show({
                                          title: "Generation Failed",
                                          message:
                                            "Could not parse the AI response. Please try again.",
                                          color: "red",
                                        });
                                      }
                                    }}
                                  />
                                )}
                              </Group>
                              <Textarea
                                placeholder="Enter question text (minimum 10 characters) to enable the AI suggestion feature"
                                value={question.questionText}
                                onChange={(e) =>
                                  updateQuestion(
                                    question.id,
                                    "questionText",
                                    e.target.value,
                                  )
                                }
                                required
                                disabled={!isEditable}
                                minRows={2}
                                autoFocus={!question.isSaved}
                                data-testid="question-text-input"
                                aria-label="Question text"
                                aria-required="true"
                                description="Must be unique within this lab - less than 85% similar to other questions (10-1000 characters)"
                              />
                            </Box>

                            <Select
                              label="Question Type"
                              data={QUESTION_TYPES}
                              value={question.type}
                              onChange={(value) =>
                                updateQuestion(
                                  question.id,
                                  "type",
                                  value || "MCQ",
                                )
                              }
                              required
                              disabled={!isEditable}
                            />

                            {question.type === "MCQ" && (
                              <Box>
                                <Group justify="space-between" mb={8}>
                                  <Box>
                                    <Text size="sm" fw={500}>
                                      Options{" "}
                                      <span style={{ color: "red" }}>*</span>
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      Enter at least 2 options
                                    </Text>
                                  </Box>
                                  {isEditable &&
                                    question.options.length < 10 && (
                                      <Button
                                        size="xs"
                                        variant="subtle"
                                        onClick={() => {
                                          const newOptions = [
                                            ...question.options,
                                            "",
                                          ];
                                          updateQuestion(
                                            question.id,
                                            "options",
                                            newOptions,
                                          );
                                        }}
                                      >
                                        + Add Option
                                      </Button>
                                    )}
                                </Group>
                                <Stack gap="xs">
                                  {question.options.map((option, index) => (
                                    <Group
                                      key={`${question.id}-option-${index}`}
                                      gap="xs"
                                    >
                                      <TextInput
                                        placeholder={`Option ${index + 1}`}
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...question.options,
                                          ];
                                          newOptions[index] = e.target.value;
                                          updateQuestion(
                                            question.id,
                                            "options",
                                            newOptions,
                                          );
                                        }}
                                        required
                                        disabled={!isEditable}
                                        style={{ flex: 1 }}
                                      />
                                      {isEditable &&
                                        question.options.length > 2 && (
                                          <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => {
                                              const newOptions =
                                                question.options.filter(
                                                  (_, i) => i !== index,
                                                );
                                              updateQuestion(
                                                question.id,
                                                "options",
                                                newOptions,
                                              );
                                            }}
                                            title="Remove option"
                                          >
                                            <IconX size={16} />
                                          </ActionIcon>
                                        )}
                                    </Group>
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            <TextInput
                              label="Correct Answer / Solution"
                              placeholder="Enter correct answer"
                              value={question.correctAnswer}
                              onChange={(e) =>
                                updateQuestion(
                                  question.id,
                                  "correctAnswer",
                                  e.target.value,
                                )
                              }
                              required
                              disabled={!isEditable}
                            />

                            {isEditable && (
                              <Group justify="flex-end" mt="sm">
                                {question.isSaved && (
                                  <Button
                                    variant="subtle"
                                    size="sm"
                                    onClick={() =>
                                      toggleEditQuestion(question.id)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                                {!question.isSaved && (
                                  <Button
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => {
                                      // T011: Cancel handler - set isFormCancelled flag and clear unsaved question
                                      setIsFormCancelled(true);
                                      setQuestions(
                                        questions.filter(
                                          (q) => q.id !== question.id,
                                        ),
                                      );
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    saveIndividualQuestion(question.id)
                                  }
                                  loading={savingQuestionId === question.id}
                                >
                                  Save Question
                                </Button>
                              </Group>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}

                    {totalPages > 1 && (
                      <Group justify="center">
                        <Pagination
                          total={totalPages}
                          value={currentPage}
                          onChange={setCurrentPage}
                          size="md"
                        />
                      </Group>
                    )}
                  </Stack>
                )}

                {/* Practice Test Configuration */}
                <Divider
                  label="Practice Test Configuration"
                  labelPosition="center"
                />

                {canEditContent && (
                  <Group>
                    <Switch
                      checked={enablePracticeTest}
                      onChange={(event) =>
                        setEnablePracticeTest(event.currentTarget.checked)
                      }
                      label="Enable Practice Test"
                    />
                  </Group>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="diagram-test" pt="md">
              <Stack gap="md">
                {/* Back to Tests & Questions Button */}
                <Group justify="flex-start">
                  <Button
                    variant="subtle"
                    onClick={handleBackToTestsAndQuestions}
                    leftSection="←"
                  >
                    Back to Tests & Questions
                  </Button>
                </Group>

                <Box>
                  <Group gap="xs" mb={4}>
                    <Text size="sm" fw={500}>
                      Prompt <span style={{ color: "red" }}>*</span>
                    </Text>
                    {canEditContent && (
                      <>
                        <AISuggestionButton
                          prompt={() =>
                            buildDiagramAIPrompt(prompt, architectureType, [
                              ...additionalSubCatArchTypes,
                              ...additionalNestedArchTypes,
                            ])
                          }
                          label="Generate diagram from prompt with AI"
                          disabled={!prompt.trim() || isDiagramValidating}
                          onEmptyPrompt={() => {
                            notifications.show({
                              title: "Missing Information",
                              message: "Please enter a prompt first.",
                              color: "orange",
                            });
                          }}
                          onSuggestion={async (suggestion) => {
                            // Pass 1: Parse and render immediately
                            const pass1 = parseAIDiagramResponse(
                              suggestion,
                              architectureType,
                            );
                            if (!pass1) {
                              notifications.show({
                                title: "Generation Failed",
                                message:
                                  "Could not parse the AI response into a diagram. Please try again.",
                                color: "red",
                              });
                              return;
                            }
                            setExpectedDiagramState(pass1);
                            notifications.show({
                              title: "Diagram Generated",
                              message: `Created ${pass1.nodes.length} nodes and ${pass1.links.length} connections. Validating...`,
                              color: "blue",
                            });

                            // Pass 2: Validate and auto-correct via AI
                            setIsDiagramValidating(true);
                            try {
                              const originalPrompt = buildDiagramAIPrompt(
                                prompt,
                                architectureType,
                                [
                                  ...additionalSubCatArchTypes,
                                  ...additionalNestedArchTypes,
                                ],
                              );
                              const messages = buildDiagramValidationPrompt(
                                originalPrompt,
                                suggestion,
                              );
                              const response =
                                await AISuggestions.getSuggestionByAI({
                                  messages,
                                  aiModel: selectedAI,
                                  modelVersion: selectedModel,
                                });
                              if (
                                response.status === 200 &&
                                response.data?.suggestion
                              ) {
                                const validationResult =
                                  parseAIValidationResponse(
                                    response.data.suggestion,
                                    architectureType,
                                  );
                                if (validationResult) {
                                  setExpectedDiagramState(
                                    validationResult.diagram,
                                  );
                                  setValidationIssues(validationResult.issues);
                                  setValidationSummary(
                                    validationResult.summary,
                                  );

                                  // Show modal if there are issues
                                  if (validationResult.issues.length > 0) {
                                    openValidationModal();
                                    notifications.show({
                                      title: "Diagram Validated",
                                      message: `Found ${validationResult.issues.length} issue(s). Click to review.`,
                                      color: "yellow",
                                    });
                                  } else {
                                    notifications.show({
                                      title: "Diagram Validated",
                                      message:
                                        "AI reviewed and corrected the diagram for accuracy.",
                                      color: "teal",
                                    });
                                  }
                                }
                              }
                            } catch (err: unknown) {
                              const msg = (
                                err as {
                                  response?: { data?: { message?: string } };
                                }
                              )?.response?.data?.message;
                              notifications.show({
                                title: "Validation Skipped",
                                message:
                                  msg ??
                                  "Could not run validation pass — diagram may have minor issues.",
                                color: "yellow",
                              });
                            } finally {
                              setIsDiagramValidating(false);
                            }
                          }}
                        />
                        {isDiagramValidating && (
                          <Text size="xs" c="dimmed">
                            Validating diagram...
                          </Text>
                        )}
                      </>
                    )}
                  </Group>
                  <Textarea
                    description="Instructions for students (10-2000 characters)"
                    placeholder="Describe what diagram students should create..."
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                    disabled={!canEditContent}
                  />
                </Box>

                {/* Hints Editor - Optional hints for students */}
                <HintsEditor
                  hints={hints}
                  onUpdate={(updatedHints) => {
                    setHints(updatedHints);
                    console.log("Hints updated:", updatedHints);
                  }}
                  disabled={!canEditContent}
                />

                {/* Instructor Information Accordion */}
                <Accordion
                  transitionDuration={1000}
                  styles={{
                    root: {
                      backgroundColor: "#e7f5ff",
                      borderRadius: "8px",
                      border: "1px solid #339af0",
                    },
                    item: {
                      border: "none",
                    },
                    control: {
                      padding: "12px 16px",
                      "&:hover": {
                        backgroundColor: "#d0ebff",
                      },
                    },
                    content: {
                      padding: "0 16px 16px 16px",
                    },
                  }}
                >
                  <Accordion.Item value="instructor-info">
                    <Accordion.Control>
                      <Group gap="xs">
                        <Text size="sm" fw={600} c="blue.9">
                          💡 How Diagram Tests Work
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        <Text size="xs" c="blue.9">
                          <strong>What You Do:</strong> Create the correct
                          diagram below by placing shapes inside containers
                          (VPC, Namespace, Zones) and connecting them with
                          arrows.
                        </Text>
                        <Text size="xs" c="blue.9">
                          <strong>What Students See:</strong> Your diagram is
                          automatically jumbled - shapes are scattered randomly
                          outside containers with no arrow connections.
                        </Text>
                        <Text size="xs" c="blue.9">
                          <strong>What Students Must Do:</strong> Reconstruct
                          your exact diagram by (1) dragging shapes INTO the
                          correct containers, and (2) drawing correct arrow
                          connections.
                        </Text>
                        <Text size="xs" c="blue.9">
                          <strong>Grading:</strong> Students are graded on both{" "}
                          <strong>nesting</strong> (50% - shapes in correct
                          containers) and <strong>connections</strong> (50% -
                          correct arrows). They must achieve 100% to pass.
                        </Text>
                        <Group gap="xs" mt="xs">
                          <Badge size="sm" color="blue" variant="light">
                            Tip: Use 5-10 shapes for best results
                          </Badge>
                          <Badge size="sm" color="blue" variant="light">
                            Make containers large enough (400×300+)
                          </Badge>
                          <Badge size="sm" color="blue" variant="light">
                            Use clear labels
                          </Badge>
                        </Group>
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>

                <Box>
                  <Text size="sm" fw={500} mb={8}>
                    Diagram Editor
                  </Text>
                  <Text size="xs" c="dimmed" mb={8}>
                    Drag shapes onto the canvas to create your expected diagram.
                    Add more shape libraries below.
                  </Text>

                  {canEditContent && (
                    <Group grow mb="md">
                      <MultiSelect
                        label="Additional Sub Categories"
                        description={`Add up to ${MAX_ADDITIONAL_SELECTIONS} extra sub-category shape libraries`}
                        placeholder="Select additional sub-categories"
                        data={getArchitectureSelectOptions(
                          L2_ARCHITECTURE_TYPES,
                          architectureType,
                        )}
                        value={additionalSubCatArchTypes}
                        onChange={(val) =>
                          setAdditionalSubCatArchTypes(
                            val.slice(0, MAX_ADDITIONAL_SELECTIONS),
                          )
                        }
                        maxValues={MAX_ADDITIONAL_SELECTIONS}
                        searchable
                        clearable
                      />
                      <MultiSelect
                        label="Additional Topics"
                        description={`Add up to ${MAX_ADDITIONAL_SELECTIONS} extra topic shape libraries`}
                        placeholder="Select additional topics"
                        data={getArchitectureSelectOptions(
                          L3_ARCHITECTURE_TYPES,
                          architectureType,
                        )}
                        value={additionalNestedArchTypes}
                        onChange={(val) =>
                          setAdditionalNestedArchTypes(
                            val.slice(0, MAX_ADDITIONAL_SELECTIONS),
                          )
                        }
                        maxValues={MAX_ADDITIONAL_SELECTIONS}
                        searchable
                        clearable
                      />
                    </Group>
                  )}

                  <Group align="flex-start" gap="md">
                    {/* Canvas - DiagramEditor */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <>
                        {isMobile && canEditContent && (
                          <Alert
                            icon={<IconDeviceDesktop size={16} />}
                            title="Screen Too Small"
                            color="blue"
                            mb="md"
                          >
                            Creating diagrams on mobile is difficult. We suggest
                            updating the diagram from a larger screen.
                          </Alert>
                        )}
                        <DiagramEditor
                          initialGraph={expectedDiagramState}
                          mode={canEditContent ? "instructor" : "student"}
                          architectureTypes={allArchitectureTypes}
                          onGraphChange={(graph) => {
                            setExpectedDiagramState(graph);
                          }}
                          className="diagram-editor"
                        />
                      </>
                    </Box>
                  </Group>
                </Box>

                <Group justify="space-between">
                  {canEditContent && (
                    <Group>
                      <Button
                        variant="subtle"
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={openDeleteDiagramModal}
                        loading={saving}
                      >
                        Delete Test
                      </Button>
                      <Switch
                        label="Mark as Preview"
                        checked={isPreviewDiagram}
                        onChange={(e) =>
                          setIsPreviewDiagram(e.currentTarget.checked)
                        }
                        description="Allow students to try this test before purchasing"
                      />
                    </Group>
                  )}

                  {canEditContent && (
                    <Group>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/labs/${labId}`)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveDiagramTest} loading={saving}>
                        Save Diagram Test
                      </Button>
                    </Group>
                  )}

                  {!canEditContent && (
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/labs/${labId}`)}
                    >
                      Back to Lab
                    </Button>
                  )}
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>

        {/* Delete Question Confirmation Modal */}
        <Modal
          opened={deleteQuestionModalOpened}
          onClose={closeDeleteQuestionModal}
          title="Delete Question"
          centered
        >
          <Stack>
            <Text>Are you sure you want to delete this question?</Text>
            <Text size="sm" c="dimmed">
              This action cannot be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeDeleteQuestionModal}>
                Cancel
              </Button>
              <Button color="red" onClick={removeQuestion} loading={isDeleting}>
                Delete Question
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Delete Diagram Test Confirmation Modal */}
        <Modal
          opened={deleteDiagramModalOpened}
          onClose={closeDeleteDiagramModal}
          title="Delete Diagram Test"
          centered
        >
          <Stack>
            <Text>Are you sure you want to delete this diagram test?</Text>
            <Text size="sm" c="dimmed">
              This action cannot be undone. The expected diagram state will be
              permanently deleted.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeDeleteDiagramModal}>
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDeleteDiagramTest}
                loading={isDeleting}
              >
                Delete Diagram Test
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Validation Summary Modal */}
        <Modal
          opened={validationModalOpened}
          onClose={closeValidationModal}
          title="Diagram Validation Summary"
          size="lg"
        >
          <Stack gap="md">
            <Alert
              color={
                validationIssues.some((i) => i.severity === "error")
                  ? "red"
                  : validationIssues.some((i) => i.severity === "warning")
                    ? "yellow"
                    : "teal"
              }
              title={validationSummary}
            >
              {validationIssues.length === 0
                ? "No issues found. The diagram is ready to use."
                : `Found ${validationIssues.length} issue(s) during validation.`}
            </Alert>

            {validationIssues.length > 0 && (
              <Stack gap="xs">
                <Text fw={500}>Issues Found:</Text>
                {validationIssues.map((issue, idx) => (
                  <Paper
                    key={`${issue.severity}-${issue.category}-${idx}`}
                    p="sm"
                    withBorder
                    style={{
                      borderLeft: `4px solid ${issue.severity === "error"
                        ? "var(--mantine-color-red-6)"
                        : issue.severity === "warning"
                          ? "var(--mantine-color-yellow-6)"
                          : "var(--mantine-color-blue-6)"
                        }`,
                    }}
                  >
                    <Group gap="xs" mb={4}>
                      <Badge
                        size="sm"
                        color={
                          issue.severity === "error"
                            ? "red"
                            : issue.severity === "warning"
                              ? "yellow"
                              : "blue"
                        }
                      >
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <Text size="sm" fw={500}>
                        {issue.category}
                      </Text>
                    </Group>
                    <Text size="sm">{issue.message}</Text>
                    {issue.affectedNodes && issue.affectedNodes.length > 0 && (
                      <Text size="xs" c="dimmed" mt={4}>
                        Affected: {issue.affectedNodes.join(", ")}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  const issueText = validationIssues
                    .map(
                      (i) =>
                        `[${i.severity.toUpperCase()}] ${i.category}: ${i.message}${i.affectedNodes?.length
                          ? ` (Nodes: ${i.affectedNodes.join(", ")})`
                          : ""
                        }`,
                    )
                    .join("\n");
                  navigator.clipboard.writeText(
                    `Validation Summary: ${validationSummary}\n\n${issueText || "No issues found."}`,
                  );
                  notifications.show({
                    title: "Copied",
                    message: "Validation summary copied to clipboard",
                    color: "teal",
                  });
                }}
                leftSection={<IconDeviceDesktop size={16} />}
              >
                Copy to Clipboard
              </Button>
              <Button onClick={closeValidationModal}>Close</Button>
            </Group>
          </Stack>
        </Modal>
      </Container>
    </>
  );
};

export default LabPageEditorPage;

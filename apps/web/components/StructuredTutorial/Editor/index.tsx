"use client";

import {
    Box,
    Button,
    Divider,
    Grid,
    Group,
    Paper,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { MantineLoader } from "@whatsnxt/core-ui";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FullPageOverlay } from "@/components/Common/FullPageOverlay";
import { CategoryAPI } from "../../../apis/v1/blog";
import {
    StructuredTutorialAPI,
    type TutorialSection,
} from "../../../apis/v1/blog/structuredTutorialApi";
import { uploadImage } from "../../Blog/Form/util";
import { QuizEditor } from "../../Quiz/QuizEditor";
import { PostForm, type PostFormAiContext } from "./PostForm";
import { ReusePostDialog } from "./ReusePostDialog";
import { ReuseSectionDialog } from "./ReuseSectionDialog";
import { SectionForm } from "./SectionForm";
import { TreeNavigator } from "./TreeNavigator";
import { TutorialMetadataForm } from "./TutorialMetadataForm";
import type { LocalPost, LocalSection, SelectedNode, TreeNode } from "./types";

export const StructuredTutorialEditor: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editTutorialId = searchParams?.get("id");

    // State
    const [tutorialData, setTutorialData] = useState<any>(null);
    const [sections, setSections] = useState<LocalSection[]>([]);
    const [categories, setCategories] = useState<
        Array<{ value: string; label: string }>
    >([]);
    const [categoriesData, setCategoriesData] = useState<any[]>([]); // Raw category data with subcategories
    const [selectedNode, setSelectedNode] = useState<SelectedNode>({
        type: "tutorial",
        id: null,
    });
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [isVisible, { open, close }] = useDisclosure(false);
    const [isSaving, setIsSaving] = useState(false);
    const [reuseSectionDialogOpen, setReuseSectionDialogOpen] = useState(false);
    const [reusePostDialogOpen, setReusePostDialogOpen] = useState(false);
    const [currentSectionIdForPost, setCurrentSectionIdForPost] = useState<
        string | null
    >(null);

    // Load tutorial data on mount (if editing)
    useEffect(() => {
        const fetchData = async () => {
            open();
            try {
                // Fetch categories (always needed)
                try {
                    const categoriesData = await CategoryAPI.getCategories();
                    console.log("🚀 :: fetchData :: categoriesData:", categoriesData);

                    if (categoriesData && Array.isArray(categoriesData)) {
                        // Store raw data for subcategory filtering
                        setCategoriesData(categoriesData);

                        // Create dropdown options (only main categories)
                        const categoryOptions = categoriesData.map((cat: any) => ({
                            value: cat.categoryName,
                            label: cat.categoryName,
                        }));

                        setCategories(categoryOptions);
                    } else {
                        setCategories([]);
                        setCategoriesData([]);
                    }
                } catch (error) {
                    console.error("Error fetching categories:", error);
                    setCategories([]);
                    setCategoriesData([]);
                }

                // Only fetch tutorial data if editing (editTutorialId exists)
                if (editTutorialId) {
                    try {
                        const tutorialRes =
                            await StructuredTutorialAPI.getById(editTutorialId);
                        console.log("🚀 :: fetchData :: tutorialRes:", tutorialRes);
                        if (tutorialRes.success && tutorialRes.data) {
                            const tutorial = tutorialRes.data;
                            setTutorialData(tutorial);

                            // Use populated sections from tutorial response if available
                            let sectionsData = tutorial.sectionIds;

                            // If not populated (just IDs) or missing, fetch separate
                            if (
                                !sectionsData ||
                                (sectionsData.length > 0 && typeof sectionsData[0] === "string")
                            ) {
                                const sectionsRes =
                                    await StructuredTutorialAPI.getSections(editTutorialId);
                                if (sectionsRes.success && sectionsRes.data) {
                                    sectionsData = sectionsRes.data;
                                }
                            }

                            if (sectionsData) {
                                const mappedSections: LocalSection[] = sectionsData.map(
                                    (s: any) => ({
                                        id: s._id || s.id,
                                        title: s.title,
                                        description: s.description || "",
                                        icon: s.icon || "IconFolder",
                                        order: s.order,
                                        isFreePreview: s.isFreePreview || false,
                                        isReused: s.isReused,
                                        sourceId: s.sourceId,
                                        posts: (s.postIds || []).map((p: any) => ({
                                            id: p._id || p.id,
                                            title: p.title,
                                            description:
                                                p.lexicalState ||
                                                p.content?.lexicalState ||
                                                p.description ||
                                                "",
                                            contentFormat: p.contentFormat || "HTML",
                                            postType: p.postType || "CONTENT",
                                            mcqData: p.mcqData,
                                            order: p.order,
                                            isReused: p.isReused,
                                            sourceId: p.sourceId,
                                        })),
                                    }),
                                );
                                setSections(mappedSections);

                                // Auto-expand all sections
                                const allSectionIds = new Set(mappedSections.map((s) => s.id!));
                                setExpandedNodes(allSectionIds);
                            }
                        }
                    } catch (error) {
                        console.error("Error loading tutorial data:", error);
                        notifications.show({
                            title: "Error",
                            message: "Failed to load tutorial data",
                            color: "red",
                        });
                    }
                }
            } catch (error) {
                console.error("Error loading categories:", error);
                notifications.show({
                    title: "Error",
                    message: "Failed to load categories",
                    color: "red",
                });
            } finally {
                close();
            }
        };

        fetchData();
    }, [editTutorialId]);

    // Build tree structure for navigator
    const buildTreeNodes = (): TreeNode[] => {
        return sections.map((section) => ({
            id: section.id!,
            type: "section",
            title: section.title,
            isExpanded: expandedNodes.has(section.id!),
            isReused: section.isReused,
            order: section.order,
            children: section.posts.map((post) => ({
                id: post.id!,
                type: post.postType === "MCQ" ? "mcq" : "post",
                title: post.title,
                isReused: post.isReused,
                order: post.order,
            })),
        }));
    };

    // Handlers
    const handleToggleExpand = (nodeId: string) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    const handleSaveTutorial = async (data: any, imageFile?: File | null, aiImageAsset?: {
        imageUrl: string;
        cloudinaryAsset: { public_id: string; url: string; secure_url: string; format: string; resource_type: string };
    } | null) => {
        setIsSaving(true);
        try {
            let imageUrl = tutorialData?.imageUrl || "";
            let cloudinaryAssets: any[] = tutorialData?.cloudinaryAssets || [];

            if (imageFile) {
                const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API;
                const { secure_url, asset } = await uploadImage(
                    imageFile,
                    "whatsnxt",
                    false,
                    bffApiUrl,
                );
                if (secure_url && asset) {
                    imageUrl = secure_url;
                    cloudinaryAssets = [asset];
                }
            } else if (aiImageAsset) {
                imageUrl = aiImageAsset.imageUrl;
                cloudinaryAssets = [aiImageAsset.cloudinaryAsset];
            }

            let response;
            if (editTutorialId) {
                response = await StructuredTutorialAPI.update(editTutorialId, {
                    ...data,
                    imageUrl,
                    cloudinaryAssets,
                });
            } else {
                response = await StructuredTutorialAPI.create({
                    ...data,
                    imageUrl,
                    cloudinaryAssets,
                });
            }

            if (response?.success) {
                setTutorialData(response.data);
                notifications.show({
                    title: "Success",
                    message: editTutorialId ? "Tutorial updated" : "Tutorial created",
                    color: "green",
                });

                // Redirect to history table
                router.push("/history/table");
            }
        } catch (error: any) {
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
                    title: "Error",
                    message: error?.message || "Failed to save tutorial",
                    color: "red",
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSection = () => {
        const newSection: LocalSection = {
            id: `temp-${Date.now()}`,
            title: "New Section",
            description: "",
            icon: "IconFolder",
            posts: [],
        };
        setSections([...sections, newSection]);
        setSelectedNode({ type: "section", id: newSection.id });
        setExpandedNodes((prev) => new Set([...prev, newSection.id!]));
    };

    const handleSectionChange = (data: Partial<any>) => {
        const sectionId = selectedNode.id;
        if (!sectionId) return;

        // Update local state in real-time (optimistic update)
        setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, ...data } : s)),
        );
    };

    const handlePostChange = (data: Partial<any>, targetSectionId?: string, targetPostId?: string) => {
        const postId = targetPostId || selectedNode.id;
        const sectionId = targetSectionId || selectedNode.sectionId;
        if (!postId || !sectionId) return;

        // Update local state in real-time (optimistic update)
        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        posts: s.posts.map((p) =>
                            p.id === postId ? { ...p, ...data } : p,
                        ),
                    }
                    : s,
            ),
        );
    };

    const handleSaveSection = async (data: any) => {
        if (!editTutorialId && !tutorialData?._id) {
            notifications.show({
                title: "Error",
                message: "Please save tutorial info first",
                color: "orange",
            });
            return;
        }

        const tutorialId = editTutorialId || tutorialData._id;
        setIsSaving(true);

        try {
            const sectionId = selectedNode.id;
            const isNew = !sectionId || sectionId.startsWith("temp-");

            let response;
            if (isNew) {
                response = await StructuredTutorialAPI.createSection(tutorialId, data);

                if (response?.newTutorialId) {
                    // Backend created a draft copy - redirect to it
                    router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
                    return;
                }

                if (response?.success) {
                    // Replace temp section with real one
                    setSections((prev) =>
                        prev.map((s) =>
                            s.id === sectionId ? { ...s, ...data, id: response.data._id } : s,
                        ),
                    );
                    setSelectedNode({ type: "section", id: response.data._id });
                }
            } else {
                response = await StructuredTutorialAPI.updateSection(
                    tutorialId,
                    sectionId!,
                    data,
                );

                // Check if backend created a draft copy
                if (response?.newTutorialId) {
                    // Redirect to the new draft
                    router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
                    return;
                }

                if (response?.success) {
                    setSections((prev) =>
                        prev.map((s) => (s.id === sectionId ? { ...s, ...data } : s)),
                    );
                }
            }

            // Don't show success notification for auto-save (too noisy)
        } catch (error: any) {
            notifications.show({
                title: "Error",
                message: error?.message || "Failed to save section",
                color: "red",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this section and all its posts?",
            )
        ) {
            return;
        }

        if (!sectionId.startsWith("temp-")) {
            const tutorialId = editTutorialId || tutorialData._id;
            try {
                const response = await StructuredTutorialAPI.deleteSection(
                    tutorialId,
                    sectionId,
                );

                // Check if backend created a draft copy
                if (response?.newTutorialId) {
                    // Redirect to the new draft
                    router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
                    return;
                }
            } catch (error) {
                notifications.show({
                    title: "Error",
                    message: "Failed to delete section",
                    color: "red",
                });
                return;
            }
        }

        setSections((prev) => prev.filter((s) => s.id !== sectionId));
        setSelectedNode({ type: "tutorial", id: null });
        notifications.show({
            title: "Success",
            message: "Section deleted",
            color: "green",
        });
    };

    const handleAddPost = async (sectionId: string) => {
        // Auto-save section if it has a temp ID
        let resolvedSectionId = sectionId;
        if (sectionId.startsWith("temp-")) {
            const realId = await ensureSectionSaved(sectionId);
            if (!realId) {
                notifications.show({
                    title: "Info",
                    message: "Please save the tutorial info first",
                    color: "orange",
                });
                return;
            }
            resolvedSectionId = realId;
        }

        const newPost: LocalPost = {
            id: `temp-${Date.now()}`,
            title: "New Post",
            description: "",
            contentFormat: "HTML",
        };

        setSections((prev) =>
            prev.map((s) =>
                s.id === resolvedSectionId ? { ...s, posts: [...s.posts, newPost] } : s,
            ),
        );

        setSelectedNode({
            type: "post",
            id: newPost.id,
            sectionId: resolvedSectionId,
        });
        setExpandedNodes((prev) => new Set([...prev, resolvedSectionId]));
    };

    const handleAddMCQ = async (sectionId: string) => {
        // Auto-save section if it has a temp ID
        let resolvedSectionId = sectionId;
        if (sectionId.startsWith("temp-")) {
            const realId = await ensureSectionSaved(sectionId);
            if (!realId) {
                notifications.show({
                    title: "Info",
                    message: "Please save the tutorial info first",
                    color: "orange",
                });
                return;
            }
            resolvedSectionId = realId;
        }

        const newMCQ: LocalPost = {
            id: `temp-mcq-${Date.now()}`,
            title: "New MCQ Quiz",
            description: "",
            contentFormat: "HTML",
            postType: "MCQ",
            mcqData: {
                question: "",
                options: [
                    { id: "a", label: "A", text: "", isCorrect: false },
                    { id: "b", label: "B", text: "", isCorrect: false },
                    { id: "c", label: "C", text: "", isCorrect: false },
                    { id: "d", label: "D", text: "", isCorrect: false },
                ],
                explanation: "",
                difficulty: "MEDIUM",
            },
        };

        setSections((prev) =>
            prev.map((s) =>
                s.id === resolvedSectionId ? { ...s, posts: [...s.posts, newMCQ] } : s,
            ),
        );

        setSelectedNode({
            type: "mcq",
            id: newMCQ.id,
            sectionId: resolvedSectionId,
        });
        setExpandedNodes((prev) => new Set([...prev, resolvedSectionId]));
    };

    // Auto-save a temp section and return the real MongoDB ID
    const ensureSectionSaved = async (
        tempSectionId: string,
    ): Promise<string | null> => {
        if (!tempSectionId.startsWith("temp-")) return tempSectionId;

        const tutorialId = editTutorialId || tutorialData?._id;
        if (!tutorialId) return null;

        const section = sections.find((s) => s.id === tempSectionId);
        if (!section) return null;

        const sectionData = {
            title: section.title,
            description: section.description,
            icon: section.icon,
        };
        const response = await StructuredTutorialAPI.createSection(
            tutorialId,
            sectionData,
        );

        if (response?.newTutorialId) {
            router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
            return null;
        }

        if (!response?.success) return null;

        const realId = response.data._id;
        setSections((prev) =>
            prev.map((s) => (s.id === tempSectionId ? { ...s, id: realId } : s)),
        );
        return realId;
    };

    const handleSavePost = async (data: any, targetSectionId?: string, targetPostId?: string) => {
        const resolvedSectionId = targetSectionId || selectedNode.sectionId;
        const resolvedPostId = targetPostId || selectedNode.id;
        if (!resolvedSectionId) return;

        let sectionId = resolvedSectionId;
        const postId = resolvedPostId;
        const isNew = !postId || postId.startsWith("temp-");

        setIsSaving(true);

        try {
            // Auto-save section first if it has a temp ID
            if (sectionId.startsWith("temp-")) {
                const realSectionId = await ensureSectionSaved(sectionId);
                if (!realSectionId) {
                    notifications.show({
                        title: "Error",
                        message: "Please save the section before adding posts",
                        color: "orange",
                    });
                    return;
                }
                sectionId = realSectionId;
                setSelectedNode((prev) => ({ ...prev, sectionId: realSectionId }));
            }

            let response;
            if (isNew) {
                response = await StructuredTutorialAPI.createPost(sectionId, data);
                if (response?.success) {
                    setSections((prev) =>
                        prev.map((s) =>
                            s.id === sectionId
                                ? {
                                    ...s,
                                    posts: s.posts.map((p) =>
                                        p.id === postId
                                            ? { ...p, ...data, id: response.data._id }
                                            : p,
                                    ),
                                }
                                : s,
                        ),
                    );
                    setSelectedNode({ type: "post", id: response.data._id, sectionId });
                }
            } else {
                response = await StructuredTutorialAPI.updatePost(
                    sectionId,
                    postId!,
                    data,
                );

                // Check if backend created a draft copy
                if (response?.newTutorialId) {
                    // Redirect to the new draft
                    router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
                    return;
                }

                if (response?.success) {
                    setSections((prev) =>
                        prev.map((s) =>
                            s.id === sectionId
                                ? {
                                    ...s,
                                    posts: s.posts.map((p) =>
                                        p.id === postId ? { ...p, ...data } : p,
                                    ),
                                }
                                : s,
                        ),
                    );
                }
            }

            // Don't show success notification for auto-save (too noisy)
        } catch (error: any) {
            notifications.show({
                title: "Error",
                message: error?.message || "Failed to save post",
                color: "red",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePost = async (sectionId: string, postId: string) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        if (!postId.startsWith("temp-")) {
            try {
                const response = await StructuredTutorialAPI.deletePost(
                    sectionId,
                    postId,
                );

                // Check if backend created a draft copy
                if (response?.newTutorialId) {
                    // Redirect to the new draft
                    router.push(`/form/structured-tutorial?id=${response.newTutorialId}`);
                    return;
                }
            } catch (error) {
                notifications.show({
                    title: "Error",
                    message: "Failed to delete post",
                    color: "red",
                });
                return;
            }
        }

        setSections((prev) =>
            prev.map((s) =>
                s.id === sectionId
                    ? { ...s, posts: s.posts.filter((p) => p.id !== postId) }
                    : s,
            ),
        );

        setSelectedNode({ type: "section", id: sectionId });
        notifications.show({
            title: "Success",
            message: "Post deleted",
            color: "green",
        });
    };

    const handleReuseSection = async (sourceSectionId: string) => {
        const tutorialId = editTutorialId || tutorialData._id;
        if (!tutorialId) {
            notifications.show({
                title: "Error",
                message: "Please save tutorial info first",
                color: "orange",
            });
            return;
        }

        try {
            const response = await StructuredTutorialAPI.reuseSection(
                tutorialId,
                sourceSectionId,
            );
            if (response?.success) {
                // Reload sections
                const sectionsRes = await StructuredTutorialAPI.getSections(tutorialId);
                if (sectionsRes.success) {
                    const mappedSections: LocalSection[] = sectionsRes.data.map(
                        (s: TutorialSection) => ({
                            id: s._id,
                            title: s.title,
                            description: s.description || "",
                            icon: s.icon || "IconFolder",
                            order: s.order,
                            isFreePreview: s.isFreePreview || false,
                            isReused: s.isReused,
                            posts: (s.postIds || []).map((p: any) => ({
                                id: p._id,
                                title: p.title,
                                description:
                                    p.lexicalState ||
                                    p.content?.lexicalState ||
                                    p.description ||
                                    "",
                                contentFormat: p.contentFormat || "HTML",
                                postType: p.postType || "CONTENT",
                                mcqData: p.mcqData,
                                order: p.order,
                                isReused: p.isReused,
                            })),
                        }),
                    );
                    setSections(mappedSections);
                }
            }
        } catch (error) {
            throw error;
        }
    };

    const handleReusePost = async (sourcePostId: string) => {
        if (!currentSectionIdForPost) return;

        try {
            const response: any = await StructuredTutorialAPI.reusePost(
                currentSectionIdForPost,
                sourcePostId,
            );
            if (response?.success) {
                // Reload section's posts
                setSections((prev) =>
                    prev.map((s) =>
                        s.id === currentSectionIdForPost
                            ? {
                                ...s,
                                posts: [
                                    ...s.posts,
                                    {
                                        id: response.data._id,
                                        title: response.data.title,
                                        description:
                                            response.data.lexicalState ||
                                            response.data.content?.lexicalState ||
                                            response.data.description ||
                                            "",
                                        contentFormat: response.data.contentFormat || "HTML",
                                        order: response.data.order,
                                        isReused: true,
                                    },
                                ],
                            }
                            : s,
                    ),
                );
            }
        } catch (error) {
            throw error;
        }
    };

    const handlePublish = async () => {
        if (!editTutorialId && !tutorialData?._id) return;

        const tutorialId = editTutorialId || tutorialData._id;
        const newPublishedState = !tutorialData?.published;

        try {
            const response = await StructuredTutorialAPI.publish(
                tutorialId,
                newPublishedState,
            );
            if (response?.success) {
                setTutorialData(response.data);
                notifications.show({
                    title: "Success",
                    message: newPublishedState
                        ? "Tutorial published"
                        : "Tutorial unpublished",
                    color: "green",
                });
                router.push("/history/table");
            }
        } catch (error) {
            notifications.show({
                title: "Error",
                message: "Failed to update publish status",
                color: "red",
            });
        }
    };

    // Get current section/post data for forms
    const getCurrentSectionData = () => {
        if (selectedNode.type !== "section" || !selectedNode.id) return undefined;
        return sections.find((s) => s.id === selectedNode.id);
    };

    const getCurrentPostData = () => {
        if (
            (selectedNode.type !== "post" && selectedNode.type !== "mcq") ||
            !selectedNode.id ||
            !selectedNode.sectionId
        )
            return undefined;
        const section = sections.find((s) => s.id === selectedNode.sectionId);
        return section?.posts.find((p) => p.id === selectedNode.id);
    };

    const postAiContext: PostFormAiContext | undefined = useMemo(() => {
        if (selectedNode.type !== "post" || !selectedNode.sectionId) return undefined;
        const section = sections.find((s) => s.id === selectedNode.sectionId);
        const categoryPath = [
            tutorialData?.categoryName,
            tutorialData?.subCategory,
            tutorialData?.nestedSubCategory,
        ]
            .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
            .join(" › ");
        return {
            tutorialTitle: typeof tutorialData?.title === "string" ? tutorialData.title : "",
            categoryPath,
            sectionTitle: section?.title ?? "",
        };
    }, [
        selectedNode.type,
        selectedNode.sectionId,
        sections,
        tutorialData?.title,
        tutorialData?.categoryName,
        tutorialData?.subCategory,
        tutorialData?.nestedSubCategory,
    ]);

    return (
        <Suspense fallback={<MantineLoader />}>
            <FullPageOverlay visible={isVisible} />
            <Box pos="relative" h="calc(100vh - 80px)">
                {/* Header */}
                <Paper p="md" withBorder>
                    <Group justify="space-between">
                        <Group>
                            <Button
                                variant="subtle"
                                leftSection={<IconArrowLeft size={18} />}
                                onClick={() => router.push("/history/table")}
                            >
                                Back to History
                            </Button>
                            <Divider orientation="vertical" />
                            <Title order={4}>
                                {editTutorialId ? "Edit" : "Create"} Structured Tutorial
                            </Title>
                        </Group>
                        {tutorialData && (
                            <Tooltip
                                label={
                                    tutorialData.published
                                        ? "Move tutorial to drafts (unpublish)"
                                        : "Publish tutorial to make it public"
                                }
                                position="bottom"
                            >
                                <Button
                                    leftSection={<IconCheck size={18} />}
                                    color={tutorialData.published ? "orange" : "green"}
                                    onClick={handlePublish}
                                >
                                    {tutorialData.published ? "Draft" : "Publish"}
                                </Button>
                            </Tooltip>
                        )}
                    </Group>
                </Paper>

                {/* Main Content */}
                <Grid gutter={0} h="calc(100% - 73px)">
                    {/* Left: Tree Navigator - Only show if tutorial is saved */}
                    {tutorialData?._id && (
                        <Grid.Col
                            span={{ base: 12, md: 3 }}
                            style={{ borderRight: "1px solid var(--mantine-color-gray-3)" }}
                        >
                            <TreeNavigator
                                tutorialTitle={tutorialData?.title || "New Tutorial"}
                                sections={buildTreeNodes()}
                                selectedNode={selectedNode}
                                expandedNodes={expandedNodes}
                                onSelectNode={setSelectedNode}
                                onToggleExpand={handleToggleExpand}
                                onAddSection={handleAddSection}
                                onAddPost={handleAddPost}
                                onAddMCQ={handleAddMCQ}
                                onDeleteSection={handleDeleteSection}
                                onDeletePost={handleDeletePost}
                                onReuseSection={() => setReuseSectionDialogOpen(true)}
                                onReusePost={(sectionId) => {
                                    setCurrentSectionIdForPost(sectionId);
                                    setReusePostDialogOpen(true);
                                }}
                                isPublished={tutorialData?.published}
                            />
                        </Grid.Col>
                    )}

                    <Grid.Col span={{ base: 12, md: tutorialData?._id ? 9 : 12 }}>
                        <Box
                            p={{ base: "md", md: "xl" }}
                            style={{ overflowY: "auto", height: "100%" }}
                        >
                            {selectedNode.type === "tutorial" && (
                                <>
                                    <Title order={4} mb="md">
                                        Tutorial Information
                                    </Title>
                                    {!tutorialData?._id && (
                                        <Text c="dimmed" mb="md" size="sm">
                                            💡 Please save the tutorial information below to start
                                            adding sections and posts.
                                        </Text>
                                    )}
                                    <TutorialMetadataForm
                                        initialData={tutorialData}
                                        categories={categories}
                                        categoriesData={categoriesData}
                                        onSave={handleSaveTutorial}
                                        isSaving={isSaving}
                                    />
                                </>
                            )}

                            {selectedNode.type === "section" && (
                                <SectionForm
                                    initialData={getCurrentSectionData()}
                                    onSave={handleSaveSection}
                                    onChange={handleSectionChange}
                                    isSaving={isSaving}
                                    isNew={selectedNode.id?.startsWith("temp-")}
                                />
                            )}

                            {selectedNode.type === "post" && selectedNode.sectionId && (
                                <PostForm
                                    key={selectedNode.id || selectedNode.sectionId}
                                    initialData={getCurrentPostData()}
                                    onSave={(data) => handleSavePost(data, selectedNode.sectionId, selectedNode.id)}
                                    onChange={(data) => handlePostChange(data, selectedNode.sectionId!, selectedNode.id!)}
                                    isSaving={isSaving}
                                    isNew={selectedNode.id?.startsWith("temp-")}
                                    aiContext={postAiContext}
                                />
                            )}

                            {selectedNode.type === "mcq" && selectedNode.sectionId && (
                                <>
                                    <Title order={4} mb="md">
                                        {selectedNode.id?.startsWith('temp-') ? 'Create MCQ Quiz' : 'Edit MCQ Quiz'}
                                    </Title>
                                    <QuizEditor
                                        sectionId={selectedNode.sectionId}
                                        postId={selectedNode.id || undefined}
                                        initialData={getCurrentPostData()}
                                        onSave={(postId) => {
                                            // Update the local state with the saved post ID
                                            setSections((prev) =>
                                                prev.map((s) =>
                                                    s.id === selectedNode.sectionId
                                                        ? {
                                                            ...s,
                                                            posts: s.posts.map((p) =>
                                                                p.id === selectedNode.id
                                                                    ? { ...p, id: postId }
                                                                    : p,
                                                            ),
                                                        }
                                                        : s,
                                                ),
                                            );
                                            setSelectedNode({
                                                type: "mcq",
                                                id: postId,
                                                sectionId: selectedNode.sectionId,
                                            });
                                            notifications.show({
                                                title: "Success",
                                                message: "MCQ quiz created successfully!",
                                                color: "green",
                                            });
                                        }}
                                        onCancel={() => {
                                            // Remove the temp MCQ and go back to section
                                            if (selectedNode.id?.startsWith("temp-mcq-")) {
                                                setSections((prev) =>
                                                    prev.map((s) =>
                                                        s.id === selectedNode.sectionId
                                                            ? {
                                                                ...s,
                                                                posts: s.posts.filter(
                                                                    (p) => p.id !== selectedNode.id,
                                                                ),
                                                            }
                                                            : s,
                                                    ),
                                                );
                                            }
                                            setSelectedNode({
                                                type: "section",
                                                id: selectedNode.sectionId,
                                            });
                                        }}
                                    />
                                </>
                            )}

                            {!selectedNode.type && tutorialData?._id && (
                                <Box ta="center" mt="xl">
                                    <Text c="dimmed">Select an item from the tree to edit</Text>
                                </Box>
                            )}
                        </Box>
                    </Grid.Col>
                </Grid>

                {/* Dialogs */}
                <ReuseSectionDialog
                    opened={reuseSectionDialogOpen}
                    onClose={() => setReuseSectionDialogOpen(false)}
                    onReuse={handleReuseSection}
                    excludeTutorialId={editTutorialId || tutorialData?._id}
                />

                <ReusePostDialog
                    opened={reusePostDialogOpen}
                    onClose={() => setReusePostDialogOpen(false)}
                    onReuse={handleReusePost}
                    excludeSectionId={currentSectionIdForPost || undefined}
                />
            </Box>
        </Suspense>
    );
};

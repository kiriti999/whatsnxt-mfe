"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBrain,
  IconChevronRight,
  IconEdit,
  IconEye,
  IconLock,
  IconSearch,
  IconTopologyStarRing3,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import type { Lab, LabPage } from "@whatsnxt/types";
import { VALIDATION } from "@whatsnxt/constants";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import labApi from "@/apis/lab.api";
import { AISuggestionButton } from "@/components/Common/AISuggestionButton";
import { FullPageOverlay } from "@/components/Common/FullPageOverlay";
import CloneLabButton from "@/components/Lab/CloneLabButton";
import { LabAccessButton } from "@/components/Lab/LabAccessButton";
import { LearningMaterialEditor } from "@/components/Lab/LearningMaterial/LearningMaterialEditor";
import RepublishModal from "@/components/Lab/RepublishModal";
import { LexicalEditor } from "@/components/StructuredTutorial/Editor/LexicalEditor";
import useAuth from "@/hooks/Authentication/useAuth";

const LabDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  // Get URL params for page
  const urlPage = searchParams.get("page");

  const [lab, setLab] = useState<Lab | null>(null);
  const [pages, setPages] = useState<LabPage[]>([]);
  const [descriptionEditorKey, setDescriptionEditorKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [requiresAccess, setRequiresAccess] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [
    deletePageModalOpened,
    { open: openDeletePageModal, close: closeDeletePageModal },
  ] = useDisclosure(false);
  const [
    republishModalOpened,
    { open: openRepublishModal, close: closeRepublishModal },
  ] = useDisclosure(false);
  const [labDetailsOpened, { toggle: toggleLabDetails }] = useDisclosure(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [subCategories, setSubCategories] = useState<
    Array<{ name: string; subcategories?: Array<{ name: string }> }>
  >([]);
  const [nestedSubCategories, setNestedSubCategories] = useState<
    Array<{ name: string }>
  >([]);
  const [pageToDelete, setPageToDelete] = useState<{
    id: string;
    pageNumber: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["labCategories"],
    queryFn: async () => {
      const response = await labApi.getCategories();
      return response?.categories || [];
    },
  });

  const categoryOptions = categories.map(
    (cat: { categoryName: string; subcategories?: any[] }) => ({
      value: cat.categoryName,
      label: cat.categoryName,
      subcategories: cat.subcategories || [],
    }),
  );

  const subCategoryOptions = subCategories.map((sub) => ({
    value: sub.name,
    label: sub.name,
    subcategories: sub.subcategories || [],
  }));

  const nestedSubCategoryOptions = nestedSubCategories.map((nested) => ({
    value: nested.name,
    label: nested.name,
  }));

  // Derived values (must come after state declarations)
  const isTrainer = isAuthenticated && user?.role === "trainer";
  const isAdmin = isAuthenticated && user?.role === "admin";
  const isOwner = isTrainer && lab?.instructorId === user?._id;

  const PAGES_PER_PAGE = 3;

  // Update page from URL param
  useEffect(() => {
    if (urlPage) {
      setCurrentPage(parseInt(urlPage, 10));
    }
  }, [urlPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      labType: "",
      subCategory: "",
      nestedSubCategory: "",
    },
    validate: {
      name: (value) => (value ? null : "Lab name is required"),
      labType: (value) => (value ? null : "Category is required"),
    },
  });

  const handleCategoryChange = (value: string | null) => {
    form.setFieldValue("labType", value || "");
    form.setFieldValue("subCategory", "");
    form.setFieldValue("nestedSubCategory", "");
    setNestedSubCategories([]);

    const selected = categoryOptions.find(
      (opt: { value: string }) => opt.value === value,
    );
    setSubCategories(selected?.subcategories || []);
  };

  const handleSubCategoryChange = (value: string | null) => {
    form.setFieldValue("subCategory", value || "");
    form.setFieldValue("nestedSubCategory", "");

    const selected = subCategoryOptions.find(
      (opt: { value: string }) => opt.value === value,
    );
    setNestedSubCategories(selected?.subcategories || []);
  };

  const fetchLabData = useCallback(async () => {
    console.log("[fetchLabData] Starting fetch for labId:", labId);
    setLoading(true);
    try {
      const response = await labApi.getLabById(labId);
      const labData = response.data;
      setLab(labData);

      // Check if access is required (returned from backend)
      const accessRequired = (response as any).requiresAccess || false;
      setRequiresAccess(accessRequired);

      // Debug logging
      console.log("[Lab Access Debug]", {
        labId,
        labStatus: labData.status,
        requiresAccess: accessRequired,
        userRole: user?.role,
        isAuthenticated,
        pricing: labData.pricing,
        pagesCount: labData.pages?.length || 0,
      });

      // Set pages - backend already filtered them if access is required
      setPages(labData.pages || []);

      // Populate form with lab data including associated courses
      form.setValues({
        name: labData.name,
        description: labData.description || "",
        labType: labData.labType,
        subCategory: labData.subCategory || "",
        nestedSubCategory: labData.nestedSubCategory || "",
      });

      // Populate cascading category state from existing lab data
      if (labData.labType && categories.length > 0) {
        const selectedCat = categories.find(
          (cat: { categoryName: string }) =>
            cat.categoryName === labData.labType,
        );
        const subs = selectedCat?.subcategories || [];
        setSubCategories(subs);
        if (labData.subCategory) {
          const selectedSub = subs.find(
            (sub: { name: string }) => sub.name === labData.subCategory,
          );
          setNestedSubCategories(selectedSub?.subcategories || []);
        }
      }
      console.log("[fetchLabData] Fetch completed successfully");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load lab.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to load lab:", error);
    } finally {
      setLoading(false);
    }
  }, [labId]); // Only depend on labId, not form or other values

  useEffect(() => {
    console.log("[useEffect] labId changed:", labId);
    if (labId) {
      fetchLabData();
    }
  }, [labId, fetchLabData]);

  // Populate cascading category state when categories load after lab data
  useEffect(() => {
    if (lab && categories.length > 0) {
      const selectedCat = categories.find(
        (cat: { categoryName: string }) => cat.categoryName === lab.labType,
      );
      const subs = selectedCat?.subcategories || [];
      setSubCategories(subs);
      if (lab.subCategory) {
        const selectedSub = subs.find(
          (sub: { name: string }) => sub.name === lab.subCategory,
        );
        setNestedSubCategories(selectedSub?.subcategories || []);
      }
    }
  }, [lab, categories]);

  const handleUpdateLab = async (values: any) => {
    try {
      const response = await labApi.updateLab(labId, {
        ...values,
        subCategory: values.subCategory || undefined,
        nestedSubCategory: values.nestedSubCategory || undefined,
      });
      // Sync cascading state after update
      const updated = response.data;
      if (updated.labType && categories.length > 0) {
        const selectedCat = categories.find(
          (cat: { categoryName: string }) =>
            cat.categoryName === updated.labType,
        );
        const subs = selectedCat?.subcategories || [];
        setSubCategories(subs);
        if (updated.subCategory) {
          const selectedSub = subs.find(
            (sub: { name: string }) => sub.name === updated.subCategory,
          );
          setNestedSubCategories(selectedSub?.subcategories || []);
        } else {
          setNestedSubCategories([]);
        }
      }
      setLab(response.data);
      setIsEditing(false);
      notifications.show({
        title: "Success",
        message: "Lab updated successfully!",
        color: "green",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update lab.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to update lab:", error);
    }
  };

  const handleCreatePage = async () => {
    try {
      const response = await labApi.createLabPage(labId, {
        pageNumber: pages.length + 1,
        hasQuestion: false,
        hasDiagramTest: false,
      });
      setPages([...pages, response.data]);
      notifications.show({
        title: "Success",
        message: "Page created successfully!",
        color: "green",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create page.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to create page:", error);
    }
  };

  const handlePublishLab = async () => {
    // T069-T070: Check if this is a draft clone and show republish modal instead
    if (lab?.clonedFromLabId) {
      openRepublishModal();
      return;
    }

    // Normal publish flow for non-clone drafts
    try {
      const response = await labApi.publishLab(labId);
      setLab(response.data);
      notifications.show({
        title: "Success",
        message: "Lab published successfully!",
        color: "green",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to publish lab.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to publish lab:", error);
    }
  };

  const handleDeleteLab = async () => {
    setIsDeleting(true);
    try {
      await labApi.deleteLab(labId);
      notifications.show({
        title: "Success",
        message: "Lab deleted successfully!",
        color: "green",
      });
      closeDeleteModal();
      router.push("/labs");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete lab.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to delete lab:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeletePage = (pageId: string, pageNumber: number) => {
    setPageToDelete({ id: pageId, pageNumber });
    openDeletePageModal();
  };

  const handleDeletePage = async () => {
    if (!pageToDelete) return;

    setIsDeleting(true);
    try {
      await labApi.deleteLabPage(labId, pageToDelete.id);
      setPages(pages.filter((p) => p.id !== pageToDelete.id));
      notifications.show({
        title: "Success",
        message: "Page deleted successfully!",
        color: "green",
      });
      closeDeletePageModal();
      setPageToDelete(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete page.";
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
      console.error("Failed to delete page:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <FullPageOverlay visible={loading} />
      </>
    );
  }

  if (!lab) {
    return (
      <Container size="lg" py="xl">
        <Text>Lab not found.</Text>
      </Container>
    );
  }

  // Derived values after lab is loaded
  const isPublished = lab.status === "published";
  const canEdit = lab.status === "draft"; // Only draft labs can be edited
  const canDelete = isAdmin || (isOwner && lab.status === "draft"); // Admin can delete any, owner can delete drafts
  const isStudent = isAuthenticated && user?.role === "student";
  // Can view tests when: trainer owner OR (student AND has access = not requiring access)
  const canViewTests = isOwner || (isStudent && !requiresAccess);

  // Search and filter pages based on questions
  const filteredPages = pages.filter((page: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search in page number
    if (page.pageNumber.toString().includes(query)) return true;

    // Search in questions
    if (page.questions && page.questions.length > 0) {
      return page.questions.some(
        (question: any) =>
          question.questionText?.toLowerCase().includes(query) ||
          question.type?.toLowerCase().includes(query) ||
          question.correctAnswer?.toLowerCase().includes(query) ||
          (question.options &&
            JSON.stringify(question.options).toLowerCase().includes(query)),
      );
    }

    // Search in diagram test
    if (page.diagramTest) {
      return page.diagramTest.prompt?.toLowerCase().includes(query);
    }

    return false;
  });

  // Pagination calculations (on filtered pages)
  const totalPages = Math.ceil(filteredPages.length / PAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * PAGES_PER_PAGE;
  const endIndex = startIndex + PAGES_PER_PAGE;
  const paginatedPages = filteredPages.slice(startIndex, endIndex);

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button variant="subtle" onClick={() => router.push("/labs")}>
            ← Back to Labs
          </Button>
          {(isOwner || isTrainer || isAdmin) && (
            <Badge color={isPublished ? "green" : "gray"} size="lg">
              {lab.status.toUpperCase()}
            </Badge>
          )}
        </Group>
        <Group>
          {canDelete && (
            <Button variant="outline" color="red" onClick={openDeleteModal}>
              Delete Lab
            </Button>
          )}
          {canEdit && !isPublished && (
            <Button color="blue" onClick={handlePublishLab}>
              Publish Lab
            </Button>
          )}
          {/* T035-T036: Clone button for published labs owned by instructor */}
          {isPublished && isOwner && (
            <CloneLabButton
              labId={labId}
              onSuccess={(clonedLabId) => {
                console.log(
                  "[LabDetailPage] Clone successful, redirecting to:",
                  clonedLabId,
                );
              }}
            />
          )}
        </Group>
      </Group>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Lab"
        centered
      >
        <Stack>
          <Text>Are you sure you want to delete this lab?</Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. All pages, questions, and diagram
            tests will be permanently deleted.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteLab} loading={isDeleting}>
              Delete Lab
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Page Confirmation Modal */}
      <Modal
        opened={deletePageModalOpened}
        onClose={closeDeletePageModal}
        title="Delete Page"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete Page {pageToDelete?.pageNumber}?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone. All questions and diagram tests on
            this page will be permanently deleted.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDeletePageModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeletePage} loading={isDeleting}>
              Delete Page
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Republish Confirmation Modal (T069-T070) */}
      <RepublishModal
        labId={labId}
        opened={republishModalOpened}
        onClose={closeRepublishModal}
        onSuccess={(updatedLabId) => {
          console.log(
            "[LabDetailPage] Republish successful, redirecting to:",
            updatedLabId,
          );
        }}
      />

      <Box pt="md">
        <Group
          justify="space-between"
          align="center"
          mb="xl"
          onClick={toggleLabDetails}
          style={{ cursor: "pointer" }}
        >
          <Title order={4}>Lab Details</Title>
          <IconChevronRight
            size={18}
            style={{
              transform: labDetailsOpened ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 200ms ease",
            }}
          />
        </Group>
        <Collapse in={labDetailsOpened}>
          <Paper shadow="sm" p="xl" withBorder style={{ position: "relative" }}>
            {canEdit && !isEditing && (
              <Tooltip label="Edit Details">
                <ActionIcon
                  onClick={() => setIsEditing(true)}
                  variant="subtle"
                  color="blue"
                  size="lg"
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                  }}
                >
                  <IconEdit size={20} />
                </ActionIcon>
              </Tooltip>
            )}
            {isEditing ? (
              <form onSubmit={form.onSubmit(handleUpdateLab)}>
                <Stack>
                  <TextInput
                    label="Lab Name"
                    placeholder="e.g., AWS Cloud Fundamentals"
                    {...form.getInputProps("name")}
                    required
                  />
                  <Box>
                    <Group mb={6} justify="space-between" align="center">
                      <Text size="sm" fw={500}>
                        Description
                      </Text>
                      <AISuggestionButton
                        prompt={`Write a concise, engaging lab description (2-4 sentences) for a technical lab titled: "${form.values.name}". Focus on what students will learn and practise. Hard limit: keep the response under ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters total (including any HTML markup). Do not return a full HTML document — only the inner content.`}
                        onSuggestion={(suggestion) => {
                          form.setFieldValue("description", suggestion);
                          setDescriptionEditorKey((k) => k + 1);
                        }}
                        label="Generate description with AI"
                        iconSize={14}
                      />
                    </Group>
                    <LexicalEditor
                      key={descriptionEditorKey}
                      value={form.values.description}
                      onChange={(value) =>
                        form.setFieldValue("description", value)
                      }
                      placeholder="Brief description of the lab"
                    />
                  </Box>
                  <Select
                    label="Category"
                    placeholder="Select category"
                    data={categoryOptions}
                    searchable
                    value={form.values.labType}
                    onChange={handleCategoryChange}
                    error={form.errors.labType as string}
                    required
                  />
                  {subCategoryOptions.length > 0 && (
                    <Select
                      label="Sub Category"
                      placeholder="Select sub category"
                      data={subCategoryOptions}
                      searchable
                      value={form.values.subCategory}
                      onChange={handleSubCategoryChange}
                      error={form.errors.subCategory as string}
                    />
                  )}
                  {nestedSubCategoryOptions.length > 0 && (
                    <Select
                      label="Topic"
                      placeholder="Select topic"
                      data={nestedSubCategoryOptions}
                      searchable
                      value={form.values.nestedSubCategory}
                      onChange={(value) =>
                        form.setFieldValue("nestedSubCategory", value || "")
                      }
                      error={form.errors.nestedSubCategory as string}
                    />
                  )}

                  <Group justify="flex-end" mt="md">
                    <Button
                      variant="subtle"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack>
                <Box>
                  <Title order={5}>{lab.name}</Title>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    Description
                  </Text>
                  {lab.description ? (
                    <Box>
                      <Box
                        style={{
                          maxHeight: descriptionExpanded ? "none" : "7.5em",
                          minHeight: 0,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <LexicalEditor value={lab.description} readOnly />
                        {!descriptionExpanded && (
                          <Box
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              left: 0,
                              height: "1.5em",
                              background: "linear-gradient(to bottom, transparent, var(--mantine-color-body))",
                            }}
                          />
                        )}
                      </Box>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                        mt={4}
                      >
                        {descriptionExpanded ? "Show less" : "Show more"}
                      </Button>
                    </Box>
                  ) : (
                    <Text c="dimmed" fs="italic">
                      No description
                    </Text>
                  )}
                </Box>
                <Group>
                  <Box>
                    <Badge size="lg">{lab.labType}</Badge>
                  </Box>
                  {lab.subCategory && (
                    <Box>
                      <Badge size="lg" color="grape">
                        {lab.subCategory}
                      </Badge>
                    </Box>
                  )}
                  {lab.nestedSubCategory && (
                    <Box>
                      <Badge size="lg" color="violet">
                        {lab.nestedSubCategory}
                      </Badge>
                    </Box>
                  )}
                </Group>

                {/* Associated Courses */}
                {lab.associatedCourses && lab.associatedCourses.length > 0 && (
                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">
                      Associated Courses
                    </Text>
                    <Stack gap="xs">
                      {lab.associatedCourses.map((course: any) => (
                        <Paper
                          key={course._id}
                          p="sm"
                          withBorder
                          radius="sm"
                          className="bg-blue-light"
                        >
                          <Group justify="space-between">
                            <Box>
                              <Text size="sm" fw={600} c="blue">
                                {course.courseName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                Students enrolled in this course can access this
                                lab
                              </Text>
                            </Box>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() =>
                                router.push(`/courses/${course.slug}`)
                              }
                            >
                              View Course
                            </Button>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        </Collapse>
      </Box>

      <Box pt="xl">
        <Divider
          mb="xl"
          label={<Title order={4}>Tests & Questions ({pages.length})</Title>}
          labelPosition="left"
        />
        {!canViewTests && isPublished && isStudent && requiresAccess ? (
          <Stack gap="lg">
            <Paper shadow="sm" p="xl" withBorder className="bg-yellow-light">
              <Stack align="center" gap="md">
                <Text size="xl" fw={600}>
                  🔒 Access Required
                </Text>
                <Text c="dimmed" ta="center" size="lg">
                  You need to purchase this lab or enroll in a course to view
                  all tests and questions.
                </Text>
                <LabAccessButton
                  labId={labId}
                  labTitle={lab.name}
                  pricing={lab.pricing}
                  onAccessGranted={() => {
                    fetchLabData();
                  }}
                />
              </Stack>
            </Paper>

            {/* Preview Pages Section — Phase 1: Visual Thumbnails */}
            {pages.some(
              (p: any) =>
                (p.hasQuestion && p.question?.isPreview) ||
                (p.hasDiagramTest && p.diagramTest?.isPreview),
            ) &&
              (() => {
                const previewPages = pages.filter(
                  (p: any) =>
                    (p.hasQuestion && p.question?.isPreview) ||
                    (p.hasDiagramTest && p.diagramTest?.isPreview),
                );
                return (
                  <Paper
                    shadow="sm"
                    p="lg"
                    withBorder
                    style={{
                      borderLeft:
                        "4px solid var(--mantine-color-orange-outline)",
                    }}
                  >
                    <Stack gap="lg">
                      <Group justify="space-between" align="flex-start">
                        <Box>
                          <Group gap="sm" mb={4}>
                            <ThemeIcon
                              color="orange"
                              variant="light"
                              size="lg"
                              radius="md"
                            >
                              <IconEye size={20} />
                            </ThemeIcon>
                            <Text size="lg" fw={700}>
                              Free Preview Available
                            </Text>
                            <Badge color="orange" variant="filled" size="sm">
                              {previewPages.length} test
                              {previewPages.length !== 1 ? "s" : ""}
                            </Badge>
                          </Group>
                          <Text size="sm" c="dimmed" ml={46}>
                            Try these tests before purchasing — no account
                            upgrade needed.
                          </Text>
                        </Box>
                        <Badge
                          color="orange"
                          variant="light"
                          size="lg"
                          leftSection={<IconLock size={12} />}
                        >
                          Try before you buy
                        </Badge>
                      </Group>

                      <Divider />

                      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                        {previewPages.map((page: any) => {
                          const hasQ =
                            page.hasQuestion && page.question?.isPreview;
                          const hasDiag =
                            page.hasDiagramTest && page.diagramTest?.isPreview;
                          const questionPreview = hasQ
                            ? (page.question.questionText || "").slice(0, 80) +
                            ((page.question.questionText || "").length > 80
                              ? "…"
                              : "")
                            : null;
                          const diagramPreview = hasDiag
                            ? (page.diagramTest.prompt || "").slice(0, 80) +
                            ((page.diagramTest.prompt || "").length > 80
                              ? "…"
                              : "")
                            : null;
                          return (
                            <Paper
                              key={page.id}
                              p="md"
                              withBorder
                              radius="md"
                              style={{
                                cursor: "pointer",
                                transition: "box-shadow 0.15s ease",
                                borderTop:
                                  "3px solid var(--mantine-color-orange-outline)",
                              }}
                              onClick={() => {
                                // Phase 3: track preview thumbnail click
                                const gtagFn =
                                  typeof window !== "undefined"
                                    ? ((window as Record<string, unknown>)
                                      .gtag as
                                      | ((...args: unknown[]) => void)
                                      | undefined)
                                    : undefined;
                                if (gtagFn) {
                                  gtagFn("event", "preview_test_clicked", {
                                    lab_id: labId,
                                    page_id: page.id,
                                    page_number: page.pageNumber,
                                    has_question: hasQ,
                                    has_diagram: hasDiag,
                                  });
                                }
                                router.push(
                                  `/labs/${labId}/pages/${page.id}?preview=true&returnPage=${currentPage}`,
                                );
                              }}
                            >
                              <Stack gap="sm">
                                <Group justify="space-between">
                                  <Badge variant="dot" color="orange" size="sm">
                                    Page {page.pageNumber}
                                  </Badge>
                                  <Group gap={4}>
                                    {hasQ && (
                                      <ThemeIcon
                                        color="green"
                                        variant="light"
                                        size="sm"
                                        radius="xl"
                                      >
                                        <IconBrain size={10} />
                                      </ThemeIcon>
                                    )}
                                    {hasDiag && (
                                      <ThemeIcon
                                        color="blue"
                                        variant="light"
                                        size="sm"
                                        radius="xl"
                                      >
                                        <IconTopologyStarRing3 size={10} />
                                      </ThemeIcon>
                                    )}
                                  </Group>
                                </Group>

                                {hasQ && (
                                  <Box>
                                    <Group gap={6} mb={4}>
                                      <IconBrain
                                        size={13}
                                        style={{
                                          color:
                                            "var(--mantine-color-green-light-color)",
                                        }}
                                      />
                                      <Text size="xs" fw={600} c="green">
                                        Question — {page.question.type}
                                      </Text>
                                    </Group>
                                    <Text
                                      size="sm"
                                      c="dimmed"
                                      lineClamp={2}
                                      style={{ fontStyle: "italic" }}
                                    >
                                      {questionPreview || "Question preview"}
                                    </Text>
                                  </Box>
                                )}

                                {hasDiag && (
                                  <Box>
                                    <Group gap={6} mb={4}>
                                      <IconTopologyStarRing3
                                        size={13}
                                        style={{
                                          color:
                                            "var(--mantine-color-blue-light-color)",
                                        }}
                                      />
                                      <Text size="xs" fw={600} c="blue">
                                        Diagram Test
                                      </Text>
                                    </Group>
                                    <Text
                                      size="sm"
                                      c="dimmed"
                                      lineClamp={2}
                                      style={{ fontStyle: "italic" }}
                                    >
                                      {diagramPreview ||
                                        "Reconstruct the architecture diagram"}
                                    </Text>
                                  </Box>
                                )}

                                <Divider />
                                <Group justify="flex-end">
                                  <Button
                                    size="xs"
                                    variant="light"
                                    color="orange"
                                    rightSection={
                                      <IconChevronRight size={12} />
                                    }
                                  >
                                    Try Free
                                  </Button>
                                </Group>
                              </Stack>
                            </Paper>
                          );
                        })}
                      </SimpleGrid>
                    </Stack>
                  </Paper>
                );
              })()}
          </Stack>
        ) : (
          <Stack>
            {canEdit && (
              <Group justify="space-between" mb="md">
                <Box>
                  <Title order={4}>Tests & Questions</Title>
                  <Text size="sm" c="dimmed">
                    {searchQuery
                      ? `Showing ${filteredPages.length} of ${pages.length} pages`
                      : "Each page can have a question test (MCQ, True/False, Fill in blank) and/or a diagram test"}
                  </Text>
                </Box>
                <Button onClick={handleCreatePage} leftSection="+" size="sm">
                  Add New Page
                </Button>
              </Group>
            )}

            {/* Search Bar */}
            {pages.length > 0 && (
              <TextInput
                placeholder="Search questions and tests across all pages..."
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
                mb="md"
              />
            )}

            {pages.length === 0 ? (
              <Paper shadow="sm" p="xl" withBorder>
                <Stack align="center" gap="md">
                  <Text size="xl" c="dimmed">
                    No pages yet
                  </Text>
                  <Text c="dimmed" ta="center">
                    Create your first page to start adding questions and diagram
                    tests
                  </Text>
                  {canEdit && (
                    <Button onClick={handleCreatePage} size="xs">
                      Create First Page
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : filteredPages.length === 0 ? (
              <Paper shadow="sm" p="xl" withBorder>
                <Stack align="center" gap="md">
                  <IconSearch size={48} color="gray" />
                  <Text size="xl" c="dimmed">
                    No results found
                  </Text>
                  <Text c="dimmed" ta="center">
                    No pages match your search "{searchQuery}"
                  </Text>
                  <Button variant="subtle" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack gap="md">
                {paginatedPages.map((page) => (
                  <Paper key={page.id} shadow="sm" p="lg" withBorder>
                    <Group justify="space-between" align="flex-start" mb="md">
                      <Box>
                        <Group gap="sm" mb="xs">
                          <Text fw={700} size="md">
                            Page {page.pageNumber}
                          </Text>
                          {page.hasQuestion && (
                            <Badge size="md" color="green" variant="light">
                              Question Test
                            </Badge>
                          )}
                          {page.hasQuestion && page.question?.isPreview && (
                            <Badge size="sm" color="orange" variant="light">
                              👁 Preview
                            </Badge>
                          )}
                          {page.hasDiagramTest && (
                            <Badge size="md" color="blue" variant="light">
                              Diagram Test
                            </Badge>
                          )}
                          {page.hasDiagramTest &&
                            page.diagramTest?.isPreview && (
                              <Badge size="sm" color="orange" variant="light">
                                👁 Preview
                              </Badge>
                            )}
                          {(page as any).hasLearningMaterial && (
                            <Badge size="md" color="violet" variant="light">
                              📚 Learning
                            </Badge>
                          )}
                          {!page.hasQuestion && !page.hasDiagramTest && (
                            <Badge size="md" color="gray" variant="light">
                              No Tests
                            </Badge>
                          )}
                        </Group>
                      </Box>
                      <Group gap="sm">
                        {lab?.status === "published" &&
                          (page.hasQuestion || page.hasDiagramTest) &&
                          !isOwner && (
                            <Button
                              variant="filled"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/labs/${labId}/pages/${page.id}?returnPage=${currentPage}`,
                                )
                              }
                            >
                              View Tests
                            </Button>
                          )}
                        {(lab?.status !== "published" || isOwner) && (
                          <Button
                            variant="filled"
                            size="xs"
                            onClick={() =>
                              router.push(
                                `/labs/${labId}/pages/${page.id}?returnPage=${currentPage}`,
                              )
                            }
                          >
                            {page.hasQuestion || page.hasDiagramTest
                              ? "Edit Tests"
                              : "Add Tests"}
                          </Button>
                        )}
                        {canEdit &&
                          !page.hasQuestion &&
                          !page.hasDiagramTest && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              size="lg"
                              onClick={() =>
                                confirmDeletePage(page.id, page.pageNumber)
                              }
                              title={`Delete Page ${page.pageNumber}`}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          )}
                      </Group>
                    </Group>

                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {page.hasQuestion ? (
                        <Paper p="md" radius="md" withBorder
                          style={{ borderLeft: '3px solid var(--mantine-color-green-6)' }}
                          className="bg-green-light"
                        >
                          <Group gap="xs" mb={4}>
                            <ThemeIcon size="sm" color="green" variant="filled" radius="xl">
                              <IconBrain size={14} />
                            </ThemeIcon>
                            <Text size="sm" fw={600} c="green.9">
                              Question Test
                            </Text>
                            <Badge size="xs" color="green" variant="filled" ml="auto">
                              Active
                            </Badge>
                          </Group>
                          {page.question?.questionText && (
                            <Text size="xs" c="green.8" lineClamp={2} pl={30}>
                              {page.question.questionText}
                            </Text>
                          )}
                        </Paper>
                      ) : (
                        <Paper p="md" radius="md" className="border-dashed">
                          <Group gap="xs" mb={4}>
                            <ThemeIcon size="sm" color="gray" variant="light" radius="xl">
                              <IconBrain size={14} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              Question Test
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed" pl={30}>
                            Not configured
                          </Text>
                        </Paper>
                      )}

                      {page.hasDiagramTest ? (
                        <Paper p="md" radius="md" withBorder
                          style={{ borderLeft: '3px solid var(--mantine-color-blue-6)' }}
                          className="bg-blue-light"
                        >
                          <Group gap="xs" mb={4}>
                            <ThemeIcon size="sm" color="blue" variant="filled" radius="xl">
                              <IconTopologyStarRing3 size={14} />
                            </ThemeIcon>
                            <Text size="sm" fw={600} c="blue.9">
                              Diagram Test
                            </Text>
                            <Badge size="xs" color="blue" variant="filled" ml="auto">
                              Active
                            </Badge>
                          </Group>
                        </Paper>
                      ) : (
                        <Paper p="md" radius="md" className="border-dashed">
                          <Group gap="xs" mb={4}>
                            <ThemeIcon size="sm" color="gray" variant="light" radius="xl">
                              <IconTopologyStarRing3 size={14} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              Diagram Test
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed" pl={30}>
                            Not configured
                          </Text>
                        </Paper>
                      )}
                    </SimpleGrid>

                    {(isOwner || isTrainer) && (
                      <LearningMaterialEditor
                        labId={labId}
                        pageId={page.id}
                        labType={lab.labType}
                        subCategory={lab.subCategory}
                        nestedSubCategory={lab.nestedSubCategory}
                        diagramTestPrompt={(page as any).diagramTest?.prompt}
                        initialData={page as any}
                        onSaved={(updated) => {
                          setPages((prev) =>
                            prev.map((p) =>
                              p.id === updated.id ? { ...p, ...updated } : p,
                            ),
                          );
                        }}
                      />
                    )}
                  </Paper>
                ))}

                {totalPages > 1 && (
                  <Group justify="center" mt="lg">
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

            {canEdit && pages.length > 0 && (
              <Paper
                shadow="sm"
                p="lg"
                withBorder
                mt="md"
                className="bg-blue-light"
              >
                <Group gap="sm">
                  <Text size="lg">💡</Text>
                  <Box style={{ flex: 1 }}>
                    <Text fw={600} mb={4}>
                      Publishing Requirement
                    </Text>
                    <Text size="sm" c="dimmed">
                      At least one page must have a question test or diagram
                      test before you can publish this lab.
                    </Text>
                  </Box>
                </Group>
              </Paper>
            )}
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default LabDetailPage;

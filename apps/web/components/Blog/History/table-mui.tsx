"use client";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconDownload,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconMarkdown,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { deleteIndex, indexRecord } from "@whatsnxt/core-util";
import { DataTable, type DataTableColumn } from "mantine-datatable";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ContentAPI,
  HistoryAPI,
  StructuredTutorialAPI,
} from "../../../apis/v1/index";
import { SystemDesignAPI } from "../../../apis/v1/systemDesign";
import { downloadBase64File } from "../../../utils/downloadFile";
import { unifiedDeleteWebWorker } from "../../../utils/worker/assetManager";

interface HistoryTableProps {
  open: () => void;
  close: () => void;
}

type ContentType = "blog" | "tutorial" | "structured" | "system-design";

interface HistoryRecord {
  _id: string;
  title: string;
  slug: string;
  categoryName: string;
  updatedAt: string | Date;
  published: boolean;
  tutorial?: boolean;
  source?: string;
  cloudinaryAssets?: string[];
  contentType: ContentType;
}

const PAGE_SIZES = [5, 10, 15];

const HistoryTable = ({ open, close }: HistoryTableProps) => {
  const tutorialIndex = "tutorial";
  const blogIndex = "blog";
  const [modalOpen, setModalOpen] = useState(false);
  const [tutorialTitle, setTutorialTitle] = useState("");
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  const [selectedRecords, setSelectedRecords] = useState<HistoryRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const router = useRouter();

  const handleEditButtonClick = (rowData: HistoryRecord) => {
    if (rowData.contentType === "system-design") {
      router.push(`/form/system-design?id=${rowData._id}`);
    } else if (rowData?.source === "structured") {
      router.push(`/form/structured-tutorial?id=${rowData._id}`);
    } else {
      router.push(
        `/form${rowData?.tutorial ? "/tutorial" : "/blog"}?id=${rowData._id}`,
      );
    }
  };

  const handleDownloadEbook = async (rowData: HistoryRecord) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadEBook(
        rowData._id,
      );
      downloadBase64File(fileContent, filename, "application/epub+zip");
      notifications.show({
        message: "eBook downloaded successfully",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error downloading eBook",
        color: "red",
      });
    }
  };

  const handleDownloadPDF = async (rowData: HistoryRecord) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadPDF(
        rowData._id,
      );
      downloadBase64File(fileContent, filename, "application/pdf");
      notifications.show({
        message: "PDF downloaded successfully",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error downloading PDF",
        color: "red",
      });
    }
  };

  const handleDownloadPPT = async (rowData: HistoryRecord) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadPPT(
        rowData._id,
      );
      downloadBase64File(
        fileContent,
        filename,
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      );
      notifications.show({
        message: "PowerPoint downloaded successfully",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error downloading PowerPoint",
        color: "red",
      });
    }
  };

  const handleDownloadMarkdown = async (rowData: HistoryRecord) => {
    try {
      const { filename, fileContent, mimeType } = await HistoryAPI.downloadMarkdown(
        rowData._id,
      );
      downloadBase64File(fileContent, filename, mimeType || "text/markdown");
      notifications.show({
        message: "Markdown downloaded successfully",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error downloading Markdown",
        color: "red",
      });
    }
  };

  const deleteContent = async (id: string) => {
    const rowData = records.find((f) => f._id === id);
    if (!rowData) return;

    if (rowData.contentType === "system-design") {
      await SystemDesignAPI.delete(rowData._id);
      await load();
      return;
    }

    let deleteResult: unknown;
    if (rowData.source === "structured") {
      deleteResult = await StructuredTutorialAPI.delete(rowData._id);
    } else {
      deleteResult = await ContentAPI[
        rowData.tutorial ? "deleteTutorial" : "deleteBlog"
      ](rowData._id);
    }
    const assetsList = rowData.cloudinaryAssets || [];

    if (deleteResult) {
      if (assetsList.length > 0) {
        const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_CLOUDINARY_API;
        unifiedDeleteWebWorker({ assetsList, bffApiUrl });
      }
      await deleteIndex(rowData._id, rowData.tutorial ? "tutorial" : "blog");
      await load();
    }
  };

  const handleBulkDelete = async () => {
    try {
      open();
      const deleteRequest = selectedRecords.map((rec) =>
        deleteContent(rec._id),
      );
      await Promise.allSettled(deleteRequest);
      setSelectedRecords([]);
      await load();
      notifications.show({
        message: "Successfully deleted",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error on Delete",
        color: "red",
      });
    } finally {
      close();
    }
  };

  const handleCreateTutorial = async () => {
    try {
      const selectedIds = selectedRecords.map((rec) => rec._id);
      const result = await ContentAPI.createTutorialFromBlogs(
        selectedIds,
        tutorialTitle,
      );
      if (result._id) {
        setSelectedRecords([]);
        await load();
        notifications.show({
          message: "Successfully created tutorial",
          color: "green",
        });
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Error while creating tutorial",
        color: "red",
      });
    } finally {
      setTutorialTitle("");
      setModalOpen(false);
    }
  };

  const handlePublishButtonClick = async (rowData: HistoryRecord) => {
    try {
      open();
      const publish = !rowData.published;

      if (rowData.contentType === "system-design") {
        await SystemDesignAPI.update(rowData._id, {
          status: publish ? "published" : "draft",
        });
        await load();
        return;
      }

      let publishRes: unknown;

      if (rowData.source === "structured") {
        const response = await StructuredTutorialAPI.publish(
          rowData._id,
          publish,
        );
        publishRes = response.success ? response.data : null;
      } else {
        publishRes = await HistoryAPI.publishDraft(rowData._id, publish);
      }

      await load();
      if (publish && publishRes) {
        await indexRecord(
          publishRes,
          rowData.tutorial ? tutorialIndex : blogIndex,
        );
      } else if (!publish) {
        await deleteIndex(
          rowData._id,
          rowData.tutorial ? tutorialIndex : blogIndex,
        );
      }
    } catch (error) {
      console.error("handlePublishButtonClick error:", error);
    } finally {
      close();
    }
  };

  const handleDeleteButtonClick = async (rowData: HistoryRecord) => {
    try {
      open();
      await deleteContent(rowData._id);
      notifications.show({
        message: "Successfully deleted",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Error on Delete",
        color: "red",
      });
    } finally {
      close();
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return "N/A";
      const date =
        dateString instanceof Date ? dateString : new Date(dateString);
      if (Number.isNaN(date.getTime())) return "Invalid Date";
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    } catch {
      return "Format Error";
    }
  };

  const typeLabel: Record<ContentType, { label: string; color: string }> = {
    blog: { label: "Blog", color: "blue" },
    tutorial: { label: "Tutorial", color: "teal" },
    structured: { label: "Structured", color: "violet" },
    "system-design": { label: "System Design", color: "cyan" },
  };

  const columns: DataTableColumn<HistoryRecord>[] = [
    {
      accessor: "title",
      title: "Title",
      render: (record) => {
        const href = record.contentType === "system-design"
          ? `/form/system-design?id=${record._id}&mode=view`
          : `/content/${decodeURIComponent(record.slug)}`;
        return (
          <a href={href} style={{ textDecoration: "none" }}>
            {record.title.substring(0, 50)}
            {record.title.length > 50 ? "..." : ""}
          </a>
        );
      },
    },
    {
      accessor: "contentType",
      title: "Type",
      width: 130,
      render: (record) => {
        const info = typeLabel[record.contentType];
        return (
          <Badge size="sm" variant="light" color={info.color}>
            {info.label}
          </Badge>
        );
      },
    },
    {
      accessor: "categoryName",
      title: "Category",
    },
    {
      accessor: "updatedAt",
      title: "Date",
      render: (record) => formatDate(record.updatedAt),
    },
    {
      accessor: "published",
      title: "Publish",
      width: 100,
      render: (record) => (
        <ActionIcon
          variant="subtle"
          onClick={() => handlePublishButtonClick(record)}
          aria-label={record.published ? "Unpublish" : "Publish"}
        >
          {record.published ? (
            <IconEye size={20} />
          ) : (
            <IconEyeOff size={20} color="var(--mantine-color-red-6)" />
          )}
        </ActionIcon>
      ),
    },
    {
      accessor: "edit",
      title: "Edit",
      width: 100,
      render: (record) => (
        <ActionIcon
          variant="subtle"
          onClick={() => handleEditButtonClick(record)}
          aria-label="Edit"
        >
          <IconEdit size={20} />
        </ActionIcon>
      ),
    },
    {
      accessor: "markdown",
      title: "MD",
      width: 80,
      render: (record) =>
        record.contentType === "system-design" ? null : (
          <Tooltip label="Download Markdown">
            <ActionIcon
              variant="subtle"
              onClick={() => handleDownloadMarkdown(record)}
              aria-label="Download Markdown"
            >
              <IconMarkdown size={20} />
            </ActionIcon>
          </Tooltip>
        ),
    },
    {
      accessor: "delete",
      title: "Delete",
      width: 100,
      render: (record) => (
        <ActionIcon
          variant="subtle"
          color="red"
          onClick={() => handleDeleteButtonClick(record)}
          aria-label="Delete"
        >
          <IconTrash size={20} />
        </ActionIcon>
      ),
    },
  ];

  const deriveContentType = (rec: Omit<HistoryRecord, "contentType">): ContentType => {
    if (rec.source === "structured") return "structured";
    if (rec.tutorial) return "tutorial";
    return "blog";
  };

  const load = useCallback(async () => {
    setFetching(true);
    const [fetchedData, sdResult] = await Promise.all([
      HistoryAPI.getHistory(page, recordsPerPage, debouncedSearch, {
        startDateParam: null,
        endDateParam: null,
        searchInput: "",
        selectedOptions: [],
      }),
      SystemDesignAPI.list(),
    ]);

    const blogRecords: HistoryRecord[] = (fetchedData.posts || []).map(
      (r: Omit<HistoryRecord, "contentType">) => ({ ...r, contentType: deriveContentType(r) }),
    );

    const sdCourses = sdResult?.data || [];
    const sdRecords: HistoryRecord[] = sdCourses
      .filter((c) => !debouncedSearch || c.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .map((c) => ({
        _id: c._id,
        title: c.title,
        slug: c.slug,
        categoryName: c.category,
        updatedAt: c.updatedAt,
        published: c.status === "published",
        contentType: "system-design" as ContentType,
      }));

    const merged = [...blogRecords, ...sdRecords].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    setRecords(merged);
    setTotalRecords((fetchedData?.totalRecords || 0) + sdRecords.length);
    setFetching(false);
  }, [page, recordsPerPage, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Enter Tutorial Title"
      >
        <TextInput
          placeholder="Enter tutorial title"
          value={tutorialTitle}
          onChange={(e) => setTutorialTitle(e.target.value)}
        />
        <Button onClick={handleCreateTutorial} fullWidth mt="md">
          Create
        </Button>
      </Modal>

      <div style={{ margin: "2rem 0" }}>
        <Group justify="space-between" mb="md" px="md">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(1);
            }}
            style={{ minWidth: 300 }}
          />
          <Group gap="xs" wrap="nowrap">
            <Tooltip label="Create content" fz="xs">
              <Button onClick={() => router.push("/form")} size="xs">
                <IconPlus size={16} />
              </Button>
            </Tooltip>
            <Tooltip label="Delete selected" fz="xs">
              <Button
                disabled={selectedRecords.length === 0}
                onClick={handleBulkDelete}
                color="red"
                size="xs"
              >
                <IconTrash size={16} />
              </Button>
            </Tooltip>
          </Group>
        </Group>

        <DataTable striped
          withTableBorder
          withColumnBorders
          verticalAlign="bottom"
          borderRadius="sm"
          highlightOnHover
          records={records}
          columns={columns}
          idAccessor="_id"
          fetching={fetching}
          totalRecords={totalRecords}
          recordsPerPage={recordsPerPage}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={(size) => {
            setRecordsPerPage(size);
            setPage(1);
          }}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
          paginationActiveBackgroundColor="blue"
          paginationWrapBreakpoint="xs"
        />
      </div>
    </>
  );
};

export default HistoryTable;

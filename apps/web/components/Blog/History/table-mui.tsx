'use client';
import React, { useEffect, useState } from 'react';
import {
  type MRT_ColumnDef,
  useMaterialReactTable,
  MaterialReactTable,
} from 'material-react-table';
import { notifications } from '@mantine/notifications';
import {
  Group,
  Button,
  Tooltip,
  Modal,
  TextInput,
} from '@mantine/core';
import {
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconPlus,
} from '@tabler/icons-react';
import { ContentAPI, HistoryAPI } from '../../../apis/v1/index';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@mantine/hooks';
import { downloadBase64File } from '../../../utils/downloadFile';
import { deleteIndex, indexRecord } from '@whatsnxt/core-util';
import { unifiedDeleteWebWorker } from '../../../utils/worker/assetManager';

const HistoryMUI = ({ open, close }: any) => {
  const tutorialIndex = 'tutorial';
  const blogIndex = 'blog';
  const [modalOpen, setModalOpen] = useState(false);
  const [tutorialTitle, setTutorialTitle] = useState('');
  const [data, setData] = useState([]) as any;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const router = useRouter();

  const handleEditButtonClick = (rowData: any) => {
    router.push(`/form${rowData?.tutorial ? '/tutorial' : '/blog'}?id=${rowData._id}`);
  };

  const handleDownloadEbook = async (rowData: any) => {
    const { filename, fileContent } = await HistoryAPI.downloadEBook(rowData._id);
    downloadBase64File(fileContent, filename, 'application/epub+zip');
  };

  const handleDownloadPDF = async (rowData: any) => {
    const { filename, fileContent } = await HistoryAPI.downloadPDF(rowData._id);
    downloadBase64File(fileContent, filename, 'application/pdf');
  };

  const handleDownloadPPT = async (rowData: any) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadPPT(rowData._id);
      downloadBase64File(fileContent, filename, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      notifications.show({
        message: 'PowerPoint downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error downloading PowerPoint',
        color: 'red',
      });
    }
  };

  const deleteContent = async (id: string | number) => {
    const rowData = data && data.length > 0 && data.find((f: { _id: number; }) => f._id === id);

    console.log(' deleteContent :: rowData:', rowData)
    const deleteResult = await ContentAPI[rowData?.tutorial ? 'deleteTutorial' : 'deleteBlog'](rowData._id);
    const assetsList = rowData?.cloudinaryAssets || [];

    if (deleteResult) {
      if (assetsList.length > 0) {
        unifiedDeleteWebWorker({ assetsList })
      }
      await deleteIndex(rowData._id, rowData?.tutorial ? 'tutorial' : 'blog');
      await load();
    }
  };

  const handleBulkDelete = async () => {
    try {
      open();
      const deleteRequest = Object.keys(rowSelection).map((id) =>
        deleteContent(id)
      );
      await Promise.allSettled(deleteRequest);
      setRowSelection({});
      await load();
      notifications.show({
        message: 'Successfully deleted',
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Error on Delete',
        color: 'red',
      });
    } finally {
      close();
    }
  };

  const createTutorial = async (list: string[], tutorialTitle: string) => {
    return await ContentAPI.createTutorialFromBlogs(list, tutorialTitle)
  }

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCreateTutorial = async () => {
    try {
      const selectedIds = Object.keys(rowSelection).map((id) => id)
      const result = await createTutorial(selectedIds, tutorialTitle)
      if (result._id) {
        setRowSelection({});
        await load();
        notifications.show({
          message: 'Successfully created tutorial',
          color: 'green',
        });
      }
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Error while creating tutorial',
        color: 'red',
      });
    } finally {
      setTutorialTitle('')
      setModalOpen(false);
    }
  };

  const handlePublishButtonClick = async (rowData: any) => {
    try {
      open();
      const publish = !rowData.published;
      const publishRes = await HistoryAPI.publishDraft(rowData._id, publish)
      await load();
      if (publish && publishRes) {
        await indexRecord(publishRes, rowData.tutorial === 'tutorial' ? tutorialIndex : blogIndex);
      } else if (!publish) {
        await deleteIndex(rowData._id, rowData?.tutorial ? tutorialIndex : blogIndex);
      }
    } catch (error) {
      console.log('🚀 ~ handlePublishButtonClick ~ error:', error)
    } finally {
      close();
    }
  };

  const handleDeleteButtonClick = async (rowData: any) => {
    try {
      open();
      await deleteContent(rowData._id);
      notifications.show({
        message: 'Successfully deleted',
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Error',
        message: 'Error on Delete',
        color: 'red',
      });
    } finally {
      close();
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    try {
      if (!dateString) return 'N/A';

      // Handle both string and Date objects
      const date = dateString instanceof Date ? dateString : new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date provided:', dateString);
        return 'Invalid Date';
      }

      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };

      return new Intl.DateTimeFormat('en-US', options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', dateString);
      return 'Format Error';
    }
  };

  const columns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      Cell: ({ row }: any) => (
        <a href={`/content/${decodeURIComponent(row.original.slug)}`}>
          {row.original.title}
        </a>
      ),
    },
    { accessorKey: 'categoryName', header: 'Category' },
    {
      accessorKey: 'updatedAt',
      header: 'Date',
      Cell: ({ row }: any) => formatDate(row.original.updatedAt),
    },
    {
      accessorKey: 'published',
      header: 'Publish',
      Cell: ({ row }: any) => (
        <div onClick={() => handlePublishButtonClick(row.original)}>
          {row.original.published === true ? (
            <IconEye size={'20'} color="#1976d2" style={{ cursor: 'pointer' }} />
          ) : (
            <IconEyeOff
              size={'20'} color="#d32f2f" style={{ cursor: 'pointer' }} />
          )}
        </div>
      ),
      size: 100
    },
    {
      accessorKey: 'edit',
      header: 'Edit',
      Cell: ({ row }: any) => (
        <IconEdit size={20} onClick={() => handleEditButtonClick(row.original)} style={{ cursor: 'pointer' }} />
      ),
      size: 100

    },
    {
      accessorKey: 'ebook',
      header: 'Ebook',
      Cell: ({ row }: any) => {
        if (row?.original?.tutorial === true) {
          return (
            <Tooltip label="Download ebook">
              <IconDownload
                size={20}
                onClick={() => handleDownloadEbook(row.original)}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          );
        }
        return null; // Return null to render nothing if the condition is not met
      },
      size: 100
    },
    {
      accessorKey: 'pdf',
      header: 'PDF',
      Cell: ({ row }: any) => {
        if (row?.original?.tutorial === true) {
          return (
            <Tooltip label="Download pdf">
              <IconDownload
                size={20}
                onClick={() => handleDownloadPDF(row.original)}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          );
        }
        return null; // Return null to render nothing if the condition is not met
      },
      size: 100
    },
    {
      accessorKey: 'ppt',
      header: 'PPT',
      Cell: ({ row }: any) => {
        if (row?.original?.tutorial === true) {
          return (
            <Tooltip label="Download ppt">
              <IconDownload
                size={20}
                onClick={() => handleDownloadPPT(row.original)}
                style={{ cursor: 'pointer' }}
              />
            </Tooltip>
          );
        }
        return null; // Return null to render nothing if the condition is not met
      },
      size: 100
    },
    {
      accessorKey: 'delete',
      header: 'Delete',
      Cell: ({ row }: any) => (
        <IconTrash size={'20'} onClick={() => handleDeleteButtonClick(row.original)} style={{ cursor: 'pointer' }} />
      ),
      size: 100
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    manualFiltering: true,
    enableMultiRowSelection: true,
    enableColumnFilters: false,
    enableColumnFilterModes: false,
    enableColumnActions: false,
    enableColumnOrdering: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableSorting: false,
    enableDensityToggle: false,
    rowCount: totalCount,
    positionToolbarAlertBanner: 'none',
    enablePinning: false,
    muiTableProps: {
      border: 0,
    },
    onPaginationChange: setPagination,
    state: { pagination, rowSelection, isLoading, globalFilter: searchQuery },
    onGlobalFilterChange: (e) => {
      setSearchQuery(e);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    muiCircularProgressProps: {
      color: 'secondary',
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: 'pulse',
      height: 28,
    },
    enableRowSelection: true,
    getRowId: (row) => row._id,
    onRowSelectionChange: setRowSelection,
    initialState: {
      showGlobalFilter: true,
    },
    muiPaginationProps: {
      rowsPerPageOptions: [5, 10, 15],
      variant: 'outlined',
    },
    paginationDisplayMode: 'pages',
    muiTablePaperProps: {
      elevation: 0,
    },
    positionGlobalFilter: 'left',
    muiSearchTextFieldProps: {
      sx: { minWidth: '300px' },
      variant: 'outlined',
    },
    renderToolbarInternalActions: ({ table }) => (
      <Group>
        <Tooltip label='Create tutorial' fz={'xs'}>
          <Button
            disabled={Object.keys(rowSelection).length === 0}
            onClick={handleOpenModal}
            size='xs'
          >
            <IconPlus size={16} />
          </Button>
        </Tooltip>

        <Tooltip label='Delete selected' fz={'xs'}>
          <Button
            disabled={Object.keys(rowSelection).length === 0}
            onClick={handleBulkDelete}
            color="red"
            size='xs'
          >
            <IconTrash size={16} />
          </Button>
        </Tooltip>
      </Group>
    ),
  });

  useEffect(() => {
    load();
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearch]);

  async function load() {
    const startDateParam = startDate ? startDate.toISOString() : null;
    const endDateParam = endDate ? endDate.toISOString() : null;
    setIsLoading(true);
    const fetchedData = await HistoryAPI.getHistory(pagination.pageIndex + 1, pagination.pageSize, debouncedSearch, {
      startDateParam,
      endDateParam,
      searchInput,
      selectedOptions,
    });
    setIsLoading(false);
    setData(fetchedData.posts || []);
    setTotalCount((fetchedData?.totalRecords) || 0)
  }

  const handleDateChange = (type: 'start' | 'end', date: Date | null) => {
    if (type === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  return (
    <>
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Enter Tutorial Title">
        <TextInput
          placeholder="Enter tutorial title"
          value={tutorialTitle}
          onChange={(e) => setTutorialTitle(e.target.value)}
        />
        <Button onClick={handleCreateTutorial} fullWidth mt="md">Create</Button>
      </Modal>

      <Group gap="xl" style={{ margin: '2rem 0' }} justify='center'>
        <MaterialReactTable table={table} />
      </Group>
    </>
  );
};

export default HistoryMUI;

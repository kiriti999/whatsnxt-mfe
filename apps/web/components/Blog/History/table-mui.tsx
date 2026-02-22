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
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconPlus,
} from '@tabler/icons-react';
import { ContentAPI, HistoryAPI, StructuredTutorialAPI } from '../../../apis/v1/index';
import { useRouter } from 'next/navigation';
import { useDebouncedValue } from '@mantine/hooks';
import { downloadBase64File } from '../../../utils/downloadFile';
import { deleteIndex, indexRecord } from '@whatsnxt/core-util';
import { unifiedDeleteWebWorker } from '../../../utils/worker/assetManager';

const HistoryMUI = ({ open, close }: any) => {
  const { colorScheme } = useMantineColorScheme();
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
    if (rowData?.source === 'structured') {
      router.push(`/form/structured-tutorial?id=${rowData._id}`);
    } else {
      router.push(`/form${rowData?.tutorial ? '/tutorial' : '/blog'}?id=${rowData._id}`);
    }
  };

  const handleDownloadEbook = async (rowData: any) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadEBook(rowData._id);
      downloadBase64File(fileContent, filename, 'application/epub+zip');
      notifications.show({
        message: 'eBook downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error downloading eBook',
        color: 'red',
      });
    }
  };

  const handleDownloadPDF = async (rowData: any) => {
    try {
      const { filename, fileContent } = await HistoryAPI.downloadPDF(rowData._id);
      downloadBase64File(fileContent, filename, 'application/pdf');
      notifications.show({
        message: 'PDF downloaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error downloading PDF',
        color: 'red',
      });
    }
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

    let deleteResult: any;
    if (rowData?.source === 'structured') {
      deleteResult = await StructuredTutorialAPI.delete(rowData._id);
    } else {
      deleteResult = await ContentAPI[rowData?.tutorial ? 'deleteTutorial' : 'deleteBlog'](rowData._id);
    }
    const assetsList = rowData?.cloudinaryAssets || [];

    if (deleteResult) {
      if (assetsList.length > 0) {
        const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
        unifiedDeleteWebWorker({ assetsList, bffApiUrl })
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
      let publishRes: any;

      if (rowData?.source === 'structured') {
        const response = await StructuredTutorialAPI.publish(rowData._id, publish);
        publishRes = response.success ? response.data : null;
      } else {
        publishRes = await HistoryAPI.publishDraft(rowData._id, publish);
      }

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
        <a
          href={`/content/${decodeURIComponent(row.original.slug)}`}
          style={{
            color: colorScheme === 'dark' ? '#4c6ef5' : '#228be6',
            textDecoration: 'none'
          }}
        >
          {row.original.title.substring(0, 50)}{row.original.title.length > 50 ? '...' : ''}
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
            <IconEye
              size={'20'}
              color={colorScheme === 'dark' ? '#4c6ef5' : '#1976d2'}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <IconEyeOff
              size={'20'}
              color={colorScheme === 'dark' ? '#fa5252' : '#d32f2f'}
              style={{ cursor: 'pointer' }}
            />
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
      sx: {
        tableLayout: 'auto',
      },
    },
    muiSelectCheckboxProps: {
      sx: {
        color: colorScheme === 'dark' ? '#909296' : '#495057',
        '&.Mui-checked': {
          color: colorScheme === 'dark' ? '#4c6ef5' : '#228be6',
        },
      },
    },
    muiSelectAllCheckboxProps: {
      sx: {
        color: colorScheme === 'dark' ? '#909296' : '#495057',
        '&.Mui-checked': {
          color: colorScheme === 'dark' ? '#4c6ef5' : '#228be6',
        },
      },
    },
    muiTableContainerProps: {
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#25262b' : '#f8f9fa',
        color: colorScheme === 'dark' ? '#c1c2c5' : '#212529',
        borderBottom: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #dee2e6',
        fontWeight: 600,
      },
    },
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
        color: colorScheme === 'dark' ? '#c1c2c5' : '#212529',
        borderBottom: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #dee2e6',
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
        '&:hover': {
          backgroundColor: colorScheme === 'dark' ? '#25262b' : '#f8f9fa',
        },
      },
    }),
    muiTopToolbarProps: {
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
        color: colorScheme === 'dark' ? '#c1c2c5' : '#212529',
        borderBottom: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #dee2e6',
      },
    },
    muiBottomToolbarProps: {
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
        color: colorScheme === 'dark' ? '#c1c2c5' : '#212529',
        borderTop: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #dee2e6',
      },
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
      sx: {

        '& .MuiTablePagination-selectLabel': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
        },
        '& .MuiTablePagination-displayedRows': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
        },
        '& .MuiTablePagination-select': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
        },
        '& .MuiIconButton-root': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
        },
        '& .MuiPaginationItem-root': {
          color: colorScheme === 'dark' ? '#c1c2c5 !important' : '#212529',
          borderColor: colorScheme === 'dark' ? '#373a40' : '#dee2e6',
        },
        '& .MuiPaginationItem-root.Mui-selected': {
          backgroundColor: colorScheme === 'dark' ? 'rgba(76, 110, 245, 0.15)' : 'rgba(25, 113, 194, 0.1)',
          borderColor: colorScheme === 'dark' ? '#4c6ef5' : '#1971c2',
          color: colorScheme === 'dark' ? '#4c6ef5 !important' : '#1971c2',
        },
        '& .MuiTablePagination-selectIcon': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
        },
        '& .MuiTablePagination-menuItem': {
          color: colorScheme === 'dark' ? '#c1c2c5' : '#212529',
        },
      },
    },
    paginationDisplayMode: 'pages',
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        backgroundColor: colorScheme === 'dark' ? '#1a1b1e' : '#fff',
        border: colorScheme === 'dark' ? '1px solid #373a40' : '1px solid #dee2e6',
      },
    },
    positionGlobalFilter: 'left',
    muiSearchTextFieldProps: {
      sx: {
        minWidth: '300px',
        '& .MuiOutlinedInput-root': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#212529',
          '& fieldset': {
            borderColor: colorScheme === 'dark' ? '#373a40' : '#ced4da',
          },
          '&:hover fieldset': {
            borderColor: colorScheme === 'dark' ? '#4c6ef5' : '#228be6',
          },
          '&.Mui-focused fieldset': {
            borderColor: colorScheme === 'dark' ? '#4c6ef5' : '#228be6',
          },
        },
        '& .MuiInputLabel-root': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#868e96',
        },
        '& .MuiInputBase-input::placeholder': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#868e96',
          opacity: '1 !important',
        },
        '& .MuiSvgIcon-root': {
          color: colorScheme === 'dark' ? '#ffffff !important' : '#868e96',
        },
      },
      variant: 'outlined',
    },
    renderToolbarInternalActions: ({ table }) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label='Create content' fz={'xs'}>
          <Button
            onClick={() => router.push('/form')}
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

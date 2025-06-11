import React from 'react';
import { Table, Checkbox, TextInput, Pagination, Center, Box, Text, Loader } from '@mantine/core';
import styles from "./MantineTable.module.css";

const MantineTable = ({
    columns,
    data,
    isLoading = false,
    // pagination props
    pageSize = 10,
    totalCount = 0,
    currentPage = 1,
    setCurrentPage,
    onPaginationChange = null,
    // searching filter props
    searchQuery = "",
    setSearchQuery,
    // table props 
    className = "",
    withTableBorder = false,
    tableTitle = null,
    headerComponent: HeaderComponent = null,
    // checkbox related props
    isCheckBox = false,
    selectedRows = null,
    setSelectedRows = null,
    onSelectAllChange = null,
}) => {

    const handleSelectAll = (event) => {
        if (onSelectAllChange) {
            onSelectAllChange(event);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.currentTarget.value);
        // reset states on search change
        setCurrentPage(1);
        setSelectedRows && setSelectedRows([]);
    };

    const handlePaginationChange = (e) => {
        setCurrentPage(e);
        if (onPaginationChange) {
            onPaginationChange(e);
        }
        // reset selected rows 
        setSelectedRows && setSelectedRows([]);
    };

    return (
        <div className={className}>
            <Box display={"flex"} style={{ justifyContent: "space-between" }}>
                {tableTitle ? (
                    <Box>
                        <Text size='lg' fw={700}>{tableTitle}</Text>
                    </Box>
                ) : null}

                <Box className={styles["table-header-components"]}>
                    {HeaderComponent ? <HeaderComponent /> : null}
                    <Box>
                        <TextInput
                            placeholder="Search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            mb="md"
                        />
                    </Box>
                </Box>
            </Box>

            <Table withTableBorder={withTableBorder}>
                <thead>
                    <tr>
                        {isCheckBox && (
                            <th>
                                <Checkbox
                                    classNames={{ icon: styles["checkbox-right-icon"] }}
                                    onChange={handleSelectAll}
                                    checked={selectedRows.length === data?.length}
                                    indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < data?.length
                                    }
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th key={column.header}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={columns.length + (isCheckBox ? 1 : 0)}>
                                <Center style={{ flexDirection: "column", padding: '20px 0' }}>
                                    <Loader size="lg" />
                                </Center>
                            </td>
                        </tr>
                    ) : (
                        data && data.length > 0 ? data.map((row) => (
                            <tr key={row.id}>
                                {isCheckBox && (
                                    <td>
                                        <Checkbox
                                            classNames={{ icon: styles["checkbox-right-icon"] }}
                                            aria-label="Select row"
                                            checked={selectedRows.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                        />
                                    </td>
                                )}
                                {columns.map((column) => (
                                    <td key={column.header}>
                                        {typeof column.accessor === 'function'
                                            ? column.accessor(row)
                                            : row[column.accessor]}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (isCheckBox ? 1 : 0)}>
                                    <Center>No data available</Center>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </Table>

            <Box display={"flex"} style={{ justifyContent: "end" }}>
                <Pagination
                    value={currentPage}
                    onChange={handlePaginationChange}
                    total={Math.ceil(totalCount / pageSize)}
                    mt="md"
                    radius="md"
                />
            </Box>
        </div>
    );
};

export default MantineTable;

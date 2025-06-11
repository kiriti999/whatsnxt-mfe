import React from 'react';
import { Group, Pagination as MantinePagination } from '@mantine/core';

function Pagination({ nPages, currentPage, setCurrentPage }: IPagination) {

  const changePage = (page: number) => {
    setCurrentPage(page);
  }

  return (
    <Group justify="center" className="mt-5">
      <MantinePagination total={nPages} color="#fe4a55" value={currentPage} onChange={changePage} />
    </Group>
  );
}

interface IPagination {
  nPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default Pagination;

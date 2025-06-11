import React from 'react';
import { Pagination as MantinePagination } from '@mantine/core';
import styles from './pagination.module.css';

function Pagination(props: any) {
  const { nPages, currentPage, setCurrentPage, disabled = false, pageChangeCallback } = props;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pageChangeCallback && pageChangeCallback(page)
  };

  return (
    <MantinePagination
      disabled={disabled}
      value={currentPage}
      color="red"
      total={nPages}
      // page={currentPage}
      onChange={handlePageChange}
      withEdges
      classNames={{
        root: `${styles['pagination-area']}`, // Root container styling
        control: `${styles['page-numbers']} ${currentPage === currentPage ? styles['current'] : ''}`, // Apply active class within control
        dots: `${styles['dots']}`, // Dots styling
      }}
    />
  );
}

export default Pagination;

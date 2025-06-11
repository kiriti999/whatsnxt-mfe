import React, { FC } from 'react';
import { TextInput, ActionIcon } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import styles from './SearchForm.module.css';

import {
  IconSearch
} from "@tabler/icons-react";

export const SearchForm = ({
  handleSearch, inputRef,
  containerRef, search, show,
  setShow, change, data, isLoading,
  SearchResultComponent
}: SearchFormProps) => {
  const onChangeSearch = useDebouncedCallback(change, 250);
  return (
    // @ts-ignore
    <form ref={inputRef} className={styles['search-box']} onSubmit={handleSearch}>
      <TextInput
        placeholder="Search"
        size="md"
        radius="xl"
        className="w-100"
        // @ts-ignore
        onChange={onChangeSearch}
      />
      <ActionIcon
        type="submit"
        variant="transparent"
        color="#fe4a55"
        aria-label="Search"
        className={styles['search-icon']}
      >
        <IconSearch size={18} />
      </ActionIcon>
      {SearchResultComponent && (
        <SearchResultComponent
          data={data}
          isLoading={isLoading}
          search={search}
          show={show}
          setShow={setShow}
          containerRef={containerRef}
        />
      )}
    </form>
  );
};

type SearchResultProps = {
  data: any[];
  isLoading: boolean;
  search: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement>;
};

interface SearchFormProps {
  handleSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  search: string;
  show: boolean;
  setShow: any;
  change: (e: React.FormEvent<HTMLFormElement>) => void;
  data: any[],
  isLoading: boolean;
  SearchResultComponent?: FC<SearchResultProps>;
}
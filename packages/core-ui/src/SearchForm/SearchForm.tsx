"use client"
import React, { FC, useRef } from 'react';
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
  SearchResultComponent,
  variant = "default",
}: SearchFormProps) => {
  const onChangeSearch = useDebouncedCallback(change, 250);
  const formRef = useRef<HTMLFormElement>(null);
  const toolbar = variant === "toolbar";

  return (
    <form
      ref={formRef}
      className={`${styles["search-box"]} ${toolbar ? styles["search-box--toolbar"] : ""}`}
      onSubmit={handleSearch}
    >

      <TextInput
        ref={inputRef}
        placeholder="Search..."
        size={toolbar ? "sm" : "md"}
        radius="xl"
        className="w-100"
        onChange={onChangeSearch}
        styles={
          toolbar
            ? {
                input: {
                  minHeight: 38,
                  height: 38,
                },
              }
            : undefined
        }
        rightSection={
          <ActionIcon
            type="submit"
            variant="transparent"
            c="red"
            aria-label="Search"
            size={toolbar ? "sm" : "md"}
          >
            <IconSearch size={toolbar ? 16 : 18} />
          </ActionIcon>
        }
      />

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
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  data: any[];
  isLoading: boolean;
  SearchResultComponent?: FC<SearchResultProps>;
  /** Narrower control for headers/toolbars so it lines up with adjacent nav text */
  variant?: "default" | "toolbar";
}
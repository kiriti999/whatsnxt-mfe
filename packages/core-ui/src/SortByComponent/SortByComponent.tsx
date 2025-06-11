"use client"
import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select, ComboboxData } from '@mantine/core';

export const SortByComponent = () => {
  const router = useRouter();
  const searchParam = useSearchParams();
  const pathname = usePathname();
  const sortCourses = (sort: string | null) => {
    const params = new URLSearchParams(searchParam.toString())
    params.set("sort", sort ?? "");

    router.push(pathname + "?" + params);
  };

  const opts: ComboboxData = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'latest', label: 'Latest' },
    { value: 'low-high', label: 'Price: low to high' },
    { value: 'high-low', label: 'Price: high to low' },
  ]

  return (
    <div className="col-lg-4 col-md-6">
      <Select
        size="md"
        radius="md"
        placeholder="Sort by"
        clearable={true}
        data={opts}
        onChange={sortCourses}
      />
    </div>
  );
};

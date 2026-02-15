"use client"
import React, { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Select } from '@mantine/core';
import type { Category } from '@whatsnxt/core-util';

export const CoursesFilter = ({ categories }: { categories: Category[] }) => {
    const router = useRouter();
    const searchParam = useSearchParams();
    const pathname = usePathname();

    const currentSubCategory = searchParam.get('subcategory');

    const handleSubCategoryChange = (value: string | null) => {
        const params = new URLSearchParams(searchParam.toString());
        if (value) {
            params.set('subcategory', value);
            // Remove category if present, as the request is to filter by only subcategories
            params.delete('category');
        } else {
            params.delete('subcategory');
        }
        router.push(pathname + "?" + params.toString());
    };

    const subCategoryOptions = useMemo(() => {
        const allSubCategories = categories.flatMap(c => c.subcategories || []);
        // Remove duplicates and filter out "General" if needed
        const uniqueHelper = new Set();
        return allSubCategories
            .filter(s => {
                const isDuplicate = uniqueHelper.has(s.name);
                uniqueHelper.add(s.name);
                return !isDuplicate && s.name !== 'General';
            })
            .map(s => ({ value: s.name, label: s.name }));
    }, [categories]);

    return (
        <Select
            placeholder="Filter by Subcategory"
            data={subCategoryOptions}
            value={currentSubCategory}
            onChange={handleSubCategoryChange}
            clearable
            radius="md"
            size="md"
            searchable
        />
    );
};

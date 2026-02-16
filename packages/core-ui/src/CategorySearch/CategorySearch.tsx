'use client';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import classes from './CategorySearch.module.css';

/** A flattened category path with all three levels */
export interface CategoryPath {
    category: string;
    subCategory: string;
    nestedSubCategory: string;
}

/** Minimal subcategory shape matching the common pattern */
interface SubCategoryItem {
    name: string;
    subcategories?: SubCategoryItem[];
}

/** Minimal category shape matching the common pattern */
interface CategoryItem {
    categoryName: string;
    subcategories?: SubCategoryItem[];
}

export interface CategorySearchProps {
    /** Array of categories with nested subcategories */
    categories: CategoryItem[];
    /** Callback when a category path is selected */
    onSelect: (path: CategoryPath) => void;
    /** Optional placeholder text */
    placeholder?: string;
    /** Optional label text */
    label?: string;
}

/** Flatten categories into searchable paths */
const flattenCategories = (categories: CategoryItem[]): CategoryPath[] => {
    const paths: CategoryPath[] = [];
    for (const cat of categories) {
        if (!cat.subcategories || cat.subcategories.length === 0) {
            paths.push({ category: cat.categoryName, subCategory: '', nestedSubCategory: '' });
            continue;
        }
        for (const sub of cat.subcategories) {
            if (!sub.subcategories || sub.subcategories.length === 0) {
                paths.push({ category: cat.categoryName, subCategory: sub.name, nestedSubCategory: '' });
                continue;
            }
            for (const nested of sub.subcategories) {
                paths.push({ category: cat.categoryName, subCategory: sub.name, nestedSubCategory: nested.name });
            }
        }
    }
    return paths;
};

/** Filter paths that match the search term at any level */
const filterPaths = (paths: CategoryPath[], term: string): CategoryPath[] => {
    const lower = term.toLowerCase();
    return paths.filter(
        (p) =>
            p.category.toLowerCase().includes(lower) ||
            p.subCategory.toLowerCase().includes(lower) ||
            p.nestedSubCategory.toLowerCase().includes(lower)
    );
};

/** Highlight matching text in a string */
const HighlightText: React.FC<{ text: string; term: string }> = ({ text, term }) => {
    if (!term || !text) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <span className={classes.highlight}>{text.slice(idx, idx + term.length)}</span>
            {text.slice(idx + term.length)}
        </>
    );
};

/**
 * CategorySearch — a search input that searches across all levels of a
 * category hierarchy (Category → Subcategory → Nested Subcategory) and
 * lets the user pick a full path to auto-fill form fields.
 */
export const CategorySearch: React.FC<CategorySearchProps> = ({
    categories,
    onSelect,
    placeholder = 'Search all categories (e.g. Kubernetes)',
    label = 'Find My Category',
}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const allPaths = useMemo(() => flattenCategories(categories ?? []), [categories]);

    const results = useMemo(() => {
        if (!search.trim()) return [];
        return filterPaths(allPaths, search.trim());
    }, [allPaths, search]);

    const handleSelect = useCallback(
        (path: CategoryPath) => {
            onSelect(path);
            setSearch('');
            setIsOpen(false);
        },
        [onSelect],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, path: CategoryPath) => {
            if (e.key === 'Enter') handleSelect(path);
        },
        [handleSelect],
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const showDropdown = isOpen && search.trim().length > 0;

    return (
        <div className={classes.wrapper} ref={wrapperRef}>
            <TextInput
                label={label}
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    setIsOpen(true);
                }}
                onFocus={() => search.trim() && setIsOpen(true)}
                leftSection={<IconSearch size={16} />}
                rightSection={
                    search ? (
                        <IconX
                            size={14}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setSearch('');
                                setIsOpen(false);
                            }}
                        />
                    ) : null
                }
            />
            {showDropdown && (
                <div className={classes.resultsDropdown}>
                    {results.length === 0 ? (
                        <div className={classes.noResults}>No matching categories found</div>
                    ) : (
                        results.map((path, idx) => (
                            <div
                                key={`${path.category}-${path.subCategory}-${path.nestedSubCategory}-${idx}`}
                                className={classes.resultItem}
                                onClick={() => handleSelect(path)}
                                onKeyDown={(e) => handleKeyDown(e, path)}
                                tabIndex={0}
                                role="option"
                                aria-selected={false}
                            >
                                <span className={classes.breadcrumb}>
                                    <HighlightText text={path.category} term={search} />
                                    {path.subCategory && (
                                        <>
                                            <span className={classes.separator}>→</span>
                                            <HighlightText text={path.subCategory} term={search} />
                                        </>
                                    )}
                                    {path.nestedSubCategory && (
                                        <>
                                            <span className={classes.separator}>→</span>
                                            <HighlightText text={path.nestedSubCategory} term={search} />
                                        </>
                                    )}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

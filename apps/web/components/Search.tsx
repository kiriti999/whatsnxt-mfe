// Search.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { SearchForm, SearchBarResult } from '@whatsnxt/core-ui';
import { useAlgoliaSearch } from '@whatsnxt/core-util';
import { useSearchContext } from '../context/SearchContext';

function Search({ variant = "default" }: { variant?: "default" | "toolbar" }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [show, setShow] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { indexType } = useSearchContext();

    const { data, isLoading } = useAlgoliaSearch<any>(indexType, search);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/course-search?q=${search}`);
        setShow(false);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setShow(true);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                !inputRef?.current?.contains(target) &&
                !containerRef?.current?.contains(target)
            )
                setShow(false);
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <SearchForm
            handleSearch={handleSearch}
            inputRef={inputRef}
            containerRef={containerRef}
            search={search}
            show={show}
            setShow={setShow}
            change={onChange}
            data={data}
            isLoading={isLoading}
            SearchResultComponent={SearchBarResult}
            variant={variant}
        />
    )
}

export default Search
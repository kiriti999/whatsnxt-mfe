import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { SearchForm, SearchResult } from '@whatsnxt/core-ui';
import { useAlgoliaSearch, type CourseType } from '@whatsnxt/core-util';

function Search() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [show, setShow] = useState(true);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const { data, isLoading } = useAlgoliaSearch<CourseType>(search);

    const handleSearch = (e) => {
        e.preventDefault();
        router.push(`/algolia-search?q=${search}`);
        setShow(false);
    };

    const onChange = (e) => {
        setSearch(e.target.value);
        setShow(true);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                !inputRef?.current?.contains(e.target) &&
                !containerRef?.current?.contains(e.target)
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
            search={search} show={show} setShow={setShow}
            change={onChange} data={data} isLoading={isLoading}
            SearchResultComponent={SearchResult}
        />
    )
}

export default Search

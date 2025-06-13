import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import { SearchForm, SearchBarResult } from '@whatsnxt/core-ui';
import { useAlgoliaSearch } from '@whatsnxt/core-util';
import { useSearchContext } from '@/context/SearchContext';

function Search() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [show, setShow] = useState(true);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const { indexType } = useSearchContext();

    const { data, isLoading } = useAlgoliaSearch<any>(indexType, search);

    const handleSearch = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        router.push(`/course-search?q=${search}`);
        setShow(false);
    };

    const onChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setSearch(e.target.value);
        setShow(true);
    };

    useEffect(() => {
        const handleClickOutside = (e: { target: any; }) => {
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
            SearchResultComponent={SearchBarResult}
        />
    )
}

export default Search

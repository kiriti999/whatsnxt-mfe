'use client';
import { Component, useEffect, useState } from 'react';
import BlogCard from '../../../components/Blog/Cards/Blog';
import TutorialCard from '../../../components/Blog/Cards/Tutorial';
import styles from './Search.module.css';
import CardSkeleton from '../../../components/Blog/Content/CardSkeleton';
import { Grid, Title } from '@mantine/core';
import { algoliaSearchByKeyword } from '@whatsnxt/core-util';
import { useSearchContext } from '../../../context/SearchContext';
import Pagination from '../../../components/pagination/pagination';

function Search({ query }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [nPages, setNPages] = useState(0);
  const { indexType } = useSearchContext();

  useEffect(() => {
    const searchData = async () => {
      try {
        setLoading(true);
        const res = await algoliaSearchByKeyword(indexType, query, page - 1, 10, {
          searchableAttributes: ['title']
        });
        setData(res.hits);
        setTotal(res.nbHits);
        setNPages(res.nbPages);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    searchData();
  }, [query, page]);

  return (
    <div className={styles.container + ' container'}>
      {Array.isArray(data) && data.length > 0 && (
        <>
          <div className={styles.header}>
            <p>
              We found <strong>{total}</strong> results available for you
            </p>
          </div>
          <Grid>
            {data?.map((item: any, i: any) => (
              <Component key={i}>
                {item?.tutorial ? (
                  <TutorialCard tutorial={item} />
                ) : (
                  <BlogCard blog={item} />
                )}
              </Component>
            ))}
          </Grid>
        </>
      )}
      {!loading && Array.isArray(data) && data.length == 0 && (
        <div>
          <Title order={5}>No results available for {query}</Title>
        </div>
      )}
      {loading && <CardSkeleton count={8} />}
      
      {!loading && Array.isArray(data) && data.length > 0 && (
        <Pagination
          nPages={nPages}
          currentPage={page}
          setCurrentPage={setPage}
        />
      )}
    </div>
  );
}

export default Search;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import {
  getPosts,
  getTutorials,
  selectArticles,
  selectTutorials,
  selectContentLoading,
  selectContentError,
  selectTotalCount,
  ContentItem
} from '../../../store/slices/contentSlice';
import Pagination from '../../Common/Pagination';
import ErrorTemplate from './ErrorTemplate';
import TutorialCard from '../Cards/Tutorial';
import BlogCard from '../Cards/Blog';
import { SkeletonCardContent } from '@whatsnxt/core-ui'
import { Box, Container, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ContentType } from '../../../types/form';

export type ComponentContentType = "blog" | "tutorial" | "both";

export interface ContentProps {
  type: ComponentContentType;
}

function ContentComponent(props: ContentProps) {
  const { type } = props;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const articles = useSelector(selectArticles);

  const tutorials = useSelector(selectTutorials);
  const loading = useSelector(selectContentLoading);
  const error = useSelector(selectContentError);
  const totalCount = useSelector(selectTotalCount);

  const dispatch = useDispatch<AppDispatch>();
  const [recordsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const nPages = Math.ceil(totalCount / recordsPerPage);

  useEffect(() => {
    if (type === 'tutorial') {
      dispatch(getTutorials({ start: currentPage, limit: recordsPerPage, type }));
    } else {
      const apiType = type === 'both' ? '' : type;
      dispatch(getPosts({ start: currentPage, limit: recordsPerPage, type: apiType as ContentType }));
    }
  }, [type, dispatch, recordsPerPage, currentPage]);

  const pageChangeCallback = (page: number) => {
    setCurrentPage(page);
    if (type === 'tutorial') {
      dispatch(getTutorials({ start: page, limit: recordsPerPage, type }));
    } else {
      const apiType = type === 'both' ? '' : type;
      dispatch(getPosts({ start: page, limit: recordsPerPage, type: apiType as ContentType }));
    }
  }

  const displayData: ContentItem[] = type === 'tutorial' ? tutorials : articles;

  return (
    <>
      <Group justify={isMobile ? 'center' : 'start'}>
        {error && error !== '' && <ErrorTemplate />}
        {loading ? (
          <SkeletonCardContent />
        ) : (
          displayData && displayData.length > 0 &&
          displayData.map((item: ContentItem, i: number) => (
            <Box key={item._id || i}>
              {item?.tutorial || type === 'tutorial' ? (
                <TutorialCard tutorial={item} />
              ) : (
                <BlogCard blog={item} />
              )}
            </Box>
          ))
        )}
      </Group>

      {nPages > 1 && !loading && (!error || error === '') && displayData && displayData.length > 0 && (
        <Group mt={'xl'} justify="center">
          <Container fluid>
            <Pagination
              pageChangeCallback={pageChangeCallback}
              nPages={nPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Container>
        </Group>
      )}
    </>
  );
}

export default ContentComponent;
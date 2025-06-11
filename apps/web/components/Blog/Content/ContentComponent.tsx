import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { getPosts, getTutorials } from '../../../store/slices/contentSlice';
import Pagination from '../../Common/Pagination';
import ErrorTemplate from './ErrorTemplate';
import TutorialCard from '../Cards/Tutorial';
import BlogCard from '../Cards/Blog';
import { SkeletonCardContent } from '@whatsnxt/core-ui'
import { Box, Container, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

/* eslint-disable-next-line */
export type ContentType = "blog" | "tutorial" | "both";
/* eslint-disable-next-line */
export interface ContentProps {
  type: ContentType;
}

function ContentComponent(props: ContentProps) {
  const { type } = props;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const content = useSelector((store: RootState) => store.content);
  console.log(' ContentComponent :: content:', content);
  const totalCount = useSelector((store: RootState) => store.content.totalCount);
  const dispatch = useDispatch<AppDispatch>();
  const [recordsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const nPages = Math.ceil(totalCount / recordsPerPage);

  useEffect(() => {
    if (type === 'tutorial') {
      dispatch(getTutorials({ start: currentPage, limit: recordsPerPage, type }));
    } else {
      dispatch(getPosts({ start: currentPage, limit: recordsPerPage, type }));
    }
  }, [type, dispatch, recordsPerPage]); // Added dependencies

  const pageChangeCallback = (page: number) => {
    setCurrentPage(page);
    if (type === 'tutorial') {
      dispatch(getTutorials({ start: page, limit: recordsPerPage, type }));
    } else {
      dispatch(getPosts({ start: page, limit: recordsPerPage, type }));
    }
  }

  // Get the appropriate data based on type
  const displayData = type === 'tutorial' ? content.tutorials : content.articles;

  return (
    <>
      <Group justify={isMobile ? 'center' : 'start'}>
        {content.error !== '' && <ErrorTemplate />}
        {content.loading ? (
          <SkeletonCardContent />
        ) : (
          displayData && displayData.length > 0 &&
          displayData.map((item: any, i: number) => (
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

      {nPages > 1 && <Group mt={'xl'}>
        {!content.loading &&
          content.error === '' &&
          displayData && displayData.length > 0 ? (
          <Container fluid>
            <Pagination
              pageChangeCallback={pageChangeCallback}
              nPages={nPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </Container>
        ) : null}
      </Group>}
    </>
  );
}

export default ContentComponent;
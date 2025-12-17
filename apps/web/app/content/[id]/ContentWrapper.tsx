'use client';

import { Box } from '@mantine/core';
import BlogContentDetails from './BlogContentDetails';
import TutorialContentDetails from './TutorialContentDetails';
import { PostSlugResponse } from './BlogContentDetails';

interface ContentWrapperProps {
  details: PostSlugResponse;
}

export default function ContentWrapper({ details }: ContentWrapperProps) {
  return (
    <Box my={'xl'}>
      {details?.tutorial ? (
        <TutorialContentDetails details={details} />
      ) : (
        <BlogContentDetails details={details} />
      )}
    </Box>
  );
}

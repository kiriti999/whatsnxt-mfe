'use client';

import { Box } from '@mantine/core';
import { useSearchParams } from 'next/navigation';
import BlogContentDetails from './BlogContentDetails';
import TutorialContentDetails from './TutorialContentDetails';
import StructuredTutorialContentDetails from './StructuredTutorialContentDetails';
import { PostSlugResponse } from './BlogContentDetails';

interface ContentWrapperProps {
  details: PostSlugResponse;
}

export default function ContentWrapper({ details }: ContentWrapperProps) {
  const searchParams = useSearchParams();
  const tutorialIdParam = searchParams.get('tutorial');
  const tutorialId = tutorialIdParam || (details as any).tutorialId || ((details as any).isStructuredTutorial ? (details as any)._id : null);

  // If there's a tutorial query param or it's a structured tutorial type (root or post)
  if ((details as any).isStructuredTutorial || (details as any).isStructuredTutorialPost || tutorialIdParam) {
    return (
      <Box my={'xl'}>
        <StructuredTutorialContentDetails
          details={details}
          tutorialId={tutorialId}
        />
      </Box>
    );
  }

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


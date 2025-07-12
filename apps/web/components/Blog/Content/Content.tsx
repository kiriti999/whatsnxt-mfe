'use client';

import React, { Suspense } from 'react';
import Sidebar from '../sidebar';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Box, Grid, GridCol } from '@mantine/core';
import type { ContentProps } from './ContentComponent';

// Lazy import the heavy components
const HomeContent = React.lazy(() => import('./HomeContent'));
const ContentComponent = React.lazy(() => import('./ContentComponent'));

function Content(props: ContentProps) {
  const { type = 'both' } = props;

  return (
    <Box pt={'xl'} pb={'xl'}>
      <Grid>
        <GridCol span={{ base: 12, md: 9 }}>
          <Suspense fallback={<MantineLoader />}>
            {type === 'both' ? (
              <HomeContent type={type} />
            ) : (
              <ContentComponent type={type} />
            )}
          </Suspense>
        </GridCol>

        <GridCol span={{ base: 12, md: 3 }}>
          <Sidebar />
        </GridCol>
      </Grid>
    </Box>
  );
}

export default Content;

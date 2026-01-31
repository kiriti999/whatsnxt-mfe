'use client';

import React, { Suspense } from 'react';
import Sidebar from '../sidebar';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Box, Grid, GridCol } from '@mantine/core';

// Lazy import the heavy component
const HomeContent = React.lazy(() => import('./HomeContent'));

export type ContentType = "blog" | "tutorial" | "both";

export interface ContentProps {
  type: ContentType;
}

function Content(props: ContentProps) {
  const { type = 'both' } = props;

  return (
    <Box pt={'xl'} pb={'xl'}>
      <Grid>
        <GridCol span={{ base: 12, md: 9 }}>
          <Suspense fallback={<MantineLoader />}>
            <HomeContent type={type} />
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

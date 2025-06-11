'use client';
import React, { Suspense } from 'react';
import Sidebar from '../sidebar';
import ContentComponent from './ContentComponent';
import type { ContentProps } from './ContentComponent';
import HomeContent from './HomeContent';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Box, Grid, GridCol } from '@mantine/core';

function Content(props: ContentProps) {
  const { type = 'both' } = props;
  return (
    <Suspense fallback={<MantineLoader />}>
      <Box pt={'xl'} pb={'xl'}>
        <Grid>
          <GridCol span={{ base: 12, md: 9 }}>
            {type === 'both' ? (
              <HomeContent type={type} />
            ) : (
              <ContentComponent type={type} />
            )}
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <Sidebar />
          </GridCol>
        </Grid>
      </Box>
    </Suspense>

  );
}

export default Content;

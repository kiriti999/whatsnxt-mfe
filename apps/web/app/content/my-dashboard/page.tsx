import { MantineLoader } from '@whatsnxt/core-ui';
import { Suspense } from 'react';
import { DashboardContent } from '../../../components/Blog/Content/MyDashboard/MyDashboardContent';
import { Container } from '@mantine/core';
import React from 'react';

const Page = () => {
  return (
    <Suspense fallback={<MantineLoader />}>
      <Container fluid>
        <DashboardContent type={'both'}></DashboardContent>
      </Container>
    </Suspense>
  )
};

export default Page;

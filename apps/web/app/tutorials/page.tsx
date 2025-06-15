import Content from '../../components/Blog/Content/Content';
import { Container } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Suspense } from 'react';

const Tutorial = () => {
  return (
    <Suspense fallback={<MantineLoader />}>
      <Container fluid>
        <Content type="tutorial"></Content>
      </Container>
    </Suspense>
  );
};

export default Tutorial;

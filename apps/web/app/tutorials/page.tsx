// import Content from '../../components/Blog/Content/Content';
// import { Container } from '@mantine/core';
// import { MantineLoader } from '@whatsnxt/core-ui';
// import { Suspense } from 'react';

// const Tutorial = () => {
//   return (
//     <Suspense fallback={<MantineLoader />}>
//       <Container fluid>
//         <Content type="tutorial"></Content>
//       </Container>
//     </Suspense>
//   );
// };

// export default Tutorial;


import { Container } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';
import dynamic from 'next/dynamic';
const Content = dynamic(() => import('../../components/Blog/Content/Content'), {
  ssr: false,
  loading: () => <MantineLoader />,
});

export default function TutorialPage() {
  return (
    <Container fluid>
      <Content type="tutorial" />
    </Container>
  );
}

// import React, { Suspense } from 'react';

// import Content from '../../components/Blog/Content/Content';
// import { MantineLoader } from '@whatsnxt/core-ui';
// import { Container } from '@mantine/core';

// export const metadata = {
//     title:
//         'Blogs | whatsnxt blogs and tutorials - Online skill development and learning',
// };

// const BlogPage = () => {
//     return (
//         <Suspense fallback={<MantineLoader />}>
//             <Container fluid>
//                 <Content type="blog" />
//             </Container>
//         </Suspense>
//     );
// };

// export default BlogPage;


'use client';

import { Container } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';
import dynamic from 'next/dynamic';

const Content = dynamic(() => import('../../components/Blog/Content/Content'), {
  ssr: false,
  loading: () => <MantineLoader />,
});

export const metadata = {
  title:
    'Blogs | whatsnxt blogs and tutorials - Online skill development and learning',
};

export default function BlogPage() {
  return (
    <Container fluid>
      <Content type="blog" />
    </Container>
  );
}

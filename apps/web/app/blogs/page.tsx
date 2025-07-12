import React, { Suspense } from 'react';

import Content from '../../components/Blog/Content/Content';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Container } from '@mantine/core';

export const metadata = {
    title:
        'Blogs | whatsnxt blogs and tutorials - Online skill development and learning',
};

const BlogPage = () => {
    return (
        <Suspense fallback={<MantineLoader />}>
            <Container fluid>
                <Content type="blog" />
            </Container>
        </Suspense>
    );
};

export default BlogPage;

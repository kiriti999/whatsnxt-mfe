"use client"

import React from 'react';
import BlogClient from '../../../components/Blog/blog-client';
import { PageBanner } from '@whatsnxt/core-ui';
import { Container, Grid } from '@mantine/core';

function Blog() {

    return (
        <div>
            <div style={{ paddingTop: '25px', paddingBottom: '100px' }}>
                <Container>
                    <Grid>
                        <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                            {/* <BlogClient /> */}
                        </Grid.Col>
                        {/* Uncomment and implement the sidebar if needed */}
                        {/* <Grid.Col span={{ base: 12, lg: 3, md: 6 }}>
                            <Sidebar />
                        </Grid.Col> */}
                    </Grid>
                </Container>
            </div>
        </div>
    );
}

export default Blog;

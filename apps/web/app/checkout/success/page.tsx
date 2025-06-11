import { Box, Container, Grid, Title, Text } from '@mantine/core';
import { PageBanner } from '@whatsnxt/core-ui';
import Link from 'next/link'
import React from 'react'

const Page = () => {
    return (
        <>
            <Container>
                <Grid className='my-5 text-center' justify='center'>
                    <Box>
                        <Title order={1}>Thank You!</Title>
                        <Text>Your payment is successful</Text>
                        <Title order={5} className='mt-3'>
                            <Link legacyBehavior href='/my-courses'>Go to my courses</Link>
                        </Title>
                    </Box>
                </Grid>

            </Container>
        </>
    )
}

export default Page
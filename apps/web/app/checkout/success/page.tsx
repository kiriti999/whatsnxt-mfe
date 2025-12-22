import { Box, Container, Grid, Title, Text } from '@mantine/core';
import { PageBanner } from '@whatsnxt/core-ui';
import Link from 'next/link'
import React from 'react'

const Page = () => {
    return (
        <>
            <Container>
                <Grid my={"15rem"} justify='center' ta={'center'}>
                    <Box>
                        <Title order={1}>Thank You!</Title>
                        <Text>Your payment is successful</Text>
                        <Title order={5} mt={"1rem"}>
                            <Link href='/my-courses'>Go to my courses</Link>
                        </Title>
                    </Box>
                </Grid>

            </Container>
        </>
    )
}

export default Page
'use client'
import { Grid, Group, Stack, Button, Container, Text } from '@mantine/core'
import { MantineLoader } from '@whatsnxt/core-ui'
import Link from 'next/link'
import React, { Suspense } from 'react'

export function ContentTypeForm() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <Container mb={'5rem'}>
                <Grid>
                    <Grid.Col>
                        <Group justify='center'>
                            <Text
                                size="xl"
                                mb={20}
                                fw={500}
                                fz={18}
                                ta="center"
                            >
                                Choose the type of content you would like to write
                            </Text>
                        </Group>
                    </Grid.Col>
                    <Grid.Col>
                        <Group justify='center'>
                            <Stack>
                                <Link href="/form/blog" passHref>
                                    <Button fullWidth>BLOG</Button>
                                </Link>
                                <Link href="/form/tutorial" passHref>
                                    <Button fullWidth>TUTORIAL</Button>
                                </Link>
                            </Stack>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Container>
        </Suspense>
    )
}

export default ContentTypeForm
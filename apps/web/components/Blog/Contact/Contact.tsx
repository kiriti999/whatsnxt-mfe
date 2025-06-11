import { Container, Center, Stack, Title, Paper, Group, Box, Text } from '@mantine/core'
import { IconMapPin, IconPhone, IconClock } from '@tabler/icons-react'
import { MantineLoader } from '@whatsnxt/core-ui'
import React, { Suspense } from 'react'

export function Contact() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <Container pb={'xl'}>
                <Center>
                    <Stack align="center">
                        <Title order={3}>
                            Get in Touch
                        </Title>

                        <Paper withBorder p={'xl'}>
                            <Stack>
                                <Group align="baseline">
                                    <Box>
                                        <IconMapPin size={14} />
                                    </Box>
                                    <Stack>
                                        <Text size="md">
                                            Our Address
                                        </Text>
                                        <Text size="md">Hyderabad, India</Text>
                                    </Stack>
                                </Group>

                                <Group align="baseline">
                                    <Box>
                                        <IconPhone size={14} />
                                    </Box>
                                    <Stack>
                                        <Text size="md">
                                            Mail: <a href="mailto:info@whatsnxt.in">info@whatsnxt.in</a>
                                        </Text>
                                    </Stack>
                                </Group>

                                <Group align="baseline">
                                    <Box>
                                        <IconClock size={14} />
                                    </Box>
                                    <Stack>
                                        <Text size="md">
                                            Hours of Operation
                                        </Text>
                                        <Text size="md">Monday - Friday: 10:00 - 15:00</Text>
                                        <Text size="md">Sunday & Saturday: 10:30 - 13:00</Text>
                                    </Stack>
                                </Group>
                            </Stack>

                        </Paper>

                    </Stack>
                </Center>
            </Container>
        </Suspense>
    )
}

export default Contact
'use client'
import { Container, Text, SimpleGrid, Paper, Stack, ThemeIcon, Box, Title, Group } from '@mantine/core'
import { MantineLoader } from '@whatsnxt/core-ui'
import { IconArticle, IconBook, IconSparkles, IconLayoutList } from '@tabler/icons-react'
import Link from 'next/link'
import React, { Suspense } from 'react'

const contentTypes = [
    {
        href: '/form/blog',
        icon: IconArticle,
        title: 'Blog Post',
        description: 'Share insights, stories, and ideas with your audience',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea'
    },
    {
        href: '/form/tutorial',
        icon: IconBook,
        title: 'Tutorial',
        description: 'Create step-by-step guides to help others learn',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f093fb'
    },
    {
        href: '/form/structured-tutorial',
        icon: IconLayoutList,
        title: 'Structured Tutorial',
        description: 'Build comprehensive multi-section tutorials with organized content',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        color: '#11998e'
    }
]

export function ContentTypeForm() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <Container size="md" py={{ base: 'xl', sm: '4rem' }}>
                <Stack gap="xl" align="center">
                    {/* Header Section */}
                    <Stack gap="xs" align="center" maw={600}>
                        <Group justify="center" gap="xs">
                            <ThemeIcon
                                size="xl"
                                radius="md"
                                variant="gradient"
                                gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                            >
                                <IconSparkles size={24} />
                            </ThemeIcon>
                            <Title order={1} size="h2" ta="center">
                                Create Content
                            </Title>
                        </Group>
                        <Text
                            size="lg"
                            c="dimmed"
                            ta="center"
                            fw={400}
                        >
                            Choose the type of content you would like to write
                        </Text>
                    </Stack>

                    {/* Content Type Cards */}
                    <SimpleGrid
                        cols={{ base: 1, sm: 2 }}
                        spacing="lg"
                        w="100%"
                        mt="md"
                    >
                        {contentTypes.map((type) => (
                            <Link
                                key={type.href}
                                href={type.href}
                                style={{ textDecoration: 'none' }}
                            >
                                <Paper
                                    shadow="sm"
                                    p="xl"
                                    radius="md"
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: '100%',
                                        minHeight: '200px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    className="content-type-card"
                                >
                                    <Stack gap="md" h="100%" justify="space-between">
                                        <Box>
                                            <ThemeIcon
                                                size={60}
                                                radius="md"
                                                variant="gradient"
                                                gradient={{ from: type.color, to: type.color, deg: 135 }}
                                                mb="md"
                                                style={{
                                                    background: type.gradient
                                                }}
                                            >
                                                <type.icon size={32} stroke={1.5} />
                                            </ThemeIcon>

                                            <Title order={3} size="h3" mb="xs">
                                                {type.title}
                                            </Title>

                                            <Text size="sm" c="dimmed" lh={1.6}>
                                                {type.description}
                                            </Text>
                                        </Box>

                                        <Text
                                            size="sm"
                                            fw={600}
                                            style={{
                                                color: type.color,
                                                opacity: 0
                                            }}
                                            className="card-cta"
                                        >
                                            Get Started →
                                        </Text>
                                    </Stack>
                                </Paper>
                            </Link>
                        ))}
                    </SimpleGrid>
                </Stack>

                {/* Add custom styles for hover effects */}
                <style jsx global>{`
                    .content-type-card {
                        position: relative;
                    }
                    
                    .content-type-card:hover {
                        transform: translateY(-4px);
                        box-shadow: var(--mantine-shadow-lg);
                    }
                    
                    .content-type-card:hover .card-cta {
                        opacity: 1 !important;
                        transition: opacity 0.3s ease;
                    }
                    
                    .content-type-card:active {
                        transform: translateY(-2px);
                    }
                `}</style>
            </Container>
        </Suspense>
    )
}

export default ContentTypeForm
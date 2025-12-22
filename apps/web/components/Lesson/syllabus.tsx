'use client';
import Link from 'next/link';
import { Accordion, Title, Text, Tooltip, Flex, Stack, Badge, ThemeIcon, Box, useMantineColorScheme } from '@mantine/core';
import { IconFileInfo, IconStarFilled, IconVideo, IconChevronDown, IconPlayerPlay, IconDownload, IconBook } from '@tabler/icons-react';
import styles from './lesson.module.css';

const Syllabus = ({ sections, courseSlug }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    if (!sections || sections.length === 0) {
        return (
            <Box className={styles.syllabus}>
                <Title order={3}>Syllabus</Title>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    py="xl"
                    gap="md"
                >
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                        <IconBook size={28} stroke={1.5} />
                    </ThemeIcon>
                    <Text c="dimmed" ta="center">No syllabus available yet.</Text>
                </Flex>
            </Box>
        );
    }

    const totalVideos = sections.reduce((acc, section) => acc + (section.videos?.length || 0), 0);

    return (
        <div className={styles.syllabus}>
            <Flex justify="space-between" align="center" mb="md">
                <Title order={3}>Syllabus</Title>
                <Badge
                    variant="light"
                    color="blue"
                    size="lg"
                    radius="xl"
                    styles={{
                        root: {
                            textTransform: 'none',
                            fontWeight: 600,
                        }
                    }}
                >
                    {totalVideos} lessons
                </Badge>
            </Flex>

            <Accordion
                variant="separated"
                radius="md"
                chevron={<IconChevronDown size={18} />}
                styles={{
                    item: {
                        background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-white)',
                        border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'}`,
                        marginBottom: '0.5rem',
                        transition: 'all 0.2s ease',
                        '&[data-active]': {
                            borderColor: isDark ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-blue-3)',
                        },
                    },
                    control: {
                        padding: '0.875rem 1rem',
                        '&:hover': {
                            background: isDark ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-0)',
                        },
                    },
                    chevron: {
                        color: isDark ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-6)',
                    },
                    label: {
                        fontWeight: 600,
                    },
                    content: {
                        padding: '0 1rem 1rem 1rem',
                    },
                }}
            >
                {sections.map(({ sectionTitle, videos, _id: sectionId }, i) => {
                    const sectionNumber = String(i + 1).padStart(2, '0');

                    return (
                        <Accordion.Item key={sectionId} value={sectionTitle}>
                            <Accordion.Control
                                icon={
                                    <Badge
                                        size="md"
                                        radius="md"
                                        variant="filled"
                                        color="blue"
                                        styles={{
                                            root: {
                                                minWidth: '36px',
                                                height: '28px',
                                                fontWeight: 700,
                                            }
                                        }}
                                    >
                                        {sectionNumber}
                                    </Badge>
                                }
                            >
                                <Flex justify="space-between" align="center" style={{ width: '100%', paddingRight: '0.5rem' }}>
                                    <Text size="sm" fw={600} lineClamp={1}>
                                        {sectionTitle}
                                    </Text>
                                    {videos?.length > 0 && (
                                        <Badge size="xs" variant="light" color="gray" radius="xl">
                                            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                                        </Badge>
                                    )}
                                </Flex>
                            </Accordion.Control>
                            <Accordion.Panel>
                                {!videos || videos.length === 0 ? (
                                    <Text size="sm" c="dimmed" ta="center" py="md">
                                        No videos in this section yet.
                                    </Text>
                                ) : (
                                    <ul className={styles['videos-container']}>
                                        {videos.map((video) => (
                                            <li key={video._id}>
                                                <Stack gap="xs">
                                                    <Link
                                                        href={`/courses/${courseSlug}/section/${sectionId}/lesson/${video._id}`}
                                                        passHref
                                                        style={{ textDecoration: 'none' }}
                                                    >
                                                        <Flex align="center" gap="sm">
                                                            <ThemeIcon size={28} radius="md" variant="light" color="blue">
                                                                <IconPlayerPlay size={14} />
                                                            </ThemeIcon>
                                                            <Text size="sm" lineClamp={1} c={isDark ? 'gray.2' : 'dark.6'}>
                                                                {video.name}
                                                            </Text>
                                                        </Flex>
                                                    </Link>

                                                    {video?.docUrl && (
                                                        <Link href={video.docUrl} passHref style={{ textDecoration: 'none' }}>
                                                            <Flex align="center" gap="sm" ml={36}>
                                                                <ThemeIcon size={24} radius="md" variant="light" color="teal">
                                                                    <IconDownload size={12} />
                                                                </ThemeIcon>
                                                                <Text size="xs" c="teal.6" fw={500}>
                                                                    Download Resources
                                                                </Text>
                                                            </Flex>
                                                        </Link>
                                                    )}
                                                </Stack>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })}

                {/* User Feedback Section */}
                {sections.length > 0 && (
                    <Accordion.Item key="review" value="rating-review">
                        <Accordion.Control
                            icon={
                                <Badge
                                    size="md"
                                    radius="md"
                                    variant="filled"
                                    color="yellow"
                                    styles={{
                                        root: {
                                            minWidth: '36px',
                                            height: '28px',
                                            fontWeight: 700,
                                        }
                                    }}
                                >
                                    {String(sections.length + 1).padStart(2, '0')}
                                </Badge>
                            }
                        >
                            <Text size="sm" fw={600}>
                                Rate & Review
                            </Text>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <ul className={styles['videos-container']}>
                                <li>
                                    <Link
                                        href={`/courses/${courseSlug}/section/${sections[0]._id}/lesson/review`}
                                        passHref
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Flex align="center" gap="sm">
                                            <ThemeIcon size={28} radius="md" variant="light" color="yellow">
                                                <IconStarFilled size={14} />
                                            </ThemeIcon>
                                            <Text size="sm" c={isDark ? 'gray.2' : 'dark.6'}>
                                                Share your feedback
                                            </Text>
                                        </Flex>
                                    </Link>
                                </li>
                            </ul>
                        </Accordion.Panel>
                    </Accordion.Item>
                )}
            </Accordion>
        </div>
    );
};

export default Syllabus;

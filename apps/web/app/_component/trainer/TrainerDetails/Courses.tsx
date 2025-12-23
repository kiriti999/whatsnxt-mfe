import { Stack, Grid, Anchor, Text, Paper, Group, Badge } from '@mantine/core';
import Link from 'next/link';
import { IconBook2 } from '@tabler/icons-react';

const Courses = ({ courses }) => {
    if (courses.length === 0) {
        return (
            <Paper p="xl" radius="md" withBorder>
                <Text ta="center" c="dimmed" size="sm">
                    No courses found
                </Text>
            </Paper>
        )
    }

    return (
        <Stack gap="md">
            {courses?.map((course) => (
                <Paper
                    key={course._id || course.slug}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                            boxShadow: 'var(--mantine-shadow-sm)',
                            transform: 'translateY(-2px)'
                        }
                    }}
                >
                    <Group gap="md" wrap="nowrap">
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--mantine-color-blue-0)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <IconBook2 size={20} color="var(--mantine-color-blue-6)" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Anchor
                                component={Link}
                                href={`/courses/${course.slug}`}
                                style={{
                                    textDecoration: 'none',
                                    display: 'block'
                                }}
                            >
                                <Text
                                    size="sm"
                                    fw={600}
                                    c="blue"
                                    style={{
                                        wordBreak: 'break-word',
                                        lineHeight: 1.4
                                    }}
                                >
                                    {course.courseName}
                                </Text>
                            </Anchor>
                            {course.status && (
                                <Badge
                                    size="xs"
                                    variant="dot"
                                    color={course.status === 'published' ? 'green' : 'gray'}
                                    mt="xs"
                                >
                                    {course.status}
                                </Badge>
                            )}
                        </div>
                    </Group>
                </Paper>
            ))}
        </Stack>
    )
}

export default Courses;

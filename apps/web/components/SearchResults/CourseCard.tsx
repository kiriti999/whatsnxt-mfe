import React from 'react';
import { Paper, Box, Stack, Group, Text, Badge, Flex, Rating } from '@mantine/core';
import { CardComponent, Amount } from '@whatsnxt/core-ui';
import Image from 'next/image';
import htmlReactParser from 'html-react-parser';
import { EnhancedCourse } from './types';

interface CourseCardProps {
    course: EnhancedCourse;
}

export function CourseCard({ course }: CourseCardProps) {
    const paidType = course.paidType || 'video';

    return (
        <Paper
            shadow="xs"
            p={0}
            radius="md"
            h="100%"
            style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
            }}
        >
            <CardComponent
                courseName={course.courseName}
                paidType={paidType}
                link={`/courses/${course.slug}`}
                image={
                    <Box pos="relative" style={{ width: '100%', height: '200px' }}>
                        <Image
                            fill
                            style={{ objectFit: 'cover' }}
                            alt={course.courseName}
                            src={course.courseImageUrl}
                            priority={false}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    </Box>
                }
            >
                <Stack gap="xs">
                    <Group justify="space-between" wrap="nowrap">
                        <Box>
                            {course.courseType === 'free' ? (
                                <Text fw={600} size="sm">Free Course</Text>
                            ) : (
                                <>
                                    {course.price !== undefined && (
                                        <Amount amount={course.price} discount={course.discount} />
                                    )}
                                </>
                            )}
                            {course.discount && course.discount > 0 && (
                                <Text component="span" size="sm" c="dimmed" fw={500}>
                                    ({course.discount}% off)
                                </Text>
                            )}
                        </Box>

                        {course.purchaseCount && course.purchaseCount > 0 && (
                            <Badge color="yellow" variant="filled" size="sm">
                                Best Seller
                            </Badge>
                        )}
                    </Group>

                    <Flex align="center" justify="space-between" wrap="nowrap">
                        <Rating
                            value={course.rating || 0}
                            fractions={2}
                            size="xs"
                            readOnly
                        />
                        <Text size="xs" c="dimmed">
                            {paidType === 'video' && course.duration
                                ? course.duration
                                : paidType === 'live' && course.lessons
                                    ? `${course.lessons} lessons`
                                    : null}
                        </Text>
                    </Flex>

                    {course.overview && (
                        <Box>
                            <Text size="sm" c="dimmed" lineClamp={2}>
                                {typeof course.overview === 'string'
                                    ? htmlReactParser(course.overview)
                                    : course.overview
                                }
                            </Text>
                        </Box>
                    )}
                </Stack>
            </CardComponent>
        </Paper>
    );
}

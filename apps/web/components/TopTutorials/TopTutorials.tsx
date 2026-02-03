'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Skeleton,
    Text,
    Box,
    Grid,
    Container,
    Paper,
    Button,
    Group
} from '@mantine/core';
import Image from 'next/image';
import { CardComponent } from '@whatsnxt/core-ui';
import { useRouter } from 'next/navigation';
import styles from '../TopCourses/TopCourses.module.css'; // Reusing styles

interface Tutorial {
    _id: string;
    title: string;
    slug: string;
    imageUrl?: string;
    description?: string;
    categoryName?: string;
}

const TopTutorials = ({ tutorials }: { tutorials: Tutorial[] }) => {
    console.log('🚀 :: TopTutorials :: tutorials:', tutorials)
    const [displayCount, setDisplayCount] = useState(8);
    const router = useRouter();
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (displayCount < 16 && displayCount < tutorials.length) {
                        setDisplayCount(prev => Math.min(prev + 8, 16));
                    }
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [displayCount, tutorials.length]);

    const visibleTutorials = tutorials.slice(0, displayCount);

    return (
        <Box className={styles.topCoursesContainer}>
            <Container size="xl">
                <Grid gutter={{ base: "md", sm: "lg" }} justify="center">
                    {visibleTutorials.length > 0 ? (
                        visibleTutorials.map((tutorial) => (
                            <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={tutorial._id}>
                                <Paper
                                    shadow={'xs'}
                                    p={0}
                                    radius="md"
                                    className={styles.topCoursesPaper}
                                >
                                    <CardComponent
                                        courseName={tutorial.title}
                                        paidType="video"
                                        link={`/content/${tutorial.slug}`}
                                        image={
                                            <Box className={styles.topCoursesImageContainer}>
                                                {tutorial.imageUrl ? <Image
                                                    fill
                                                    className={styles.topCoursesImage}
                                                    alt={tutorial.title}
                                                    src={tutorial.imageUrl}
                                                    priority={true}
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                /> : <Box h="100%" w="100%" bg="gray.1"></Box>}
                                            </Box>
                                        }
                                    >
                                        <Group justify="space-between" mt="xs">
                                            <Box>
                                                <Text size="sm" className={styles.topCoursesFreeText}>
                                                    Free Tutorial
                                                </Text>
                                            </Box>
                                            {tutorial.categoryName && (
                                                <Text size="xs" c="dimmed">
                                                    {tutorial.categoryName}
                                                </Text>
                                            )}
                                        </Group>
                                        <Text lineClamp={2} size="sm" mt="xs" c="dimmed">
                                            {tutorial.description?.replace(/<[^>]*>?/gm, "") || "Start learning now"}
                                        </Text>
                                    </CardComponent>
                                </Paper>
                            </Grid.Col>
                        ))
                    ) : (
                        <Flex
                            direction={{ base: "column", lg: "row" }}
                            gap="md"
                            className={styles.topCoursesSkeletonContainer}
                        >
                            {[...Array(4).keys()].map((i) => (
                                <Skeleton key={i} width={300} height={300} radius="md" />
                            ))}
                        </Flex>
                    )}
                </Grid>

                {/* Intersection Anchor */}
                {displayCount < 16 && displayCount < tutorials.length && (
                    <div ref={observerTarget} style={{ height: '20px', marginTop: '20px' }}></div>
                )}

                {/* View All Button */}
                <Box mt="xl" ta="center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/blogs?type=tutorial')}
                    >
                        View All Tutorials & Articles
                    </Button>
                </Box>

            </Container>
        </Box>
    );
};

// Import Flex for Skeleton fallback
import { Flex } from '@mantine/core';

export default TopTutorials;

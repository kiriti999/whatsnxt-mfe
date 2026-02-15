"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import htmlReactParser from 'html-react-parser';
import { Skeleton, Text, Container, Grid, GridCol, Flex, Box, Paper, Group, Badge, Rating, SimpleGrid } from '@mantine/core';
import { Amount, CardComponent, SortByComponent } from '@whatsnxt/core-ui';
import type { CourseType, Category } from '@whatsnxt/core-util';
import { InfiniteScrollComponent as InfiniteScroll } from '@whatsnxt/core-util';
import sortStyles from './index.module.css';
import CoursesSidebar from '../../../components/Courses/CoursesSidebar';
import { addPopularityToCourses } from '../../../utils';
import { AnalyticsAPI } from '../../../apis/v1/analytics';
import { useQuery } from '@tanstack/react-query';
import { lexicalToHtml } from '../../../utils/lexicalToHtml';

import { CoursesFilter } from '../../../components/Courses/CoursesFilter'; // Ensure correct path

export default function CoursePage({ courses, enrolled, categories }: { courses: CourseType[], enrolled: any[], categories: Category[] }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const sort = searchParams.get("sort");

  let filteredCourses = courses;
  if (category) {
    filteredCourses = filteredCourses.filter(c => c.categoryName === category);
  }
  if (subcategory) {
    filteredCourses = filteredCourses.filter(c => c.subCategoryName === subcategory);
  }

  const coursesPopularity = enrolled || [];
  const coursesWithPopularity = addPopularityToCourses(filteredCourses, coursesPopularity);

  // fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const data = await AnalyticsAPI.getData();
      return data || [];
    }
  })
  // modify course data
  coursesWithPopularity.forEach(course => {
    const data = analyticsData?.find(item => item.pagePath.includes(course.slug));
    course.popularity = data?.pageViews;
  })

  switch (sort) {
    case 'popularity':
      coursesWithPopularity.sort((a, b) => (b.popularity) - (a.popularity));
      break;
    case 'latest':
      coursesWithPopularity.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'low-high':
      coursesWithPopularity.sort((a, b) => (a.price) - (b.price));
      break;
    case 'high-low':
      coursesWithPopularity.sort((a, b) => (b.price) - (a.price));
      break;
    default:
      break;
  }

  return (
    <Courses
      categories={categories || []}
      allCourses={courses || []}
      courses={coursesWithPopularity}
      totalRecords={coursesWithPopularity.length}
    />
  )
}

function Courses({ allCourses, courses, categories, totalRecords }: CourseProps) {
  const BATCH_SIZE = 6;
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const currentRecords = courses.slice(0, displayCount);
  const hasMore = displayCount < totalRecords;

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    // Small delay to show loading state
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + BATCH_SIZE, totalRecords));
      setIsLoading(false);
    }, 300);
  };

  return (
    <div>
      <Container fluid>
        <Grid>
          <GridCol span={{ base: 12, sm: 12, md: 9, lg: 9 }}>
            <Box maw={1114} mx="auto" px="0">
              <div
                className={`${sortStyles['whatsnxt-grid-sorting']} row align-items-center`}
              >
                <Grid>
                  <GridCol
                    span={{ base: 12 }}
                    className={sortStyles['result-count']}
                  >
                    <Text>
                      We found{' '}
                      <span className={sortStyles['count']}>{totalRecords}</span>{' '}
                      courses available for you
                    </Text>
                  </GridCol>

                  <GridCol span={{ base: 12 }}>
                    <Grid align="flex-end">
                      <GridCol span={{ base: 12, md: 8 }}>
                        <CoursesFilter categories={categories} />
                      </GridCol>
                      <GridCol span={{ base: 12, md: 4 }}>
                        <SortByComponent />
                      </GridCol>
                    </Grid>
                  </GridCol>
                </Grid>

              </div>
            </Box>

            <InfiniteScroll
              isLoading={isLoading}
              onViewPortCallback={loadMore}
              isScrollCompleted={!hasMore}
            >
              <SimpleGrid
                cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4 }}
                spacing="lg"
                verticalSpacing="lg"
                px="md"
              >
                {currentRecords.map((course) => (
                  <Paper
                    key={course._id}
                    shadow="xs"
                    p={0}
                    radius="md"
                    className={sortStyles['card-paper']}
                  >
                    <CardComponent
                      courseName={`${course.courseName}`}
                      paidType={course.paidType}
                      link={`/courses/${course.slug}`}
                      image={
                        <div className={sortStyles['course-image-container']}>
                          <Image
                            fill
                            src={course.imageUrl}
                            alt={course.courseName}
                            className={sortStyles['course-image']}
                            style={{ objectFit: "cover" }}
                            priority={true}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      }
                    >
                      {/* Price and Badges Row */}
                      <Group justify="space-between" mt="xs" mb="xs">
                        <Box>
                          {course.price ? (
                            <Amount amount={course.price} discount={course.discount} />
                          ) : (
                            <Text size="sm" className={sortStyles['free-text']}>
                              Free Course
                            </Text>
                          )}
                          {(course.discount !== null && course?.discount > 0) && (
                            <Text span className={sortStyles['discount-text']}>
                              {" "}({course.discount}%)
                            </Text>
                          )}
                        </Box>
                        {course.purchaseCount > 0 && (
                          <Badge
                            color="yellow"
                            c="dark"
                            variant="filled"
                            className={sortStyles['best-seller-badge']}
                          >
                            Best Seller
                          </Badge>
                        )}
                      </Group>


                      {/* Overview Text */}
                      <Box mb="xs">
                        <Text
                          className={sortStyles['overview-style']}
                          c="dimmed"
                          size="sm"
                          lineClamp={3}
                          h={60}
                        >
                          {course.overview ? (() => {
                            let html = course.overview;
                            try {
                              const parsed = JSON.parse(course.overview);
                              if (parsed?.root) html = lexicalToHtml(parsed);
                            } catch { /* legacy HTML */ }
                            return htmlReactParser(html);
                          })() : 'No description available'}
                        </Text>
                      </Box>

                      {/* Rating and Duration/Lessons */}
                      <Flex align='center' justify='space-between' mt="auto">
                        <Rating defaultValue={course.rating || 4.5} fractions={2} size="xs" readOnly />
                        {course.paidType === 'video' && (
                          <Text size='xs' className={sortStyles['meta-text']}>
                            {course.duration || '0m'}
                          </Text>
                        )}
                        {course.paidType === 'live' && (
                          <Text size='xs' className={sortStyles['meta-text']}>
                            {course.lessons || 0} lessons
                          </Text>
                        )}
                      </Flex>
                    </CardComponent>
                  </Paper>
                ))}
                {totalRecords > 0 && currentRecords.length === 0 && (
                  [...Array(3).keys()].map((i) => (
                    <Skeleton key={i} height={350} radius="sm" />
                  ))
                )}
              </SimpleGrid>
            </InfiniteScroll>

            <Box w="100%" mt="xl">
              {totalRecords > 0 && currentRecords?.length === 0 && (
                <Flex align="center" gap="xs" justify="center" mt="md">
                  {[...Array(3).keys()].map((i) => <Skeleton key={i} width={35} height={35} radius="sm" />)}
                </Flex>

              )}
            </Box>
          </GridCol>

          {/* TODO: Enable CoursesSidebar component to show courses based on popularity (GA page views) */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            {/* Your content here */}
            <CoursesSidebar courses={allCourses} categories={categories} />
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );

}

type CourseProps = {
  courses: CourseType[];
  allCourses: CourseType[];
  categories: Category[];
  totalRecords: number;
}

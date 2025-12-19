"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import htmlReactParser from 'html-react-parser';
import { Skeleton, Avatar, Text, Tooltip, Container, Grid, GridCol, Flex, Box, Paper, Group, Badge, Rating } from '@mantine/core';
import { Amount, CardComponent, SortByComponent } from '@whatsnxt/core-ui';
import type { CourseType, Category } from '@whatsnxt/core-util';
import sortStyles from './index.module.css';
import CoursesSidebar from '../../../components/Courses/CoursesSidebar';
import Pagination from '../../../components/pagination/pagination';
import { addPopularityToCourses } from '../../../utils';
import { AnalyticsAPI } from '../../../apis/v1/analytics';
import { useQuery } from '@tanstack/react-query';

export default function CoursePage({ courses, enrolled, categories }: { courses: CourseType[], enrolled: any[], categories: Category[] }) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");

  const filteredCourses = category ? courses.filter(c => c.categoryName === category) : courses;
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
  const [recordsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = courses.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div>
      <Container fluid>
        <Grid>
          <GridCol span={{ base: 12, sm: 12, md: 9, lg: 9 }}>
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
                  <SortByComponent />
                </GridCol>
              </Grid>

            </div>

            <Grid gutter="xl">
              {currentRecords.map((course) => (
                <GridCol span={{ base: 12, sm: 6, lg: 4 }} key={course._id}>
                  <Paper
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

                      {/* Author Info (kept compact) */}
                      <Flex align="center" mb="xs">
                        {course.userId?.profilePhoto ? (
                          <Image
                            width={24}
                            height={24}
                            src={`${course?.userId?.profilePhoto}`}
                            className="rounded-circle"
                            alt="avatar"
                          />
                        ) : (
                          <Avatar variant="light" radius="xl" size="sm" />
                        )}
                        <Text ml="xs" size="xs" c="dimmed">
                          Led by experts
                        </Text>
                      </Flex>

                      {/* Overview Text */}
                      <Box style={{ flex: 1, marginBottom: '10px' }}>
                        {course.overview && (
                          <Text
                            className={sortStyles['overview-style']}
                            c="dimmed"
                            size="sm"
                            lineClamp={3}
                          >
                            {htmlReactParser(course.overview)}
                          </Text>
                        )}
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
                </GridCol>
              ))}
              {totalRecords > 0 && currentRecords.length === 0 && (
                [...Array(3).keys()].map((i) => (
                  <GridCol span={{ base: 12, sm: 6, lg: 4 }} key={i}>
                    <Skeleton width="100%" height={400} radius="sm" />
                  </GridCol>
                ))
              )}
            </Grid>

            <GridCol span={12}>
              {currentRecords?.length > 0 && (
                <Pagination
                  nPages={nPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              )}
              {totalRecords > 0 && currentRecords?.length === 0 && (
                <Flex align="center" gap="xs" justify="center" mt="md">
                  {[...Array(3).keys()].map((i) => <Skeleton key={i} width={35} height={35} radius="sm" />)}
                </Flex>

              )}
            </GridCol>
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

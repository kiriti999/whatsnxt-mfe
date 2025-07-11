import React, { useState } from 'react';
import {
  Skeleton,
  Rating,
  Text,
  Box,
  Badge,
  Title,
  Grid,
  Container,
  Group,
  Flex,
  Paper
} from '@mantine/core';
import Image from 'next/image';
import { Amount, CardComponent } from '@whatsnxt/core-ui';
import Pagination from '../../components/pagination/pagination';
import styles from './TopCourses.module.css';

const TopCourses = ({ courses, total }: { courses: any[], total: number }) => {
  const [recordsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = courses.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(total / recordsPerPage);

  return (
    <Box className={styles.topCoursesContainer}>
      <Container size="xl">
        <Box className={styles.topCoursesInner}>
          <Title order={4} className={styles.topCoursesTitle}>
            Top Selling Courses
          </Title>
        </Box>

        <Grid gutter={{ base: "md", sm: "lg" }} justify="center">
          {currentRecords ? (
            currentRecords.map((course) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={course._id}>
                <Paper
                  shadow={'xs'}
                  p={0}
                  radius="md"
                  className={styles.topCoursesPaper}
                >
                  <CardComponent
                    courseName={course.courseName}
                    paidType={course.paidType}
                    link={`/courses/${course.slug}`}
                    image={
                      <Box className={styles.topCoursesImageContainer}>
                        <Image
                          fill
                          className={styles.topCoursesImage}
                          alt={course.courseName}
                          src={course.imageUrl}
                          priority={true}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </Box>
                    }
                  >
                    <Group justify="space-between" mt="xs">
                      <Box>
                        {course.courseType === 'free' ? (
                          <Text size="sm" className={styles.topCoursesFreeText}>
                            Free Course
                          </Text>
                        ) : (
                          <>
                            {course.price && (
                              <Amount amount={course.price} discount={course.discount} />
                            )}
                          </>
                        )}
                        {course.discount! > 0 && (
                          <Text span className={styles.topCoursesDiscountText}>
                            {" "}({course.discount}%)
                          </Text>
                        )}
                      </Box>

                      {course?.purchaseCount > 0 && (
                        <Badge
                          color="yellow"
                          c="dark"
                          variant="filled"
                          className={styles.topCoursesBestSellerBadge}
                        >
                          Best Seller
                        </Badge>
                      )}
                    </Group>
                    <Flex align='center' mt="xs" justify={'space-between'}>
                      <Rating defaultValue={course.rating} fractions={2} size="xs" readOnly />
                      {course.paidType === 'video' && (
                        <Text size='xs' className={styles.topCoursesDurationText}>
                          {course.duration}
                        </Text>
                      )}
                      {course.paidType === 'live' && (
                        <Text size='xs' className={styles.topCoursesLessonsText}>
                          {course.lessons} lessons
                        </Text>
                      )}
                    </Flex>
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

          <Grid.Col span={12}>
            <Box className={styles.topCoursesCenterContainer}>
              <Text size="md" className={styles.topCoursesDescription}>
                Discover your next skill or passion. Join thousands of learners worldwide and take the next step in your career, hobbies, or personal growth. Your learning journey starts here!
              </Text>
            </Box>
          </Grid.Col>
        </Grid>

      </Container>

      {nPages > 1 && (
        <Box className={styles.topCoursesPaginationContainer}>
          <Pagination
            nPages={nPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </Box>
      )}
    </Box>
  );
};

export default TopCourses;
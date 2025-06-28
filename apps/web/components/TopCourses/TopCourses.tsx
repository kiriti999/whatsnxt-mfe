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

const TopCourses = ({ courses, total }: { courses: any[], total: number }) => {
  const [recordsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = courses.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(total / recordsPerPage);

  return (
    <Box py="0">
      <Container size="xl">
        <Box maw={720} mx="auto" mb={35} ta="center">
          <Title order={4}>Top Selling Courses</Title>
        </Box>

        <Grid gutter={{ base: "md", sm: "lg" }} justify="center">
          {currentRecords ? (
            currentRecords.map((course) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }} key={course._id}>
                <Paper
                  shadow={'xs'}
                  p={0}
                  radius="md"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <CardComponent
                    courseName={course.courseName}
                    paidType={course.paidType}
                    link={`/courses/${course.slug}`}
                    image={
                      <Box pos="relative" style={{ width: '100%', height: '200px' }}>
                        <Image
                          fill
                          style={{ objectFit: 'cover' }}
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
                          <Text fw={600} size="sm">Free Course</Text>
                        ) : (
                          <>
                            {course.price && (
                              <Amount amount={course.price} discount={course.discount} />
                            )}
                          </>
                        )}
                        {course.discount! > 0 && <Text span fw={700}> ({course.discount}%)</Text>}
                      </Box>

                      {course?.purchaseCount > 0 && (
                        <Badge color="yellow" c="dark" variant="filled">Best Seller</Badge>
                      )}
                    </Group>
                    <Flex align='center' mt="xs" justify={'space-between'}>
                      <Rating defaultValue={course.rating} fractions={2} size="xs" readOnly />
                      {course.paidType === 'video' && <Text size='xs'>{course.duration}</Text>}
                      {course.paidType === 'live' && <Text size='xs'>{course.lessons} lessons</Text>}
                    </Flex>
                  </CardComponent>
                </Paper>
              </Grid.Col>
            ))
          ) : (
            <Flex
              direction={{ base: "column", lg: "row" }}
              gap="md"
              align="center"
              justify="center"
              w="100%"
            >
              {[...Array(4).keys()].map((i) => (
                <Skeleton key={i} width={300} height={300} radius="md" />
              ))}
            </Flex>
          )}

          <Grid.Col span={12}>
            <Box ta="center" py="xl">
              <Text size="md" maw={600} mx="auto">
                Discover your next skill or passion. Join thousands of learners worldwide and take the next step in your career, hobbies, or personal growth. Your learning journey starts here!
              </Text>
            </Box>
          </Grid.Col>
        </Grid>

      </Container>

      {nPages > 1 && (
        <Box ta="center" mt="xl">
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
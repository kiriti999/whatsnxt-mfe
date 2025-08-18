import React, { ReactElement } from "react";
import TopCourses from './TopCourses/TopCourses';
import type { CourseType } from '@whatsnxt/core-util';
import TrendingArticles from './TrendingArticles';
import { Button, Container, Grid } from "@mantine/core";

interface MicroFrontendProps {
  courses: CourseType[];
  total: number;
  articles: any[]; // Add articles prop
  totalArticles: number; // Add totalArticles prop
}

export default function MicroFrontend({
  courses,
  total,
  articles,
  totalArticles
}: MicroFrontendProps): ReactElement {
  return (
    <>
      <TopCourses courses={courses || []} total={total || 0} />
      <Container size="xl" mt="md" mb="xl">
        <Grid justify="center" align="center">
          <Grid.Col span={12} style={{ textAlign: 'center' }}>
            <Button component="a" href="/courses" size="lg" c="white" fw={500} style={{ textDecoration: 'none' }}>
              Explore Our Courses
            </Button>
          </Grid.Col>
        </Grid>
      </Container>

      <TrendingArticles
        articles={articles || []}
        total={totalArticles || 0}
      />
    </>
  );
}
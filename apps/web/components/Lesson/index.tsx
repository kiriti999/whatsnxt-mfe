"use client";
import { Grid, Title } from '@mantine/core';
import styles from './lesson.module.css';
import Main from './lessonPlayer';
import Syllabus from './syllabus';

const Lesson = ({ sections, courseOverview, courseSlug, lesson, lessonId, course }) => {
    return (
        <main className={styles.container}>
            <Title order={3}>{course.courseName}</Title>
            <Grid>
                <Grid.Col span={{ base: 12, md: 8, lg: 8 }}>
                    <Main lessonId={lessonId} course={course} sections={sections} courseOverview={courseOverview} videoUrl={lesson?.videoUrl} courseSlug={courseSlug} />
                </Grid.Col>
                <Grid.Col span={{ base: 0, md: 4, lg: 4 }} className={'hideOnMobileAndMediumTablets'}>
                    <Syllabus sections={sections} courseSlug={courseSlug} />
                </Grid.Col>
            </Grid>
        </main>
    )
}

export default Lesson;
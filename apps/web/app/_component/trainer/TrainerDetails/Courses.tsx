import { Text, Stack, Grid, Anchor } from '@mantine/core';
import Link from 'next/link';

const Courses = ({ courses }) => {
    if (courses.length === 0) {
        return <p className="text-center">No courses found</p>
    }

    return (
        <Stack justify='center'>
            {courses?.map((course) => (
                <Grid>
                    <Text size='sm' m={0}>Link to the course: </Text>
                    <Anchor component={Link} href={`/courses/${course.slug}`} ml={'xs'}>
                        <Text size={'sm'} m={0}>{course.courseName}</Text>
                    </Anchor>
                </Grid>
            ))}
        </Stack>
    )
}

export default Courses;

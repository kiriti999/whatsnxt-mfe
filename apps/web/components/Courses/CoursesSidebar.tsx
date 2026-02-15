import { Skeleton, Text, Card, Stack, Badge, Group } from '@mantine/core';
import PopularPost from '@whatsnxt/core-ui/src/PopularPost';
import { type CourseType, type Category } from '@whatsnxt/core-util';
import type { Lab } from '@whatsnxt/core-types';
import styles from './Widget.module.css';

interface CoursesSidebarProps {
  courses: CourseType[];
  categories: Category[];
  labs?: Lab[];
}

const CoursesSidebar = ({ courses, labs }: CoursesSidebarProps) => {
  return (
    <div className={styles['widget-area']}>
      <div className={`${styles['widget']} ${styles['widget_recent_courses']}`}>
        <h3 className={styles['widget-title']}>New Courses</h3>
        {courses ? (
          courses.length > 0 ? (
            courses.map((course) =>
            (
              <PopularPost
                key={course._id}
                imageUrl={course.imageUrl}
                title={course?.courseName}
                updatedAt={new Date(course.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                categoryName={course.categoryName}
                slug={`/courses/${course.slug as string}`}
              />
            ))
          ) : (
            <p>No new courses available</p>
          )
        ) : (
          [...Array(5).keys()].map((i) => <Skeleton key={i} height={20} width="100%" mt={5} />)
        )}
      </div>

      <div className={`${styles['widget']} ${styles['widget_recent_labs']}`}>
        <h3 className={styles['widget-title']}>New Labs</h3>
        {labs ? (
          labs.length > 0 ? (
            <Stack gap="sm">
              {labs.map((lab) => (
                <Card key={lab.id} withBorder p="sm" radius="md" component="a" href={`/labs/${lab.id}`} className={styles['lab-card']}>
                  <Text size="sm" fw={700} lineClamp={1} truncate className={styles['lab-title']}>{lab.name}</Text>
                  {lab.description && (
                    <Text size="xs" c="dimmed" lineClamp={1} truncate mt={2} className={styles['lab-description']}>{lab.description}</Text>
                  )}
                  <Group gap={4} mt={6}>
                    {lab.architectureType && (
                      <Badge size="xs" variant="light" color="cyan" radius="sm">{lab.architectureType}</Badge>
                    )}
                    {lab.labType && (
                      <Badge size="xs" variant="light" color="violet" radius="sm">{lab.labType}</Badge>
                    )}
                  </Group>
                  <Text size="9px" c="dimmed" mt={6}>
                    {new Date(lab.updatedAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Card>
              ))}
            </Stack>
          ) : (
            <p>No new labs available</p>
          )
        ) : (
          [...Array(3).keys()].map((i) => <Skeleton key={i} height={60} width="100%" mt={5} radius="sm" />)
        )}
      </div>
    </div>
  );
};

export default CoursesSidebar;

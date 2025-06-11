import React from 'react';
import Link from 'next/link';
import { Skeleton } from '@mantine/core';
import PopularPost from '@whatsnxt/core-ui/src/PopularPost';
import { type CourseType, type Category } from '@whatsnxt/core-util';
import styles from './Widget.module.css';

const CoursesSidebar = ({ courses, categories }: { courses: CourseType[]; categories: Category[] }) => {
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
                imageUrl={course.courseImageUrl}
                title={course.courseName}
                updatedAt={new Date(course.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                categoryName={course.categoryName}
                slug={course.slug as string}
              />
            ))
          ) : (
            <p>No new courses available</p>
          )
        ) : (
          [...Array(5).keys()].map((i) => <Skeleton key={i} height={20} width="100%" mt={5} />)
        )}
      </div>

      <div className={`${styles['widget']} ${styles['widget_tag_cloud']}`}>
        <h3 className={styles['widget-title']}>Popular Tags</h3>
        <div className={styles['tagcloud']}>
          {categories?.length > 0 ? (
            categories.map((item, i) => (
              <Link key={i} href={`/courses?category=${encodeURIComponent(item.name)}`}>
                {item.name} <span className="tag-link-count">({item.count})</span>
              </Link>
            ))
          ) : (
            [...Array(5).keys()].map((i) => <Skeleton key={i} height={20} width="100%" mt={5} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesSidebar;

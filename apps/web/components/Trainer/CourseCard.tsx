import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Avatar, Badge, Rating } from '@mantine/core';
import styles from '../Courses/Course.module.css';
import { IconCurrencyRupee } from '@tabler/icons-react';

function CourseCard({ course }) {
  return (
    <div className="col-lg-3 col-md-6 mb-4">
      <div
        className={`${styles['single-courses-box']} ${styles['course-box-border']}`}
      >
        <div className={styles['courses-image']}>
          <Link
            href={`/courses/${course.slug}`}
            className={`d-block ${styles['image']}`}
          >
            {course.courseImageUrl ? (
              <Image
                width={500}
                height={300}
                src={course.courseImageUrl}
                alt={course.courseName}
              />
            ) : (
              <Avatar variant="light" radius="xl" size="md" />
            )}
          </Link>
        </div>

        <div className={`${styles['courses-content']} p-2 mb-2 ml-5`}>
          <b title={course.courseName}>
            <Link href={`/courses/${course.slug}`}>
              {course.courseName.slice(0, 47)}
              ...
            </Link>
          </b>

          <br />
          <small style={{ color: 'grey' }}>Led by experts</small>

          <ul
            className={`${styles['courses-box-footer']} d-flex justify-content-between align-items-center`}
          >
            <li>
              {course?.discount > 0 ? (
                <>
                  <b>
                    ₹{' '}
                    {course.price -
                      (course.price * course.discount) /
                      100}{' '}
                  </b>
                  <s style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                    ₹{course.price}
                  </s>
                  <b> ({course.discount}%)</b>
                </>
              ) : (
                <b>₹{course.price}</b>
              )}
            </li>

            {course?.purchaseCount > 0 && (
              <li>
                <Badge color="yellow">Best Seller</Badge>
              </li>
            )}
          </ul>

          <Rating defaultValue={course.rating} fractions={2} size={'xs'} readOnly className="mt-1" />
        </div>
      </div>
    </div>
  );
}

export default CourseCard;

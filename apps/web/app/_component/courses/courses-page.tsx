"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import htmlReactParser from 'html-react-parser';
import { Skeleton, Avatar, Text, Tooltip } from '@mantine/core';
import { Amount, CardComponent, SortByComponent } from '@whatsnxt/core-ui';
import type { CourseType, Category } from '@whatsnxt/core-util';
import sortStyles from './index.module.css';
import CoursesSidebar from '../../../components/Courses/CoursesSidebar';
import styles from '../../../components/Courses/Course.module.css';
import Pagination from '../../../components/pagination/pagination';
import { addPopularityToCourses } from '../../../utils';
import { AnalyticsAPI } from '../../../api/v1/analytics';
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
  const [recordsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = courses.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(totalRecords / recordsPerPage);

  return (
    <div>
      <div className={`${styles['courses-area']} pb-70`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-9 col-sm-12">
              <div
                className={`${sortStyles['whatsnxt-grid-sorting']} row align-items-center`}
              >
                <div
                  className={`col-lg-8 col-md-6 ${sortStyles['result-count']}`}
                >
                  <p>
                    We found{' '}
                    <span className={sortStyles['count']}>{totalRecords}</span>{' '}
                    courses available for you
                  </p>
                </div>

                <SortByComponent />
              </div>

              <div className="all-posts">
                {currentRecords.map((course) => (
                  <div className="posts" key={course._id}>
                    <CardComponent
                      courseName={`${course.courseName}`}
                      paidType={course.paidType}
                      link={`/courses/${course.slug}`}
                      image={
                        <Image
                          fill
                          src={course.courseImageUrl}
                          alt={course.courseName}
                          style={{ objectFit: "cover" }}
                        />
                      }>

                      <div className='d-flex pb-2 align-items-center'>
                        {course.userId?.profilePhoto ? (
                          <Image
                            width={100}
                            height={100}
                            src={`${course?.userId?.profilePhoto}`}
                            className="rounded-circle"
                            alt="avatar"
                          />
                        ) : (
                          <Avatar variant="light" radius="xl" size="md" />
                        )}
                        <p className='ms-2 fw-bold'>
                          <small>Led by experts</small>
                        </p>
                      </div>

                      {course.overview && (
                        <Text className='py-1' lineClamp={4}>{htmlReactParser(course.overview)}</Text>
                      )}
                      {course.price ? (
                        <Amount amount={course.price} discount={course.discount} />
                      ) : (
                        <div>
                          <Tooltip label='Free course'><strong>free</strong></Tooltip>
                        </div>
                      )}
                      {(course.discount !== null && course?.discount > 0) && <b> ({course.discount}%)</b>}
                    </CardComponent>
                  </div>
                ))}
                {totalRecords > 0 && currentRecords.length === 0 && (
                  [...Array(3).keys()].map((i) => <Skeleton key={i} width={300} height={400} radius="sm" />)
                )}
              </div>
              <div className="col-lg-12 col-md-12">
                {currentRecords?.length > 0 && (
                  <Pagination
                    nPages={nPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                )}
                {totalRecords > 0 && currentRecords?.length === 0 && (
                  <div className="d-flex align-items-center gap-1 justify-content-center mt-3">
                    {[...Array(3).keys()].map((i) => <Skeleton key={i} width={35} height={35} radius="sm" />)}
                  </div>
                )}
              </div>
            </div>

            {/* TODO: Enable CoursesSidebar component to show courses based on popularity (GA page views) */}
            <div className="col-lg-3 col-md-3 col-sm-12">
              <CoursesSidebar courses={allCourses} categories={categories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

type CourseProps = {
  courses: CourseType[];
  allCourses: CourseType[];
  categories: Category[];
  totalRecords: number;
}

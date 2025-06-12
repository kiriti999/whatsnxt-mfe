"use client"

/* eslint-disable @next/next/no-img-element */
/*eslint no-case-declarations: "error"*/
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { algoliaSearchByKeyword, type CourseType } from '@whatsnxt/core-util';
import { PageBanner } from '@whatsnxt/core-ui';
import htmlReactParser from 'html-react-parser';
import styles from './index.module.css';
import courseStyles from '../../../components/Courses/Course.module.css';
import QueryPagination from '../../../components/QueryPagination/QueryPagination';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

const sortOption = [
    {
        value: 'popularity',
        text: 'Popularity',
    },
    {
        value: 'latest',
        text: 'Latest',
    },
    {
        value: 'low-high',
        text: 'Price: low to high',
    },
    {
        value: 'high-low',
        text: 'Price: high to low',
    },
];

export default function AlgoliaSearchComponent({ coursesPopularity }) {
    const queryString = useSearchParams();
    const searchQuery = queryString.get("q") || "";
    const sortQuery = queryString.get("sort");
    const page = queryString.get("page") || 1 as any;

    const { data, isLoading } = useQuery({
        queryKey: [""],
        queryFn: () => {
            return algoliaSearchByKeyword<CourseType>(
                process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,
                searchQuery,
                page - 1,
                20,
            );
        }
    });

    if (isLoading) return;

    const { hits: searchResult, nbPages } = data;

    const courses = searchResult.map((course: CourseType) => ({
        ...course,
        popularity: coursesPopularity.find(p => p.courseId === course.objectID)?.count ?? 0
    }));

    console.log({ data })
    if (sortQuery) {
        courses.sort((a, b) => {
            const totalPriceA = a.price;
            const totalPriceB = b.price;

            switch (sortQuery) {
                case 'popularity':
                    let aCount = parseInt(a.popularity)
                    let bCount = parseInt(b.popularity)
                    return bCount - aCount;
                case 'latest':
                    return new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf();
                case 'low-high':
                    return totalPriceA - totalPriceB;
                case 'high-low':
                    return totalPriceB - totalPriceA;
                default:
                    return 0;
            }
        });
    }

    return (
        <AlgoliaSearch courses={courses} pages={nbPages} />
    )
}

function AlgoliaSearch({ courses, pages }: PageProps) {
    const searchParams = useSearchParams();
    const page = searchParams.get("page");
    const sort = searchParams.get("sort");
    const pathname = usePathname();
    const { push } = useRouter();
    const [newCourses] = useState([]);

    const sortCourses = (type: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort", type)

        const newParams = params.toString()
        push(pathname + '?' + newParams)
    };

    const handlePagination = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("sort", pageNumber.toString())

        const newParams = params.toString()
        push(pathname + '?' + newParams)
    };

    return (
        <>
            <div className={`${courseStyles['courses-area']} pt-40 pb-70`}>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12">
                            <div className={`${styles['whatsnxt-grid-sorting']} row align-items-center`}>
                                <div className={`col-lg-8 col-md-6 ${styles['result-count']}`}>
                                    <p>
                                        We found{' '}
                                        <span className={styles['count']}>
                                            {courses.length ? courses.length : 0}
                                        </span>{' '}
                                        courses available for you
                                    </p>
                                </div>

                                <div className={`col-lg-4 col-md-6 ${styles['ordering']}`}>
                                    <div className="select-box">
                                        <select onChange={(e) => sortCourses(e.target.value)} className="form-control">
                                            <option>Sort By</option>
                                            {sortOption.map(({ value, text }) => (
                                                <option key={value} value={value} selected={value === sort}>
                                                    {text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                {
                                    courses && courses.length
                                        ? courses.map((c) => (c.price && <CourseCard key={c.id} course={c} />))
                                        : <h6>Empty</h6>
                                }
                            </div>

                            <div className="row">
                                <QueryPagination
                                    totalPage={pages}
                                    currentPage={Array.isArray(page) ? page[0] : page}
                                    previousPageClickHandler={handlePagination}
                                    nextPageClickHandler={handlePagination}
                                    pageNumberClickHandler={handlePagination}
                                />
                            </div>

                            <>
                                {newCourses.length > 0 && <h3 className="pt-10">New courses</h3>}
                                <div className="col-lg-12 col-md-12">
                                    <div className="row">
                                        {newCourses.map((c) => <CourseCard key={c.id} course={c} />)}
                                    </div>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CourseCard({ course, live = true }: { course: CourseType; live?: boolean }) {
    return (
        <div className="col-lg-3 col-md-6 mb-4" key={course.courseName + (live ? 'live' : 'video')}>
            <div className={`${courseStyles['single-courses-box']} ${courseStyles['course-box-border']}`}>
                <div className={courseStyles['courses-image']}>
                    <Link href="/courses/[id]" as={`/courses/${course.slug}`}>
                        <div className={`d-block image ${courseStyles['image']}`}>
                            <Image width={500} height={300} src={course.courseImageUrl} alt={course.courseName} />
                        </div>
                    </Link>
                </div>
                <div className={courseStyles['courses-content'] + ' p-2'}>
                    <b title={course.courseName}>
                        <Link href="/courses/[id]" as={`/courses/${course.slug}`}>
                            <h5>{course.courseName.slice(0, 45)}...</h5>
                        </Link>
                    </b>

                    <div className={`${courseStyles['course-author']} d-flex align-items-center mt-2`}>
                        <Image width={100} height={100} src={'/images/default-avatar.png'} className="rounded-circle" alt="image" />
                        <span>
                            <small>Led by experts</small>
                        </span>
                    </div>

                    <div className={`${styles['overview-style']}`}>
                        {htmlReactParser(course?.overview)}
                    </div>

                    <ul className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center pb-10`}>
                        <li><b>₹ {course.price}</b></li>
                    </ul>

                    <p>{live ? 'Live training' : 'Course videos'}</p>
                </div>
            </div>
        </div>
    )
}

type PageProps = {
    courses: CourseType[],
    pages: number;
}

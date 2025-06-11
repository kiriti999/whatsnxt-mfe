import React from 'react';
import Link from 'next/link';
import styles from './ProfileCourses.module.css';
import courseStyles from '../Courses/Course.module.css';
import Image from 'next/image';
import {Anchor} from '@mantine/core';
import { IconHeart, IconNote, IconUsers } from '@tabler/icons-react';

const ProfileCourses = () => {
  return (
    <div className={`${styles['profile-courses']} pb-70`}>
      <h3 className="title">Courses</h3>
      <div className="row">
        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses1.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 39
              </div>
            </div>

            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user1.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Alex Morgan</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  The Data Science Course 2020: Complete Data Science Bootcamp
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 15 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 145 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses2.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 49
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user2.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Sarah Taylor</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Java Programming MasterclassName for Software Developers
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 100 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses3.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 59
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user3.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>David Warner</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Deep Learning A-Z™: Hands-On Artificial Neural Networks
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 150 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses4.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 39
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user6.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Alex Morgan</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Python for Finance: Investment Fundamentals & Data Analytics
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 15 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 145 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses5.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 49
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user5.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Sarah Taylor</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Machine Learning A-Z™: Hands-On Python & R In Data Science
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 100 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses6.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 99
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user4.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>James Anderson</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  R Programming A-Z™: R For Data Science With Real Exercises!
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 44 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 440 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses10.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 39
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user1.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Alex Morgan</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Deep Learning The Numpy Stack in Python
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 15 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 145 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses11.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 49
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user2.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Sarah Taylor</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Statistics for Data Science and Business Analysis
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 100 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses12.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 59
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user3.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>David Warner</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Microsoft Excel - Excel from Beginner to Advanced
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 150 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses13.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 39
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user6.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Alex Morgan</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Python Django Web Development: To-Do App
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 15 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 145 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses14.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 49
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user5.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>Sarah Taylor</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Oracle SQL Developer : Essentials, Tips and Tricks
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 20 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 100 Students
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className={courseStyles['single-courses-box']}>
            <div className={courseStyles['courses-image']}>
              <Anchor component={Link} href="/single-courses-1" className={`d-block ${courseStyles['image']}`}>
                <Image
                  width={500}
                  height={500}
                  src="/images/courses/courses15.jpg"
                  alt="image"
                />
              </Anchor>
              <Anchor href="#" className={courseStyles['fav']}>
                <i><IconHeart /></i>
              </Anchor>
              <div className={`${courseStyles['price']} shadow`}>
                &#8377; 99
              </div>
            </div>
            <div className={courseStyles['courses-content']}>
              <div
                className={`${courseStyles['course-author']} d-flex align-items-center`}
              >
                <Image
                  width={500}
                  height={500}
                  src="/images/user4.jpg"
                  className="rounded-circle"
                  alt="image"
                />
                <span>James Anderson</span>
              </div>

              <h3>
                <Anchor component={Link} href="/single-courses-1">
                  Learning A-Z™: Hands-On Python In Data Science
                </Anchor>
              </h3>

              <p>
                Lorem ipsum dolor sit amet, constetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore.
              </p>
              <ul
                className={`${courseStyles['courses-box-footer']} d-flex justify-content-between align-items-center`}
              >
                <li>
                  <i><IconNote /></i> 44 Lessons
                </li>
                <li>
                  <i><IconUsers /></i> 440 Students
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCourses;

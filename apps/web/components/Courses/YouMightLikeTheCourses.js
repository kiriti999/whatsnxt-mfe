import React from 'react';
import Link from 'next/link';
import { Anchor } from '@mantine/core';
import styles from '../Courses/Course.module.css';
import Image from 'next/image';

const YouMightLikeTheCourses = () => {
  return (
    <div className={`${styles['courses-area']} bg-f8f9f8 pt-100 pb-70`}>
      <div className="container">
        <Box maw={720} mx={"auto"} mb={55} ta={"center"}>
          <Title maw={615} mb={0} mx={'auto'} size={"xl"} fw={800} order={2}>More Courses You Might Like</Title>
        </Box>

        <div className="row">
          <div className="col-lg-4 col-md-6">
            <div className={styles['single-courses-box']}>
              <div className={styles['courses-image']}>
                <Anchor component={Link} href="/single-courses-1" className={`d-block ${styles['image']}`}>
                  <Image
                      width={500}
                      height={500}
                      src="/images/courses/courses1.jpg"
                      alt="image"
                  />
                </Anchor>
                <Anchor href="#" className={styles['fav']}>
                  <i><IconHeart /></i>
                </Anchor>
                <div className={`${styles['price']} shadow`}>$39</div>
              </div>
              <div className={styles['courses-content']}>
                <div
                  className={`${styles['course-author']} d-flex align-items-center`}
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
                    The Data Science Course 2020: Complete Data Science
                    Bootcamp
                  </Anchor>
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore.
                </p>
                <ul
                  className={`${styles['courses-box-footer']} d-flex justify-content-between align-items-center`}
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
            <div className={styles['single-courses-box']}>
              <div className={styles['courses-image']}>
                <Anchor component={Link} href="/single-courses-1" className={`d-block ${styles['image']}`}>
                  <Image
                      width={500}
                      height={500}
                      src="/images/courses/courses2.jpg"
                      alt="image"
                  />
                </Anchor>
                <Anchor href="#" className={styles['fav']}>
                  <i><IconHeart /></i>
                </Anchor>
                <div className={`${styles['price']} shadow`}>$49</div>
              </div>
              <div className={styles['courses-content']}>
                <div
                  className={`${styles['course-author']} d-flex align-items-center`}
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore.
                </p>
                <ul
                  className={`${styles['courses-box-footer']} d-flex justify-content-between align-items-center`}
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

          <div className="col-lg-4 col-md-6 offset-lg-0 offset-md-3">
            <div className={styles['single-courses-box']}>
              <div className={styles['courses-image']}>
                <Anchor component={Link} href="/single-courses-1" className={`d-block ${styles['imag']}`}>
                  <Image
                      width={500}
                      height={500}
                      src="/images/courses/courses3.jpg"
                      alt="image"
                  />
                </Anchor>
                <Anchor href="#" className={styles['fav']}>
                  <i><IconHeart /></i>
                </Anchor>
                <div className={`${styles['price']} shadow`}>$59</div>
              </div>
              <div className={styles['courses-content']}>
                <div
                  className={`${styles['course-author']} d-flex align-items-center`}
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
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore.
                </p>
                <ul
                  className={`${styles['courses-box-footer']} d-flex justify-content-between align-items-center`}
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
        </div>
      </div>
    </div>
  );
};

export default YouMightLikeTheCourses;

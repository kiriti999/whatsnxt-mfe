
import React, { FC, useEffect, useMemo, useState } from 'react';
import styles from './CoursesDetailsSidebar.module.css';
import { notifications } from '@mantine/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { Anchor, LoadingOverlay, Text } from '@mantine/core';
import Link from 'next/link';
import ReactPlayer from 'react-player';
import ActionButtons from './ActionButtons';

import {
  IconCopy,
  IconBrandWhatsapp,
  IconUser,
  IconTimeDuration90,
  IconClock,
  IconTags,
  IconShare,
} from "@tabler/icons-react";

import { useIsEnrolled } from '../../hooks/useIsEnrolled';
import { useDisclosure } from '@mantine/hooks';

type CoursesDetailsSidebarProps = {
  _id: string;
  courseName: string;
  price: number | null;
  userId: any;
  courseImageUrl: string;
  duration: any;
  lessons: any;
  loggedInUser: any;
  courseData: any;
  slug: string | null;
  isCourseReviewMode: boolean
};

export const CoursesDetailsSidebar: FC<CoursesDetailsSidebarProps> = ({
  _id: courseId,
  courseName,
  price,
  userId,
  courseImageUrl,
  duration,
  lessons,
  courseData,
  slug,
  isCourseReviewMode
}) => {
  const cartItems = useSelector((state: any) => state.cart.cartItems);
  const dispatch = useDispatch();
  const [add, setAdd] = useState(false);
  const [display, setDisplay] = useState(false); // State for ReactPlayer
  const [isVisible, { open, close }] = useDisclosure(true);

  const { isEnrolled, isFetching } = useIsEnrolled(courseId);
  const isFreeCourse = courseData?.courseType === 'free';

  const url = useMemo(() => `${process.env.MFE_HOST}/courses/${slug}`, [slug]);

  const addToCart = () => {
    const courseObj = { id: courseId, courseName, slug, price, total_cost: price, lessons, duration, image: courseImageUrl, quantity: 1 };
    if (!isCourseExist()) {
      dispatchAddToCart(courseObj);
    }
  }

  const dispatchAddToCart = (courseObj: { courseName: string }) => {
    dispatch({ type: 'ADD_TO_CART', data: courseObj });
    notifications.show({
      position: 'bottom-right', title: 'Cart Updated', message: `${courseObj.courseName} added to cart.`, color: 'green'
    });
  };

  const isCourseExist = () => {
    return cartItems.find((cart: { id: string }) => courseId === cart.id.split('_')[1]);
  };

  useEffect(() => {
    const courseExist = cartItems.find((cart: { id: string }) => courseId === cart.id.split('_')[1]);
    courseExist && setAdd(true);
  }, [cartItems, courseId]);

  useEffect(() => {
    close()
  }, []);

  return !isFetching && (
    <>
      <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      {/* Conditionally render ReactPlayer when the state is true */}
      {display && (
        <ReactPlayer
          url="https://www.youtube.com/embed/bk7McNUjWgw"
          width="100%"
          height="500px"
          controls={true}
        />
      )}

      {/* {courseData?.courseType === 'paid' && */}
      <div className={`${styles['courses-details-info']}`}>
        {/* Instructor and course details */}
        <ul className={`${styles['info']}`}>
          <li>
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <i><IconUser size={20} /></i> Instructor
              </span>
              {courseData?.author}
            </div>
          </li>

          {/* Render course details conditionally */}
          {price > 0 && (
            <li>
              {courseData?.paidType === 'live' && (
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <i><IconTimeDuration90 size={20} /></i> Live Training
                  </span>
                  {lessons} lessons
                </div>
              )}

              {courseData?.paidType === 'video' && (
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <i><IconClock size={20} /></i> Video Courses
                  </span>
                  {duration}
                </div>
              )}
            </li>
          )}

          <li className={styles['price']}>
            {!isEnrolled ? (
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i><IconTags /></i>
                  {isFreeCourse ? 'Course Type' : 'Price'}
                </span>

                {isFreeCourse ? (
                  <Text c="red" fw={600}>
                    {courseData.courseType}
                  </Text>
                ) : (
                  <span>&#8377;{price}</span>
                )}
              </div>

            ) : <p>Already purchased this course</p>}
          </li>
        </ul>

        {/* Action buttons */}
        {!isCourseReviewMode && (
          <>
            <ActionButtons
              add={add}
              isEnrolled={isEnrolled}
              addToCartClick={addToCart}
              userId={userId}
              courseId={courseData._id}
              courseType={courseData.courseType}
              courseSlug={courseData.slug}
              sectionId={courseData.sections?.[0]?._id}
              lessonId={courseData.sections?.[0]?.videos?.[0]?._id}
              open={open}
            />

            <div className={styles['courses-share']}>
              <div className={styles['share-info']}>
                <span>
                  Share This Course <IconShare size={22} />
                </span>
                <ul className={styles['social-link']}>
                  <li>
                    <Anchor
                      href="#"
                      className="d-block"
                      target="_blank"
                      onClick={(event) => {
                        event.preventDefault();
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      <IconCopy />
                    </Anchor>
                  </li>
                  <li>
                    <Anchor component={Link} href={`https://wa.me/?text=${encodeURIComponent(url)}`} className="d-block" target="_blank">
                      <IconBrandWhatsapp />
                    </Anchor>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      {/* } */}
    </>
  );
};

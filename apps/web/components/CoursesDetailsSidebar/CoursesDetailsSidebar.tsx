import React, { FC, useEffect, useMemo, useState } from 'react';
import styles from './CoursesDetailsSidebar.module.css';
import { notifications } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks'; // Create this hook
import { Anchor, LoadingOverlay, Text, Group } from '@mantine/core';
import Link from 'next/link';
import ReactPlayer from 'react-player';
import ActionButtons from './ActionButtons';

// Import RTK actions - ADD updateCartOnServer!
import {
  addToCart,
  selectCartItems,
  updateCartOnServer  // <-- Import this!
} from '../../store/slices/cartSlice';

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
  imageUrl: string;
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
  imageUrl,
  duration,
  lessons,
  courseData,
  slug,
  isCourseReviewMode
}) => {
  const cartItems = useSelector(selectCartItems) as any;
  const dispatch = useAppDispatch(); // Use typed dispatch
  const [add, setAdd] = useState(false);
  const [display, setDisplay] = useState(false);
  const [isVisible, { open, close }] = useDisclosure(true);

  const { isEnrolled, isFetching } = useIsEnrolled(courseId);
  console.log('🚀 :: CoursesDetailsSidebar :: isEnrolled:', isEnrolled)
  const isFreeCourse = courseData?.courseType === 'free';

  const url = useMemo(() => `${process.env.NEXT_PUBLIC_MFE_HOST}/courses/${slug}`, [slug]);

  const handleAddToCart = async () => {
    const courseObj = {
      id: courseId,
      _id: courseId,
      courseName,
      slug,
      price: price || 0,
      total_cost: price || 0,
      lessons,
      duration,
      image: imageUrl,
      quantity: 1
    };

    if (!isCourseExist()) {
      await dispatchAddToCart(courseObj);
    }
  }

  const dispatchAddToCart = async (courseObj: any) => {
    // First dispatch the addToCart action (updates local state)
    dispatch(addToCart(courseObj));

    // Then sync with server
    try {
      // Get current state after adding item
      const currentState = {
        cartItems: [...cartItems, courseObj],
        discount: 0 // You may want to get this from state
      };

      // Dispatch async thunk to sync with server
      await dispatch(updateCartOnServer(currentState)).unwrap();

      notifications.show({
        position: 'bottom-right',
        title: 'Cart Updated',
        message: `${courseObj.courseName} added to cart.`,
        color: 'green'
      });
    } catch (error) {
      // Handle server sync error
      console.error('Failed to sync cart with server:', error);
      notifications.show({
        position: 'bottom-right',
        title: 'Warning',
        message: `${courseObj.courseName} added locally, but failed to sync with server.`,
        color: 'yellow'
      });
    }
  };

  const isCourseExist = () => {
    return cartItems.find((cart: { id: string }) => {
      const cartId = cart.id.includes('_') ? cart.id.split('_')[1] : cart.id;
      return courseId === cartId;
    });
  };

  useEffect(() => {
    const courseExist = cartItems.find((cart: { id: string }) => {
      const cartId = cart.id.includes('_') ? cart.id.split('_')[1] : cart.id;
      return courseId === cartId;
    });
    setAdd(!!courseExist);
  }, [cartItems, courseId]);

  useEffect(() => {
    close()
  }, []);

  return !isFetching && (
    <>
      <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

      {display && (
        <ReactPlayer
          url="https://www.youtube.com/embed/bk7McNUjWgw"
          width="100%"
          height="500px"
          controls={true}
        />
      )}

      <div className={`${styles['courses-details-info']}`}>
        <ul className={`${styles['info']}`}>
          <li>
            <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text fw={700} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                <IconUser size={20} style={{ marginRight: 0 }} />
                Instructor
              </Text>

              <Text style={{ display: 'flex', alignItems: 'center' }}>{courseData?.author}</Text>
            </Group>
          </li>

          {price > 0 && (
            <li>
              {courseData?.paidType === 'live' && (
                <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text fw={700} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                    <IconTimeDuration90 size={20} style={{ marginRight: 0 }} />
                    Live Training
                  </Text>

                  <Text style={{ display: 'flex', alignItems: 'center' }}>{lessons} lessons</Text>
                </Group>
              )}

              {courseData?.paidType === 'video' && (
                <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text fw={700} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                    <IconClock size={20} style={{ marginRight: 0 }} />
                    Video Courses
                  </Text>

                  <Text style={{ display: 'flex', alignItems: 'center' }}>{duration}</Text>
                </Group>
              )}
            </li>
          )}

          <li className={styles['price']}>
            {!isEnrolled ? (
              <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fw={700} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                  <IconTags size={18} style={{ display: 'inline-flex' }} />
                  {isFreeCourse ? 'Course Type' : 'Price'}
                </Text>

                {isFreeCourse ? (
                  <Text c="red" fw={600} style={{ display: 'flex', alignItems: 'center' }} m={0}>
                    {courseData.courseType}
                  </Text>
                ) : (
                  <Text style={{ display: 'flex', alignItems: 'center' }} m={0}>&#8377;{price}</Text>
                )}
              </Group>
            ) : <p>Already purchased this course</p>}
          </li>
        </ul>

        {!isCourseReviewMode && (
          <>
            <ActionButtons
              add={add}
              isEnrolled={isEnrolled}
              addToCartClick={handleAddToCart}
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
                  Share This Course <IconShare size={20} />
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
    </>
  );
};
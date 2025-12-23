import React, { FC, useEffect, useMemo, useState } from 'react';
import styles from './CoursesDetailsSidebar.module.css';
import { notifications } from '@mantine/notifications';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks'; // Create this hook
import { Anchor, LoadingOverlay, Text, Group, Paper, Stack, ActionIcon } from '@mantine/core';
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
              <Text fw={700} fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                <IconUser size={20} style={{ marginRight: 0 }} />
                Instructor
              </Text>

              <Text fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center' }}>{courseData?.author}</Text>
            </Group>
          </li>

          {price > 0 && (
            <li>
              {courseData?.paidType === 'live' && (
                <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text fw={700} fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                    <IconTimeDuration90 size={20} style={{ marginRight: 0 }} />
                    Live Training
                  </Text>

                  <Text fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center' }}>{lessons} lessons</Text>
                </Group>
              )}

              {courseData?.paidType === 'video' && (
                <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text fw={700} fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                    <IconClock size={20} style={{ marginRight: 0 }} />
                    Video Courses
                  </Text>

                  <Text fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center' }}>{duration}</Text>
                </Group>
              )}
            </li>
          )}

          <li className={styles['price']}>
            {!isEnrolled ? (
              <Group style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fw={700} fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center', gap: 8 }} m={0}>
                  <IconTags size={18} style={{ display: 'inline-flex' }} />
                  {isFreeCourse ? 'Course Type' : 'Price'}
                </Text>

                {isFreeCourse ? (
                  <Text c="red" fw={600} fz={{ base: 'sm', sm: 'md' }} style={{ display: 'flex', alignItems: 'center' }} m={0}>
                    {courseData.courseType}
                  </Text>
                ) : (
                  <Text fz={{ base: 'lg', sm: 'xl' }} style={{ display: 'flex', alignItems: 'center' }} m={0}>&#8377;{price}</Text>
                )}
              </Group>
            ) : <Text fz={{ base: 'sm', sm: 'md' }}>Already purchased this course</Text>}
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

            <Paper
              p="xs"
              radius="md"
              withBorder
              mt="md"
              style={{
                borderColor: 'var(--mantine-color-gray-3)'
              }}
            >
              <Group gap="md" justify="center" align="center">
                <Group gap="xs">
                  <IconShare size={20} />
                  <Text fw={600} size="sm">Share this course</Text>
                </Group>

                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="lg"
                    radius="md"
                    onClick={(event) => {
                      event.preventDefault();
                      navigator.clipboard.writeText(url);
                      notifications.show({
                        position: 'bottom-right',
                        title: 'Link Copied',
                        message: 'Course link copied to clipboard!',
                        color: 'green'
                      });
                    }}
                    title="Copy link"
                  >
                    <IconCopy size={20} stroke={1.5} />
                  </ActionIcon>

                  <ActionIcon
                    component={Link}
                    href={`https://wa.me/?text=${encodeURIComponent(url)}`}
                    target="_blank"
                    variant="subtle"
                    color="teal"
                    size="xl"
                    radius="md"
                    title="Share on WhatsApp"
                  >
                    <IconBrandWhatsapp size={20} stroke={1.5} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          </>
        )}
      </div>
    </>
  );
};
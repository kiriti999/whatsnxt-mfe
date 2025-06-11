import React, { FC } from 'react';
import styles from './RatingBars.module.css';
import { Stack, Text } from '@mantine/core'

type RatingBarsProps = {
  // Define your component props here
  course: any
  courseReviews: any
}

export const RatingBars: FC<RatingBarsProps> = ({ course, courseReviews }) => {

  // const calculateStarsData = (star: any) => {
  //   const starCount = course.rateArray.filter(
  //     (item: number) => Math.floor(item) === star,
  //   ).length;
  //   const starRatio =
  //     courseReviews.length > 0 ? starCount / courseReviews.length : 0;
  //   return { starCount, starRatio };
  // };

  const calculateStarsData = (star: number) => {
    const starIndex = 5 - star; // Ensure index maps correctly (5 → index 0, 1 → index 4)
    const starCount = course.rateArray?.[starIndex] || 0; // Safely access index
    const starRatio = courseReviews.length > 0 ? starCount / courseReviews.length : 0;
    return { starCount, starRatio };
  };


  const renderStarBar = (star: any, index: number) => {
    const { starCount, starRatio } = calculateStarsData(star);

    return (
      <div key={index} className={`${styles['rating-bar']} mb-1`}>
        <div className={`${styles['star']}`}>{star} star</div>
        <div className={styles['middle']}>
          <div className={styles['bar-container']}>
            <div
              className={`${styles[`bar-${star}`]} ${styles['bar']}`}
              style={{ width: `${starRatio * 100}%` }}
            ></div>
          </div>
        </div>
        <div className={`${styles['side']} ${styles['right']}`}>
          {starCount}
        </div>
      </div>
    );
  };

  const averageRating = parseInt(course.rating).toFixed(1);

  return (
    <>
      <Text size='md' my={'xs'}>
        {averageRating} average based on {courseReviews.length} reviews.
      </Text>
      <Stack gap={0}>
        {[5, 4, 3, 2, 1].map((star, index) => renderStarBar(star, index))}
      </Stack>
    </>
  );
};

import React, { FC } from 'react';
import styles from './LoadingSkeleton.module.css';

type LoadingSkeletonProps = {
  // Define your component props here
}

export const LoadingSkeleton: FC<LoadingSkeletonProps> = () => {
  return (
    <div className={styles.container}>
      <div className={styles.heading}></div>
      {new Array(14).fill(null).map((_, i) => (
        <div key={i} className={styles.text}></div>
      ))}
    </div>
  );
};

import { Skeleton } from '@mantine/core';
import clsx from 'clsx';
import styles from './CardSkeleton.module.css';

const defaultStyle = styles.defaultLoadingCardStyle;

function CardSkeleton({ count = 6, styles: propStyles }: any) {
  const combinedStyles = clsx(defaultStyle, propStyles);
  return (
    <div className={combinedStyles}>
      {new Array(count).fill(null).map((_, i) => (
        <Skeleton key={i} height={230} width="100%" />
      ))}
    </div>
  );
}

export default CardSkeleton;

import React, { FC } from 'react';
import Link from 'next/link';
import { Anchor } from '@mantine/core';
import styles from './PageBanner.module.css';

type PageBannerProps = {
  // Define your component props here
  pageTitle: string;
  homePageUrl: string;
  homePageText: string;
  activePageText: any
}

export const PageBanner: FC<PageBannerProps> = ({ pageTitle,
  homePageUrl,
  homePageText,
  activePageText, }) => {
  return (
    <div className={styles['page-title-area']}>
      <div className="container">
        <div className={styles['page-title-content']}>
          <ul>
            <li>
                <Anchor component={Link} href={homePageUrl}>{homePageText}</Anchor>
            </li>
            <li className={styles['active']}>{activePageText}</li>
          </ul>

          {/* <h2>{pageTitle}</h2> */}
        </div>
      </div>
    </div>
  );
};

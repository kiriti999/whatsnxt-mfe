import React from 'react';
import Link from 'next/link';
import styles from './PageBanner.module.css';
import { Anchor } from '@mantine/core';

const PageBanner = ({
  pageTitle,
  homePageUrl,
  homePageText,
  activePageText,
}) => {
  return (
    <div className={styles['page-title-area']}>
      <div className="">
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

export default PageBanner;

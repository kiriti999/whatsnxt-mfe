import React, { FC } from 'react';
import { Anchor } from '@mantine/core';
import styles from './SocialShare.css';

import {
  IconCopy,
  IconBrandWhatsapp,
  IconShare,
} from "@tabler/icons-react";
import LinkedInShare from './LinkedInshare';

type SocialShareProps = {
  // Define your component props here
  url: string
}

export const SocialShare: FC<SocialShareProps> = ({ url }) => {
  return (
    <div className={styles['courses-share']}>
      <div className={styles['share-info']}>
        <span>
          Share This Course <i><IconShare /></i>
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
            <Anchor
              href={`https://wa.me/?text=${encodeURIComponent(url)}`}
              className="d-block"
              target="_blank"
            >
              <IconBrandWhatsapp />
            </Anchor>
          </li>
          <li>
            <LinkedInShare url={url} />
          </li>
        </ul>
      </div>
    </div>
  );
};

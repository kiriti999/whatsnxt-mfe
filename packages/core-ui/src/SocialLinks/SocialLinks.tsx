import React, { FC } from 'react';
import { Anchor } from '@mantine/core';
import styles from './SocialLinks.module.css';
import {
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
} from "@tabler/icons-react";

type SocialLinksProps = {
  // Define your component props here
  data: any;
};

export const SocialLinks: FC<SocialLinksProps> = ({ data }) => {
  return (
    <ul className={`${styles['social-link']} ${styles['social-link']}`}>
      <li>
        <Anchor
          href={data?.userId?.fb_url || '#'}
          className="d-block"
          target="_blank"
        >
          <IconBrandFacebook size={24} />
        </Anchor>
      </li>
      <li>
        <Anchor
          href={data?.userId?.tw_url || '#'}
          className="d-block"
          target="_blank"
        >
          <IconBrandTwitter size={24} />
        </Anchor>
      </li>
      <li>
        <Anchor
          href={data?.userId?.insta_url || '#'}
          className="d-block"
          target="_blank"
        >
          <IconBrandInstagram size={24} />
        </Anchor>
      </li>
      <li>
        <Anchor
          href={data?.userId?.in_url || '#'}
          className="d-block"
          target="_blank"
        >
          <IconBrandLinkedin size={24} />
        </Anchor>
      </li>
    </ul>
  );
};

"use client"
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Text, Container, ActionIcon, Group, Anchor, Box, List, ListItem, Skeleton, Flex } from '@mantine/core';
import {
  IconCopyright,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconMapPin,
  IconPhoneCall,
  IconMail,
  IconHome,
  IconSchool,
  IconInfoCircle,
  IconArticle,
  IconNotebook,
} from "@tabler/icons-react";
import { Logo } from '../Logo';
import classes from './Footer.module.css';

// Dynamically import with no SSR to prevent hydration issues
const MobileFooter = dynamic(() => import('./MobileFooter').then((mod) => mod.MobileFooter), {
  ssr: false,
  loading: () => <Skeleton height={300} radius="sm" />
});

const termsLinks = [
  { text: 'Privacy Policy', link: '/privacy-policy' },
  { text: 'Terms & Conditions', link: '/terms-of-service' },
  { text: 'Refund Policy', link: '/refund-policy' },
];

const footerSections = [
  {
    title: 'Explore',
    links: [
      { icon: <IconHome size={16} />, text: 'Home', link: '/' },
      { icon: <IconInfoCircle size={16} />, text: 'About', link: '/about' },
      { icon: <IconSchool size={16} stroke={1.5} />, text: 'Courses', link: '/courses' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { icon: <IconArticle size={16} stroke={1.5} />, text: 'Reads', link: '/reads' },
      { icon: <IconNotebook size={16} stroke={1.5} />, text: 'Tutorials', link: 'https://www.whatsnxt.in/tutorials' },
      { icon: <IconMail size={16} />, text: 'Contact', link: '/contact-us' }
    ],
  },
  {
    title: 'Address',
    links: [
      { icon: <IconMapPin size={16} />, text: 'Hyderabad, India', link: 'https://maps.app.goo.gl/2o5hu5yMSc78Tz4W9' },
      { icon: <IconPhoneCall size={16} />, text: '+91 6300711966', link: 'tel:+91 6300711966' },
      { icon: <IconMail size={16} />, text: 'support@whatsnxt.in', link: 'mailto:support@whatsnxt.in' },
    ],
  },
];

const socialMediaPlatforms = [
  { icon: <IconBrandFacebook size={16} />, url: 'https://www.facebook.com/profile.php?id=61567825286078' },
  { icon: <IconBrandTwitter size={16} />, url: 'https://x.com/whatsnxtsocial' },
  { icon: <IconBrandInstagram size={16} />, url: 'https://www.instagram.com/whatsnxtsocial/' },
  { icon: <IconBrandLinkedin size={16} />, url: 'https://www.linkedin.com/in/whatsnxt-social-a29883334/' },
];

// Desktop Footer Component
const DesktopFooter = () => (
  <div className={classes['footer-grid-container']}>
    <section className={classes['brand-column']}>
      <div className={classes['single-footer-widget']}>
        <Logo
          color="white"
          variant="footer"
          width={1040}
          height={256}
          className={classes.footerLogoLink}
        />
        <Text size="md" className={classes['brand-blurb']}>
          Working to bring significant changes in online-based learning by
          doing extensive research for course curriculum preparation,
          student engagements, and looking forward to the flexible
          education!
        </Text>
        <Group gap={10} className={classes.social} justify="flex-start" wrap="nowrap" mt="md">
          {socialMediaPlatforms.map((smp, i) => (
            <Anchor
              href={smp.url}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
            >
              <ActionIcon size="sm" color="white" variant="subtle" className={classes.socialIcon}>
                {smp.icon}
              </ActionIcon>
            </Anchor>
          ))}
        </Group>
      </div>
    </section>

    {footerSections.map((section, index) => (
      <Box key={index} className={classes['link-column']}>
        <div className={classes['single-footer-widget']}>
          <Text component="h3" className={classes['column-heading']}>
            {section.title}
          </Text>
          <List className={`${classes['footer-contact-info']}`} listStyleType="none">
            {section.links?.map((link, i) => (
              <ListItem key={i} className={classes['footer-link-row']}>
                <Flex gap="sm" align="flex-start" wrap="nowrap">
                  <Box className={classes['footer-link-icon']} aria-hidden>
                    {link.icon}
                  </Box>
                  <Anchor
                    td="none"
                    className={classes['footer-link-anchor']}
                    href={link.link}
                    {...(section.title === 'Address' && link.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.text}
                  </Anchor>
                </Flex>
              </ListItem>
            ))}
          </List>
        </div>
      </Box>
    ))}
  </div>
);

export const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box className={classes['footer-area']}>
        <Container className={`container ${classes['footer-inner']}`}>
          <Skeleton height={300} radius="sm" />
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes['footer-area']}>
      <Container className={`container ${classes['footer-inner']}`}>
        {isMobile ? (
          <MobileFooter
            footerSections={footerSections}
            socialMediaPlatforms={socialMediaPlatforms}
          />
        ) : (
          <DesktopFooter />
        )}
      </Container>

      <Box className={classes['footer-bottom-area']}>
        <Container className={`container ${classes['footer-inner']}`}>
          <Box
            className={classes['footer-bottom-wrapper']}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Group gap={6} mb="sm" align="center" justify="center" wrap="wrap">
              <IconCopyright size={18} className={classes['footer-bottom-icon']} />
              <Text component="span" className={classes['footer-copyright-main']}>
                {currentYear} whatsnxt
              </Text>
              <Text component="span" className={classes['footer-copyright-sub']}>
                All rights reserved
              </Text>
            </Group>
            <Flex
              component="nav"
              aria-label="Legal links"
              wrap="wrap"
              justify="center"
              align="center"
              gap={10}
              rowGap={6}
              className={classes['footer-policy-row']}
            >
              {termsLinks.map((link, i) => (
                <React.Fragment key={link.link}>
                  {i > 0 ? (
                    <Text component="span" className={classes['footer-policy-sep']} aria-hidden>
                      |
                    </Text>
                  ) : null}
                  <Anchor td="none" href={link.link} className={classes['footer-policy-link']}>
                    {link.text}
                  </Anchor>
                </React.Fragment>
              ))}
            </Flex>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
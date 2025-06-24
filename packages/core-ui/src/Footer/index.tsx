"use client"
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Text, Container, ActionIcon, Group, Anchor, Box, List, Skeleton, Flex } from '@mantine/core';
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
  IconBook,
  IconInfoCircle,
  IconArticle
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
      { icon: <IconBook size={16} />, text: 'Courses', link: '/courses' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { icon: <IconArticle size={16} />, text: 'Blogs', link: 'https://blog.whatsnxt.in/blogs' },
      { icon: <IconBook size={16} />, text: 'Tutorials', link: 'https://blog.whatsnxt.in/tutorials' },
      { icon: <IconMail size={16} />, text: 'Contact', link: '/contact-us' }
    ],
  },
  {
    title: 'Address',
    links: [
      { icon: <IconMapPin size={16} />, text: 'Hyderabad, India', link: 'https://maps.app.goo.gl/2o5hu5yMSc78Tz4W9' },
      { icon: <IconPhoneCall size={16} />, text: '+91 6300711966', link: 'tel:+91 6300711966' },
      { icon: <IconMail size={16} />, text: 'info@whatsnxt.in', link: 'mailto:info@whatsnxt.in' },
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
    <section>
      <div className={classes['single-footer-widget']}>
        <Logo color="white" className="w-75 mb-3" />
        <Text>
          Working to bring significant changes in online-based learning by
          doing extensive research for course curriculum preparation,
          student engagements, and looking forward to the flexible
          education!
        </Text>
        <Group gap={10} className={classes.social} justify="flex-start" wrap="nowrap">
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
      <Box key={index}>
        <div className={classes['single-footer-widget']}>
          <Text size="xl" fw={800}>{section.title}</Text>
          <List className={`${classes['footer-contact-info']}`}>
            {section.links?.map((link, i) => (
              <List.Item key={i} className='d-flex align-items-baseline'>
                <Flex gap='sm' align='center'>
                  {link.icon}
                  <Anchor
                    className={`text-decoration-none ${section.title === 'Address' ? 'mx-2' : ''}`}
                    href={link.link}
                  >
                    {link.text}
                  </Anchor>
                </Flex>
              </List.Item>
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
        <Container className="container">
          <Skeleton height={300} radius="sm" />
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes['footer-area']}>
      <Container className="container">
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
        <Container className="container">
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
            <Text className="d-flex align-items-center gap-1 mb-2">
              <IconCopyright size={18} />
              {currentYear} whatsnxt
              <Anchor target="_blank" href="https://www.whatsnxt.in/" className="text-decoration-none">
                Copyright reserved
              </Anchor>
            </Text>
            <List className='p-0 m-0'>
              <Flex wrap='wrap' justify='center'>
                {termsLinks.map((link, i) => (
                  <List.Item key={i} className='d-flex align-items-baseline'>
                    <Anchor
                      className='text-decoration-none'
                      href={link.link}
                    >
                      {link.text}
                    </Anchor>
                  </List.Item>
                ))}
              </Flex>
            </List>
          </Box>
        </Container>
      </Box>

      <div className={classes.lines}>
        <div className={classes.line}></div>
        <div className={classes.line}></div>
        <div className={classes.line}></div>
      </div>
    </Box>
  );
};
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Navbar from './Navbar';
import { Footer } from '@whatsnxt/core-ui/src/Footer';
import { GoTop } from '@whatsnxt/core-util';
import CookieConsent from 'react-cookie-consent';
import { Box } from '@mantine/core';

const Layout = ({ children, loginMenuLinks, links, copyRight }) => {

  return (
    <>
      <Navbar links={links} loginMenuLinks={loginMenuLinks} copyRight={copyRight} />

      <Box my={{ base: '2rem', sm: '3rem', md: '4rem' }}>
        {children}
      </Box>

      <GoTop />

      <Footer />

      <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent>
    </>
  );
};

export default Layout;

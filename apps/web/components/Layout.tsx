/* eslint-disable react/prop-types */

import React from 'react';
import Navbar from './Navbar';
import { GoTop } from '@whatsnxt/core-util';
import CookieConsent from 'react-cookie-consent';
import { Box } from '@mantine/core';

const Layout = ({ children, loginMenuLinks, links, copyRight }) => {

  return (
    <>
      <Navbar links={links} loginMenuLinks={loginMenuLinks} copyRight={copyRight} />

      {/* Spacer for fixed Navbar */}
      <Box style={{ paddingTop: '75px' }}>
        {children}
      </Box>

      <GoTop />

      {/* <Footer /> */}

      {/* <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent> */}
    </>
  );
};

export default Layout;

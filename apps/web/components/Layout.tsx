import React from 'react';
import Navbar from './Navbar';
import { GoTop } from '@whatsnxt/core-util';
import CookieConsent from 'react-cookie-consent';
import { Box } from '@mantine/core';
import TutorialAppShell from './TutorialAppShell/TutorialAppShell';

const Layout = ({ children, loginMenuLinks, links, copyRight }) => {

  return (
    <>
      <Navbar links={links} loginMenuLinks={loginMenuLinks} copyRight={copyRight} />

      <TutorialAppShell>
        <Box>
          {children}
        </Box>
      </TutorialAppShell>

      <GoTop />

      {/* <Footer /> */}

      {/* <CookieConsent>
        This website uses cookies to enhance the user experience.
      </CookieConsent> */}
    </>
  );
};

export default Layout;

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Router from 'next/router';
import Navbar from './Navbar';
// import Preloader from './Preloader';
import { Footer } from '@whatsnxt/core-ui/src/Footer';
import { GoTop } from '@whatsnxt/core-util';
import CookieConsent from 'react-cookie-consent';
import { Box } from '@mantine/core';

const Layout = ({ children, user, loginMenuLinks, links, copyRight }) => {

  const [loader, setLoader] = React.useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 2000);
  }, []);

  Router.events.on('routeChangeStart', () => {
    setLoader(true);
  });
  Router.events.on('routeChangeComplete', () => {
    setLoader(false);
  });
  Router.events.on('routeChangeError', () => {
    setLoader(false);
  });

  return (
    <>
      <Navbar user={user} links={links} loginMenuLinks={loginMenuLinks} copyRight={copyRight} />

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

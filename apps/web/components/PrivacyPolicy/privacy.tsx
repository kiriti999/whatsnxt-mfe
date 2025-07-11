import React from 'react';
import { Container, Grid, Box, Text, Title, Blockquote, GridCol } from '@mantine/core';
import { PageBanner } from '@whatsnxt/core-ui';

const PrivacyPolicy = () => {
  return (
    <>
      <Box py="xl" pt="sm">
        <Container>
          <Grid>
            <GridCol span={{ base: 12, lg: 12 }}>
              <Box>
                <Text fs="italic" mb="md">
                  This Privacy Policy was last updated on July 6, 2025.
                </Text>

                <Title order={3} mb="md">1. What Data We Get</Title>
                <Blockquote mb="md">
                  <Text>
                    We collect certain data from you directly, like information
                    you enter yourself, data about your participation in
                    courses, and data from third-party platforms you connect
                    with whatsnxt. We also collect some data automatically, like
                    information about your device and what parts of our Services
                    you interact with or spend time using.
                  </Text>
                </Blockquote>

                <Title order={3} mb="md">2. Data You Provide to Us</Title>
                <Text mb="md">
                  We may collect different data from or about you depending on
                  how you use the Services. Below are some examples to help you
                  better understand the data we collect.
                </Text>

                <Title order={3} mb="md">3. How We Get Data About You</Title>
                <Text mb="md">
                  We use tools like cookies, web beacons, analytics services,
                  and advertising providers to gather the data listed above.
                  Some of these tools offer you the ability to opt out of data
                  collection.
                </Text>

                <Title order={3} mb="md">4. What We Use Your Data For</Title>
                <Box component="ol" mb="md">
                  <li>Responding to your questions and concerns;</li>
                  <li>
                    Sending you administrative messages and information,
                    including messages from instructors and teaching assistants,
                    notifications about changes to our Service, and updates to
                    our agreements;
                  </li>
                  <li>
                    Sending push notifications to your wireless device to
                    provide updates and other relevant messages (which you can
                    manage from the "options" or "settings" page of the mobile
                    app);
                  </li>
                </Box>

                <Title order={3} mb="md">5. Your Choices About the Use of Your Data</Title>
                <Text mb="md">
                  You can choose not to provide certain data to us, but you may
                  not be able to use certain features of the Services.
                </Text>

                <Box component="ul" mb="md">
                  <li>
                    To stop receiving promotional communications from us, you
                    can opt out by using the unsubscribe mechanism in the
                    promotional communication you receive or by changing the
                    email preferences in your account. Note that regardless of
                    your email preference settings, we will send you
                    transactional and relationship messages regarding the
                    Services, including administrative confirmations, order
                    confirmations, important updates about the Services, and
                    notices about our policies.
                  </li>
                  <li>
                    The browser or device you use may allow you to control
                    cookies and other types of local data storage. Your wireless
                    device may also allow you to control whether location or
                    other data is collected and shared. You can manage Adobe's
                    LSOs through their Website Storage Settings panel.
                  </li>
                  <li>
                    To get information and control cookies used for tailored
                    advertising from participating companies, see the consumer
                    opt-out pages for the Network Advertising Initiative and
                    Digital Advertising Alliance, or if you're located in the
                    European Union, visit the Your Online Choices site. To opt
                    out of Google's display advertising or customize Google
                    Display Network ads, visit the Google Ads Settings page. To
                    opt out of Taboola's targeted ads, see the Opt-out Link in
                    their Cookie Policy.
                  </li>
                  <li>
                    To update data you provide directly, log into your account
                    and update your account at any time.
                  </li>
                </Box>

                <Title order={3} mb="md">6. Our Policy Concerning Children</Title>
                <Text>
                  We recognize the privacy interests of children and encourage
                  parents and guardians to take an active role in their
                  children's online activities and interests. Children under 13
                  (or under 16 in the European Economic Area) should not use the
                  Services. If we learn that we've collected personal data from
                  a child under those ages, we will take reasonable steps to
                  delete it.
                </Text>
              </Box>
            </GridCol>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default PrivacyPolicy;
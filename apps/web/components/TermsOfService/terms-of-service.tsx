import React from 'react';
import { Container, Text, Title, List, Blockquote, Stack } from '@mantine/core';

const TermsOfService = () => {
  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Text fs="italic" c="dimmed">
          This Terms of Service was last updated on January 1, 2020.
        </Text>

        <Title order={3}>1. Our website</Title>
        <Text>Our website address is: http://whatsnxt.com</Text>

        <Blockquote>
          We collect certain data from you directly, like information
          you enter yourself, data about your participation in
          courses, and data from third-party platforms you connect
          with whatsnxt. We also collect some data automatically, like
          information about your device and what parts of our Services
          you interact with or spend time using.
        </Blockquote>

        <Title order={3}>2. Data You Provide to Us</Title>
        <Text>
          We may collect different data from or about you depending on
          how you use the Services. Below are some examples to help you
          better understand the data we collect.
        </Text>

        <Title order={3}>3. How We Get Data About You</Title>
        <Text>
          We use tools like cookies, web beacons, analytics services,
          and advertising providers to gather the data listed above.
          Some of these tools offer you the ability to opt out of data
          collection.
        </Text>

        <Title order={3}>4. What We Use Your Data For</Title>
        <List type="ordered">
          <List.Item>Responding to your questions and concerns;</List.Item>
          <List.Item>
            Sending you administrative messages and information,
            including messages from instructors and teaching assistants,
            notifications about changes to our Service, and updates to
            our agreements;
          </List.Item>
          <List.Item>
            Sending push notifications to your wireless device to
            provide updates and other relevant messages (which you can
            manage from the "options" or "settings" page of the mobile
            app);
          </List.Item>
        </List>

        <Title order={3}>5. Your Choices About the Use of Your Data</Title>
        <Text>
          You can choose not to provide certain data to us, but you may
          not be able to use certain features of the Services.
        </Text>

        <List>
          <List.Item>
            To stop receiving promotional communications from us, you
            can opt out by using the unsubscribe mechanism in the
            promotional communication you receive or by changing the
            email preferences in your account. Note that regardless of
            your email preference settings, we will send you
            transactional and relationship messages regarding the
            Services, including administrative confirmations, order
            confirmations, important updates about the Services, and
            notices about our policies.
          </List.Item>
          <List.Item>
            The browser or device you use may allow you to control
            cookies and other types of local data storage. Your wireless
            device may also allow you to control whether location or
            other data is collected and shared. You can manage Adobe's
            LSOs through their Website Storage Settings panel.
          </List.Item>
          <List.Item>
            To get information and control cookies used for tailored
            advertising from participating companies, see the consumer
            opt-out pages for the Network Advertising Initiative and
            Digital Advertising Alliance, or if you're located in the
            European Union, visit the Your Online Choices site. To opt
            out of Google's display advertising or customize Google
            Display Network ads, visit the Google Ads Settings page. To
            opt out of Taboola's targeted ads, see the Opt-out Link in
            their Cookie Policy.
          </List.Item>
          <List.Item>
            To update data you provide directly, log into your account
            and update your account at any time.
          </List.Item>
        </List>

        <Title order={3}>6. Our Policy Concerning Children</Title>
        <Text>
          We recognize the privacy interests of children and encourage
          parents and guardians to take an active role in their
          children's online activities and interests. Children under 13
          (or under 16 in the European Economic Area) should not use the
          Services. If we learn that we've collected personal data from
          a child under those ages, we will take reasonable steps to
          delete it.
        </Text>

        <Title order={3}>7. Back Links Policy</Title>
        <Text fw={600} c="red">
          Back links are not allowed.
        </Text>
      </Stack>
    </Container>
  );
};

export default TermsOfService;
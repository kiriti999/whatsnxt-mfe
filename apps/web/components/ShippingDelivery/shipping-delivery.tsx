import React from 'react';
import { Container, Grid, Box, Text, Title, GridCol } from '@mantine/core';

const ShippingDelivery = () => {
  return (
    <>
      <Box py="xl" pt="sm">
        <Container>
          <Grid>
            <GridCol span={{ base: 12, lg: 12 }}>
              <Box>
                <Text fs="italic" mb="md">
                  This Information was last updated on January 1, 2024.
                </Text>

                <Title order={3} mb="md">1. Shipping and Delivery</Title>
                <Text mb="md">
                  As an online learning platform, all our courses and content are delivered digitally. There are no physical products to ship, and access to your purchased courses is provided instantly upon successful payment.
                </Text>

                <Title order={4} mb="md">Instant Access Upon Purchase</Title>
                <Text mb="md">
                  Once your payment is processed, you will receive immediate access to the courses and learning materials. This includes video content, downloadable resources, and any other educational materials offered as part of the course.
                </Text>

                <Title order={4} mb="md">Delivery Methods</Title>
                <Box component="ul" mb="md">
                  <li>
                    <Text component="span" fw="bold">Video Streaming:</Text> Course materials are delivered through live or pre-recorded video content that can be streamed directly from our platform. You can access these videos on demand, at your own pace.
                  </li>
                  <li>
                    <Text component="span" fw="bold">Downloadable Resources:</Text> Additional resources such as PDFs, exercise files, and other course materials may be available for download for offline access.
                  </li>
                </Box>

                <Title order={4} mb="md">Scheduled Live Courses</Title>
                <Text mb="md">
                  For courses that include live sessions, you will receive scheduled times for these events, and they will be delivered through live-streaming. You will also receive notifications and calendar invites to remind you of upcoming sessions.
                </Text>

                <Title order={4} mb="md">Confirmation and Setup</Title>
                <Text mb="md">
                  Upon purchasing a course, you will receive a confirmation email with all the necessary information to access the course, including login credentials (if applicable), access instructions, and links to any resources required.
                </Text>

                <Title order={4} mb="md">Access Duration</Title>
                <Text mb="md">
                  Your access to the purchased course may vary depending on the terms of the course offering. Some courses may provide lifetime access, while others may be accessible for a limited time (e.g., 6 months or 1 year). Please refer to the specific course details for information on access duration.
                </Text>

                <Title order={4} mb="md">Customer Support</Title>
                <Text mb="md">
                  If you experience any issues accessing your course materials, our support team is available to assist you. This support includes troubleshooting issues such as broken links, missing resources, or any other technical difficulties.
                </Text>

                <Title order={4} mb="md">Platform Updates and Notifications</Title>
                <Text mb="md">
                  As part of our commitment to providing high-quality learning experiences, we may periodically update or add new materials to your purchased courses. You will be notified of any significant updates or additional resources that become available.
                </Text>

                <Title order={4} mb="md">Returns or Refunds</Title>
                <Text>
                  Since our courses are digital products delivered instantly, refunds are typically not offered once a course has been accessed. However, if there is an issue with the course content or delivery, you can reach out to our support team for assistance or resolution.
                </Text>
              </Box>
            </GridCol>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ShippingDelivery;
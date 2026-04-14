import React from 'react';
import { Container, Grid, Box, Text, Title, Blockquote, Anchor, GridCol } from '@mantine/core';

const RefundPolicy = () => {
  return (
    <>
      <Box py="xl" pt="sm">
        <Container>
          <Grid>
            <GridCol span={{ base: 12, lg: 12 }}>
              <Box>
                <Text fs="italic" mb="md">
                  This Refund Policy was last updated on April 14, 2026.
                </Text>

                <Title order={3} mb="md">1. Refund for Video Recorded Courses</Title>
                <Blockquote mb="md">
                  <Text>
                    If you have purchased a video recorded course and are unsatisfied with it, you may request a refund within 30 days of purchase. Please note that after this 30-day period, refunds for video recorded courses will no longer be issued.
                  </Text>
                </Blockquote>

                <Title order={3} mb="md">2. Refund for Live Training Courses</Title>
                <Text mb="md">
                  For live training courses, you must request a refund before attending the third session with the trainer. Refund requests after attending the third session will not be entertained. To initiate a refund, please contact us via email at <Anchor href="mailto:support@whatsnxt.in">support@whatsnxt.in</Anchor>.
                </Text>

                <Title order={3} mb="md">3. Refund for Labs</Title>
                <Text mb="md">
                  For paid labs, you may request a refund within 24 hours of purchase. After this 24-hour window, refunds for labs will no longer be issued. You can request a refund directly from your Purchase History page or by contacting us at <Anchor href="mailto:support@whatsnxt.in">support@whatsnxt.in</Anchor>.
                </Text>

                <Title order={3} mb="md">4. Refund for System Design Courses</Title>
                <Text mb="md">
                  For system design courses, you may request a refund within 24 hours of purchase. After this 24-hour window, refunds for system design courses will no longer be issued. To initiate a refund, please contact us via email at <Anchor href="mailto:support@whatsnxt.in">support@whatsnxt.in</Anchor>.
                </Text>

                <Title order={3} mb="md">5. Structured Tutorials (Premium Content)</Title>
                <Text mb="md">
                  We do not offer refunds for structured tutorials or premium subscriptions. We encourage you to explore the free content available on our platform before upgrading to ensure the learning style and quality match your expectations.
                </Text>

                <Title order={3} mb="md">6. How to Request a Refund</Title>
                <Box component="ol" mb="md">
                  <li>Email us at <Anchor href="mailto:support@whatsnxt.in">support@whatsnxt.in</Anchor> with your order details and the reason for your refund request.</li>
                  <li>
                    For video recorded courses, the refund request must be made within 30 days of purchase.
                  </li>
                  <li>
                    For live training courses, the refund request must be made before attending the third session with the trainer.
                  </li>
                  <li>
                    For labs and system design courses, the refund request must be made within 24 hours of purchase.
                  </li>
                </Box>

                <Title order={3} mb="md">7. Refund Processing</Title>
                <Text mb="md">
                  Refunds will be processed within 7-10 business days after the refund request has been approved. Refunds will be credited to the original payment method used at the time of purchase.
                </Text>

                <Title order={3} mb="md">8. Exceptions to the Refund Policy</Title>
                <Box component="ul" mb="md">
                  <li>Refunds will not be issued for courses that have been completed or for which certificates have been issued.</li>
                  <li>Refund requests made outside of the allowed timeframe (30 days for video courses, before the 3rd session for live training, 24 hours for labs and system design courses) will not be considered.</li>
                  <li>Structured tutorials and premium subscriptions are non-refundable.</li>
                </Box>
              </Box>
            </GridCol>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default RefundPolicy;
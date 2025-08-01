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
                  This Refund Policy was last updated on July 6, 2025.
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

                <Title order={3} mb="md">3. How to Request a Refund</Title>
                <Box component="ol" mb="md">
                  <li>Email us at <Anchor href="mailto:support@whatsnxt.in">support@whatsnxt.in</Anchor> with your order details and the reason for your refund request.</li>
                  <li>
                    For video recorded courses, the refund request must be made within 30 days of purchase.
                  </li>
                  <li>
                    For live training courses, the refund request must be made before attending the third session with the trainer.
                  </li>
                </Box>

                <Title order={3} mb="md">4. Refund Processing</Title>
                <Text mb="md">
                  Refunds will be processed within 7-10 business days after the refund request has been approved. Refunds will be credited to the original payment method used at the time of purchase.
                </Text>

                <Title order={3} mb="md">5. Exceptions to the Refund Policy</Title>
                <Box component="ul" mb="md">
                  <li>Refunds will not be issued for courses that have been completed or for which certificates have been issued.</li>
                  <li>Refund requests made outside of the allowed timeframe (30 days for video courses, before the 3rd session for live training) will not be considered.</li>
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
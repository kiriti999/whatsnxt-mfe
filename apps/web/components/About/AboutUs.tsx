import React, { Suspense } from 'react';
import { Text, Badge, Title, Stack, Paper, Container } from '@mantine/core';
import { MantineLoader } from '@whatsnxt/core-ui';

const AboutUs = () => {

  return (

    <Suspense fallback={<MantineLoader />}>
      <Container size={'xl'} py="xl">

        <Paper shadow="sm" p="xl" radius="md">
          <Stack gap="xl" align="center">

            <Stack gap="lg" ta="center">

              <Badge
                size="lg"
                variant="light"
                color="blue"
                styles={{
                  root: {
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }
                }}
              >
                About Me
              </Badge>

              <Title
                order={2}
                size="h2"
                fw={700}
                ta="center"
                style={{
                  lineHeight: 1.3,
                  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)'
                }}
              >
                I am Kiriti Komaragiri, the Founder and CTO of WhatsNxt.
              </Title>

              <Text
                size="lg"
                lh={1.7}
                ta="center"
                c="dimmed"
                style={{
                  fontSize: '1.1rem',
                  maxWidth: '900px',
                  margin: '0 auto'
                }}
              >
                With over 12 years of experience in software development, I am
                deeply committed to creating a learning platform that empowers
                individuals and provides a clear pathway to career advancement on different categories through rich quality arcticles, tutorials and engaging video courses.
              </Text>
              {/* <p>
                At WhatsNxt, my vision is to offer the best learning experience—one
                that not only meets industry demands but also delivers practical,
                real-world skills. My goal is to support learners at every stage
                of their journey, from foundational skills to advanced expertise.
              </p> */}
              <Text
                size="lg"
                lh={1.7}
                ta="center"
                c="dimmed"
                style={{
                  fontSize: '1.1rem',
                  maxWidth: '900px',
                  margin: '0 auto'
                }}
              >
                At WhatsNxt, my vision is to provide with high-quality blogs that deliver practical knowledge,
                real-world examples, videos, and brain teasers. This approach
                ensures users can quickly grasp essential concepts without sifting through
                unnecessary details. To enhance this experience, I've introduced an article
                series feature, providing an organized learning journey that guides users
                through various topics. Ultimately, I aim to create a platform where users
                can access concise, engaging, and effective content for rapid learning.
              </Text>

            </Stack>
          </Stack>
        </Paper>

      </Container>
    </Suspense>


  );
};

export default AboutUs;

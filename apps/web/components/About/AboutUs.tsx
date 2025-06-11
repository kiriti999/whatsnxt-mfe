import React from 'react';
import styles from './AboutUs.module.css';
import { IconArtboard, IconBook, IconDeviceLaptop } from '@tabler/icons-react';
import { Box, Grid, Group, GridCol, Text, ThemeIcon } from '@mantine/core';

const AboutUs = () => {

  const features = [
    { icon: <IconArtboard size={20} />, text: "Live Training" },
    { icon: <IconDeviceLaptop size={20} />, text: "Remote Learning" },
    { icon: <IconBook size={20} />, text: "Rich Tutorials" }
  ];
  return (
    <div className={`${styles['about-area']} ptb-50`}>
      <div className="container">
        <div className="row align-items-center">

          <div className="col-lg-12 col-md-12">
            <div className={styles['about-content']}>
              <span className={`sub-title ${styles['sub-title']}`}>
                ABOUT ME
              </span>
              <h2>
                I am Kiriti Komaragiri, the Founder and CTO of WhatsNxt.
              </h2>
              <p>
                With over 12 years of experience in software development, I am
                deeply committed to creating a learning platform that empowers
                individuals and provides a clear pathway to career advancement.
                My expertise spans both high-level and low-level architectural
                design, with extensive hands-on experience in technologies like
                Next.js, Java, Docker, AWS, Node.js, and MongoDB.
              </p>
              <p>
                At WhatsNxt, my vision is to offer the best learning experience—one
                that not only meets industry demands but also delivers practical,
                real-world skills. My goal is to support learners at every stage
                of their journey, from foundational skills to advanced expertise,
                making the path to a successful career both accessible and engaging.
              </p>
              <p>
                Join me at WhatsNxt, where learning is designed to inspire growth
                and open doors to new opportunities.
              </p>

              <Box w="100%">
                <Grid gutter={{ base: 'sm', sm: 'md', lg: 'xl' }}>
                  {features.map((feature, index) => (
                    <GridCol key={index} span={{ base: 12, xs: 6, sm: 4 }}>
                      <Group>
                        <ThemeIcon
                          radius="xl"
                          variant="transparent"
                          color="#fe4a55"
                        >
                          {feature.icon}
                        </ThemeIcon>
                        <Text fw={500}>{feature.text}</Text>
                      </Group>
                    </GridCol>
                  ))}
                </Grid>
              </Box>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;

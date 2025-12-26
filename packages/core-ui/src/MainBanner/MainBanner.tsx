import React from 'react';
import { Container, Grid, Title, Box } from '@mantine/core';
import { HeroWithText } from '../HeroWithText';
import styles from './MainBanner.module.css';

export const MainBanner = () => {
  return (
    <Box pt={'2.3rem'}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(99, 102, 241, 0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        borderRadius: 'var(--mantine-radius-lg)',
        position: 'relative',
        padding: '2rem 0',
        marginBottom: '0.8rem'
      }}
    >
      <Container fluid style={{ position: 'relative', zIndex: 1 }}>
        <Grid justify="center" align="center">
          <Grid.Col span={12}>
            <div style={{ textAlign: 'center' }}>
              <Title
                order={3}
                fw={700}
                className={styles.mainBannerTitle}
              >
                Empower Your Learning Journey
              </Title>

              {/* <SmoothTextSwitcher /> */}
              <HeroWithText />
            </div>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

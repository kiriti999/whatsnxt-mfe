import React from 'react';
import { Container, Grid, Title } from '@mantine/core';
import { HeroWithText } from '../HeroWithText';

export const MainBanner = () => {
  return (
    <Container fluid>
      <Grid justify="center" align="center">
        <Grid.Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <Title order={3} fw={700}>
              Empower Your Learning Journey
            </Title>

            {/* <SmoothTextSwitcher /> */}
            <HeroWithText />
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

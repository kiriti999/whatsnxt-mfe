import React from 'react';
import { Container, Grid, Text } from '@mantine/core';
import SmoothTextSwitcher from '../TextSwitcher/TextSwitcher';
import { HeroWithText } from '../HeroWithText';

export const MainBanner = () => {
  return (
    <Container fluid>
      <Grid justify="center" align="center">
        <Grid.Col span={12}>
          <div style={{ textAlign: 'center' }}>
            <Text component="h3" fw={700}>
              Empower Your Learning Journey
            </Text>

            {/* <SmoothTextSwitcher /> */}
            <HeroWithText />
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

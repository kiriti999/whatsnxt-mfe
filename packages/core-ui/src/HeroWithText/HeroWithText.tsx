import React, { FC } from 'react';
import './HeroWithText.module.css';
import { Box, Text } from '@mantine/core';

type HeroWithTextProps = {
  // Define your component props here
}

export const HeroWithText: FC<HeroWithTextProps> = () => {
  return (
    <Box maw={720} mx={"auto"} mb={'xl'} ta={"center"}>
      {/* <Text component='h3' mb={14} fw={600}>Start Learning Today</Text> */}
      <Text mt={12} mx={'auto'} size='md'>
        Discover courses in every genre and category – live sessions or recorded trainings, tailored for your learning style. Explore tutorials, blogs, and resources to grow your skills and passions.
      </Text>
    </Box>
  );
};

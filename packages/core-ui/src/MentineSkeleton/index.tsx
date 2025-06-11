import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mantine/core';

interface SkeletonProps {
  color?: string;
  height?: number | string;
  width?: number | string;
  visible?: boolean;
  circle?: boolean;
  animate?: boolean;
  mb?: string; radius?: string
}

const SkeletonRectangle: React.FC<SkeletonProps> = ({
  color = 'red',
  height = 30,
  width = 200,
  visible = true,
  circle = false,
  animate = true,
}) => {
  return (
    <Skeleton
      height={height}
      width={width}
      visible={visible}
      circle={circle}
      animate={animate}
      style={{ backgroundColor: color }}
    />
  );
};



const SkeletonText: React.FC<SkeletonProps> = ({
  color = undefined,
  height = 25,
  width = '100%',
  visible = true,
  circle = false,
  animate = true,
  mb = 'xl',
  radius = 'sm'
}) => {
  return (
    <Skeleton
      height={height}
      width={width}
      visible={visible}
      circle={circle}
      animate={animate}
      style={{ backgroundColor: color }}
      mb={mb}
      radius={radius}
    />
  );
};


const SkeletonCard: React.FC = () => {
  return (
    <Stack align="center">
      <SkeletonRectangle height={150} />
      <SkeletonText width={'72%'} />
    </Stack>
  );
};

const SkeletonCardContent: React.FC = () => {
  return (
    <Box>
      <Grid grow gutter="lg">
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
      </Grid>
      <Grid grow gutter="lg">
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
        <Grid.Col span={4}><SkeletonCard /></Grid.Col>
      </Grid>
    </Box>
  );
};


const SkeletonBlogContent: React.FC = () => {
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <SkeletonText width="90%" mb="lg" radius='xl' />
      <SkeletonText width="85%" mb="lg" radius='xl' />
      <SkeletonText width="75%" mb="lg" radius='xl' />
      <SkeletonText width="95%" mb="lg" radius='xl' />
      <SkeletonText width="90%" mb="lg" radius='xl' />
      <SkeletonText width="85%" mb="lg" radius='xl' />
      <SkeletonText width="75%" mb="lg" radius='xl' />
      <SkeletonText width="95%" mb="lg" radius='xl' />
    </div>
  );
};




export {
  SkeletonRectangle,
  SkeletonText,
  SkeletonCard,
  SkeletonCardContent,
  SkeletonBlogContent,
};

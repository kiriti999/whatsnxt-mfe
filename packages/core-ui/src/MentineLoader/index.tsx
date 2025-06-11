import React from 'react';
import {
  Loader,
  MantineColor,
  MantineSize,
  DefaultMantineColor,
  MantineLoaderComponent, // Import this to correctly type the loaders
} from '@mantine/core';

interface CustomLoaderProps {
  children?: React.ReactNode;
  color?: MantineColor;
  loaders?: Partial<
    Record<DefaultMantineColor | 'bars' | 'dots' | 'oval', MantineLoaderComponent>
  >;
  size?: number | MantineSize | string;
  type?: DefaultMantineColor | 'bars' | 'dots' | 'oval' | string;
}

const MantineLoader = ({
  children,
  color = 'red',
  loaders,
  size = 'lg',
  type = 'oval',
}: CustomLoaderProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Loader color={color} loaders={loaders} size={size} type={type}>
        {children}
      </Loader>
    </div>
  );
};

export default MantineLoader;

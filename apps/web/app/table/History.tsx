'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Box, LoadingOverlay } from '@mantine/core';
import { FullPageOverlay } from '../../components/Common/FullPageOverlay';
import { useDisclosure } from '@mantine/hooks';

// Dynamically import the HistoryMUI component
const HistoryMUI = dynamic(() => import('../../components/Blog/History/table-mui'), {
  ssr: false, // Disable server-side rendering
  loading: () => (
    <Box style={{ height: '80vh' }}>
      <LoadingOverlay visible={true} zIndex={1000}
        overlayProps={{ radius: "sm", blur: 0.1 }}
        loaderProps={{ color: 'pink', type: 'bars' }}
      />
    </Box>
  ),
});

export default function History() {
  const [isVisible, { open, close }] = useDisclosure(false);
  return (
    <>
      <FullPageOverlay visible={isVisible} />
      <HistoryMUI open={open} close={close} />
    </>
  );
}

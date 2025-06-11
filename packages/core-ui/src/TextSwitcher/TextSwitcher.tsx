'use client'
import React, { useState, useEffect } from 'react';
import { Container, Title, Transition } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const genres = ['technology', 'cooking', 'art', 'music', 'business', 'design', 'photography'];

const PartialTextSwitcher = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const isMobile = useMediaQuery('(max-width: 576px)');

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false); // Fade out the text
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % genres.length); // Update genre
        setVisible(true); // Fade in new text
      }, 1000); // Match fade duration
    }, 4000); // Change genre every 4 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <Container
      size="lg"
      style={{
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Title
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          display: 'inline-flex',
          gap: '12px',
        }}
        className='flex-sm-row flex-column'
      >
        Learn{' '}
        <Transition
          mounted={visible}
          transition="fade"
          duration={1000} // Smooth fade transition
          timingFunction="ease-in-out"
        >
          {(styles) => (
            <span
              style={{
                ...styles,
                display: 'inline-block',
                width: `${isMobile ? '100%' : '140px'}`, // Set fixed width on desktop to avoid shifting
                textAlign: `${isMobile ? 'center' : 'left'}`,
                color: '#007BFF',
                fontWeight: 800,
                fontSize: '2rem',
              }}
            >
              {genres[activeIndex]}
            </span>
          )}
        </Transition>
      </Title>
    </Container>
  );
};

export default PartialTextSwitcher;

import React, { useState, useEffect } from 'react';
import styles from './stickyHeader.module.css';
import { Title, Box, useMantineColorScheme, Transition, Text } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface Title {
  ref: HTMLElement;
  text: string;
  id: string;
}

interface StickyHeaderProps {
  titles: Title[];
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ titles }) => {
  const { colorScheme } = useMantineColorScheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(
    titles.length > 0 ? titles[0].id : null
  );

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleTitleClick = (e: React.MouseEvent, titleId: string) => {
    e.preventDefault();
    setActiveId(titleId); // Set the clicked title as active immediately
    window.history.pushState(null, '', `#${titleId}`);
    const element = document.getElementById(titleId);
    if (element) {
      const yOffset = -56; // Adjust this value to get the exact position
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    );

    titles.forEach((title) => {
      const element = document.getElementById(title.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      titles.forEach((title) => {
        const element = document.getElementById(title.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [titles]);

  useEffect(() => {
    // Set the initial active ID to the first title if no other title is active
    if (!activeId && titles.length > 0) {
      setActiveId(titles[0].id);
    }
  }, [activeId, titles]);

  return (
    <Transition mounted={isVisible} transition="slide-down" duration={400} timingFunction="ease">
      {(transitionStyles) => (
        <Box
          className={styles.stickyHeader}
          style={{
            ...transitionStyles,
            position: 'sticky',
            top: 70,
            zIndex: 999,
            backgroundColor: colorScheme === 'dark' ? 'rgba(26, 27, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
            display: 'flex',
            alignItems: 'center',
            padding: '8px 24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            width: 'fit-content',
            maxWidth: '90%',
            minWidth: '300px',
            margin: '0 auto',
            borderRadius: '2rem'
          }}
        >
          <Title
            order={4}
            m={0}
            fw={500}
            c={colorScheme === 'dark' ? 'gray.1' : 'dark.9'}
            style={{ flex: 1, textAlign: 'center' }}
            lineClamp={1}
          >
            {activeId ? titles.find((title) => title.id === activeId)?.text || titles[0]?.text : titles[0]?.text}
          </Title>
          {menuOpen ? (
            <IconChevronUp size={20} onClick={handleMenuToggle} style={{ cursor: 'pointer', marginLeft: '8px' }} />
          ) : (
            <IconChevronDown size={20} onClick={handleMenuToggle} style={{ cursor: 'pointer', marginLeft: '8px' }} />
          )}
          {menuOpen && (
            <Box
              className={styles.menu}
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: colorScheme === 'dark' ? 'rgba(26, 27, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              }}
            >
              {titles.map((title) => (
                <Text
                  truncate
                  lineClamp={1}
                  component="a"
                  key={title.id}
                  className={styles.menuItem}
                  onClick={(e: React.MouseEvent) => handleTitleClick(e, title.id)}
                  href={`#${title.id}`}
                  display="block"
                  style={{
                    padding: '12px 16px',
                    textDecoration: 'none',
                    color: title.id === activeId
                      ? (colorScheme === 'dark' ? '#4dabf7' : '#1971c2')
                      : (colorScheme === 'dark' ? '#ced4da' : '#212529'),
                    borderTop: `1px solid ${colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                  }}
                >
                  {title.text}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Transition>
  );
};

export default StickyHeader;
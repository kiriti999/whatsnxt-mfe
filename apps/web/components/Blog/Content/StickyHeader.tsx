import React, { useState, useEffect } from 'react';
import styles from './stickyHeader.module.css';
import { Title, Box, useMantineColorScheme } from '@mantine/core';
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
    <Box
      className={styles.stickyHeader}
      pos="sticky"
      top={0}
      style={{
        zIndex: 1000,
      }}
    >
      <Title
        order={4}
        c={colorScheme === 'dark' ? 'gray.1' : 'dark.9'}
      >
        {titles.find((title) => title.id === activeId)?.text || titles[0]?.text}
      </Title>
      {menuOpen ? (
        <IconChevronUp size={20} onClick={handleMenuToggle} />
      ) : (
        <IconChevronDown size={20} onClick={handleMenuToggle} />
      )}
      {menuOpen && (
        <Box className={styles.menu}>
          {titles.map((title) => (
            <a
              key={title.id}
              className={styles.menuItem}
              onClick={(e) => handleTitleClick(e, title.id)}
              href={`#${title.id}`}
              style={{
                color: title.id === activeId
                  ? (colorScheme === 'dark' ? '#4dabf7' : '#1971c2')
                  : (colorScheme === 'dark' ? '#ced4da' : '#212529'),
              }}
            >
              {title.text}
            </a>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default StickyHeader;
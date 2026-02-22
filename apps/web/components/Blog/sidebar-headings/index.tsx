import { Title, Text, Box, Stack } from '@mantine/core';
import { useObserverManage } from '../../../hooks/useObserverManage';
import styles from './sidebarHeadings.module.css';

interface SidebarHeadingsProps {
  headings: { ref: Element; text: string; id: string }[];
  activeHeadingRef: Element | undefined;
}

function SidebarHeadings({
  headings,
  activeHeadingRef,
}: SidebarHeadingsProps) {
  const activeId = useObserverManage(headings.map(({ id }) => id));

  const escapeId = (id: string) => CSS.escape(id);

  const handleAnchorClick = (e: React.MouseEvent, headingId: string) => {
    e.preventDefault();
    const escapedId = escapeId(headingId);
    const element = document.querySelector(`#${escapedId}`);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      {headings.length > 1 && (
        <Box className="widget">
          <Title order={6} mb={'xs'} className={styles.sidebarTitle}>
            On this page:
          </Title>

          <Stack gap={0}>
            {headings.map((heading) => (
              <Box
                key={heading.id}
                className={`${styles.headingTile} ${heading.id === activeId ? styles.headingTileActive : ''}`}
                onClick={(e) => handleAnchorClick(e, heading.id)}
                style={{ cursor: 'pointer' }}
                py="xs"
                px="sm"
              >
                <Text
                  size="sm"
                  fw={heading.id === activeId ? 600 : 400}
                  lineClamp={1}
                  className={heading.id === activeId ? styles.headingTextActive : styles.headingText}
                >
                  {heading.text}
                </Text>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </>
  );
}

export default SidebarHeadings;
import { Title, Text, Box, Paper, Stack } from '@mantine/core';
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
        <Box className="widget" mt={'lg'}>
          <Title order={4} mt={'0.33rem'} mb={'xl'}
            style={{ cursor: 'pointer' }}>
            On this page:
          </Title>

          <Stack gap={0}>
            {headings.map((heading) => (
              <Paper
                key={heading.id}
                className={`${styles.headingTile} ${heading.id === activeId ? styles.headingTileActive : ''}`}
                onClick={(e) => handleAnchorClick(e, heading.id)}
                style={{ cursor: 'pointer' }}
                radius="md"
                shadow={heading.id === activeId ? "md" : "xs"}
                p="sm"
              >
                <Stack gap={0}>
                  <Text
                    size="xs"
                    fw={heading.id === activeId ? 600 : 400}
                    lineClamp={2}
                    truncate
                    c={heading.id === activeId ? 'blue.6' : 'dimmed'}
                  >
                    {heading.text}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </>
  );
}

export default SidebarHeadings;
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
          <Title order={5} mt={'0.33rem'} mb={'xs'}
            style={{ cursor: 'pointer' }}>
            On this page:
          </Title>

          <Stack gap={0}>
            {headings.map((heading) => (
              <Paper withBorder={false}
                key={heading.id}
                className={`${styles.headingTile} ${heading.id === activeId ? styles.headingTileActive : ''}`}
                onClick={(e) => handleAnchorClick(e, heading.id)}
                style={{ cursor: 'pointer' }}
                radius="xs"
                shadow={heading.id === activeId ? "md" : "xs"}
                p="0.4rem"
              >
                <Stack gap={0}>
                  <Title
                    order={5}
                    fw={heading.id === activeId ? 500 : 400}
                    lineClamp={1}
                    c={heading.id === activeId ? 'blue.6' : 'dimmed'}
                  >
                    {heading.text}
                  </Title>
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
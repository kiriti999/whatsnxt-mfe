import Link from 'next/link';
import { Group, Button, Anchor } from '@mantine/core';
import styles from './NavButtons.module.css'
import { IconChevronLeft, IconChevronRight, IconHome } from '@tabler/icons-react';

const TutorialNavButtons = ({ active, tutorials, setActive }: any) => {
  const navigateNext = () => {
    if (active < tutorials.length) {
      setActive((prev: number) => prev + 1);
    }
  }

  const navigatePrev = () => {
    if (active > 0) {
      setActive((prev: number) => prev - 1);
    }
  }

  return (
    <Group mb={'1.3em'} justify="space-between">
      {active > 0 ? (
        <Button
          className={styles.custom_button}
          disabled={active === 0}
          variant="outline"
          onClick={navigatePrev}
        >
          <IconChevronLeft size={16} className={styles.mobile_only} />
          <span className={styles.desktop_only}>Previous</span>
        </Button>
      ) : (
        <Anchor component={Link} href="/">
          <Button
            className={styles.custom_button}
            variant="outline"
          >
            <IconHome size={16} className={styles.mobile_only} />
            <span className={styles.desktop_only}>Home</span>
          </Button>
        </Anchor>
      )}

      {active < tutorials.length - 1 && (
        <Button
          disabled={!(active < tutorials.length - 1)}
          variant="outline"
          className={styles.custom_button}
          onClick={navigateNext}
        >
          <span className={styles.desktop_only}>Next</span>
          <IconChevronRight size={16} className={styles.mobile_only} />
        </Button>
      )}
    </Group>
  );
};

export default TutorialNavButtons;
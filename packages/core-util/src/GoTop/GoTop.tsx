import { Affix, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import styles from './GoTop.module.css';
import { IconChevronUp } from '@tabler/icons-react';

export const GoTop = () => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: 20, right: 20 }}>
      <Transition transition="slide-up" mounted={scroll.y > 0}>
        {(transitionStyles) => (
          <div
            style={transitionStyles}
            onClick={() => scrollTo({ y: 0 })}
            className={`${styles['go-top']} ${scroll.y > 0 ? styles['active'] : ''}`}
          >
            <IconChevronUp size={24} stroke={2} />
          </div>
        )}
      </Transition>
    </Affix>
  );
};

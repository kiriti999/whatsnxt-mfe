import type { FC } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@mantine/core";
import styles from './CoursesDetailsSidebar.module.css';

type PROPS = {
  url: string;
  text: string;
  open: () => void;
  icon?: React.ReactNode;
}

const NavigateButton: FC<PROPS> = ({ url, text, icon, open }) => {
  const router = useRouter();

  function handleClick() {
    open();
    router.push(url);
  };

  return (
    <Button
      color="red"
      c={'white'}
      onClick={handleClick}
      className={styles['default-btn']}
      leftSection={icon}
      fullWidth
      radius="md"
      size="lg"
    >
      {text}
    </Button>
  )
}

export default NavigateButton;

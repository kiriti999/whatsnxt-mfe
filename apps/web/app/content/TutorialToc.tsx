import React, { useMemo } from 'react';
import { Box, Text, Paper, Stack } from '@mantine/core';
import clsx from 'clsx';
import styles from './TutorialToc.module.css';
import { TutorialsTocProps } from '../../types/TutorialContentDetails';

const TutorialsToc: React.FC<TutorialsTocProps> = ({ tutorials, active, navigateTutorial }) => {
    const tutorialsToc = useMemo(
        () =>
            tutorials.map((tutorial, i) => (
                <Paper
                    key={tutorial.title}
                    className={clsx(styles.tileToc, { [styles.tileTocActive]: active === i })}
                    onClick={navigateTutorial(i)}
                    style={{ cursor: 'pointer' }}
                    radius="md"
                    shadow={active === i ? "md" : "xs"}
                    p="sm"
                    mb="5px"
                >
                    <Stack gap={0}>
                        <Text size='xs' fw={active === i ? 600 : 400} lineClamp={1} truncate>
                            {tutorial.title}
                        </Text>
                    </Stack>
                </Paper>
            )),
        [active, tutorials, navigateTutorial]
    );

    return (
        <div className='mt-3'>
            {tutorialsToc}
        </div>
    )
};

export default TutorialsToc;
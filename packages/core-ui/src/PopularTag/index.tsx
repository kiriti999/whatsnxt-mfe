"use client"
import { Button, Title, Box, Flex } from '@mantine/core';
import { IMemoStore } from './interfaces';
import styles from './tags.module.css'

interface Props {
    categoryStore: IMemoStore;
    sidebarStore?: any;
    activeTag?: string | null;
    onClick: (value: string) => void;
}

export default function PopularTag(props: Props) {
    const { categoryStore, activeTag, onClick } = props;

    return (
        <Box className={styles.widgetTagCloud}>
            {categoryStore?.categoryCount?.length > 0 && (
                <Title order={5} className={styles.tagsTitle}>Popular Tags</Title>
            )}
            {categoryStore.categoryCount && categoryStore.categoryCount.length > 0 && (
                <Flex wrap="wrap" gap="xs">
                    {categoryStore.categoryCount.map((item, index) => {
                        if (item.count > 0) {
                            const isActive = activeTag === item.categoryName;
                            return (
                                <Button
                                    size='xs'
                                    key={index}
                                    variant={isActive ? 'filled' : 'light'}
                                    className={isActive ? styles.tagButtonActive : styles.tagButton}
                                    onClick={() => onClick(item.categoryName)}
                                >
                                    {item.categoryName}({item.count})
                                </Button>
                            );
                        }
                        return null;
                    })}
                </Flex>
            )}
        </Box>
    )
}
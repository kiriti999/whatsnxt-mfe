"use client"
import { Button, Title, Box } from '@mantine/core';
import { IMemoStore } from './interfaces';
import './tags.module.css'

interface Props {
    categoryStore: IMemoStore;
    sidebarStore?: any;
    onClick: (value: string) => void;
}

export default function PopularTag(props: Props) {
    const { categoryStore, onClick } = props;

    return (
        <Box className='widget widget_tag_cloud' my={'lg'}>
            {categoryStore?.categoryCount?.length > 0 && <Title order={5} mb={'0.5rem'}>Popular Tags</Title>}
            {categoryStore.categoryCount && categoryStore.categoryCount.length > 0 && (
                <div>
                    {categoryStore.categoryCount.map((item, index) => {
                        if (item.count > 0) {
                            return (
                                <Button size='xs' key={index} mr={5} mb={5}
                                    onClick={() => onClick(item.categoryName)}>
                                    <Title order={6} c="white" className="tag-link"> {item.categoryName} </Title>
                                    <Title order={6} c="white" className="tag-link-count">({item.count})</Title>
                                </Button>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </Box>
    )
}
"use client"
import { Button, Title } from '@mantine/core';
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
        <div className='widget widget_tag_cloud'>
            {categoryStore?.categoryCount?.length > 0 && <Title order={5}>Popular Tags</Title>}
            {categoryStore.categoryCount && categoryStore.categoryCount.length > 0 && (
                <div>
                    {categoryStore.categoryCount.map((item, index) => {
                        if (item.count > 0) {
                            return (
                                <Button size='xs' key={index} mr={5} mb={5}
                                    onClick={() => onClick(item.categoryName)}>
                                    {item.categoryName} <span className="tag-link-count">({item.count})</span>
                                </Button>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    )
}
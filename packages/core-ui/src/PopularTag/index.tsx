"use client"
import { Button } from '@mantine/core';
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
            {categoryStore?.categoryCount?.length > 0 && <h3 className='widget-title'>Popular Tags</h3>}
            {categoryStore.categoryCount && categoryStore.categoryCount.length > 0 && (
                <div>
                    {categoryStore.categoryCount.map((item, index) => {
                        if (item.count > 0) {
                            return (
                                <Button key={index} mr={5} mb={5}
                                    onClick={() => onClick(item.categoryName)}>
                                    {item.categoryName}
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
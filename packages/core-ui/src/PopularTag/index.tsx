"use client"
import { Button } from '@mantine/core';
import { IMemoStore } from './interfaces';
import './tags.module.css'

interface Props {
    memoizedStore: IMemoStore;
    onClick: (value: string) => void;
}

export default function PopularTag(props: Props) {
    const { memoizedStore, onClick } = props;

    return (
        <div className='widget widget_tag_cloud'>
            {memoizedStore.categories.length > 0 && <h3 className='widget-title'>Popular Tags</h3> }
            {memoizedStore.categories && memoizedStore.categories.length > 0 && (
                <div>
                    {memoizedStore.categories.map((item, index) => {
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
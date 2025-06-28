import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateItemListSchema } from '../../utils/structuredData';
import React from 'react';

interface CarouselItem {
    name: string;
    url: string;
    image?: string;
    description?: string;
}

interface CarouselStructuredDataProps {
    items: CarouselItem[];
    listName: string;
    listDescription?: string;
}

export const CarouselStructuredData: FC<CarouselStructuredDataProps> = ({
    items,
    listName,
    listDescription
}) => {
    const schema = generateItemListSchema(items, listName, listDescription);
    return <StructuredData data={schema} />;
};
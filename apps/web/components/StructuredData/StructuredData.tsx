import React from 'react';
import { FC } from 'react';

interface StructuredDataProps {
    data: object;
}

export const StructuredData: FC<StructuredDataProps> = ({ data }) => {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data, null, 2)
            }}
        />
    );
};
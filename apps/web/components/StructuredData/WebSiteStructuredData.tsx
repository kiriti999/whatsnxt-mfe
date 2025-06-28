import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateWebSiteSchema } from '../../utils/structuredData';
import React from 'react';

export const WebSiteStructuredData: FC = () => {
    const schema = generateWebSiteSchema();
    return <StructuredData data={schema} />;
};
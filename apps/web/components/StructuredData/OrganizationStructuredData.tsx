import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateOrganizationSchema } from '../../utils/structuredData';
import React from 'react';

export const OrganizationStructuredData: FC = () => {
    const schema = generateOrganizationSchema();
    return <StructuredData data={schema} />;
};
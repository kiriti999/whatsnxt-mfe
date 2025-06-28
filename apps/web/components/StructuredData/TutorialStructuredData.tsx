import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateTutorialSchema, Tutorial } from '../../utils/structuredData';
import React from 'react';

interface TutorialStructuredDataProps {
    tutorial: Tutorial;
}

export const TutorialStructuredData: FC<TutorialStructuredDataProps> = ({ tutorial }) => {
    const schema = generateTutorialSchema(tutorial);
    return <StructuredData data={schema} />;
};
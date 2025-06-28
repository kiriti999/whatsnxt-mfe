import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateArticleSchema, Article } from '../../utils/structuredData';
import React from 'react';

interface ArticleStructuredDataProps {
    article: Article;
}

export const ArticleStructuredData: FC<ArticleStructuredDataProps> = ({ article }) => {
    const schema = generateArticleSchema(article);
    return <StructuredData data={schema} />;
};

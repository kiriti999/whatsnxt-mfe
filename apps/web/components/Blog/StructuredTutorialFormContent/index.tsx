'use client'
import { CategoryAPI } from '../../../../web/apis/v1';
import { StructuredTutorialAPI } from '../../../apis/v1/structuredTutorialApi';
import { MantineLoader } from '@whatsnxt/core-ui';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import StructuredTutorialForm from '../Form/StructuredTutorialForm';

export function StructuredTutorialFormContent() {
    const params = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [editData, setEditData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const editId = params.get('id');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await CategoryAPI.getCategories();
                setCategories(categories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchTutorial = async () => {
            if (!editId) {
                setLoading(false);
                return;
            }

            try {
                const tutorial = await StructuredTutorialAPI.getById(editId);
                setEditData({
                    id: tutorial._id,
                    title: tutorial.title,
                    categoryId: tutorial.categoryId,
                    categoryName: tutorial.categoryName,
                    subCategory: tutorial.subCategory || '',
                    nestedSubCategory: tutorial.nestedSubCategory || '',
                    pages: tutorial.pages || [],
                    linkedSectionIds: tutorial.linkedSectionIds || [],
                    description: '', // TODO: Add description field if needed
                    imageUrl: tutorial.imageUrl,
                    cloudinaryAssets: tutorial.cloudinaryAssets || [],
                    published: tutorial.published,
                    slug: tutorial.slug,
                    tags: tutorial.tags || [],
                    difficulty: tutorial.difficulty || 'beginner',
                    estimatedDuration: tutorial.estimatedDuration || 0,
                });
            } catch (error) {
                console.error('Failed to fetch structured tutorial:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTutorial();
    }, [editId]);

    if (loading) {
        return <MantineLoader />;
    }

    return (
        <StructuredTutorialForm
            categories={categories}
            edit={editData}
        />
    );
}

export default StructuredTutorialFormContent;

'use client'
import { CategoryAPI, ContentAPI } from '../../../../web/api/v1';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { ContentType } from '../Content/ContentComponent';
import BlogForm from '../Form/BlogForm';

export function BlogFormContent() {
    const params = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [editData, setEditData] = useState<any>(null);
    const [type, setType] = useState<ContentType>('both');
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
        const fetchPost = async () => {
            try {
                const editId = params.get('id');
                if (editId) {
                    const post = await ContentAPI.getPostsById(editId);
                    setEditData(post);
                    setType(post.tutorial ? 'tutorial' : 'blog');
                }
            } catch (error) {
                console.error('Failed to fetch post:', error);
            }
        };

        fetchPost();
    }, [params]);

    useEffect(() => {
        (async () => {
            if (editId) {
                const post = await ContentAPI.getPostsById(editId);
                setEditData(post);
                setType(post.tutorial ? 'tutorial' : 'blog');

                if (post.tutorial) {
                    setEditData({
                        title: post.title,
                        categoryName: post.categoryName,
                        tutorials: post.tutorials,
                    });
                } else {
                    setEditData({
                        title: post.title,
                        categoryName: post.categoryName,
                        description: post.description,
                        subCategory: post.subCategory,
                        nestedSubCategory: post.nestedSubCategory
                    });
                }
            }
        })();
    }, [editId]);

    const blogEdit = useMemo(
        () => (editData ? { id: params.get('id'), ...editData } : null),
        [editData, params]
    );


    return (
        <BlogForm categories={categories} edit={blogEdit} />
    )
}
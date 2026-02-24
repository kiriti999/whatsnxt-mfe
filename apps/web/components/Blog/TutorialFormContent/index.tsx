"use client";
import { MantineLoader } from "@whatsnxt/core-ui";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { CategoryAPI, ContentAPI } from "../../../../web/apis/v1";
import TutorialForm from "../Form/TutorialForm";

export function TutorialFormContent() {
    const params = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [editData, setEditData] = useState<any>(null);

    const editId = params.get("id");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await CategoryAPI.getCategories();
                setCategories(categories);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const editId = params.get("id");
                if (editId) {
                    const post = await ContentAPI.getPostsById(editId);
                    setEditData({
                        title: post.title,
                        categoryId: post.categoryId,
                        categoryName: post.categoryName,
                        subCategory: post.subCategory,
                        nestedSubCategory: post.nestedSubCategory || "", // handle null value
                        tutorials: post.tutorials,
                        description: post.description,
                        lexicalState: post.lexicalState,
                        imageUrl: post.imageUrl,
                        cloudinaryAssets: post.cloudinaryAssets || null,
                        contentFormat: post.contentFormat,
                        listed: post.listed,
                        published: post.published,
                        slug: post.slug,
                        tutorial: post.tutorial,
                        _id: post._id,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch post:", error);
            }
        };

        fetchPost();
    }, [params]);

    useEffect(() => {
        (async () => {
            if (editId) {
                try {
                    const post = await ContentAPI.getPostsById(editId);
                    setEditData({
                        title: post.title,
                        categoryId: post.categoryId,
                        categoryName: post.categoryName,
                        subCategory: post.subCategory,
                        nestedSubCategory: post.nestedSubCategory || "", // handle null value
                        tutorials: post.tutorials,
                        description: post.description,
                        lexicalState: post.lexicalState,
                        imageUrl: post.imageUrl,
                        cloudinaryAssets: post.cloudinaryAssets || null,
                        contentFormat: post.contentFormat,
                        listed: post.listed,
                        published: post.published,
                        slug: post.slug,
                        tutorial: post.tutorial,
                        _id: post._id,
                    });
                } catch (err) {
                    console.error("Failed to fetch post:", err);
                }
            }
        })();
    }, [editId]);

    const tutorialEdit = useMemo(
        () => (editData ? { id: editId, ...editData } : null),
        [editData, editId],
    );

    return (
        <Suspense fallback={<MantineLoader />}>
            <TutorialForm categories={categories} edit={tutorialEdit} />
        </Suspense>
    );
}

export default TutorialFormContent;

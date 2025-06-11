'use client';
import React, { useEffect } from 'react';
import styles from './categories.module.css';
import { BlogCategory } from '../../store/slices/blogCategorySlice';
import { CategoryAPI } from '../../api/v1/blog/analyticsApi';
import { useForm } from 'react-hook-form';
import { EditCategoryFormData } from '@/types/form';

const CategoryEditForm = ({
  category,
  onClose,
}: {
  category: BlogCategory;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditCategoryFormData>();

  useEffect(() => {
    reset({
      categoryName: category.categoryName,
    });
  }, [category]);

  const onSubmit = async (data: EditCategoryFormData) => {
    try {
      await CategoryAPI.editCategory({
        categoryId: category.categoryId,
        categoryName: data.categoryName
      });
      onClose();
    } catch (error) {
      console.log('onEditCategory:: error: ', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles['edit-category-form']}>
          <h2>Edit Category</h2>
          <label className="mt-10">Category name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Category name"
            {...register('categoryName', { required: true })}
          />
          {errors.categoryName && <span>This field is required</span>}

          <button type="submit" className={`${styles['save-button']} mt-10`}>
            Save changes
          </button>
        </div>
      </form>

      <div className={styles.divider} />
    </>
  );
};

export default CategoryEditForm;

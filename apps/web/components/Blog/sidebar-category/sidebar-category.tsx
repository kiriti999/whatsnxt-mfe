import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { getArticleCountByCategory, getCategories } from '../../../store/slices/blogCategorySlice';
import { getPostsByCategory, setSelectTag } from '../../../store/slices/contentSlice';
import React from 'react';
import { PopularTag } from '@whatsnxt/core-ui';

const SidebarPopularTags = React.memo(() => {

  const blogCategoryStore = useSelector((store: RootState) => {
    return store.blogCategory
  })
  const storeSidebar = useSelector((store: RootState) => {
    return store.sidebar
  })
  // Memoize the result of useSelector
  const categoryStore = useMemo(() => blogCategoryStore, [blogCategoryStore]);

  const sidebarStore = useMemo(() => storeSidebar, [storeSidebar]);

  const dispatch = useDispatch<AppDispatch>();

  const handleCategoryClick = (name: string) => {
    dispatch(setSelectTag(name))
    dispatch(getPostsByCategory(name));
  }

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getArticleCountByCategory());

    //reset tag on unload of component
    return (() => { dispatch(setSelectTag(null)) })
  }, [dispatch]);


  return (
    <PopularTag categoryStore={categoryStore} sidebarStore={sidebarStore} onClick={(value: string) => handleCategoryClick(value)} />
  );
});

SidebarPopularTags.displayName = 'SidebarPopularTags';
export default SidebarPopularTags;

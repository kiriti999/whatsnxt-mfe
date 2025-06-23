import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import {
  getArticleCountByCategory,
  getCategories,
  selectIMemoStore,
  IMemoStore
} from '../../../store/slices/blogCategorySlice';
import { getPostsByCategory, setSelectTag } from '../../../store/slices/contentSlice';
import React from 'react';
import { PopularTag } from '@whatsnxt/core-ui';

const SidebarArticleTags = React.memo(() => {
  // Use the selector that returns IMemoStore format
  const categoryStore: IMemoStore = useSelector(selectIMemoStore);

  const sidebarStore = useSelector((store: RootState) => store.sidebar);

  // Memoize the stores
  const memoizedCategoryStore = useMemo(() => categoryStore, [categoryStore]);
  const memoizedSidebarStore = useMemo(() => sidebarStore, [sidebarStore]);

  const dispatch = useDispatch<AppDispatch>();

  const handleCategoryClick = (name: string) => {
    dispatch(setSelectTag(name));
    dispatch(getPostsByCategory(name));
  }

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getArticleCountByCategory());

    // Reset tag on component unmount
    return () => {
      dispatch(setSelectTag(null));
    };
  }, [dispatch]);

  return (
    <PopularTag
      categoryStore={memoizedCategoryStore}
      sidebarStore={memoizedSidebarStore}
      onClick={handleCategoryClick}
    />
  );
});

SidebarArticleTags.displayName = 'SidebarArticleTags';
export default SidebarArticleTags;
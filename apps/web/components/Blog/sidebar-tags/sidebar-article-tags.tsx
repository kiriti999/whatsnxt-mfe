import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import {
  getArticleCountBySubCategory,
  getCategories,
  selectSubCategoryMemoStore,
  IMemoStore
} from '../../../store/slices/blogCategorySlice';
import { getPostsBySubCategory, getPosts, setSelectTag, selectCurrentTag } from '../../../store/slices/contentSlice';
import React from 'react';
import { PopularTag } from '@whatsnxt/core-ui';

const SidebarArticleTags = React.memo(() => {
  // Use memoized selector that maps subcategory data into PopularTag's expected shape
  const subCategoryStore: IMemoStore = useSelector(selectSubCategoryMemoStore);
  const currentTag = useSelector(selectCurrentTag);

  const sidebarStore = useSelector((store: RootState) => store.sidebar);

  // Memoize the stores
  const memoizedSubCategoryStore = useMemo(() => subCategoryStore, [subCategoryStore]);
  const memoizedSidebarStore = useMemo(() => sidebarStore, [sidebarStore]);

  const dispatch = useDispatch<AppDispatch>();

  const handleSubCategoryClick = (name: string) => {
    if (currentTag === name) {
      // Re-clicking the same tag → reset filter
      dispatch(setSelectTag(null));
    } else {
      // Clicking a new tag → filter by subcategory
      dispatch(setSelectTag(name));
      dispatch(getPostsBySubCategory(name));
    }
  }

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getArticleCountBySubCategory());

    // Reset tag on component unmount
    return () => {
      dispatch(setSelectTag(null));
    };
  }, [dispatch]);

  return (
    <PopularTag
      categoryStore={memoizedSubCategoryStore}
      sidebarStore={memoizedSidebarStore}
      activeTag={currentTag}
      onClick={handleSubCategoryClick}
    />
  );
});

SidebarArticleTags.displayName = 'SidebarArticleTags';
export default SidebarArticleTags;
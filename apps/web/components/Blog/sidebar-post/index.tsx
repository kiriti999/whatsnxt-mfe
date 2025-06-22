import { useEffect, memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { getPopular } from '../../../store/slices/blogSidebarSlice';
import { PopularPost } from '@whatsnxt/core-ui';
import { Title } from '@mantine/core';

const SidebarPost = memo(() => {
  const store = useSelector((store: RootState) => {
    return store.sidebar
  })
  const memoizedStore = useMemo(() => store, [store]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getPopular());
  }, [dispatch]);

  // Check if there is at least one listed item
  const hasListedItem = memoizedStore.articles.some(item => item.listed);

  return (
    <div>
      {hasListedItem && <Title order={4} mb={'sm'}>Popular posts</Title>}
      {memoizedStore.articles.map((item, index) => (
        item.listed && (
          <PopularPost
            key={index}
            title={item.title}
            imageUrl={item.imageUrl}
            updatedAt={item.updatedAt ?? new Date().toDateString()}
            categoryName={item.categoryName}
            slug={`/content/${item.slug}`}
          />
        )
      ))}
    </div>
  );
});

SidebarPost.displayName = 'SidebarPost'; // Add display name here

export default SidebarPost;

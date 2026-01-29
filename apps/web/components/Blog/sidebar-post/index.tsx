import { useEffect, memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { PopularPost } from '@whatsnxt/core-ui';
import { Title } from '@mantine/core';

const SidebarPost = memo(() => {
  const store = useSelector((store: RootState) => {
    return store.sidebar
  })
  const memoizedStore = useMemo(() => store, [store]) as any;

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    import('../../../store/slices/blogSidebarSlice').then(({ getPopular }) => {
      dispatch(getPopular());
    }).catch(console.error);
  }, [dispatch]);

  // Check if there is at least one listed item
  const hasListedItem = memoizedStore.articles.some(item => item.listed);

  return (
    <div>
      {hasListedItem && <Title order={5} mb={'sm'}>Popular posts</Title>}
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

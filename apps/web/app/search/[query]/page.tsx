import Search from './Search';
import { Suspense } from 'react';

async function page(props: any) {
  const params = await props.params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Search query={params.query} />
    </Suspense>
  );
}

export default page;

// Mark as fully dynamic - opt out of any caching
export const dynamic = 'force-dynamic';
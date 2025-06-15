import React, { Suspense } from 'react';
import { BlogFormContent } from '../../../components/Blog/BlogFormContent';
import { MantineLoader } from '@whatsnxt/core-ui';

export default function Form() {
  return (
    <Suspense fallback={<MantineLoader />}>
      <BlogFormContent />
    </Suspense>
  );
}

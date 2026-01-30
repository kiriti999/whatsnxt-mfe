import React, { Suspense } from 'react';
import StructuredTutorialFormContent from '../../../components/Blog/StructuredTutorialFormContent';
import { MantineLoader } from '@whatsnxt/core-ui';

export default function StructuredTutorialForm() {
  return (
    <Suspense fallback={<MantineLoader />}>
      <StructuredTutorialFormContent />
    </Suspense>
  );
}

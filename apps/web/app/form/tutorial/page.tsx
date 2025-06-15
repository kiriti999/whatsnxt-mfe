import React, { Suspense } from 'react';
import TutorialFormContent from '../../../components/Blog/TutorialFormContent';
import { MantineLoader } from '@whatsnxt/core-ui';

export default function Form() {
  return (
    <Suspense fallback={<MantineLoader />}>
      <TutorialFormContent />
    </Suspense>
  );
}
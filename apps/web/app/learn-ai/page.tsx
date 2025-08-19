import React, { Suspense } from 'react';

import { MantineLoader } from '@whatsnxt/core-ui';
import LearnAI from '../../components/LearnAI/LearnAI';

export default function LearnAiPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <LearnAI />
        </Suspense>
    );
}

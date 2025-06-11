import React, { Suspense } from 'react';
import LinkedInCallback from '../../../components/Blog/ShareButtons/LinkedCallback';
import { MantineLoader } from '@whatsnxt/core-ui';

export default function LinkedInCallbackPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <LinkedInCallback />
        </Suspense>

    );
}

import React, { Suspense } from 'react';
import LinkedInCallback from '@whatsnxt/core-ui/src/ShareOptions/LinkedCallback';
import { MantineLoader } from '@whatsnxt/core-ui';

export default function LinkedInCallbackPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <LinkedInCallback />
        </Suspense>

    );
}

import React, { Suspense } from 'react';
import Notifications from '../../components/Notifications';
import { MantineLoader } from '@whatsnxt/core-ui';

const Page = () => {
    return (
        <Suspense fallback={<MantineLoader />}>
            <Notifications />
        </Suspense>
    );
};

export default Page;


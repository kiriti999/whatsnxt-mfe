'use client';

import dynamic from 'next/dynamic';
import { MantineLoader } from '@whatsnxt/core-ui';

const Notifications = dynamic(() => import('../../components/Notifications'), {
    loading: () => <MantineLoader />,
    ssr: false, // only if you want it client-only
});

const Page = () => {
    return <Notifications />;
};

export default Page;

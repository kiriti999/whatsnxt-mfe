'use client';

import dynamic from 'next/dynamic';
import { MantineLoader } from '@whatsnxt/core-ui';

const ConsultingPage = dynamic(() => import('../../components/Consulting'), {
    ssr: false,
    loading: () => <MantineLoader />,
});

export default function Page() {
    return <ConsultingPage />;
}

import { Suspense } from 'react';
import { MantineLoader } from '@whatsnxt/core-ui';
import { AutoCreateForm } from '../../../components/AutoCreateContent/AutoCreateForm';

export default function AutoCreateContentPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <AutoCreateForm />
        </Suspense>
    );
}

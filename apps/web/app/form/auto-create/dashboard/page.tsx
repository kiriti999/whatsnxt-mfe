import { Suspense } from 'react';
import { MantineLoader } from '@whatsnxt/core-ui';
import { ContentPlanDashboard } from '../../../../components/AutoCreateContent/ContentPlanDashboard';

export default function ContentPlanDashboardPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <ContentPlanDashboard />
        </Suspense>
    );
}

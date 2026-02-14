import { Suspense } from 'react';
import { MantineLoader } from '@whatsnxt/core-ui';
import { DiagramGallery } from '../../../components/Visualizer/DiagramGallery';

export default function DiagramsPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <DiagramGallery />
        </Suspense>
    );
}

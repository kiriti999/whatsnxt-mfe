import { Suspense } from 'react';
import { MantineLoader } from '@whatsnxt/core-ui';
import { VisualizerBuilder } from '../../../components/Visualizer/VisualizerBuilder';

export default function VisualizerPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <VisualizerBuilder />
        </Suspense>
    );
}

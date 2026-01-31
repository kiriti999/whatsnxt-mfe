import { Suspense } from 'react';
import { MantineLoader } from '@whatsnxt/core-ui';
import { StructuredTutorialEditor } from '../../../components/StructuredTutorial/Editor';

export default function StructuredTutorialFormPage() {
    return (
        <Suspense fallback={<MantineLoader />}>
            <StructuredTutorialEditor />
        </Suspense>
    );
}

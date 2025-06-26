import React, { Suspense, lazy } from 'react';

const AuthenticationForm = lazy(() =>
    import('../../components/AuthenticationForm').then(mod => ({ default: mod.AuthenticationForm }))
);

const Authentication = () => {
    return (
        <div className="container d-flex flex-column align-items-center pb-100">
            <Suspense fallback={<div>Loading...</div>}>
                <AuthenticationForm />
            </Suspense>
        </div>
    );
};

export default Authentication;
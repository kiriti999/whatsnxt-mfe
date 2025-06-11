import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
    import('../../components/PurchaseHistory/PurchaseHistory').then((component) => component)
)

const PurchaseHistory = () => (
        <DynamicComponent />
)

export default PurchaseHistory;

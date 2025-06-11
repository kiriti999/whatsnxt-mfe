import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
  import('../../components/RefundPolicy/refund').then((component) => component)
)

const RefundPolicy = () => (
  <>
    <DynamicComponent />
  </>
)

export default RefundPolicy;

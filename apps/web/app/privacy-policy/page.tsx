import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
  import('../../components/PrivacyPolicy/privacy').then((component) => component)
)

const PrivacyPolicy = () => (
  <>
    <DynamicComponent />
  </>
)

export default PrivacyPolicy;

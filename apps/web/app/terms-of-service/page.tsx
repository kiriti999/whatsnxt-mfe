import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
  import('../../components/TermsOfService/terms-of-service').then((component) => component)
)

const TermsOfService = () => (
  <>
    <DynamicComponent />
  </>
)

export default TermsOfService;

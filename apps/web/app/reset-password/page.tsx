import React from 'react';
import dynamic from 'next/dynamic';

const DynamicResetComponent = dynamic(() =>
  import('../../components/ResetPassword').then((resetComponent) => resetComponent)
)

const ResetPassword = () => (
  <>
    <DynamicResetComponent />
  </>
)

export default ResetPassword;

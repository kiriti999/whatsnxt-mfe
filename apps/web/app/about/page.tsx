import React from 'react';
import dynamic from 'next/dynamic';

const DynamicAboutComponent = dynamic(() =>
  import('../../components/About/AboutUs').then((aboutComponent) => aboutComponent)
)

const Page = () => (
  <>
    <DynamicAboutComponent />
  </>
)

export default Page;


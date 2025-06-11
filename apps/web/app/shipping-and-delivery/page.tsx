import React from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() =>
  import('../../components/ShippingDelivery/shipping-delivery').then((component) => component)
)

const ShippingDelivery = () => (
  <>
    <DynamicComponent />
  </>
)

export default ShippingDelivery;

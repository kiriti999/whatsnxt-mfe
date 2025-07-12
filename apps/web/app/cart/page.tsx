// import React from 'react';
// import { ShoppingCart } from '../../components/ShoppingCart';

// const Page = () => {
//     return (
//         <ShoppingCart />
//     );
// };

// export default Page;

'use client';

import dynamic from 'next/dynamic';
import { MantineLoader } from '@whatsnxt/core-ui';

// Import named export ShoppingCart
const ShoppingCart = dynamic(
    () => import('../../components/ShoppingCart').then((mod) => mod.ShoppingCart),
    {
        ssr: false,
        loading: () => <MantineLoader />,
    }
);

export default function Page() {
    return <ShoppingCart />;
}


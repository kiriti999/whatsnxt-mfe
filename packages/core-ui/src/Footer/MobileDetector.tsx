// MobileDetector.js
"use client"; // Mark this component as client-side

import { useMediaQuery } from '@mantine/hooks';

export const MobileDetector = ({ children }: any) => {
    const isMobile = useMediaQuery('(max-width: 767px)');

    if (typeof window === "undefined") {
        // Return null on the server to avoid mismatches during SSR
        return null;
    }

    return children(isMobile);
};

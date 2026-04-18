"use client"

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavbarDesktop } from './Desktop';
import { NavbarMobile } from './Mobile';
import useAuth from '../../hooks/Authentication/useAuth';
import { IconUserHeart } from '@tabler/icons-react';

// Import RTK selector
import { selectCartItems } from '../../store/slices/cartSlice'; // Adjust path as needed

type LinkType = {
    url: string;
    title: string;
    linkType: string;
    icon?: any;
};

type headerProps = {
    links: LinkType[];
    loginMenuLinks: LinkType[];
    copyRight: string,
}

const Navbar = ({ loginMenuLinks, links }: headerProps) => {
    const { user: authUser } = useAuth();

    // Use RTK selector
    const cartItems = useSelector(selectCartItems);
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

    // Create a new array with admin link if user is admin, without mutating the original
    const enhancedLoginMenuLinks = useMemo(() => {
        if (authUser?.role === 'admin') {
            const adminLink = {
                title: 'Admin view',
                url: `${process.env.NEXT_PUBLIC_MFE_HOST}/admin/course-review-request`,
                linkType: '_self',
                icon: IconUserHeart
            };

            // Check if admin link already exists to prevent duplicates
            const hasAdminLink = loginMenuLinks.some(link => link.title === 'Admin view');
            if (!hasAdminLink) {
                return [adminLink, ...loginMenuLinks];
            }
        }
        return loginMenuLinks;
    }, [authUser?.role, loginMenuLinks]);

    return (
        <Box>
            <NavbarDesktop
                links={links}
                cartItems={cartItems}
                loginMenuLinks={enhancedLoginMenuLinks}
                drawerOpened={drawerOpened}
                toggleDrawer={toggleDrawer}
            />

            <NavbarMobile
                links={links}
                cartItems={cartItems}
                loginMenuLinks={enhancedLoginMenuLinks}
                drawerOpened={drawerOpened}
                closeDrawer={closeDrawer}
            />
        </Box>
    );
}

export default Navbar
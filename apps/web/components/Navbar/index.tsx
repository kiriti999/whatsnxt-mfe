"use client"

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NavbarDesktop } from './Desktop';
import { NavbarMobile } from './Mobile';
import useAuth from '../../hooks/Authentication/useAuth';
import process from 'process';
import { IconUserHeart } from '@tabler/icons-react';

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
    user: {
        name: string
        role: string
    }
}

const Navbar = ({ loginMenuLinks, links }: headerProps) => {
    const { user: authUser } = useAuth();
    const cartItems = useSelector((state: any) => state.cart.cartItems);
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

    useEffect(() => {
        if (authUser?.role === 'admin') {
            loginMenuLinks.unshift({ title: 'Admin view', url: `${process.env.NEXT_PUBLIC_MFE_HOST}/admin/course-review-request`, linkType: '_self', icon: IconUserHeart })
        }
    }, [authUser?.role])

    return (
        <Box>
            <NavbarDesktop user={authUser} links={links} cartItems={cartItems}
                loginMenuLinks={loginMenuLinks} drawerOpened={drawerOpened}
                toggleDrawer={toggleDrawer} />

            <NavbarMobile user={authUser} links={links} cartItems={cartItems}
                loginMenuLinks={loginMenuLinks} drawerOpened={drawerOpened}
                closeDrawer={closeDrawer} />
        </Box>
    );
}

export default Navbar
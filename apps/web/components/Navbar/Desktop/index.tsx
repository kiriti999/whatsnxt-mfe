import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Cart, Logo } from '@whatsnxt/core-ui';
import { useMediaQuery } from '@mantine/hooks';
import { Button, rem, Burger, Space, Anchor, Box, Tooltip, Menu } from '@mantine/core';
import { IconLogin, IconLogout, IconSearch, IconX } from '@tabler/icons-react';
import type { Link as NavLink, User } from '../types';
import { NavbarNotification } from '../NavbarNotification/index';
import Search from '../../Search';
import useAuth from '../../../hooks/Authentication/useAuth';
import { CacheAPI } from '../../../api/v1/redis/index';
import classes from '../Navbar.module.css';
import { notifications } from '@mantine/notifications';

interface INavbarDesktop {
  links: NavLink[];
  cartItems: any[];
  user: User;
  loginMenuLinks: any[];
  drawerOpened: any;
  toggleDrawer: any;
}

export const NavbarDesktop = ({ links, cartItems, loginMenuLinks, drawerOpened, toggleDrawer, user }: INavbarDesktop) => {
  const [isSearch, setIsSearch] = useState(false);
  const { logout: handleLogout, user: userInfoData, loading, isAuthenticated } = useAuth();
  const [usernameLabel, setUsernameLabel] = useState<string | null>(null);
  const isAdmin = user && user.role === 'admin';
  const isTrainer = user && user.role === 'trainer';
  const isXL = useMediaQuery("(min-width: 1200px)");

  // Add new media queries for iPad Pro resolutions
  const isLargerThanIpadPro = useMediaQuery("(min-width: 1367px)");

  const dispatch = useDispatch();

  // Update usernameLabel whenever userInfoData changes
  useEffect(() => {
    if (userInfoData?.name) {
      const usernameInitials = userInfoData.name.split(' ').map(n => n.charAt(0).toUpperCase());
      setUsernameLabel(
        usernameInitials.length > 1 ? `${usernameInitials[0]}${usernameInitials[1]}` : usernameInitials[0]
      );
    }
  }, [userInfoData]);

  function logout(e: any) {
    e.preventDefault();
    dispatch({ type: 'UPDATE_USER_INFO', data: null });
    dispatch({ type: 'UPDATE_CART', data: { cartItems: [], discount: 0 } });
    localStorage.removeItem('cart');
    handleLogout();
  }

  async function clearCache() {
    try {
      await CacheAPI.invalidate();
      notifications.show({
        position: 'bottom-left',
        color: 'red',
        title: 'Cache invalidation success!',
        message: 'Complete cache has been cleared',
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-left',
        color: 'red',
        title: 'Cache invalidation failed!',
        message: error,
      });
    }
  }

  // Check if we should use desktop or mobile layout
  const shouldUseDesktopLayout = isLargerThanIpadPro;

  return (
    <header className={classes.header}>
      {shouldUseDesktopLayout ? (
        // Desktop view for screens larger than iPad Pro (>1366px)
        <Box
          h={"100%"}
          style={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}
          display={"flex"}
          px={isXL ? 0 : 20}
        >
          <Box style={{ alignItems: "center", flex: 1, minWidth: 0 }} display={"flex"} h="100%">
            <Logo />
            <Space w={'xl'} />
            <Box style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {links.map((link, index) => (
                <Anchor
                  href={link.url}
                  component={Link}
                  className={classes.link}
                  key={index}
                  target={link.linkType}
                  style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {link.title}
                </Anchor>
              ))}
            </Box>
            <Box style={{ width: "43%", minWidth: 200 }}><Search /></Box>
          </Box>

          <Space w="md" />
          <Box style={{ alignItems: "center" }} h="100%" display={"flex"}>
            <Anchor href='/search-trainers' className={classes.link} component={Link}>
              Search Trainer
            </Anchor>
            {(!isAdmin && !isTrainer) && (
              <Anchor href='/become-a-trainer' component={Link} className={classes.link}>
                Become a trainer
              </Anchor>
            )}
            {(isAdmin || isTrainer) && (
              <Anchor href='/trainer/courses' component={Link} className={classes.link}>
                Dashboard
              </Anchor>
            )}

            <Space w="md" />
            <Cart cartItems={cartItems} />
            <Space w="xl" />
            {isAuthenticated && <NavbarNotification user={user} />}
            <Space w="xl" />

            {isAuthenticated ? (
              <Menu shadow="md" width={200} trigger="click-hover" openDelay={100} closeDelay={400}>
                <Menu.Target>
                  <Button c='white' loading={loading} variant='filled'>{usernameLabel}</Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {loginMenuLinks.map((link, index) =>
                    link.title === 'Profile' && link.children ? (
                      <Menu.Item key={index}>
                        <Tooltip
                          label={userInfoData?.email}
                          position="left"
                          transitionProps={{ transition: 'scale-x', duration: 300 }}
                        >
                          <Menu.Label>{link.title}</Menu.Label>
                        </Tooltip>
                        {link.children.map((child, childIndex) => (
                          <Menu.Item
                            key={`profile-${childIndex}`}
                            component="a"
                            href={child.url}
                            leftSection={<child.icon style={{ width: rem(14), height: rem(14) }} />}
                          >
                            {child.title}
                          </Menu.Item>
                        ))}
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        key={index}
                        component="a"
                        href={link.url}
                        leftSection={<link.icon style={{ width: rem(14), height: rem(14) }} />}
                      >
                        <Menu shadow="md" width={200} trigger="click-hover" openDelay={100} closeDelay={400}>
                          <Menu.Target>
                            <span>{link.title}</span>
                          </Menu.Target>
                        </Menu>
                      </Menu.Item>
                    )
                  )}

                  {isAdmin && (
                    <Menu.Item>
                      <Button size='xs' onClick={clearCache}>Clear all cache</Button>
                    </Menu.Item>
                  )}

                  <Menu.Divider />

                  <Menu.Item
                    onClick={logout}
                    color="red"
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button loading={loading} variant='filled' size={'sm'} component={Link} href="/authentication" c='white'
                leftSection={<IconLogin style={{ width: rem(14), height: rem(14) }} />}>
                Login
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        // Mobile view (including iPad Pro resolutions)
        <Box h={"100%"}>
          {isSearch ? (
            <Box h={"100%"} style={{ alignItems: "center", justifyContent: "space-between" }} display={"flex"}>
              <Box mr={2} style={{ width: "100%" }}><Search /></Box>
              <IconX onClick={() => setIsSearch(prev => !prev)} size={30} style={{ marginLeft: "1rem" }} />
            </Box>
          ) : (
            <Box h={"100%"} style={{ alignItems: "center" }} display={"flex"}>
              <Box style={{ position: "absolute", left: "1rem" }}>
                <Burger opened={drawerOpened} onClick={toggleDrawer} size={'1.3rem'} />
              </Box>
              <Box style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Logo />
              </Box>
              <Box style={{ position: "absolute", right: "1rem", display: "flex", alignItems: "center" }}>
                <Cart cartItems={cartItems} />
                <Space w="lg" />
                <IconSearch onClick={() => setIsSearch(prev => !prev)} />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </header>
  );
};
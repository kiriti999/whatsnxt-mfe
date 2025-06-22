import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Cart, Logo } from '@whatsnxt/core-ui';
import { useMediaQuery } from '@mantine/hooks';
import { Button, rem, Burger, Space, Anchor, Box, Menu } from '@mantine/core';
import { IconLogin, IconLogout, IconSearch, IconX } from '@tabler/icons-react';
import type { Link as NavLink } from '../types';
import { NavbarNotification } from '../NavbarNotification/index';
import Search from '../../Search';
import useAuth from '../../../hooks/Authentication/useAuth';
import { CacheAPI } from '../../../apis/v1/redis/index';
import classes from '../Navbar.module.css';
import { notifications } from '@mantine/notifications';
import { resetCart } from '../../../store/slices/cartSlice';

interface INavbarDesktop {
  links: NavLink[];
  cartItems: any[];
  loginMenuLinks: any[];
  drawerOpened: any;
  toggleDrawer: any;
}

export const NavbarDesktop = ({ links, cartItems, loginMenuLinks, drawerOpened, toggleDrawer }: INavbarDesktop) => {
  const [isSearch, setIsSearch] = useState(false);
  const { logout: handleLogout, user, loading, isAuthenticated } = useAuth();
  const [usernameLabel, setUsernameLabel] = useState<string | null>(null);

  // Simplified role checks - now using user directly
  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';

  const isXL = useMediaQuery("(min-width: 1200px)");
  const isLargerThanIpadPro = useMediaQuery("(min-width: 1367px)");
  const dispatch = useDispatch();

  // Update usernameLabel whenever user changes
  useEffect(() => {
    if (user?.name) {
      const usernameInitials = user.name.split(' ').map(n => n.charAt(0).toUpperCase());
      setUsernameLabel(
        usernameInitials.length > 1 ? `${usernameInitials[0]}${usernameInitials[1]}` : usernameInitials[0]
      );
    } else {
      setUsernameLabel(null);
    }
  }, [user]);

  function logout(e: any) {
    e.preventDefault();

    // Clear Redux state
    dispatch({ type: 'LOGOUT' });
    dispatch(resetCart());

    // Call the auth logout which handles cookies and navigation
    handleLogout();
  }

  async function clearCache() {
    try {
      await CacheAPI.invalidate();
      notifications.show({
        position: 'bottom-right',
        color: 'green',
        title: 'Cache invalidation success!',
        message: 'Complete cache has been cleared',
      });
    } catch (error: any) {
      notifications.show({
        position: 'bottom-right',
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

          <Space w="md" mr={'xl'} />
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
            {(isAdmin || isTrainer) && (
              <Anchor href='/form' component={Link} className={classes.link}>
                Write
              </Anchor>
            )}

            <Space w="md" />
            <Cart cartItems={cartItems} />
            <Space w="xl" />
            {isAuthenticated && user && <NavbarNotification user={user} />}
            <Space w="xl" />

            {isAuthenticated ? (
              <Menu shadow="md" width={250} position="bottom-end" trigger="click-hover" openDelay={100} closeDelay={400} withArrow arrowPosition="center">
                <Menu.Target>
                  <Button c='white' loading={loading} variant='filled'>{usernameLabel}</Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {loginMenuLinks.map((link, index) => {
                    // Handle Profile with Menu.Sub for proper submenu
                    if (link.title === 'Profile' && link.children) {
                      return (
                        <Menu.Sub key={index}>
                          <Menu.Sub.Target>
                            <Menu.Sub.Item>
                              {link.title}
                            </Menu.Sub.Item>
                          </Menu.Sub.Target>
                          <Menu.Sub.Dropdown>
                            {link.children.map((child, childIndex) => {
                              const ChildIcon = child.icon;
                              return (
                                <Menu.Item
                                  key={`profile-${childIndex}`}
                                  component="a"
                                  href={child.url}
                                  leftSection={ChildIcon ? <ChildIcon style={{ width: rem(14), height: rem(14) }} /> : null}
                                >
                                  {child.title}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Sub.Dropdown>
                        </Menu.Sub>
                      );
                    }

                    // Handle Blog with Menu.Sub for proper submenu
                    if (link.title === 'Article' && link.children) {
                      return (
                        <Menu.Sub key={index}>
                          <Menu.Sub.Target>
                            <Menu.Sub.Item>
                              {link.title}
                            </Menu.Sub.Item>
                          </Menu.Sub.Target>
                          <Menu.Sub.Dropdown>
                            {link.children.map((child, childIndex) => {
                              const ChildIcon = child.icon;
                              return (
                                <Menu.Item
                                  key={`blog-${childIndex}`}
                                  component="a"
                                  href={child.url}
                                  leftSection={ChildIcon ? <ChildIcon style={{ width: rem(14), height: rem(14) }} /> : null}
                                >
                                  {child.title}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Sub.Dropdown>
                        </Menu.Sub>
                      );
                    }

                    // Handle regular menu items
                    const LinkIcon = link.icon;
                    return (
                      <Menu.Item
                        key={index}
                        component="a"
                        href={link.url}
                        leftSection={LinkIcon ? <LinkIcon style={{ width: rem(14), height: rem(14) }} /> : null}
                      >
                        {link.title}
                      </Menu.Item>
                    );
                  })}

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
              <Button
                loading={loading}
                variant='filled'
                size={'sm'}
                component={Link}
                href="/authentication"
                c='white'
                leftSection={<IconLogin style={{ width: rem(14), height: rem(14) }} />}
              >
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
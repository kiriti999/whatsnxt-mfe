import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { Cart, Logo, MobileLogo } from '@whatsnxt/core-ui';
import { useMediaQuery } from '@mantine/hooks';
import { Button, rem, Space, Anchor, Box, Menu, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconLogin, IconLogout, IconSearch, IconX, IconSun, IconMoon, IconMenu2 } from '@tabler/icons-react';
import type { Link as NavLink } from '../types';
import { NavbarNotification } from '../NavbarNotification/index';
import Search from '../../Search';
import useAuth from '../../../hooks/Authentication/useAuth';
import { CacheAPI } from '../../../apis/v1/redis/index';
import classes from '../Navbar.module.css';
import { notifications } from '@mantine/notifications';
import { resetCart } from '../../../store/slices/cartSlice';
import { logout } from '../../../store/slices/userSlice';

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

  function appLogout(e: any) {
    e.preventDefault();

    // Clear Redux state
    dispatch(logout());
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

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <Box style={{ display: "flex", flex: 1 }}>
              {links.map((link, index) => (
                <Anchor
                  href={link.url}
                  component={Link}
                  className={classes.link}
                  key={index}
                  target={link.linkType}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {link.title}
                </Anchor>
              ))}
            </Box>
            <Space w={'xl'} />
            <Box style={{ width: "35%", minWidth: 200 }}><Search /></Box>
          </Box>

          <Space w="md" mr={'xl'} />
          <Box style={{ alignItems: "center" }} h="100%" display={"flex"}>
            <ActionIcon
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              variant="transparent"
              size="sm"
              aria-label="Toggle color scheme"
              mr="md"
            >
              {mounted && computedColorScheme === 'dark' ? (
                <IconSun />
              ) : (
                <IconMoon />
              )}
            </ActionIcon>
            <Anchor href='/labs' className={classes.link} component={Link}>
              Labs
            </Anchor>
            <Anchor href='/consulting' className={classes.link} component={Link}>
              Consulting
            </Anchor>
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
              <Menu
                shadow="lg"
                width={280}
                position="bottom-end"
                trigger="click-hover"
                openDelay={100}
                closeDelay={400}
                withArrow
                arrowPosition="center"
                styles={{
                  dropdown: {
                    padding: '0.5rem',
                    borderRadius: 'var(--mantine-radius-md)',
                    border: '1px solid var(--mantine-color-gray-2)'
                  },
                  arrow: {
                    borderColor: 'var(--mantine-color-gray-2)'
                  }
                }}
              >
                <Menu.Target>
                  <Button
                    loading={loading}
                    variant='gradient'
                    gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                    size="md"
                    radius="xl"
                    styles={{
                      root: {
                        fontWeight: 700,
                        fontSize: '1rem',
                        minWidth: 50,
                        height: 42,
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                        }
                      }
                    }}
                  >
                    {usernameLabel}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {/* User Info Header */}
                  <Box
                    p="sm"
                    mb="xs"
                    style={{
                      background: 'linear-gradient(135deg, var(--mantine-color-indigo-0) 0%, var(--mantine-color-cyan-0) 100%)',
                      borderRadius: 'var(--mantine-radius-sm)',
                      borderBottom: '2px solid var(--mantine-color-indigo-2)'
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Box
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-cyan-5))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                        }}
                      >
                        {usernameLabel}
                      </Box>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--mantine-color-dark-7)', lineHeight: 1.3 }}>
                          {user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mantine-color-dimmed)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </div>
                      </div>
                    </Box>
                  </Box>

                  {loginMenuLinks.map((link, index) => {
                    // Handle Profile with Menu.Sub for proper submenu
                    if (link.title === 'Profile' && link.children) {
                      return (
                        <Menu key={index} trigger="hover" openDelay={100} closeDelay={200}>
                          <Menu.Target>
                            <Menu.Item
                              leftSection={link.icon ? <link.icon style={{ width: rem(16), height: rem(16) }} /> : null}
                              rightSection={<span style={{ fontSize: '0.7rem' }}>›</span>}
                              styles={{
                                item: {
                                  borderRadius: 'var(--mantine-radius-sm)',
                                  fontSize: '0.9rem',
                                  padding: '0.6rem 0.75rem'
                                }
                              }}
                            >
                              {link.title}
                            </Menu.Item>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {link.children.map((child, childIndex) => {
                              const ChildIcon = child.icon;
                              return (
                                <Menu.Item
                                  key={`profile-${childIndex}`}
                                  component="a"
                                  href={child.url}
                                  leftSection={ChildIcon ? <ChildIcon style={{ width: rem(14), height: rem(14) }} /> : null}
                                  styles={{
                                    item: {
                                      borderRadius: 'var(--mantine-radius-sm)',
                                      fontSize: '0.85rem',
                                      padding: '0.5rem 0.75rem'
                                    }
                                  }}
                                >
                                  {child.title}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Dropdown>
                        </Menu>
                      );
                    }

                    // Handle Article with Menu.Sub for proper submenu
                    if (link.title === 'Article' && link.children) {
                      return (
                        <Menu key={index} trigger="hover" openDelay={100} closeDelay={200}>
                          <Menu.Target>
                            <Menu.Item
                              leftSection={link.icon ? <link.icon style={{ width: rem(16), height: rem(16) }} /> : null}
                              rightSection={<span style={{ fontSize: '0.7rem' }}>›</span>}
                              styles={{
                                item: {
                                  borderRadius: 'var(--mantine-radius-sm)',
                                  fontSize: '0.9rem',
                                  padding: '0.6rem 0.75rem'
                                }
                              }}
                            >
                              {link.title}
                            </Menu.Item>
                          </Menu.Target>
                          <Menu.Dropdown>
                            {link.children.map((child, childIndex) => {
                              const ChildIcon = child.icon;
                              return (
                                <Menu.Item
                                  key={`blog-${childIndex}`}
                                  component="a"
                                  href={child.url}
                                  leftSection={ChildIcon ? <ChildIcon style={{ width: rem(14), height: rem(14) }} /> : null}
                                  styles={{
                                    item: {
                                      borderRadius: 'var(--mantine-radius-sm)',
                                      fontSize: '0.85rem',
                                      padding: '0.5rem 0.75rem'
                                    }
                                  }}
                                >
                                  {child.title}
                                </Menu.Item>
                              );
                            })}
                          </Menu.Dropdown>
                        </Menu>
                      );
                    }

                    // Handle regular menu items
                    const LinkIcon = link.icon;
                    return (
                      <Menu.Item
                        key={index}
                        component="a"
                        href={link.url}
                        leftSection={LinkIcon ? <LinkIcon style={{ width: rem(16), height: rem(16) }} /> : null}
                        styles={{
                          item: {
                            borderRadius: 'var(--mantine-radius-sm)',
                            fontSize: '0.9rem',
                            padding: '0.6rem 0.75rem',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-indigo-0)',
                              transform: 'translateX(4px)'
                            }
                          }
                        }}
                      >
                        {link.title}
                      </Menu.Item>
                    );
                  })}

                  {isAdmin && (
                    <Menu.Item
                      styles={{
                        item: {
                          padding: '0.5rem 0.75rem'
                        }
                      }}
                    >
                      <Button
                        size='xs'
                        onClick={clearCache}
                        variant="light"
                        color="red"
                        fullWidth
                        radius="sm"
                      >
                        Clear all cache
                      </Button>
                    </Menu.Item>
                  )}

                  <Menu.Divider my="xs" />

                  <Menu.Item
                    onClick={appLogout}
                    color="red"
                    leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />}
                    styles={{
                      item: {
                        borderRadius: 'var(--mantine-radius-sm)',
                        fontSize: '0.9rem',
                        padding: '0.6rem 0.75rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, rgba(250, 82, 82, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(250, 82, 82, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'
                        }
                      }
                    }}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Button
                loading={loading}
                variant='gradient'
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                size='md'
                component={Link}
                href="/authentication"
                radius="xl"
                leftSection={<IconLogin style={{ width: rem(16), height: rem(16) }} />}
                styles={{
                  root: {
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                    }
                  }
                }}
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
              <Box style={{ position: "absolute", left: "1rem", display: "flex", alignItems: "center" }}>
                <ActionIcon onClick={toggleDrawer} variant="transparent" size="md" c="var(--mantine-color-text)">
                  <IconMenu2 style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
                </ActionIcon>
                <Space w="xs" />
                <ActionIcon
                  onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                  variant="transparent"
                  size="md"
                  aria-label="Toggle color scheme"
                  c="dimmed"
                >
                  {mounted && computedColorScheme === 'dark' ? (
                    <IconSun style={{ width: rem(20), height: rem(20) }} />
                  ) : (
                    <IconMoon style={{ width: rem(20), height: rem(20) }} />
                  )}
                </ActionIcon>
              </Box>
              <Box style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <MobileLogo />
              </Box>
              <Box style={{ position: "absolute", right: "1rem", display: "flex", alignItems: "center" }}>
                <Cart cartItems={cartItems} iconSize={20} buttonSize="md" />
                <Space w="xs" />
                <ActionIcon
                  onClick={() => setIsSearch(prev => !prev)}
                  variant="transparent"
                  size="md"
                  aria-label="Search"
                  c="dimmed"
                >
                  <IconSearch style={{ width: rem(20), height: rem(20) }} />
                </ActionIcon>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </header>
  );
};
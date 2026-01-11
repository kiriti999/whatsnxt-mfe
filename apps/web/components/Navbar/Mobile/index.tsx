import React, { useState } from 'react';
import Link from 'next/link';
import {
  Drawer,
  ScrollArea,
  rem,
  Text,
  NavLink,
  Avatar,
  Box,
  Group,
  UnstyledButton,
  Divider,
  Stack,
  ThemeIcon,
  Button
} from '@mantine/core';
import type { Link as LinkType } from '../types';
import {
  IconLogin,
  IconLogout,
  IconUserShare,
  IconHome,
  IconArticle,
  IconBook,
  IconSchool,
  IconDashboard,
  IconCpu,
  IconSearch,
  IconFlask,
  IconBriefcase,
  IconUserCircle,
  IconChevronRight,
  IconTrash
} from '@tabler/icons-react';
import useAuth from '../../../hooks/Authentication/useAuth';
import { notifications } from '@mantine/notifications';
import { CacheAPI } from '../../../apis/v1/redis';
import classes from '../Navbar.module.css';

interface INavbarMobile {
  links: LinkType[];
  cartItems: any[];
  loginMenuLinks: any[];
  drawerOpened: any;
  closeDrawer: any;
}

const getIconForLink = (title: string) => {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('home')) return <IconHome size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('blog')) return <IconArticle size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('tutorial')) return <IconBook size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('course')) return <IconSchool size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('ai') || normalizedTitle.includes('learn')) return <IconCpu size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('dashboard')) return <IconDashboard size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('lab')) return <IconFlask size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('consult')) return <IconBriefcase size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('search')) return <IconSearch size="1.1rem" stroke={1.5} />;
  if (normalizedTitle.includes('profile')) return <IconUserCircle size="1.1rem" stroke={1.5} />;

  return <IconChevronRight size="1.1rem" stroke={1.5} />;
};

export const NavbarMobile = ({ links, loginMenuLinks, drawerOpened, closeDrawer }: INavbarMobile) => {
  const { logout: handleLogout, loading, user: authUser } = useAuth();
  const isAdmin = authUser && authUser.role === 'admin';
  const isTrainer = authUser && authUser.role === 'trainer';
  const isLoggedIn = !!authUser;

  // Track expanded state for nested menus
  const [activeSubmenus, setActiveSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (title: string) => {
    setActiveSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

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
        message: typeof error === 'string' ? error : error.message || 'Unknown error',
      });
    }
  }

  return (
    <Drawer
      opened={drawerOpened}
      onClose={closeDrawer}
      size="85%"
      padding={0}
      withCloseButton={false}
      hiddenFrom="1367px"
      zIndex={1000000}
      styles={{
        content: { display: 'flex', flexDirection: 'column' }
      }}
    >
      <Box display="flex" style={{ flexDirection: 'column', height: '100%' }}>
        {/* User Profile Header */}
        <Box
          p="lg"
          style={{
            background: isLoggedIn
              ? 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-cyan-5) 100%)'
              : 'linear-gradient(135deg, var(--mantine-color-gray-1) 0%, var(--mantine-color-gray-0) 100%)',
            borderBottom: `1px solid var(--mantine-color-gray-2)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative circles */}
          <Box
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              pointerEvents: 'none'
            }}
          />
          <Box
            style={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none'
            }}
          />

          {isLoggedIn ? (
            <Group style={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                src={(authUser as any)?.trainerProfilePhoto}
                alt={authUser?.name}
                radius="xl"
                size={60}
                style={{
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <Text size="xl" fw={700} c="white">
                  {authUser?.name?.charAt(0).toUpperCase()}
                </Text>
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="md" fw={700} c="white" lineClamp={1}>
                  {authUser?.name}
                </Text>
                <Text c="rgba(255, 255, 255, 0.85)" size="xs" lineClamp={1} style={{ wordBreak: 'break-all' }}>
                  {authUser?.email}
                </Text>
              </div>
            </Group>
          ) : (
            <Stack gap="sm" style={{ position: 'relative', zIndex: 1 }}>
              <div>
                <Text size="xl" fw={800} c="dark">Welcome to WhatsNxt</Text>
                <Text size="sm" c="dimmed" mt={4}>Sign in to access your courses and labs</Text>
              </div>
              <Group grow>
                <Button
                  variant="filled"
                  color="indigo"
                  size="sm"
                  component={Link}
                  href="/authentication"
                  onClick={closeDrawer}
                  leftSection={<IconLogin size={16} />}
                  radius="md"
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  color="dark"
                  size="sm"
                  component={Link}
                  href="/authentication"
                  onClick={closeDrawer}
                  leftSection={<IconUserShare size={16} />}
                  radius="md"
                  styles={{
                    root: {
                      borderColor: 'var(--mantine-color-gray-4)',
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-gray-0)'
                      }
                    }
                  }}
                >
                  Sign Up
                </Button>
              </Group>
            </Stack>
          )}
        </Box>

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="xs" p="md">

            {/* Main Navigation links */}
            <Box mb="xs">
              <Group gap={6} mb="sm">
                <ThemeIcon size="xs" radius="xl" variant="light" color="gray">
                  <IconHome size={10} />
                </ThemeIcon>
                <Text c="dimmed" size="xs" fw={700} tt="uppercase">Menu</Text>
              </Group>
              <Stack gap={4}>
                {links.map((link) => (
                  <NavLink
                    key={link.url}
                    label={link.title}
                    leftSection={getIconForLink(link.title)}
                    component={Link}
                    href={link.url}
                    onClick={closeDrawer}
                    active={false}
                    variant="subtle"
                    styles={{
                      root: {
                        borderRadius: 'var(--mantine-radius-md)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'var(--mantine-color-indigo-0)',
                          transform: 'translateX(4px)'
                        }
                      },
                      label: { fontWeight: 500, fontSize: '0.9rem' }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* App specific links */}
            <Box mb="xs">
              <Group gap={6} mb="sm">
                <ThemeIcon size="xs" radius="xl" variant="light" color="cyan">
                  <IconFlask size={10} />
                </ThemeIcon>
                <Text c="dimmed" size="xs" fw={700} tt="uppercase">Explore</Text>
              </Group>
              <Stack gap={4}>
                <NavLink
                  label="Labs"
                  leftSection={<IconFlask size="1.1rem" stroke={1.5} />}
                  component={Link}
                  href="/labs"
                  onClick={closeDrawer}
                  styles={{
                    root: {
                      borderRadius: 'var(--mantine-radius-md)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-cyan-0)',
                        transform: 'translateX(4px)'
                      }
                    },
                    label: { fontWeight: 500, fontSize: '0.9rem' }
                  }}
                />

                <NavLink
                  label="Consulting"
                  leftSection={<IconBriefcase size="1.1rem" stroke={1.5} />}
                  component={Link}
                  href="/consulting"
                  onClick={closeDrawer}
                  styles={{
                    root: {
                      borderRadius: 'var(--mantine-radius-md)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-cyan-0)',
                        transform: 'translateX(4px)'
                      }
                    },
                    label: { fontWeight: 500, fontSize: '0.9rem' }
                  }}
                />

                {/* <NavLink
                  label="Search trainer"
                  leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
                  component={Link}
                  href="/search-trainers"
                  onClick={closeDrawer}
                  styles={{
                    root: {
                      borderRadius: 'var(--mantine-radius-md)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--mantine-color-cyan-0)',
                        transform: 'translateX(4px)'
                      }
                    },
                    label: { fontWeight: 500, fontSize: '0.9rem' }
                  }}
                /> */}

                {!isLoggedIn && (
                  <NavLink
                    label="Become a Trainer"
                    leftSection={<IconSchool size="1.1rem" stroke={1.5} />}
                    component={Link}
                    href="/become-a-trainer"
                    onClick={closeDrawer}
                    variant="light"
                    color="teal"
                    styles={{
                      root: {
                        borderRadius: 'var(--mantine-radius-md)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'var(--mantine-color-cyan-0)',
                          transform: 'translateX(4px)'
                        }
                      },
                      label: { fontWeight: 500, fontSize: '0.9rem' }
                    }}
                  />
                )}
              </Stack>
            </Box>

            {/* Trainer/Admin Actions */}
            {(isAdmin || isTrainer) && (
              <>
                <Divider />
                <Box mb="xs">
                  <Group gap={6} mb="sm">
                    <ThemeIcon size="xs" radius="xl" variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
                      <IconDashboard size={10} />
                    </ThemeIcon>
                    <Text c="dimmed" size="xs" fw={700} tt="uppercase">Trainer</Text>
                  </Group>
                  <NavLink
                    label="Dashboard"
                    leftSection={<IconDashboard size="1.1rem" stroke={1.5} />}
                    component={Link}
                    href="/trainer/courses"
                    onClick={closeDrawer}
                    color="indigo"
                    variant="light"
                    styles={{
                      root: {
                        borderRadius: 'var(--mantine-radius-md)',
                        fontWeight: 600
                      },
                      label: { fontWeight: 600, fontSize: '0.9rem' }
                    }}
                  />
                </Box>
              </>
            )}

            {/* Account Section for Logged In Users */}
            {isLoggedIn && (
              <>
                <Divider />
                <Box mb="xs">
                  <Group gap={6} mb="sm">
                    <ThemeIcon size="xs" radius="xl" variant="gradient" gradient={{ from: 'teal', to: 'green' }}>
                      <IconUserCircle size={10} />
                    </ThemeIcon>
                    <Text c="dimmed" size="xs" fw={700} tt="uppercase">Account</Text>
                  </Group>

                  <Stack gap={4}>
                    {loginMenuLinks.map((link) => (
                      <NavLink
                        key={link.url}
                        label={link.title}
                        leftSection={link.icon ? <link.icon size="1.1rem" /> : getIconForLink(link.title)}
                        childrenOffset={28}
                        opened={activeSubmenus[link.title]}
                        onChange={() => toggleSubmenu(link.title)}
                        component={link.children ? 'button' : Link}
                        href={link.children ? undefined : link.url}
                        onClick={link.children ? undefined : closeDrawer}
                        styles={{
                          root: {
                            borderRadius: 'var(--mantine-radius-md)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'var(--mantine-color-teal-0)',
                              transform: link.children ? 'none' : 'translateX(4px)'
                            }
                          },
                          label: { fontWeight: 500, fontSize: '0.9rem' }
                        }}
                      >
                        {link.children && link.children.map((child: any) => (
                          <NavLink
                            key={child.url}
                            label={child.title}
                            component={Link}
                            href={child.url}
                            onClick={closeDrawer}
                            leftSection={child.icon ? <child.icon size="0.9rem" /> : <IconChevronRight size="0.9rem" />}
                            styles={{
                              root: {
                                borderRadius: 'var(--mantine-radius-sm)',
                                marginTop: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: 'var(--mantine-color-gray-1)',
                                  paddingLeft: '1.5rem'
                                }
                              },
                              label: { fontWeight: 400, fontSize: '0.85rem' }
                            }}
                          />
                        ))}
                      </NavLink>
                    ))}

                    {isAdmin && (
                      <NavLink
                        label="Clear Cache"
                        leftSection={<IconTrash size="1.1rem" stroke={1.5} />}
                        onClick={() => {
                          clearCache();
                          closeDrawer();
                        }}
                        color="red"
                        variant="light"
                        styles={{
                          root: {
                            borderRadius: 'var(--mantine-radius-md)',
                            marginTop: 4
                          },
                          label: { fontWeight: 500, fontSize: '0.9rem' }
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </>
            )}

          </Stack>
        </ScrollArea>

        {/* Footer with Logout */}
        {isLoggedIn && (
          <Box
            p="md"
            style={{
              borderTop: `1px solid var(--mantine-color-gray-2)`,
              background: 'var(--mantine-color-gray-0)'
            }}
          >
            <Button
              fullWidth
              variant="gradient"
              gradient={{ from: 'red.6', to: 'pink.6' }}
              leftSection={<IconLogout size={18} />}
              onClick={() => {
                handleLogout();
                closeDrawer();
              }}
              radius="md"
              size="md"
              styles={{
                root: {
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(255, 0, 0, 0.15)'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
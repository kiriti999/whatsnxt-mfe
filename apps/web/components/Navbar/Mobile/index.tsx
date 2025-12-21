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
        <Box p="md" bg="blue.0" style={{ borderBottom: `1px solid var(--mantine-color-gray-3)` }}>
          {isLoggedIn ? (
            <Group>
              <Avatar
                src={(authUser as any)?.trainerProfilePhoto}
                alt={authUser?.name}
                radius="xl"
                size="lg"
                color="blue"
              >
                {authUser?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} lineClamp={1}>
                  {authUser?.name}
                </Text>
                <Text c="dimmed" size="xs" lineClamp={1} style={{ wordBreak: 'break-all' }}>
                  {authUser?.email}
                </Text>
              </div>
            </Group>
          ) : (
            <Stack gap={5}>
              <Text size="lg" fw={700}>Welcome to WhatsNxt</Text>
              <Text size="sm" c="dimmed">Sign in to access your courses and labs</Text>
              <Group mt="sm" grow>
                <Button
                  variant="filled"
                  size="xs"
                  component={Link}
                  href="/authentication"
                  onClick={closeDrawer}
                  leftSection={<IconLogin size={14} />}
                >
                  Login
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  component={Link}
                  href="/authentication"
                  onClick={closeDrawer}
                  leftSection={<IconUserShare size={14} />}
                >
                  Sign Up
                </Button>
              </Group>
            </Stack>
          )}
        </Box>

        <ScrollArea style={{ flex: 1 }}>
          <Stack gap={2} p="md">

            {/* Main Navigation links */}
            <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb={4} mt="xs">Menu</Text>
            {links.map((link) => (
              <NavLink
                key={link.url}
                label={link.title}
                leftSection={getIconForLink(link.title)}
                component={Link}
                href={link.url}
                onClick={closeDrawer}
                active={false /* Logic to set active could be added here based on router pathname */}
                variant="subtle"
                styles={{
                  root: { borderRadius: 'var(--mantine-radius-md)' },
                  label: { fontWeight: 500 }
                }}
              />
            ))}

            <Divider my="sm" />

            {/* App specific links */}
            <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb={4}>Explore</Text>

            <NavLink
              label="Labs"
              leftSection={<IconFlask size="1.1rem" stroke={1.5} />}
              component={Link}
              href="/labs"
              onClick={closeDrawer}
              styles={{
                root: { borderRadius: 'var(--mantine-radius-md)' },
                label: { fontWeight: 500 }
              }}
            />

            <NavLink
              label="Consulting"
              leftSection={<IconBriefcase size="1.1rem" stroke={1.5} />}
              component={Link}
              href="/consulting"
              onClick={closeDrawer}
              styles={{
                root: { borderRadius: 'var(--mantine-radius-md)' },
                label: { fontWeight: 500 }
              }}
            />

            <NavLink
              label="Search A Trainer"
              leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
              component={Link}
              href="/search-trainers"
              onClick={closeDrawer}
              styles={{
                root: { borderRadius: 'var(--mantine-radius-md)' },
                label: { fontWeight: 500 }
              }}
            />

            {/* Trainer/Admin Actions */}
            {(isAdmin || isTrainer) && (
              <>
                <Divider my="sm" />
                <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb={4}>Trainer</Text>
                <NavLink
                  label="Dashboard"
                  leftSection={<IconDashboard size="1.1rem" stroke={1.5} />}
                  component={Link}
                  href="/trainer/courses"
                  onClick={closeDrawer}
                  color="blue"
                  variant="light"
                  styles={{
                    root: { borderRadius: 'var(--mantine-radius-md)' },
                    label: { fontWeight: 500 }
                  }}
                />
              </>
            )}

            {(!isAdmin && !isTrainer) && (
              <NavLink
                label="Become a Trainer"
                leftSection={<IconSchool size="1.1rem" stroke={1.5} />}
                component={Link}
                href="/become-a-trainer"
                onClick={closeDrawer}
                styles={{
                  root: { borderRadius: 'var(--mantine-radius-md)' },
                  label: { fontWeight: 500 }
                }}
              />
            )}

            {/* Account Section for Logged In Users */}
            {isLoggedIn && (
              <>
                <Divider my="sm" />
                <Text c="dimmed" size="xs" fw={700} tt="uppercase" mb="xs">Account</Text>

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
                      root: { borderRadius: 'var(--mantine-radius-md)' },
                      label: { fontWeight: 500 }
                    }}
                  >
                    {link.children && link.children.map((child: any) => (
                      <NavLink
                        key={child.url}
                        label={child.title}
                        component={Link}
                        href={child.url}
                        onClick={closeDrawer}
                        leftSection={child.icon ? <child.icon size="0.8rem" /> : <IconChevronRight size="0.8rem" />}
                        styles={{
                          root: { borderRadius: 'var(--mantine-radius-md)' },
                          label: { fontWeight: 500 }
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
                    variant="subtle"
                    styles={{
                      root: { borderRadius: 'var(--mantine-radius-md)' },
                      label: { fontWeight: 500 }
                    }}
                  />
                )}
              </>
            )}

          </Stack>
        </ScrollArea>

        {/* Footer with Logout */}
        {isLoggedIn && (
          <Box p="md" style={{ borderTop: `1px solid var(--mantine-color-gray-3)` }}>
            <Button
              fullWidth
              color="red"
              variant="light"
              leftSection={<IconLogout size={18} />}
              onClick={() => {
                handleLogout();
                closeDrawer();
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
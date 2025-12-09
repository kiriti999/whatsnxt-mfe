import React from 'react';
import Link from 'next/link';
import { Anchor, Button, Divider, Drawer, Group, Menu, ScrollArea, rem, Text } from '@mantine/core';
import type { Link as LinkType, User } from '../types';
import { IconLogin, IconLogout, IconUserShare } from '@tabler/icons-react';
import classes from '../Navbar.module.css';
import useAuth from '../../../hooks/Authentication/useAuth';
import { notifications } from '@mantine/notifications';
import { CacheAPI } from '../../../apis/v1/redis';

interface INavbarMobile {
  links: LinkType[];
  cartItems: any[];
  loginMenuLinks: any[];
  drawerOpened: any;
  closeDrawer: any;
}

export const NavbarMobile = ({ links, loginMenuLinks, drawerOpened, closeDrawer }: INavbarMobile) => {
  const { logout: handleLogout, loading, user: authUser } = useAuth();
  const isAdmin = authUser && authUser.role === 'admin';
  const isTrainer = authUser && authUser.role === 'trainer';
  const isLoggedIn = !!authUser;

  async function clearCache() {
    try {
      await CacheAPI.invalidate();
      notifications.show({
        position: 'bottom-right',
        color: 'green',
        title: 'Cache invalidation success!',
        message: 'Complete cache has been cleared',
      });
    } catch (error) {
      notifications.show({
        position: 'bottom-right',
        color: 'red',
        title: 'Cache invalidation failed!',
        message: error,
      });
    }
  }

  return (
    <Drawer
      opened={drawerOpened}
      onClose={closeDrawer}
      size="80%"
      padding="md"
      title={authUser?.email}
      hiddenFrom="1367px"
      zIndex={1000000}
    >
      <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
        <Divider my={'0.2rem'} />

        {links.map((link) => (
          <Anchor
            mt={'0.01rem'}
            href={link.url}
            component={Link}
            className={classes.link}
            target={link.linkType}
            key={link.url}
            onClick={closeDrawer}
          >
            <Text size='sm'>{link.title}</Text>
          </Anchor>
        ))}

        {(isAdmin || isTrainer) && (
          <Anchor href="/trainer/courses" component={Link} className={classes.link} onClick={closeDrawer}>
            <Text size='sm'>Dashboard</Text>
          </Anchor>
        )}

        <Anchor href={isLoggedIn ? '/labs' : '/consulting'} mt={'0.01rem'} className={classes.link} component={Link} onClick={closeDrawer}>
          <Text size='sm'>{isLoggedIn ? 'Labs' : 'Consulting'}</Text>
        </Anchor>

        <Anchor href='/search-trainers' mt={'0.01rem'} className={classes.link} component={Link} onClick={closeDrawer}>
          <Text size='sm'>Search A Trainer</Text>
        </Anchor>

        {/* Add the "Become a trainer" link with the same condition as desktop */}
        {(!isAdmin && !isTrainer) && (
          <Anchor href='/become-a-trainer' mt={'0.01rem'} className={classes.link} component={Link} onClick={closeDrawer}>
            <Text size='sm'>Become a trainer</Text>
          </Anchor>
        )}

        {isAdmin && (
          <Anchor mt={'0.01rem'} className={classes.link}>
            <Button size='xs' onClick={clearCache}>Clear all cache</Button>
          </Anchor>
        )}

        <Divider my={'0.8rem'} />

        {isLoggedIn && loginMenuLinks.map((link) => {
          if (link.children) {
            return (
              <Menu key={link.url} withinPortal position="bottom-start">
                <Menu.Target>
                  <Button variant="subtle" mt={'0.01rem'} className={classes.link}>
                    <Text size='sm'>{link.title}</Text>
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className={classes.dropdownStyle}>
                  <Menu.Item
                    onClick={closeDrawer}
                    fz={'1.01rem'}
                    href={link.url}
                    component={Link}
                  >
                    <Text size='sm'>{link.title}</Text>
                  </Menu.Item>
                  {link.children.map((child) => (
                    <Menu.Item
                      key={child.url}
                      onClick={closeDrawer}
                      fz={'1.01rem'}
                      href={child.url}
                      component={Link}
                    >
                      <Text size='sm'>{child.title}</Text>
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            );
          } else {
            return (
              <Anchor
                mt={'0.01rem'}
                href={link.url}
                component={Link}
                className={classes.link}
                key={link.url}
                onClick={closeDrawer}
              >
                <Text size='sm'>{link.title}</Text>
              </Anchor>
            );
          }
        })}

        <Divider my="sm" />

        <Group justify="center" grow pb="xl" px="md">
          {!isLoggedIn ? (
            <>
              <Button
                loading={loading}
                size="sm"
                component={Link}
                href="/authentication"
                c="white"
                leftSection={<IconLogin style={{ width: rem(14), height: rem(14) }} />}
                onClick={closeDrawer}
              >
                Login
              </Button>
              <Button
                loading={loading}
                size="sm"
                component={Link}
                href="/authentication"
                c="white"
                leftSection={<IconUserShare style={{ width: rem(14), height: rem(14) }} />}
                onClick={closeDrawer}
              >
                Sign up
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                handleLogout();
                closeDrawer();
              }}
              color="red"
              leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
            >
              Logout
            </Button>
          )}
        </Group>
      </ScrollArea>
    </Drawer>
  );
};
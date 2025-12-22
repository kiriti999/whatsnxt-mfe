"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Paper, Group, Text, Stack, Box, ThemeIcon, Card } from '@mantine/core';
import {
    IconChecklist,
} from '@tabler/icons-react';
import useAuth from '../../hooks/Authentication/useAuth';

type sidebarProps = {
    activeLink: string;
}

const AdminSidebar = ({ activeLink }: sidebarProps) => {
    const router = useRouter();
    const { user: authUser } = useAuth();

    if (authUser?.role) {
        if (authUser?.role != "admin") {
            router.replace('/');
        }
    }

    const navigationItems = [
        {
            label: 'Course Reviews',
            description: 'Review pending courses',
            icon: IconChecklist,
            href: '/admin/course-review-request',
            key: 'review',
            color: 'indigo',
        },
        // Add more navigation items here as needed
        // {
        //     label: 'Users',
        //     description: 'Manage users',
        //     icon: IconUsers,
        //     href: '/admin/users',
        //     key: 'users',
        //     color: 'teal',
        // },
    ];

    return (
        <Card shadow="sm" radius="lg" p="md" withBorder>
            <Stack gap="xs">
                {/* Header */}
                <Box mb="xs">
                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={4}>
                        Navigation
                    </Text>
                </Box>

                {/* Navigation Items */}
                {navigationItems.map((item) => {
                    const isActive = activeLink === item.key;
                    const IconComponent = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            style={{ textDecoration: 'none' }}
                        >
                            <Paper
                                p="sm"
                                radius="md"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: isActive
                                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                        : 'transparent',
                                    border: isActive
                                        ? 'none'
                                        : '1px solid var(--mantine-color-gray-2)',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--mantine-color-gray-0)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <Group gap="sm" wrap="nowrap">
                                    <ThemeIcon
                                        size="lg"
                                        radius="md"
                                        variant={isActive ? 'white' : 'light'}
                                        color={isActive ? 'dark' : item.color}
                                    >
                                        <IconComponent size={18} />
                                    </ThemeIcon>
                                    <Box style={{ flex: 1 }}>
                                        <Text
                                            size="sm"
                                            fw={600}
                                            c={isActive ? 'white' : 'dark'}
                                        >
                                            {item.label}
                                        </Text>
                                        <Text
                                            size="xs"
                                            c={isActive ? 'rgba(255,255,255,0.7)' : 'dimmed'}
                                        >
                                            {item.description}
                                        </Text>
                                    </Box>
                                </Group>
                            </Paper>
                        </Link>
                    );
                })}

                {/* Quick Stats or Info Section */}
                <Box mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                    <Text size="xs" c="dimmed" ta="center">
                        Admin Panel v1.0
                    </Text>
                </Box>
            </Stack>
        </Card>
    );
};

export default AdminSidebar;

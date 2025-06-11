"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation
import Link from 'next/link'; // Use native Link from Next.js
import { Paper, Group, Button, Text, Stack } from '@mantine/core';
import useAuth from '../../hooks/Authentication/useAuth';

type sidebarProps = {
    activeLink: String;
}

const AdminSidebar = ({ activeLink }: sidebarProps) => {
    const router = useRouter();

    const { user: authUser } = useAuth();
    if (authUser?.role) {
        if (authUser?.role != "admin") {
            router.replace('/');
        }
    }
    return (
        <>
            <Paper shadow="xs" p="md" withBorder>
                <Stack>
                    <Group>
                        <Text>
                            Request type:
                        </Text>
                    </Group>

                    <Group>
                        <Link href={"/admin/course-review-request"}>
                            <Button variant={activeLink == "review" ? 'filled' : 'subtle'}  >
                                Course reviews
                            </Button>
                        </Link>
                    </Group>
                </Stack>
            </Paper>
        </>
    );
};

export default AdminSidebar;

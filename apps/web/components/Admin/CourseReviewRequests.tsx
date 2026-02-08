"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAuth from '../../hooks/Authentication/useAuth';
import {
    Container,
    Title,
    Grid,
    Paper,
    Group,
    Button,
    Center,
    Text,
    Pagination,
    Box,
    Badge,
    Card,
    Stack,
    ThemeIcon,
    Flex,
    Tooltip,
    Skeleton,
    Avatar,
    Divider,
} from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import { useDisclosure } from '@mantine/hooks';
import AdminSidebar from "./AdminSidebar";
import { CourseAPI } from "../../apis/v1/courses/course/course";
import {
    IconBook,
    IconEye,
    IconClockHour4,
    IconFileDescription,
    IconChevronRight,
    IconInbox,
} from '@tabler/icons-react';

const LIMIT = 5;

const CourseReviewRequests = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isOpened, { open }] = useDisclosure(false);

    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);

    const [activePage, setActivePage] = useState(+params.get('page') || 1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        params.set('page', String(activePage));
        router.replace(`${pathname}?${params.toString()}`);
    }, [activePage]);

    useEffect(() => {
        if (!user?.isAuthenticated) {
            router.replace('/authentication');
        }
    }, [user?.isAuthenticated, router]);

    const getRequests = async () => {
        setLoading(true);
        try {
            const { data } = await CourseAPI.getCourseByStatus("pending_review", (activePage - 1) * LIMIT, LIMIT);
            setPendingRequests(data?.courses || []);
            setTotalPages(data?.totalPages || 0);
            setTotalCount(data?.total || 0);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getRequests();
    }, [activePage]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_review':
                return 'orange';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            case 'published':
                return 'blue';
            default:
                return 'gray';
        }
    };

    const getStatusLabel = (status: string) => {
        return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
            }}
        >
            <FullPageOverlay visible={isOpened} />
            <Container size="xl" py="xl" pos='relative'>

                {/* Header Section */}
                <Flex justify="space-between" align="center" mb="xl">
                    <Box>
                        <Title order={3} mb={4} style={{ letterSpacing: '-0.5px' }}>
                            Admin Dashboard
                        </Title>
                        <Text c="dimmed" size="sm">
                            Manage and review course submissions
                        </Text>
                    </Box>
                    <Badge
                        size="lg"
                        variant="light"
                        color="indigo"
                        leftSection={<IconFileDescription size={14} />}
                    >
                        {totalCount} Pending Review{totalCount !== 1 ? 's' : ''}
                    </Badge>
                </Flex>

                <Grid gutter="xl">
                    {/* Sidebar */}
                    <Grid.Col span={{ base: 12, lg: 3, md: 4 }}>
                        <AdminSidebar activeLink="review" />
                    </Grid.Col>

                    {/* Main Content */}
                    <Grid.Col span={{ base: 12, lg: 9, md: 8 }}>
                        <Card shadow="sm" radius="lg" p={0} withBorder style={{ overflow: 'hidden' }}>
                            {/* Card Header */}
                            <Box
                                p="lg"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                }}
                            >
                                <Group justify="space-between">
                                    <Group gap="sm">
                                        <ThemeIcon size="lg" radius="md" variant="white" color="dark">
                                            <IconBook size={20} />
                                        </ThemeIcon>
                                        <Box>
                                            <Text c="white" fw={600} size="lg">Course Review Queue</Text>
                                            <Text c="rgba(255,255,255,0.7)" size="xs">
                                                Review and approve trainer submissions
                                            </Text>
                                        </Box>
                                    </Group>
                                </Group>
                            </Box>

                            {/* Content Area */}
                            <Box p="lg">
                                {loading ? (
                                    <Stack gap="md">
                                        {[1, 2, 3].map((i) => (
                                            <Paper key={i} p="md" radius="md" withBorder>
                                                <Group justify="space-between">
                                                    <Group>
                                                        <Skeleton height={48} circle />
                                                        <Box>
                                                            <Skeleton height={16} width={200} mb={8} />
                                                            <Skeleton height={12} width={120} />
                                                        </Box>
                                                    </Group>
                                                    <Skeleton height={32} width={100} radius="md" />
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : pendingRequests.length > 0 ? (
                                    <Stack gap="md">
                                        {pendingRequests.map((request: any, index: number) => (
                                            <Paper
                                                key={request._id}
                                                p="md"
                                                radius="md"
                                                withBorder
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    borderColor: 'var(--mantine-color-gray-2)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-indigo-4)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-2)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Group gap="md" wrap="nowrap" style={{ flex: 1 }}>
                                                        <Avatar
                                                            size={48}
                                                            radius="md"
                                                            color="indigo"
                                                            variant="light"
                                                        >
                                                            {(activePage - 1) * LIMIT + index + 1}
                                                        </Avatar>
                                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                                            <Text
                                                                fw={600}
                                                                size="sm"
                                                                lineClamp={1}
                                                                onClick={() => {
                                                                    open();
                                                                    router.push(`/courses/${request.slug}`);
                                                                }}
                                                                style={{ cursor: 'pointer' }}
                                                                className="hover-underline"
                                                            >
                                                                {request?.courseName}
                                                            </Text>
                                                            <Group gap="xs" mt={4}>
                                                                <Badge
                                                                    size="xs"
                                                                    variant="light"
                                                                    color={getStatusColor(request?.status)}
                                                                >
                                                                    {getStatusLabel(request?.status)}
                                                                </Badge>
                                                                <Text size="xs" c="dimmed">
                                                                    <IconClockHour4 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                                    {formatDate(request?.createdAt)}
                                                                </Text>
                                                            </Group>
                                                        </Box>
                                                    </Group>

                                                    <Group gap="xs" wrap="nowrap">
                                                        <Tooltip label="View Course Details" position="top">
                                                            <Button
                                                                variant="light"
                                                                color="indigo"
                                                                size="sm"
                                                                radius="md"
                                                                rightSection={<IconChevronRight size={16} />}
                                                                onClick={() => {
                                                                    open();
                                                                    router.push(`/courses/${request.slug}-invalidate`);
                                                                }}
                                                            >
                                                                Review
                                                            </Button>
                                                        </Tooltip>
                                                    </Group>
                                                </Group>
                                            </Paper>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Center py={60}>
                                        <Stack align="center" gap="md">
                                            <ThemeIcon size={80} radius="xl" variant="light" color="gray">
                                                <IconInbox size={40} stroke={1.5} />
                                            </ThemeIcon>
                                            <Box ta="center">
                                                <Text fw={600} size="lg" mb={4}>No Pending Reviews</Text>
                                                <Text c="dimmed" size="sm">
                                                    All course submissions have been reviewed.
                                                </Text>
                                            </Box>
                                        </Stack>
                                    </Center>
                                )}
                            </Box>

                            {/* Pagination Footer */}
                            {totalPages > 1 && (
                                <>
                                    <Divider />
                                    <Box p="md" bg="gray.0">
                                        <Group justify="center">
                                            <Pagination
                                                total={totalPages}
                                                value={activePage}
                                                onChange={setActivePage}
                                                size='sm'
                                                radius="md"
                                                withEdges
                                            />
                                        </Group>
                                    </Box>
                                </>
                            )}
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default CourseReviewRequests;
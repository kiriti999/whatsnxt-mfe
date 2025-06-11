"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'; // Import from next/navigation
import useAuth from '../../hooks/Authentication/useAuth';
import { Container, Title, Grid, Paper, Group, Button, Center, Loader, Table, Text, LoadingOverlay, Pagination, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AdminSidebar from "./AdminSidebar";
import { CourseAPI } from "../../api/v1/courses/course/course"

const LIMIT = 1;

const CourseReviewRequests = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter(); // Use router from next/navigation
    const pathname = usePathname(); // Use pathname from next/navigation
    const [pendingRequests, setPendingRequests] = useState([]);
    const [isOpened, { open }] = useDisclosure(false);

    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);

    const [activePage, setActivePage] = useState(+params.get('page') || 1);
    const [totalPages, setTotalPages] = useState(0);

    // This useEffect is watching the activePage and updating the url
    useEffect(() => {
        params.set('page', String(activePage));
        router.replace(`${pathname}?${params.toString()}`);
    }, [activePage]);

    // Ensure authentication
    useEffect(() => {
        if (!token) {
            router.replace('/authentication'); // Use replace instead of push for redirection in the App Router
        }
    }, [token, router]);

    const getRequests = async () => {
        setLoading(true);
        try {
            const { data } = await CourseAPI.getCourseByStatus("pending_review", (activePage - 1) * LIMIT, LIMIT);
            setLoading(false);
            setPendingRequests(data?.courses);
            setTotalPages(data?.totalPages);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    }

    useEffect(() => {
        getRequests();
    }, [activePage]);

    console.log(' CourseReviewRequests :: pendingRequests:', pendingRequests)
    return (
        <>
            <Container size="lg" mt="xl" mb={'xl'} pos='relative'>
                <LoadingOverlay visible={isOpened} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
                <Title order={2} mb="lg" >
                    Admin Dashboard
                </Title>

                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, lg: 3, md: 12 }}>
                        <AdminSidebar activeLink="review" />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, lg: 9, md: 12 }}>
                        <Paper shadow="xs" p="md" withBorder>
                            {loading ? (
                                <Center>
                                    <Loader size="lg" />
                                </Center>
                            ) : (
                                <>
                                    <Table verticalSpacing="sm">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Title</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRequests.length > 0 ? (
                                                pendingRequests.map((request: any, index: number) => {
                                                    let courseStatus = request?.status;
                                                    return (
                                                        <tr key={request._id}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                <Button
                                                                    variant='transparent'
                                                                    component={'a'}
                                                                    size='sm'
                                                                    p='0'
                                                                    onClick={() => {
                                                                        open();
                                                                        router.push(`/courses/${request.slug}`);
                                                                    }}
                                                                >
                                                                    {request?.courseName}
                                                                </Button>
                                                            </td>
                                                            <td>{courseStatus}</td>
                                                            <td>
                                                                <Group>
                                                                    <Button
                                                                        size="xs"
                                                                        color="blue"
                                                                        c='white'
                                                                        component={'a'}
                                                                        onClick={() => {
                                                                            open();
                                                                            router.push(`/courses/${request.slug}-invalidate`);
                                                                        }}
                                                                    >
                                                                        Show Course
                                                                    </Button>
                                                                </Group>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={4}>
                                                        <Text ta="center">No Pending Requests!</Text>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>

                                    {/* Pagination container with proper alignment */}
                                    <Box mt="md" w="100%" display="flex" style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Group justify="center" w="100%">
                                            <Pagination
                                                total={totalPages}
                                                value={activePage}
                                                onChange={setActivePage}
                                                size='sm'
                                                withEdges
                                            />
                                        </Group>
                                    </Box>
                                </>
                            )}
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </>
    );
};

export default CourseReviewRequests;
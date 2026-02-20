'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
    Container,
    Stack,
    Title,
    Group,
    Text,
    Paper,
    Badge,
    Progress,
    Collapse,
    Flex,
    Select,
    ActionIcon,
    ThemeIcon,
    Menu,
    Tooltip,
    Box,
    Loader,
    Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconChevronDown,
    IconChevronRight,
    IconPlayerPause,
    IconPlayerPlay,
    IconX,
    IconTrash,
    IconRocket,
    IconDots,
    IconPlus,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ContentPlanAPI } from '../../apis/v1/contentPlan';
import type { ContentPlan, ContentPlanTopic } from '../../apis/v1/contentPlan';
import classes from './ContentPlanDashboard.module.css';

const PLAN_STATUS_COLORS: Record<string, string> = {
    active: 'blue',
    completed: 'green',
    paused: 'yellow',
    cancelled: 'red',
};

const TOPIC_STATUS_COLORS: Record<string, string> = {
    pending: 'gray',
    processing: 'blue',
    published: 'green',
    error: 'red',
    skipped: 'orange',
};

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export function ContentPlanDashboard() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const queryClient = useQueryClient();

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['contentPlans'],
        queryFn: async () => {
            const response = await ContentPlanAPI.list();
            return response.data || [];
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: ContentPlan['status'] }) =>
            ContentPlanAPI.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentPlans'] });
            notifications.show({
                position: 'bottom-right',
                color: 'green',
                title: 'Updated',
                message: 'Content plan status updated',
            });
        },
        onError: (error: any) => {
            notifications.show({
                position: 'bottom-right',
                color: 'red',
                title: 'Error',
                message: error?.response?.data?.message || 'Failed to update status',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ContentPlanAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentPlans'] });
            notifications.show({
                position: 'bottom-right',
                color: 'green',
                title: 'Deleted',
                message: 'Content plan deleted',
            });
        },
        onError: (error: any) => {
            notifications.show({
                position: 'bottom-right',
                color: 'red',
                title: 'Error',
                message: error?.response?.data?.message || 'Failed to delete plan',
            });
        },
    });

    const toggleExpand = useCallback((id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const filteredPlans = useMemo(() => {
        if (statusFilter === 'all') return plans;
        return plans.filter((plan: ContentPlan) => plan.status === statusFilter);
    }, [plans, statusFilter]);

    return (
        <Container size="md" py={{ base: 'xl', sm: '3rem' }}>
            <Stack gap="lg">
                {/* Header */}
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <Group gap="xs">
                        <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: 'teal', to: 'lime', deg: 135 }}
                        >
                            <IconRocket size={24} />
                        </ThemeIcon>
                        <Title order={2} className={classes.headerTitle}>
                            Content Plans
                        </Title>
                    </Group>
                    <Group gap="sm">
                        <Select
                            size="sm"
                            data={STATUS_FILTER_OPTIONS}
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val || 'all')}
                            w={160}
                        />
                        <Button
                            component={Link}
                            href="/form/auto-create"
                            leftSection={<IconPlus size={16} />}
                            variant="gradient"
                            gradient={{ from: 'teal', to: 'lime', deg: 135 }}
                            size="sm"
                        >
                            New Plan
                        </Button>
                    </Group>
                </Flex>

                {/* Loading */}
                {isLoading && (
                    <Flex justify="center" py="xl">
                        <Loader color="teal" />
                    </Flex>
                )}

                {/* Empty State */}
                {!isLoading && filteredPlans.length === 0 && (
                    <Paper p="xl" radius="md" className={classes.emptyState}>
                        <Text size="lg" fw={500}>No content plans found</Text>
                        <Text size="sm" mt="xs">Create your first content plan to start generating blog posts with AI.</Text>
                    </Paper>
                )}

                {/* Plan List */}
                {filteredPlans.map((plan: ContentPlan) => (
                    <PlanCard
                        key={plan._id}
                        plan={plan}
                        isExpanded={!!expanded[plan._id]}
                        onToggle={() => toggleExpand(plan._id)}
                        onStatusChange={(status) => statusMutation.mutate({ id: plan._id, status })}
                        onDelete={() => deleteMutation.mutate(plan._id)}
                        isUpdating={statusMutation.isPending}
                    />
                ))}
            </Stack>
        </Container>
    );
}

interface PlanCardProps {
    plan: ContentPlan;
    isExpanded: boolean;
    onToggle: () => void;
    onStatusChange: (status: string) => void;
    onDelete: () => void;
    isUpdating: boolean;
}

function PlanCard({ plan, isExpanded, onToggle, onStatusChange, onDelete, isUpdating }: PlanCardProps) {
    const progressPercent = plan.totalCount > 0
        ? Math.round((plan.completedCount / plan.totalCount) * 100)
        : 0;

    const categoryLabel = [plan.categoryName, plan.subCategory, plan.nestedSubCategory]
        .filter(Boolean)
        .join(' → ');

    return (
        <Paper radius="md" className={classes.planCard}>
            {/* Plan header — clickable to expand */}
            <Flex
                className={classes.planHeader}
                align="center"
                justify="space-between"
                onClick={onToggle}
            >
                <Flex align="center" gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    <ActionIcon variant="subtle" size="sm" color="gray">
                        {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </ActionIcon>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Flex align="center" gap="xs" wrap="wrap">
                            <Text className={classes.planTitle} lineClamp={1}>{plan.title}</Text>
                            <Badge variant="light" size="sm" color={PLAN_STATUS_COLORS[plan.status] || 'gray'}>
                                {plan.status}
                            </Badge>
                        </Flex>
                        <Flex align="center" gap="md" mt={4}>
                            <Text className={classes.categoryText}>{categoryLabel}</Text>
                            <Text className={classes.progressText}>
                                {plan.completedCount}/{plan.totalCount} topics
                            </Text>
                        </Flex>
                        <Progress value={progressPercent} size="xs" mt={6} color="teal" />
                    </Box>
                </Flex>

                {/* Action Menu */}
                <Box onClick={(e) => e.stopPropagation()}>
                    <PlanActions
                        plan={plan}
                        onStatusChange={onStatusChange}
                        onDelete={onDelete}
                        isUpdating={isUpdating}
                    />
                </Box>
            </Flex>

            {/* Expanded topics */}
            <Collapse in={isExpanded}>
                <Stack gap="xs" className={classes.topicsSection}>
                    {(plan.topics || []).map((topic) => (
                        <TopicRow key={topic._key} topic={topic} />
                    ))}
                </Stack>
            </Collapse>
        </Paper>
    );
}

interface PlanActionsProps {
    plan: ContentPlan;
    onStatusChange: (status: string) => void;
    onDelete: () => void;
    isUpdating: boolean;
}

function PlanActions({ plan, onStatusChange, onDelete, isUpdating }: PlanActionsProps) {
    return (
        <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
                <ActionIcon variant="subtle" color="gray" loading={isUpdating}>
                    <IconDots size={18} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                {plan.status === 'active' && (
                    <Menu.Item
                        leftSection={<IconPlayerPause size={14} />}
                        onClick={() => onStatusChange('paused')}
                    >
                        Pause
                    </Menu.Item>
                )}
                {plan.status === 'paused' && (
                    <Menu.Item
                        leftSection={<IconPlayerPlay size={14} />}
                        onClick={() => onStatusChange('active')}
                    >
                        Resume
                    </Menu.Item>
                )}
                {(plan.status === 'active' || plan.status === 'paused') && (
                    <Menu.Item
                        leftSection={<IconX size={14} />}
                        onClick={() => onStatusChange('cancelled')}
                        color="orange"
                    >
                        Cancel
                    </Menu.Item>
                )}
                {(plan.status === 'paused' || plan.status === 'cancelled') && (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            onClick={onDelete}
                            color="red"
                        >
                            Delete
                        </Menu.Item>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

interface TopicRowProps {
    topic: ContentPlanTopic;
}

function TopicRow({ topic }: TopicRowProps) {
    return (
        <Flex className={classes.topicRow} justify="space-between" align="center" gap="xs">
            <Box style={{ flex: 1, minWidth: 0 }}>
                <Text className={classes.topicTitle} lineClamp={1}>{topic.title}</Text>
                {topic.error && (
                    <Text className={classes.topicError} lineClamp={1}>{topic.error}</Text>
                )}
            </Box>
            <Flex align="center" gap="xs">
                {topic.retryCount > 0 && (
                    <Tooltip label={`${topic.retryCount} retries`}>
                        <Badge size="xs" variant="outline" color="gray">
                            {topic.retryCount}x
                        </Badge>
                    </Tooltip>
                )}
                <Badge variant="dot" size="xs" color={TOPIC_STATUS_COLORS[topic.status] || 'gray'}>
                    {topic.status}
                </Badge>
            </Flex>
        </Flex>
    );
}

export default ContentPlanDashboard;

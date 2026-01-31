'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StructuredTutorialAPI } from '../../../apis/v1/blog/structuredTutorialApi';
import { MantineLoader } from '@whatsnxt/core-ui';
import { Container, Text, Center, Stack, Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function TutorialRedirectPage({ params }: { params: { slug: string } }) {
    const [error, setError] = useState('');
    const router = useRouter();
    // Unwrap params using React.use() or just treat as promise in Next.js 15+ 
    // But since this is a client component, params prop is passed directly in older versions 
    // or as a promise in newer ones. Let's handle safely.
    // Actually, for client components in Next 13+, params is just a prop.
    // Wait, in Next 15 params is a Promise.
    // Let's assume standard behavior for now but handle the unwrapping if needed.

    useEffect(() => {
        // Resolve params if it's a promise (future proofing)
        const resolveParams = async () => {
            const resolvedParams = await params;
            const slug = resolvedParams.slug;

            try {
                // 1. Fetch tutorial by slug to get ID
                const tutorialRes = await StructuredTutorialAPI.getBySlug(slug);

                if (!tutorialRes.success || !tutorialRes.data) {
                    setError('Tutorial not found');
                    return;
                }

                const tutorial = tutorialRes.data;

                // 2. Fetch sidebar/tree to get the structure and find first post
                const sidebarRes = await StructuredTutorialAPI.getSidebar(tutorial._id);

                if (!sidebarRes.success || !sidebarRes.data) {
                    setError('Could not load tutorial content');
                    return;
                }

                const tree = sidebarRes.data;

                // 3. Find first section with posts
                const firstSectionWithPosts = tree.sections.find(s => s.posts && s.posts.length > 0);

                if (firstSectionWithPosts && firstSectionWithPosts.posts.length > 0) {
                    const firstPost = firstSectionWithPosts.posts[0];
                    // Redirect to the first post
                    router.replace(`/content/${firstPost.slug}?tutorial=${tutorial.slug}&section=${firstSectionWithPosts.slug}`);
                } else {
                    setError('This tutorial has no content yet.');
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'An error occurred');
            }
        };

        resolveParams();
    }, [params, router]);

    if (error) {
        return (
            <Container py="xl">
                <Center h={400}>
                    <Stack align="center">
                        <Text size="xl" fw={700}>Oops!</Text>
                        <Text c="dimmed">{error}</Text>
                        <Button component={Link} href="/blogs" leftSection={<IconArrowLeft size={16} />} variant="subtle">
                            Back to Tutorials
                        </Button>
                    </Stack>
                </Center>
            </Container>
        );
    }

    return (
        <Container h="calc(100vh - 80px)">
            <Center h="100%">
                <Stack align="center" gap="md">
                    <MantineLoader />
                    <Text c="dimmed">Redirecting to tutorial content...</Text>
                </Stack>
            </Center>
        </Container>
    );
}

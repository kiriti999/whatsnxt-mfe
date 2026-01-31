'use client';

import { AppShell } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { TutorialSidebar } from '../StructuredTutorial/Sidebar';
import { StructuredTutorialAPI, SidebarTree } from '../../apis/v1/blog/structuredTutorialApi';
import { setSidebarCache } from '../../store/slices/tutorialSidebarSlice';

interface TutorialAppShellProps {
    children: ReactNode;
}

export default function TutorialAppShell({ children }: TutorialAppShellProps) {
    const pathname = usePathname();
    const dispatch = useDispatch();

    // Check if we're on a tutorial/post page
    const isTutorialPage = pathname?.startsWith('/content/');

    // Extract tutorial slug from pathname (e.g., /content/slug-test or /content/slug-test/post-slug)
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const tutorialSlug = pathSegments[1]; // 'content' is index 0, tutorial slug is index 1

    // Get cached sidebar data
    const sidebarCache = useSelector((state: RootState) =>
        (state as any).tutorialSidebar?.cache || {}
    );

    const [sidebarData, setSidebarData] = useState<SidebarTree | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch sidebar data when tutorial slug changes
    useEffect(() => {
        if (!isTutorialPage || !tutorialSlug) {
            setSidebarData(null);
            return;
        }

        // Check if we have cached data for any tutorial ID with this slug
        const cachedEntry = Object.values(sidebarCache).find(
            (data: any) => data?.tutorialSlug === tutorialSlug
        ) as SidebarTree | undefined;

        if (cachedEntry) {
            setSidebarData(cachedEntry);
            return;
        }

        // Fetch sidebar data
        const fetchSidebar = async () => {
            setLoading(true);
            try {
                // Try to get tutorial by slug first to get the ID
                const tutorialResponse = await StructuredTutorialAPI.getBySlug(tutorialSlug);
                if (tutorialResponse?.success && tutorialResponse.data) {
                    const tutorialId = tutorialResponse.data._id;

                    // Check cache again with the ID
                    if (sidebarCache[tutorialId]) {
                        setSidebarData(sidebarCache[tutorialId]);
                        setLoading(false);
                        return;
                    }

                    // Fetch sidebar
                    const sidebarResponse = await StructuredTutorialAPI.getSidebar(tutorialId);
                    if (sidebarResponse?.success && sidebarResponse.data) {
                        setSidebarData(sidebarResponse.data);
                        dispatch(setSidebarCache({
                            tutorialId,
                            data: sidebarResponse.data
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching sidebar:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSidebar();
    }, [tutorialSlug, isTutorialPage, sidebarCache, dispatch]);

    // Get current post slug for highlighting
    const currentPostSlug = pathSegments[2]
        ? `${tutorialSlug}-${pathSegments[2]}`
        : tutorialSlug;

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: { base: 0, sm: isTutorialPage && sidebarData ? 280 : 0 },
                breakpoint: 'sm',
            }}
            padding="md"
        >
            {isTutorialPage && sidebarData && (
                <AppShell.Navbar p="md">
                    <TutorialSidebar
                        sidebarData={sidebarData}
                        currentPostSlug={currentPostSlug}
                    />
                </AppShell.Navbar>
            )}

            <AppShell.Main>
                {children}
            </AppShell.Main>
        </AppShell>
    );
}

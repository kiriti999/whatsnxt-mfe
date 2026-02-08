'use client';

import { AppShell, ActionIcon } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconLayoutSidebarRightCollapse } from '@tabler/icons-react';
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
    const [opened, { toggle, close }] = useDisclosure(true); // Start open
    const isMobile = useMediaQuery('(max-width: 992px)'); // Match 'md' breakpoint

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
    // URL: /content/tutorial-slug/post-slug
    // Sidebar stores: just 'post-slug' (without tutorial prefix)
    const currentPostSlug = pathSegments[2] || tutorialSlug;

    // Show sidebar only if we have data and it's a tutorial page
    const showSidebar = isTutorialPage && sidebarData;

    return (
        <AppShell
            navbar={{
                width: {
                    base: 280,  // Mobile: slightly larger
                    sm: 300,    // Small screens
                    md: 320,    // Tablet and up - increased for better readability
                },
                breakpoint: 'md',  // Switch at 992px
                collapsed: { mobile: !opened || !showSidebar, desktop: !opened || !showSidebar },
            }}
            styles={{
                navbar: {
                    maxWidth: '70vw',  // Limit to 70% on very small screens
                },
                main: {
                    paddingTop: '80px', // Push content down to clear global navbar
                }
            }}
        >
            {/* Mobile: Sidebar toggle - fixed position to ensure visibility below global navbar */}
            {isMobile && isTutorialPage && !opened && (
                <ActionIcon
                    onClick={toggle}
                    size="md" // Reduced from lg to match sidebar style better
                    variant="default" // Changed to default for better visibility but less aggressive than filled
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: '16px', // Aligned with content padding
                        zIndex: 1100,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                    aria-label="Toggle sidebar"
                >
                    <IconLayoutSidebarRightCollapse size={20} />
                </ActionIcon>
            )}

            {/* Always render Navbar, AppShell handles collapsing */}
            <AppShell.Navbar p={0}>
                {showSidebar && (
                    <TutorialSidebar
                        sidebarData={sidebarData}
                        currentPostSlug={currentPostSlug}
                        onCollapse={close}
                        isMobile={isMobile}
                    />
                )}
            </AppShell.Navbar>

            <AppShell.Main>
                {/* Desktop: Floating button when collapsed */}
                {!isMobile && showSidebar && !opened && (
                    <ActionIcon
                        onClick={toggle}
                        size="md"
                        variant="default"
                        aria-label="Open sidebar"
                        style={{
                            position: 'fixed',
                            top: '90px', // Match mobile position
                            left: '16px', // Match mobile position
                            zIndex: 99,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                    >
                        <IconLayoutSidebarRightCollapse size={20} />
                    </ActionIcon>
                )}
                {children}
            </AppShell.Main>
        </AppShell>
    );
}

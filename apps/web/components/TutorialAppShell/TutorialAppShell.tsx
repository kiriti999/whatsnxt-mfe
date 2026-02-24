"use client";

import { ActionIcon, AppShell } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    type SidebarTree,
    StructuredTutorialAPI,
} from "../../apis/v1/blog/structuredTutorialApi";
import { premiumAPI } from "../../apis/v1/premium";
import { setSidebarCache, setUserAccess } from "../../store/slices/tutorialSidebarSlice";
import type { RootState } from "../../store/store";
import { TutorialSidebar } from "../StructuredTutorial/Sidebar";

interface TutorialAppShellProps {
    children: ReactNode;
}

export default function TutorialAppShell({ children }: TutorialAppShellProps) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [opened, { toggle, close }] = useDisclosure(true); // Start open
    const isMobile = useMediaQuery("(max-width: 992px)"); // Match 'md' breakpoint

    // Check if we're on a tutorial/post page
    const isTutorialPage = pathname?.startsWith("/content/");

    // Extract tutorial slug from pathname (e.g., /content/slug-test or /content/slug-test/post-slug)
    const pathSegments = pathname?.split("/").filter(Boolean) || [];
    const tutorialSlug = pathSegments[1]; // 'content' is index 0, tutorial slug is index 1

    // Get cached sidebar data
    const sidebarCache = useSelector(
        (state: RootState) => (state as any).tutorialSidebar?.cache || {},
    );

    // Get user access state from Redux
    const userAccess = useSelector(
        (state: RootState) => (state as any).tutorialSidebar?.userAccess || {},
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
            (data: any) => data?.tutorialSlug === tutorialSlug,
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
                const tutorialResponse =
                    await StructuredTutorialAPI.getBySlug(tutorialSlug);
                if (tutorialResponse?.success && tutorialResponse.data) {
                    const tutorialId = tutorialResponse.data._id;

                    // Check cache again with the ID
                    if (sidebarCache[tutorialId]) {
                        setSidebarData(sidebarCache[tutorialId]);
                        setLoading(false);
                        return;
                    }

                    // Fetch sidebar
                    const sidebarResponse =
                        await StructuredTutorialAPI.getSidebar(tutorialId);
                    if (sidebarResponse?.success && sidebarResponse.data) {
                        setSidebarData(sidebarResponse.data);
                        dispatch(
                            setSidebarCache({
                                tutorialId,
                                data: sidebarResponse.data,
                            }),
                        );
                    }
                }
            } catch (error) {
                console.error("Error fetching sidebar:", error);
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

    // Derive tutorialId from cache to look up user access
    const tutorialId = Object.keys(sidebarCache).find(
        (id) => sidebarCache[id]?.tutorialSlug === tutorialSlug,
    );
    const hasUserAccess = tutorialId ? userAccess[tutorialId] === true : false;
    const accessChecked = tutorialId ? userAccess[tutorialId] !== undefined : false;

    // Check user access when tutorialId becomes available (e.g. after sidebar loads on refresh)
    useEffect(() => {
        if (!tutorialId || hasUserAccess) return;
        let cancelled = false;
        const checkAccess = async () => {
            try {
                const response = await premiumAPI.checkAccess(tutorialId);
                if (cancelled) return;
                const granted = response?.data?.hasAccess === true;
                dispatch(setUserAccess({ tutorialId, hasAccess: granted }));
            } catch {
                if (!cancelled) dispatch(setUserAccess({ tutorialId, hasAccess: false }));
            }
        };
        checkAccess();
        return () => { cancelled = true; };
    }, [tutorialId, hasUserAccess, dispatch]);

    // Show sidebar only if we have data and it's a tutorial page
    const showSidebar = isTutorialPage && sidebarData;

    return (
        <AppShell
            navbar={{
                width: {
                    base: 280, // Mobile: slightly larger
                    sm: 300, // Small screens
                    md: 320, // Tablet and up - increased for better readability
                },
                breakpoint: "md", // Switch at 992px
                collapsed: {
                    mobile: !opened || !showSidebar,
                    desktop: !opened || !showSidebar,
                },
            }}
            styles={{
                navbar: {
                    maxWidth: "70vw", // Limit to 70% on very small screens
                },
                main: {
                    paddingTop: "80px", // Push content down to clear global navbar
                },
            }}
        >
            {/* Mobile: Sidebar toggle - fixed position to ensure visibility below global navbar */}
            {isMobile && isTutorialPage && !opened && (
                <ActionIcon
                    onClick={toggle}
                    size="md" // Reduced from lg to match sidebar style better
                    variant="default" // Changed to default for better visibility but less aggressive than filled
                    style={{
                        position: "fixed",
                        top: "80px",
                        left: "16px", // Aligned with content padding
                        zIndex: 1100,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                        hasUserAccess={hasUserAccess}
                        accessChecked={accessChecked}
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
                            position: "fixed",
                            top: "80px", // Match mobile position
                            left: "16px", // Match mobile position
                            zIndex: 99,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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

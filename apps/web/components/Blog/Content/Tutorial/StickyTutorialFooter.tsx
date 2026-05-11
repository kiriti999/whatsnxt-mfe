"use client";

import { Box, Button, Group, Tooltip, useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconCrown,
    IconHome,
} from "@tabler/icons-react";
import Link from "next/link";
import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import styles from "./StickyTutorialFooter.module.css";

interface NavItem {
    label: string;
    subLabel?: string;
    href?: string;
    onClick?: () => void;
    isLocked?: boolean;
}

interface StickyTutorialFooterProps {
    prev?: NavItem | null;
    next?: NavItem | null;
    onPurchaseClick?: () => void;
}

function useTruncatedLabel(ref: RefObject<HTMLSpanElement | null>, text: string) {
    const [truncated, setTruncated] = useState(false);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) {
            setTruncated(false);
            return;
        }

        const measure = () => {
            setTruncated(el.scrollWidth > el.clientWidth + 1);
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [text]);

    return truncated;
}

const navButtonStyles = {
    root: {
        flex: "1 1 0",
        minWidth: 0,
        maxWidth: "calc(50% - var(--mantine-spacing-xs))",
        padding: "12px 16px",
    },
    inner: {
        flex: 1,
        minWidth: 0,
    },
} as const;

function FooterNavButton({ item, isNext }: { item: NavItem; isNext: boolean }) {
    const labelRef = useRef<HTMLSpanElement>(null);
    const truncated = useTruncatedLabel(labelRef, item.label);

    const labelEl = (
        <span ref={labelRef} className={styles.navLabel}>
            {item.label}
        </span>
    );

    if (item.href) {
        const btn = (
            <Button
                size="md"
                component={Link}
                href={item.href}
                variant="default"
                leftSection={!isNext ? <IconChevronLeft size={20} /> : undefined}
                rightSection={isNext ? <IconChevronRight size={20} /> : undefined}
                styles={navButtonStyles}
            >
                {labelEl}
            </Button>
        );
        return (
            <Tooltip label={item.label} disabled={!truncated} position="top" withArrow>
                {btn}
            </Tooltip>
        );
    }

    const btn = (
        <Button
            size="md"
            onClick={item.onClick}
            variant="default"
            leftSection={!isNext ? <IconChevronLeft size={20} /> : undefined}
            rightSection={isNext ? <IconChevronRight size={20} /> : undefined}
            styles={navButtonStyles}
        >
            {labelEl}
        </Button>
    );

    return (
        <Tooltip label={item.label} disabled={!truncated} position="top" withArrow>
            {btn}
        </Tooltip>
    );
}

export const StickyTutorialFooter = ({
    prev,
    next,
    onPurchaseClick,
}: StickyTutorialFooterProps) => {
    const { colorScheme } = useMantineColorScheme();
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <Box
            pos="fixed"
            bottom={0}
            left={0}
            right={0}
            py="md"
            px="xl"
            style={{
                zIndex: 1200,
                borderTop:
                    colorScheme === "dark" ? "1px solid #373a40" : "1px solid #dee2e6",
                backgroundColor: colorScheme === "dark" ? "#1a1b1e" : "#ffffff",
            }}
        >
            <Group
                justify="space-between"
                mx="auto"
                px="md"
                wrap="nowrap"
                style={{ maxWidth: isMobile ? "100%" : "62.5%" }}
            >
                {prev ? (
                    <FooterNavButton item={prev} isNext={false} />
                ) : (
                    <Button
                        component={Link}
                        href="/"
                        variant="default"
                        leftSection={<IconHome size={20} />}
                        styles={{
                            root: {
                                padding: "12px 16px",
                            },
                        }}
                    >
                        Home
                    </Button>
                )}

                {next ? (
                    next.isLocked ? (
                        <Button
                            size="md"
                            onClick={onPurchaseClick}
                            variant="filled"
                            color="teal"
                            leftSection={<IconCrown size={18} />}
                            rightSection={<IconChevronRight size={20} />}
                            styles={{
                                root: {
                                    flex: "1 1 0",
                                    minWidth: 0,
                                    maxWidth: "calc(50% - var(--mantine-spacing-xs))",
                                    padding: "12px 16px",
                                },
                                inner: {
                                    flex: 1,
                                    minWidth: 0,
                                },
                                label: {
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                },
                            }}
                        >
                            Purchase to Continue
                        </Button>
                    ) : (
                        <FooterNavButton item={next} isNext />
                    )
                ) : (
                    <Button
                        size="md"
                        variant="filled"
                        color="cyan"
                        rightSection={<IconCheck size={20} />}
                        styles={{
                            root: {
                                padding: "12px 16px",
                                cursor: "default",
                            },
                        }}
                    >
                        The End
                    </Button>
                )}
            </Group>
        </Box>
    );
};

import { Box, Button, Group, useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconCrown,
    IconHome,
} from "@tabler/icons-react";
import Link from "next/link";

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

export const StickyTutorialFooter = ({
    prev,
    next,
    onPurchaseClick,
}: StickyTutorialFooterProps) => {
    const { colorScheme } = useMantineColorScheme();
    const isMobile = useMediaQuery("(max-width: 768px)");

    const renderButton = (item: NavItem, isNext: boolean) => {
        if (item.href) {
            return (
                <Button
                    size='md'
                    component={Link}
                    href={item.href}
                    variant="default"
                    leftSection={!isNext ? <IconChevronLeft size={20} /> : undefined}
                    rightSection={isNext ? <IconChevronRight size={20} /> : undefined}
                    styles={{
                        root: {
                            padding: "12px 16px",
                        },
                        label: {
                            maxWidth: "200px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        },
                    }}
                >
                    {item.label}
                </Button>
            );
        }

        return (
            <Button size='md'
                onClick={item.onClick}
                variant="default"
                leftSection={!isNext ? <IconChevronLeft size={20} /> : undefined}
                rightSection={isNext ? <IconChevronRight size={20} /> : undefined}
                styles={{
                    root: {
                        padding: "12px 16px",
                    },
                    label: {
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    },
                }}
            >
                {item.label}
            </Button>
        );
    };

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
                style={{ maxWidth: isMobile ? "100%" : "62.5%" }}
            >
                {prev ? (
                    renderButton(prev, false)
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
                        <Button size='md'
                            onClick={onPurchaseClick}
                            variant="filled"
                            color="teal"
                            leftSection={<IconCrown size={18} />}
                            rightSection={<IconChevronRight size={20} />}
                            styles={{
                                root: {
                                    padding: "12px 16px",
                                },
                                label: {
                                    maxWidth: "200px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                },
                            }}
                        >
                            Purchase to Continue
                        </Button>
                    ) : (
                        renderButton(next, true)
                    )
                ) : (
                    <Button size='md'
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

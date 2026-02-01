'use client';

import React, { useState } from 'react';
import { Box, Text, SimpleGrid, Paper, ThemeIcon, Popover, Button } from '@mantine/core';
import {
    IconBook2,
    IconFolder,
    IconFolders,
    IconFile,
    IconCode,
    IconDatabase,
    IconServer,
    IconCloud,
    IconLock,
    IconSettings,
    IconRocket,
    IconBulb,
    IconTarget,
    IconChartBar,
    IconUsers,
    IconMessage,
    IconHeart,
    IconHandStop,
    IconRouter,
    IconSitemap,
    IconBrandGoogleDrive,
    IconBroadcast,
    IconAspectRatio,
    IconScale,
    IconArrowsLeftRight,
    IconGitBranch,
    IconBuildingBank,
} from '@tabler/icons-react';

const ICON_OPTIONS = [
    { name: 'IconHandStop', icon: IconHandStop },
    { name: 'IconBook2', icon: IconBook2 },
    { name: 'IconBulb', icon: IconBulb },
    { name: 'IconRouter', icon: IconRouter },
    { name: 'IconSitemap', icon: IconSitemap },
    { name: 'IconBrandGoogleDrive', icon: IconBrandGoogleDrive },
    { name: 'IconBroadcast', icon: IconBroadcast },
    { name: 'IconDatabase', icon: IconDatabase },
    { name: 'IconAspectRatio', icon: IconAspectRatio },
    { name: 'IconServer', icon: IconServer },
    { name: 'IconScale', icon: IconScale },
    { name: 'IconFolders', icon: IconFolders },
    { name: 'IconArrowsLeftRight', icon: IconArrowsLeftRight },
    { name: 'IconGitBranch', icon: IconGitBranch },
    { name: 'IconBuildingBank', icon: IconBuildingBank },
    // Extras
    { name: 'IconFolder', icon: IconFolder },
    { name: 'IconFile', icon: IconFile },
    { name: 'IconCode', icon: IconCode },
    { name: 'IconCloud', icon: IconCloud },
    { name: 'IconLock', icon: IconLock },
    { name: 'IconSettings', icon: IconSettings },
    { name: 'IconRocket', icon: IconRocket },
    { name: 'IconTarget', icon: IconTarget },
    { name: 'IconChartBar', icon: IconChartBar },
    { name: 'IconUsers', icon: IconUsers },
    { name: 'IconMessage', icon: IconMessage },
    { name: 'IconHeart', icon: IconHeart },
];

interface IconPickerProps {
    label?: string;
    value: string;
    onChange: (iconName: string) => void;
}

export function IconPicker({ label, value, onChange }: IconPickerProps) {
    const [opened, setOpened] = useState(false);

    const selectedIcon = ICON_OPTIONS.find(opt => opt.name === value) || ICON_OPTIONS[0];
    const SelectedIconComponent = selectedIcon.icon;

    return (
        <Box>
            {label && <Text size="sm" fw={500} mb="xs">{label}</Text>}
            <Popover opened={opened} onChange={setOpened} position="bottom-start" withArrow>
                <Popover.Target>
                    <Button
                        variant="outline"
                        leftSection={<SelectedIconComponent size={18} />}
                        onClick={() => setOpened(!opened)}
                        styles={{
                            root: {
                                justifyContent: 'flex-start',
                                minWidth: 200,
                            }
                        }}
                    >
                        {value || 'Select Icon'}
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <SimpleGrid cols={4} spacing="xs">
                        {ICON_OPTIONS.map((opt) => {
                            const IconComponent = opt.icon;
                            return (
                                <Paper
                                    key={opt.name}
                                    p="xs"
                                    withBorder
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: value === opt.name ? 'var(--mantine-color-blue-1)' : undefined,
                                        borderColor: value === opt.name ? 'var(--mantine-color-blue-5)' : undefined,
                                    }}
                                    onClick={() => {
                                        onChange(opt.name);
                                        setOpened(false);
                                    }}
                                >
                                    <ThemeIcon variant="light" size="lg">
                                        <IconComponent size={18} />
                                    </ThemeIcon>
                                </Paper>
                            );
                        })}
                    </SimpleGrid>
                </Popover.Dropdown>
            </Popover>
        </Box>
    );
}

export default IconPicker;

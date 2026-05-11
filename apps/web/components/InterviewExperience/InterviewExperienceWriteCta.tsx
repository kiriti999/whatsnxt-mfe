"use client";

import { Button } from "@mantine/core";
import { IconPencilPlus } from "@tabler/icons-react";
import Link from "next/link";

export function InterviewExperienceWriteCta() {
    return (
        <Button
            component={Link}
            href="/form/interview-experience"
            prefetch
            variant="gradient"
            gradient={{ from: "cyan", to: "blue", deg: 105 }}
            leftSection={<IconPencilPlus size={18} />}
        >
            Share your interview story
        </Button>
    );
}

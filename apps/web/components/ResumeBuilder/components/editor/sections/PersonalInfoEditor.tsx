"use client";

import { TextInput, Textarea, SimpleGrid, Stack, Title } from "@mantine/core";
import { useResumeStore } from "../../../store";

export function PersonalInfoEditor() {
    const { resume, updatePersonalInfo } = useResumeStore();
    const { personalInfo } = resume;

    return (
        <Stack gap="md">
            <Title order={4}>Personal Information</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                    label="Full Name"
                    placeholder="John Doe"
                    value={personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo({ fullName: e.currentTarget.value })}
                />
                <TextInput
                    label="Job Title"
                    placeholder="Senior Software Engineer"
                    value={personalInfo.jobTitle}
                    onChange={(e) => updatePersonalInfo({ jobTitle: e.currentTarget.value })}
                />
                <TextInput
                    label="Email"
                    placeholder="john@example.com"
                    value={personalInfo.email}
                    onChange={(e) => updatePersonalInfo({ email: e.currentTarget.value })}
                />
                <TextInput
                    label="Phone"
                    placeholder="+1 (555) 000-0000"
                    value={personalInfo.phone}
                    onChange={(e) => updatePersonalInfo({ phone: e.currentTarget.value })}
                />
                <TextInput
                    label="Location"
                    placeholder="San Francisco, CA"
                    value={personalInfo.location}
                    onChange={(e) => updatePersonalInfo({ location: e.currentTarget.value })}
                />
                <TextInput
                    label="Website"
                    placeholder="https://johndoe.com"
                    value={personalInfo.website}
                    onChange={(e) => updatePersonalInfo({ website: e.currentTarget.value })}
                />
                <TextInput
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo({ linkedin: e.currentTarget.value })}
                />
                <TextInput
                    label="GitHub"
                    placeholder="https://github.com/johndoe"
                    value={personalInfo.github}
                    onChange={(e) => updatePersonalInfo({ github: e.currentTarget.value })}
                />
            </SimpleGrid>
            <Textarea
                label="Professional Summary"
                placeholder="A brief overview of your professional background and goals..."
                minRows={4}
                autosize
                value={personalInfo.summary}
                onChange={(e) => updatePersonalInfo({ summary: e.currentTarget.value })}
            />
        </Stack>
    );
}

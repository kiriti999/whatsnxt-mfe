"use client";

import {
    Button,
    Container,
    Group,
    Paper,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    ThemeIcon,
    TagsInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconMessages, IconHistory } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
    InterviewExperienceAPI,
    type InterviewExperience,
} from "../../apis/v1/interviewExperience";

export function InterviewExperienceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("id");

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyLogoUrl, setCompanyLogoUrl] = useState("");
    const [role, setRole] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [relatedCourseSlugs, setRelatedCourseSlugs] = useState<string[]>([]);
    const [body, setBody] = useState("");
    const [status, setStatus] = useState<string | null>("draft");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const load = useCallback(async (id: string) => {
        try {
            const res = await InterviewExperienceAPI.getById(id);
            const doc = res.data as InterviewExperience;
            setTitle(doc.title);
            setSlug(doc.slug);
            setCompanyName(doc.companyName);
            setCompanyLogoUrl(doc.companyLogoUrl || "");
            setRole(doc.role || "");
            setTags(doc.tags || []);
            setRelatedCourseSlugs(doc.relatedCourseSlugs || []);
            setBody(doc.body || "");
            setStatus(doc.status);
        } catch {
            notifications.show({
                color: "red",
                title: "Error",
                message: "Failed to load interview experience",
            });
        }
    }, []);

    useEffect(() => {
        if (editId) void load(editId);
    }, [editId, load]);

    const handleSave = useCallback(async () => {
        if (!title.trim() || !companyName.trim()) {
            notifications.show({
                color: "orange",
                title: "Missing fields",
                message: "Title and company name are required",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            if (editId) {
                await InterviewExperienceAPI.update(editId, {
                    title: title.trim(),
                    companyName: companyName.trim(),
                    companyLogoUrl: companyLogoUrl.trim(),
                    role: role.trim(),
                    tags,
                    relatedCourseSlugs,
                    body,
                    status: status || "draft",
                });
                notifications.show({ color: "green", title: "Saved", message: "Updated successfully" });
            } else {
                await InterviewExperienceAPI.create({
                    title: title.trim(),
                    slug: slug.trim() || undefined,
                    companyName: companyName.trim(),
                    companyLogoUrl: companyLogoUrl.trim(),
                    role: role.trim(),
                    tags,
                    relatedCourseSlugs,
                    body,
                    status: status || "draft",
                });
                notifications.show({ color: "green", title: "Saved", message: "Created successfully" });
            }
            router.push("/history/table");
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (e as Error)?.message ||
                "Save failed";
            notifications.show({ color: "red", title: "Error", message: msg });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        title,
        companyName,
        companyLogoUrl,
        role,
        tags,
        relatedCourseSlugs,
        body,
        status,
        editId,
        slug,
        router,
    ]);

    return (
        <Container size="md" py="xl">
            <Stack gap="lg">
                <Group>
                    <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: "indigo", to: "cyan" }}>
                        <IconMessages size={20} />
                    </ThemeIcon>
                    <div>
                        <Title order={2}>Interview experience</Title>
                        <Text size="sm" c="dimmed">
                            FAANG-style write-ups with tags and links to related system design courses.
                        </Text>
                    </div>
                </Group>
                <Button component={Link} href="/history/table" variant="light" leftSection={<IconHistory size={16} />}>
                    View history
                </Button>

                <Paper withBorder p="lg" radius="md">
                    <Stack gap="md">
                        <TextInput label="Title" required value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
                        {!editId && (
                            <TextInput
                                label="Custom slug (optional)"
                                description="Leave blank to auto-generate from title"
                                value={slug}
                                onChange={(e) => setSlug(e.currentTarget.value)}
                            />
                        )}
                        {editId && <TextInput label="Slug" value={slug} readOnly />}
                        <TextInput label="Company" required value={companyName} onChange={(e) => setCompanyName(e.currentTarget.value)} />
                        <TextInput
                            label="Company logo URL"
                            value={companyLogoUrl}
                            onChange={(e) => setCompanyLogoUrl(e.currentTarget.value)}
                        />
                        <TextInput label="Role / level" placeholder="SDE-2" value={role} onChange={(e) => setRole(e.currentTarget.value)} />
                        <TagsInput label="Tags" placeholder="System Design, Coding, Behavioral" value={tags} onChange={setTags} />
                        <TagsInput
                            label="Related system design slugs"
                            placeholder="design-url-shortener"
                            value={relatedCourseSlugs}
                            onChange={setRelatedCourseSlugs}
                        />
                        <Select
                            label="Status"
                            data={[
                                { value: "draft", label: "Draft" },
                                { value: "published", label: "Published" },
                            ]}
                            value={status}
                            onChange={setStatus}
                        />
                        <Textarea
                            label="Body"
                            description="Plain text or light HTML; shown on the public detail page."
                            minRows={12}
                            value={body}
                            onChange={(e) => setBody(e.currentTarget.value)}
                        />
                        <Group justify="flex-end">
                            <Button loading={isSubmitting} onClick={() => void handleSave()}>
                                {editId ? "Update" : "Create"}
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}

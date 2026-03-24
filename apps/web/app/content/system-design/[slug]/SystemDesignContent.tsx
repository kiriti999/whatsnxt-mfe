"use client";

import {
    Badge,
    Box,
    Container,
    Divider,
    Group,
    Paper,
    Stack,
    Tabs,
    Text,
    Title,
} from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";
import { LexicalEditor } from "../../../../components/StructuredTutorial/Editor/LexicalEditor";
import { ApiDesignEditor } from "../../../../components/SystemDesign/ApiDesignEditor";
import { MermaidDiagram } from "../../../../components/SystemDesign/MermaidDiagram";
import classes from "./SystemDesignContent.module.css";

interface Section {
    key: string;
    title: string;
    content: string;
    sortOrder: number;
}

interface Diagram {
    key: string;
    title: string;
    content: string;
    sortOrder: number;
}

interface SystemDesignCourse {
    _id: string;
    title: string;
    slug: string;
    category: string;
    sections: Section[];
    diagrams: Diagram[];
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface SystemDesignContentProps {
    course: SystemDesignCourse;
}

const SystemDesignContent = ({ course }: SystemDesignContentProps) => {
    const sectionsWithContent = course.sections.filter((s) => s.content?.trim());
    const diagramsWithContent = course.diagrams.filter((d) => d.content?.trim());

    return (
        <Container size="xl" py="xl">
            <Paper radius="md" p="xl" className={classes.paper}>
                <Stack gap="xs" mb="xl" align="center">
                    <Group gap={6}>
                        <IconServer2 size={16} color="var(--mantine-color-blue-6)" />
                        <Text size="xs" fw={700} tt="uppercase" c="blue" className={classes.label}>
                            System Design
                        </Text>
                    </Group>
                    <Title order={2} ta="center" className={classes.title}>
                        {course.title}
                    </Title>
                    <Group gap="sm">
                        <Badge variant="light" color="blue">
                            {course.category}
                        </Badge>
                        <Badge variant="light" color="gray">
                            {sectionsWithContent.length} sections
                        </Badge>
                        <Badge variant="light" color="gray">
                            {diagramsWithContent.length} diagrams
                        </Badge>
                    </Group>
                </Stack>

                {sectionsWithContent.length > 0 && (
                    <>
                        <Divider label="Content Sections" labelPosition="center" mb="md" />
                        <Stack gap="lg">
                            {sectionsWithContent.map((section) => (
                                <Box key={section.key} className={classes.section}>
                                    <Text size="sm" fw={600} mb="xs" className={classes.sectionTitle}>
                                        {section.title}
                                    </Text>
                                    {section.key === "api-design" ? (
                                        <ApiDesignEditor
                                            value={section.content}
                                            onChange={() => { }}
                                            readOnly
                                        />
                                    ) : (
                                        <LexicalEditor
                                            value={section.content}
                                            onChange={() => { }}
                                            readOnly
                                        />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </>
                )}

                {diagramsWithContent.length > 0 && (
                    <>
                        <Divider label="Diagrams" labelPosition="center" my="md" />
                        <Tabs defaultValue={diagramsWithContent[0]?.key}>
                            <Tabs.List>
                                {diagramsWithContent.map((d) => (
                                    <Tabs.Tab key={d.key} value={d.key}>
                                        {d.title}
                                    </Tabs.Tab>
                                ))}
                            </Tabs.List>
                            {diagramsWithContent.map((d) => (
                                <Tabs.Panel key={d.key} value={d.key} pt="md">
                                    <Box className={classes.diagramPanel}>
                                        <MermaidDiagram code={d.content} />
                                    </Box>
                                </Tabs.Panel>
                            ))}
                        </Tabs>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default SystemDesignContent;

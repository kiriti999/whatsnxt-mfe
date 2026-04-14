"use client";

import { Flex, ActionIcon, Menu, TextInput, Group, ScrollArea, Button } from "@mantine/core";
import {
    IconDownload,
    IconFileTypePdf,
    IconSettings,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import { useResumeStore } from "../../store";
import { exportToPdf } from "../../utils/exportPdf";
import { PersonalInfoEditor } from "./sections/PersonalInfoEditor";
import { ExperienceEditor } from "./sections/ExperienceEditor";
import { EducationEditor } from "./sections/EducationEditor";
import { SkillsEditor } from "./sections/SkillsEditor";
import { ProjectsEditor } from "./sections/ProjectsEditor";
import { CertificationsEditor } from "./sections/CertificationsEditor";
import { LanguagesEditor } from "./sections/LanguagesEditor";
import { SectionOrderPanel } from "./SectionOrderPanel";
import { TemplateSelector } from "./TemplateSelector";
import classes from "./EditorPanel.module.css";
import { useState } from "react";

export function EditorPanel() {
    const { resume, activeSection, setActiveSection, setResumeTitle, resetResume } =
        useResumeStore();
    const [showSettings, setShowSettings] = useState(false);

    const visibleSections = resume.sectionOrder.filter((s) => s.visible);

    return (
        <>
            <div className={classes.editorHeader}>
                <Flex justify="space-between" align="center">
                    <TextInput
                        variant="unstyled"
                        value={resume.title}
                        onChange={(e) => setResumeTitle(e.currentTarget.value)}
                        fw={700}
                        size="lg"
                        styles={{ input: { fontSize: 20, fontWeight: 700 } }}
                    />
                    <Group gap="xs">
                        <Button
                            leftSection={<IconFileTypePdf size={16} />}
                            variant="filled"
                            size="xs"
                            onClick={exportToPdf}
                        >
                            Download PDF
                        </Button>
                        <ActionIcon
                            variant="subtle"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Settings"
                        >
                            <IconSettings size={20} />
                        </ActionIcon>
                        <Menu shadow="md">
                            <Menu.Target>
                                <ActionIcon variant="subtle" title="More options">
                                    <IconPlus size={20} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconDownload size={16} />}
                                    onClick={() => {
                                        const blob = new Blob(
                                            [JSON.stringify(resume, null, 2)],
                                            { type: "application/json" },
                                        );
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `${resume.title || "resume"}.json`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                >
                                    Export JSON
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    onClick={resetResume}
                                >
                                    Reset Resume
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Flex>
            </div>

            {showSettings && (
                <>
                    <TemplateSelector />
                    <SectionOrderPanel />
                </>
            )}

            <div className={classes.sectionNav}>
                <ScrollArea type="never">
                    <Flex gap="xs">
                        {visibleSections.map((section) => (
                            <div
                                key={section.id}
                                className={`${classes.sectionNavItem} ${activeSection === section.id ? classes.sectionNavItemActive : ""
                                    }`}
                                onClick={() => setActiveSection(section.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") setActiveSection(section.id);
                                }}
                                role="tab"
                                tabIndex={0}
                                aria-selected={activeSection === section.id}
                            >
                                {section.title}
                            </div>
                        ))}
                    </Flex>
                </ScrollArea>
            </div>

            <div className={classes.sectionContent}>
                <ActiveSectionEditor sectionId={activeSection} />
            </div>
        </>
    );
}

function ActiveSectionEditor({ sectionId }: { sectionId: string }) {
    const { resume } = useResumeStore();
    const section = resume.sectionOrder.find((s) => s.id === sectionId);
    if (!section) return null;

    switch (section.type) {
        case "personal-info":
            return <PersonalInfoEditor />;
        case "experience":
            return <ExperienceEditor />;
        case "education":
            return <EducationEditor />;
        case "skills":
            return <SkillsEditor />;
        case "projects":
            return <ProjectsEditor />;
        case "certifications":
            return <CertificationsEditor />;
        case "languages":
            return <LanguagesEditor />;
        default:
            return null;
    }
}

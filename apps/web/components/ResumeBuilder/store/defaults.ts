import type { ResumeData, SectionConfig } from "../types";

const DEFAULT_SECTION_ORDER: SectionConfig[] = [
    { id: "sec-personal", type: "personal-info", title: "Personal Info", visible: true },
    { id: "sec-experience", type: "experience", title: "Experience", visible: true },
    { id: "sec-education", type: "education", title: "Education", visible: true },
    { id: "sec-skills", type: "skills", title: "Skills", visible: true },
    { id: "sec-projects", type: "projects", title: "Projects", visible: true },
    { id: "sec-certifications", type: "certifications", title: "Certifications", visible: false },
    { id: "sec-languages", type: "languages", title: "Languages", visible: false },
];

export function createDefaultResume(): ResumeData {
    return {
        id: crypto.randomUUID(),
        title: "Untitled Resume",
        templateId: "classic",
        personalInfo: {
            fullName: "",
            jobTitle: "",
            email: "",
            phone: "",
            location: "",
            website: "",
            linkedin: "",
            github: "",
            summary: "",
            avatarUrl: "",
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        languages: [],
        customSections: [],
        sectionOrder: DEFAULT_SECTION_ORDER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

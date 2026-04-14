export interface PersonalInfo {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
    avatarUrl: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    field: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
    description: string;
}

export interface SkillCategory {
    id: string;
    name: string;
    skills: string[];
}

export interface ProjectItem {
    id: string;
    name: string;
    url: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    credentialUrl: string;
}

export interface LanguageItem {
    id: string;
    name: string;
    proficiency: LanguageProficiency;
}

export type LanguageProficiency =
    | "native"
    | "fluent"
    | "advanced"
    | "intermediate"
    | "beginner";

export interface CustomSectionItem {
    id: string;
    title: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface CustomSection {
    id: string;
    title: string;
    items: CustomSectionItem[];
}

export type SectionType =
    | "personal-info"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
    | "languages"
    | "custom";

export interface SectionConfig {
    id: string;
    type: SectionType;
    title: string;
    visible: boolean;
    customSectionId?: string;
}

export interface ResumeData {
    id: string;
    title: string;
    templateId: string;
    personalInfo: PersonalInfo;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillCategory[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    customSections: CustomSection[];
    sectionOrder: SectionConfig[];
    createdAt: string;
    updatedAt: string;
}

export interface CoverLetterData {
    id: string;
    resumeId: string;
    recipientName: string;
    recipientTitle: string;
    companyName: string;
    companyAddress: string;
    greeting: string;
    body: string;
    closing: string;
    createdAt: string;
    updatedAt: string;
}

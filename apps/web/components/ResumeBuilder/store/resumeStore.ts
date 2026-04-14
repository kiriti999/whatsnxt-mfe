import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
    CoverLetterData,
    ExperienceItem,
    EducationItem,
    SkillCategory,
    ProjectItem,
    CertificationItem,
    LanguageItem,
    CustomSection,
    PersonalInfo,
    ResumeData,
    SectionConfig,
} from "../types";
import { createDefaultResume } from "./defaults";

interface ResumeStore {
    resume: ResumeData;
    coverLetter: CoverLetterData | null;
    activeSection: string;

    setActiveSection: (sectionId: string) => void;
    updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
    setTemplateId: (templateId: string) => void;
    setResumeTitle: (title: string) => void;

    addExperience: (item: ExperienceItem) => void;
    updateExperience: (id: string, item: Partial<ExperienceItem>) => void;
    removeExperience: (id: string) => void;

    addEducation: (item: EducationItem) => void;
    updateEducation: (id: string, item: Partial<EducationItem>) => void;
    removeEducation: (id: string) => void;

    addSkillCategory: (category: SkillCategory) => void;
    updateSkillCategory: (id: string, category: Partial<SkillCategory>) => void;
    removeSkillCategory: (id: string) => void;

    addProject: (item: ProjectItem) => void;
    updateProject: (id: string, item: Partial<ProjectItem>) => void;
    removeProject: (id: string) => void;

    addCertification: (item: CertificationItem) => void;
    updateCertification: (id: string, item: Partial<CertificationItem>) => void;
    removeCertification: (id: string) => void;

    addLanguage: (item: LanguageItem) => void;
    updateLanguage: (id: string, item: Partial<LanguageItem>) => void;
    removeLanguage: (id: string) => void;

    addCustomSection: (section: CustomSection) => void;
    removeCustomSection: (id: string) => void;

    updateSectionOrder: (order: SectionConfig[]) => void;
    toggleSectionVisibility: (sectionId: string) => void;

    setCoverLetter: (data: CoverLetterData | null) => void;
    updateCoverLetter: (data: Partial<CoverLetterData>) => void;

    resetResume: () => void;
    loadResume: (data: ResumeData) => void;
}

function updateArray<T extends { id: string }>(
    arr: T[],
    id: string,
    patch: Partial<T>,
): T[] {
    return arr.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeFromArray<T extends { id: string }>(arr: T[], id: string): T[] {
    return arr.filter((item) => item.id !== id);
}

function withTimestamp(resume: ResumeData): ResumeData {
    return { ...resume, updatedAt: new Date().toISOString() };
}

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set) => ({
            resume: createDefaultResume(),
            coverLetter: null,
            activeSection: "sec-personal",

            setActiveSection: (sectionId) => set({ activeSection: sectionId }),

            updatePersonalInfo: (info) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        personalInfo: { ...s.resume.personalInfo, ...info },
                    }),
                })),

            setTemplateId: (templateId) =>
                set((s) => ({
                    resume: withTimestamp({ ...s.resume, templateId }),
                })),

            setResumeTitle: (title) =>
                set((s) => ({
                    resume: withTimestamp({ ...s.resume, title }),
                })),

            addExperience: (item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        experience: [...s.resume.experience, item],
                    }),
                })),
            updateExperience: (id, item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        experience: updateArray(s.resume.experience, id, item),
                    }),
                })),
            removeExperience: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        experience: removeFromArray(s.resume.experience, id),
                    }),
                })),

            addEducation: (item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        education: [...s.resume.education, item],
                    }),
                })),
            updateEducation: (id, item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        education: updateArray(s.resume.education, id, item),
                    }),
                })),
            removeEducation: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        education: removeFromArray(s.resume.education, id),
                    }),
                })),

            addSkillCategory: (category) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        skills: [...s.resume.skills, category],
                    }),
                })),
            updateSkillCategory: (id, category) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        skills: updateArray(s.resume.skills, id, category),
                    }),
                })),
            removeSkillCategory: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        skills: removeFromArray(s.resume.skills, id),
                    }),
                })),

            addProject: (item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        projects: [...s.resume.projects, item],
                    }),
                })),
            updateProject: (id, item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        projects: updateArray(s.resume.projects, id, item),
                    }),
                })),
            removeProject: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        projects: removeFromArray(s.resume.projects, id),
                    }),
                })),

            addCertification: (item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        certifications: [...s.resume.certifications, item],
                    }),
                })),
            updateCertification: (id, item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        certifications: updateArray(s.resume.certifications, id, item),
                    }),
                })),
            removeCertification: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        certifications: removeFromArray(s.resume.certifications, id),
                    }),
                })),

            addLanguage: (item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        languages: [...s.resume.languages, item],
                    }),
                })),
            updateLanguage: (id, item) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        languages: updateArray(s.resume.languages, id, item),
                    }),
                })),
            removeLanguage: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        languages: removeFromArray(s.resume.languages, id),
                    }),
                })),

            addCustomSection: (section) =>
                set((s) => {
                    const sectionConfig: SectionConfig = {
                        id: `sec-custom-${section.id}`,
                        type: "custom",
                        title: section.title,
                        visible: true,
                        customSectionId: section.id,
                    };
                    return {
                        resume: withTimestamp({
                            ...s.resume,
                            customSections: [...s.resume.customSections, section],
                            sectionOrder: [...s.resume.sectionOrder, sectionConfig],
                        }),
                    };
                }),
            removeCustomSection: (id) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        customSections: removeFromArray(s.resume.customSections, id),
                        sectionOrder: s.resume.sectionOrder.filter(
                            (sec) => sec.customSectionId !== id,
                        ),
                    }),
                })),

            updateSectionOrder: (order) =>
                set((s) => ({
                    resume: withTimestamp({ ...s.resume, sectionOrder: order }),
                })),

            toggleSectionVisibility: (sectionId) =>
                set((s) => ({
                    resume: withTimestamp({
                        ...s.resume,
                        sectionOrder: s.resume.sectionOrder.map((sec) =>
                            sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec,
                        ),
                    }),
                })),

            setCoverLetter: (data) => set({ coverLetter: data }),
            updateCoverLetter: (data) =>
                set((s) => ({
                    coverLetter: s.coverLetter
                        ? { ...s.coverLetter, ...data, updatedAt: new Date().toISOString() }
                        : null,
                })),

            resetResume: () =>
                set({ resume: createDefaultResume(), coverLetter: null }),

            loadResume: (data) => set({ resume: data }),
        }),
        { name: "whatsnxt-resume-storage" },
    ),
);

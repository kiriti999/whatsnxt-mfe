"use client";

import type { ResumeData } from "../../../types";
import classes from "../PreviewPanel.module.css";

interface TemplateProps {
    resume: ResumeData;
}

export function ClassicTemplate({ resume }: TemplateProps) {
    const { personalInfo, sectionOrder } = resume;
    const visibleSections = sectionOrder.filter((s) => s.visible && s.type !== "personal-info");

    return (
        <>
            <PersonalInfoHeader personalInfo={personalInfo} />
            {visibleSections.map((section) => (
                <SectionRenderer key={section.id} section={section} resume={resume} />
            ))}
        </>
    );
}

function PersonalInfoHeader({ personalInfo }: { personalInfo: ResumeData["personalInfo"] }) {
    const { fullName, jobTitle, email, phone, location, website, linkedin, github, summary } =
        personalInfo;

    const hasContent = fullName || jobTitle || email;
    if (!hasContent) {
        return (
            <div className={classes.headerSection} data-breakable>
                <div className={classes.fullName}>Your Name</div>
                <div className={classes.jobTitle}>Job Title</div>
            </div>
        );
    }

    const contactItems = [email, phone, location, website, linkedin, github].filter(Boolean);

    return (
        <div className={classes.headerSection} data-breakable>
            {fullName && <div className={classes.fullName}>{fullName}</div>}
            {jobTitle && <div className={classes.jobTitle}>{jobTitle}</div>}
            {contactItems.length > 0 && (
                <div className={classes.contactRow}>
                    {contactItems.map((item) => (
                        <span key={item} className={classes.contactItem}>
                            {item}
                        </span>
                    ))}
                </div>
            )}
            {summary && <div className={classes.summary}>{summary}</div>}
        </div>
    );
}

function SectionRenderer({
    section,
    resume,
}: {
    section: ResumeData["sectionOrder"][number];
    resume: ResumeData;
}) {
    switch (section.type) {
        case "experience":
            return <ExperienceSection resume={resume} />;
        case "education":
            return <EducationSection resume={resume} />;
        case "skills":
            return <SkillsSection resume={resume} />;
        case "projects":
            return <ProjectsSection resume={resume} />;
        case "certifications":
            return <CertificationsSection resume={resume} />;
        case "languages":
            return <LanguagesSection resume={resume} />;
        default:
            return null;
    }
}

function ExperienceSection({ resume }: { resume: ResumeData }) {
    if (resume.experience.length === 0) return null;
    const [first, ...rest] = resume.experience;
    return (
        <div className={classes.sectionBlock}>
            <div data-breakable>
                <div className={classes.sectionTitle}>Experience</div>
                <ExperienceItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <ExperienceItem item={item} />
                </div>
            ))}
        </div>
    );
}

function ExperienceItem({ item }: { item: ResumeData["experience"][number] }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div className={classes.itemHeader}>
                <div>
                    <span className={classes.itemTitle}>{item.position}</span>
                    {item.company && (
                        <span className={classes.itemSubtitle}> — {item.company}</span>
                    )}
                </div>
                <span className={classes.itemDate}>
                    {item.startDate}
                    {(item.endDate || item.current) &&
                        ` — ${item.current ? "Present" : item.endDate}`}
                </span>
            </div>
            {item.location && (
                <div style={{ fontSize: 12, color: "#777" }}>{item.location}</div>
            )}
            {item.description && (
                <div className={classes.itemDescription}>{item.description}</div>
            )}
        </div>
    );
}

function EducationSection({ resume }: { resume: ResumeData }) {
    if (resume.education.length === 0) return null;
    const [first, ...rest] = resume.education;
    return (
        <div className={classes.sectionBlock}>
            <div data-breakable>
                <div className={classes.sectionTitle}>Education</div>
                <EducationItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <EducationItem item={item} />
                </div>
            ))}
        </div>
    );
}

function EducationItem({ item }: { item: ResumeData["education"][number] }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div className={classes.itemHeader}>
                <div>
                    <span className={classes.itemTitle}>{item.degree}</span>
                    {item.field && (
                        <span className={classes.itemSubtitle}> in {item.field}</span>
                    )}
                </div>
                <span className={classes.itemDate}>
                    {item.startDate}
                    {item.endDate && ` — ${item.endDate}`}
                </span>
            </div>
            <div className={classes.itemSubtitle}>
                {item.institution}
                {item.gpa && ` | GPA: ${item.gpa}`}
            </div>
            {item.description && (
                <div className={classes.itemDescription}>{item.description}</div>
            )}
        </div>
    );
}

function SkillsSection({ resume }: { resume: ResumeData }) {
    if (resume.skills.length === 0) return null;
    return (
        <div className={classes.sectionBlock} data-breakable>
            <div className={classes.sectionTitle}>Skills</div>
            {resume.skills.map((category) => (
                <div key={category.id} className={classes.skillRow}>
                    <span className={classes.skillCategory}>{category.name}: </span>
                    <span className={classes.skillList}>{category.skills.join(", ")}</span>
                </div>
            ))}
        </div>
    );
}

function ProjectsSection({ resume }: { resume: ResumeData }) {
    if (resume.projects.length === 0) return null;
    const [first, ...rest] = resume.projects;
    return (
        <div className={classes.sectionBlock}>
            <div data-breakable>
                <div className={classes.sectionTitle}>Projects</div>
                <ProjectItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <ProjectItem item={item} />
                </div>
            ))}
        </div>
    );
}

function ProjectItem({ item }: { item: ResumeData["projects"][number] }) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div className={classes.itemHeader}>
                <div>
                    <span className={classes.itemTitle}>{item.name}</span>
                    {item.url && (
                        <>
                            {" "}
                            <a
                                href={item.url}
                                className={classes.projectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ↗
                            </a>
                        </>
                    )}
                </div>
                <span className={classes.itemDate}>
                    {item.startDate}
                    {(item.endDate || item.current) &&
                        ` — ${item.current ? "Present" : item.endDate}`}
                </span>
            </div>
            {item.description && (
                <div className={classes.itemDescription}>{item.description}</div>
            )}
            {item.technologies.length > 0 && (
                <div className={classes.techTags}>
                    {item.technologies.map((tech) => (
                        <span key={tech} className={classes.techTag}>
                            {tech}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function CertificationsSection({ resume }: { resume: ResumeData }) {
    if (resume.certifications.length === 0) return null;
    const [first, ...rest] = resume.certifications;
    return (
        <div className={classes.sectionBlock}>
            <div data-breakable>
                <div className={classes.sectionTitle}>Certifications</div>
                <CertificationItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <CertificationItem item={item} />
                </div>
            ))}
        </div>
    );
}

function CertificationItem({ item }: { item: ResumeData["certifications"][number] }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <div className={classes.itemHeader}>
                <span className={classes.itemTitle}>{item.name}</span>
                <span className={classes.itemDate}>
                    {item.issueDate}
                    {item.expiryDate && ` — ${item.expiryDate}`}
                </span>
            </div>
            <div className={classes.itemSubtitle}>
                {item.issuer}
                {item.credentialId && ` | ID: ${item.credentialId}`}
            </div>
        </div>
    );
}

function LanguagesSection({ resume }: { resume: ResumeData }) {
    if (resume.languages.length === 0) return null;
    return (
        <div className={classes.sectionBlock} data-breakable>
            <div className={classes.sectionTitle}>Languages</div>
            <div className={classes.languageRow}>
                {resume.languages.map((item) => (
                    <div key={item.id} className={classes.languageItem}>
                        <span className={classes.languageName}>{item.name}</span>{" "}
                        <span className={classes.languageLevel}>({item.proficiency})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

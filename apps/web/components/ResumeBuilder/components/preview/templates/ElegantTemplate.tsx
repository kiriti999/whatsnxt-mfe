"use client";

import type { ResumeData } from "../../../types";
import classes from "../PreviewPanel.module.css";

interface TemplateProps {
    resume: ResumeData;
}

const PROFICIENCY_LEVELS: Record<string, number> = {
    native: 5,
    fluent: 5,
    advanced: 4,
    intermediate: 3,
    beginner: 2,
};

export function ElegantTemplate({ resume }: TemplateProps) {
    return (
        <div className={classes.elegantLayout}>
            <div className={classes.elegantMain}>
                <ElegantHeader resume={resume} />
                <ElegantMainSections resume={resume} />
            </div>
            <div className={classes.elegantSidebar}>
                <ElegantSidebarContent resume={resume} />
            </div>
        </div>
    );
}

/* ---- Header (main column) ---- */
function ElegantHeader({ resume }: { resume: ResumeData }) {
    const { fullName, jobTitle, email, phone, location, linkedin } = resume.personalInfo;

    const contacts: { icon: string; value: string }[] = [];
    if (phone) contacts.push({ icon: "✆", value: phone });
    if (email) contacts.push({ icon: "@", value: email });
    if (linkedin) contacts.push({ icon: "🔗", value: linkedin });
    if (location) contacts.push({ icon: "◉", value: location });

    return (
        <div className={classes.elegantHeader} data-breakable>
            {fullName && <div className={classes.elegantName}>{fullName}</div>}
            {jobTitle && <div className={classes.elegantTitle}>{jobTitle}</div>}
            {contacts.length > 0 && (
                <div className={classes.elegantContact}>
                    {contacts.map((c) => (
                        <span key={c.value}>
                            <span className={classes.elegantContactIcon}>{c.icon}</span>
                            {c.value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---- Main column sections ---- */
function ElegantMainSections({ resume }: { resume: ResumeData }) {
    const { summary } = resume.personalInfo;
    const mainSections = resume.sectionOrder.filter(
        (s) => s.visible && !["personal-info", "skills", "certifications"].includes(s.type),
    );

    return (
        <>
            {summary && (
                <div data-breakable>
                    <div className={classes.elegantSectionTitle}>Summary</div>
                    <div className={classes.elegantSummary}>{summary}</div>
                </div>
            )}
            {mainSections.map((section) => (
                <ElegantMainSection key={section.id} section={section} resume={resume} />
            ))}
        </>
    );
}

function ElegantMainSection({
    section,
    resume,
}: {
    section: ResumeData["sectionOrder"][number];
    resume: ResumeData;
}) {
    switch (section.type) {
        case "experience":
            return <ElegantExperience resume={resume} />;
        case "education":
            return <ElegantEducation resume={resume} />;
        case "projects":
            return <ElegantProjects resume={resume} />;
        case "languages":
            return <ElegantLanguages resume={resume} />;
        default:
            return null;
    }
}

/* ---- Experience ---- */
function ElegantExperience({ resume }: { resume: ResumeData }) {
    if (resume.experience.length === 0) return null;
    const [first, ...rest] = resume.experience;
    return (
        <>
            <div data-breakable>
                <div className={classes.elegantSectionTitle}>Experience</div>
                <ElegantExpItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <ElegantExpItem item={item} />
                </div>
            ))}
        </>
    );
}

function ElegantExpItem({ item }: { item: ResumeData["experience"][number] }) {
    const dateStr = `${item.startDate}${item.endDate || item.current ? ` - ${item.current ? "Present" : item.endDate}` : ""}`;
    return (
        <div className={classes.elegantExpItem}>
            <div className={classes.elegantExpHeader}>
                <span className={classes.elegantExpRole}>{item.position}</span>
                <span className={classes.elegantExpDate}>{dateStr}</span>
            </div>
            <div>
                <span className={classes.elegantExpCompany}>{item.company}</span>
                {item.location && (
                    <span className={classes.elegantExpLocation}>{item.location}</span>
                )}
            </div>
            {item.description && (
                <div className={classes.elegantExpDesc}>{item.description}</div>
            )}
        </div>
    );
}

/* ---- Education ---- */
function ElegantEducation({ resume }: { resume: ResumeData }) {
    if (resume.education.length === 0) return null;
    const [first, ...rest] = resume.education;
    return (
        <>
            <div data-breakable>
                <div className={classes.elegantSectionTitle}>Education</div>
                <ElegantEduItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <ElegantEduItem item={item} />
                </div>
            ))}
        </>
    );
}

function ElegantEduItem({ item }: { item: ResumeData["education"][number] }) {
    const dateStr = `${item.startDate}${item.endDate ? ` - ${item.endDate}` : ""}`;
    return (
        <div className={classes.elegantEduItem}>
            <div className={classes.elegantExpHeader}>
                <span className={classes.elegantEduDegree}>
                    {item.degree}
                    {item.field && ` in ${item.field}`}
                </span>
                <span className={classes.elegantExpDate}>{dateStr}</span>
            </div>
            <div>
                <span className={classes.elegantEduSchool}>{item.institution}</span>
                {item.location && (
                    <span className={classes.elegantExpLocation}>{item.location}</span>
                )}
            </div>
        </div>
    );
}

/* ---- Projects ---- */
function ElegantProjects({ resume }: { resume: ResumeData }) {
    if (resume.projects.length === 0) return null;
    const [first, ...rest] = resume.projects;
    return (
        <>
            <div data-breakable>
                <div className={classes.elegantSectionTitle}>Projects</div>
                <div className={classes.elegantExpItem}>
                    <ElegantProjectInner item={first!} />
                </div>
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <div className={classes.elegantExpItem}>
                        <ElegantProjectInner item={item} />
                    </div>
                </div>
            ))}
        </>
    );
}

function ElegantProjectInner({ item }: { item: ResumeData["projects"][number] }) {
    return (
        <>
            <div className={classes.elegantExpHeader}>
                <span className={classes.elegantExpRole}>{item.name}</span>
                {item.startDate && <span className={classes.elegantExpDate}>{item.startDate}{(item.endDate || item.current) && ` - ${item.current ? "Present" : item.endDate}`}</span>}
            </div>
            {item.description && <div className={classes.elegantExpDesc}>{item.description}</div>}
        </>
    );
}

/* ---- Languages with dots ---- */
function ElegantLanguages({ resume }: { resume: ResumeData }) {
    if (resume.languages.length === 0) return null;
    return (
        <div data-breakable>
            <div className={classes.elegantSectionTitle}>Languages</div>
            <div className={classes.elegantLangRow}>
                {resume.languages.map((lang) => {
                    const filled = PROFICIENCY_LEVELS[lang.proficiency] ?? 3;
                    return (
                        <span key={lang.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <strong>{lang.name}</strong>
                            <span style={{ fontSize: 11, color: "#777" }}>{lang.proficiency}</span>
                            <span className={classes.elegantLangDots}>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <span key={i} className={i < filled ? classes.elegantDot : classes.elegantDotEmpty} />
                                ))}
                            </span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

/* ---- Right Sidebar ---- */
function ElegantSidebarContent({ resume }: { resume: ResumeData }) {
    const allSkills = resume.skills.flatMap((c) => c.skills);

    return (
        <>
            {allSkills.length > 0 && (
                <>
                    <div className={classes.elegantSidebarTitle}>Skills</div>
                    <div className={classes.elegantSidebarSkills}>
                        {allSkills.join(", ")}
                    </div>
                </>
            )}
            {resume.certifications.length > 0 && (
                <>
                    <div className={classes.elegantSidebarTitle}>Certifications</div>
                    {resume.certifications.map((cert) => (
                        <div key={cert.id} className={classes.elegantSidebarItem}>
                            <div className={classes.elegantSidebarItemTitle}>{cert.name}</div>
                            <div className={classes.elegantSidebarItemDesc}>
                                {cert.issuer}
                                {cert.issueDate && ` · ${cert.issueDate}`}
                            </div>
                        </div>
                    ))}
                </>
            )}
            {resume.projects.length > 0 && resume.certifications.length === 0 && allSkills.length > 0 && (
                <>
                    <div className={classes.elegantSidebarTitle}>Projects</div>
                    {resume.projects.map((proj) => (
                        <div key={proj.id} className={classes.elegantSidebarItem}>
                            <div className={classes.elegantSidebarItemTitle}>{proj.name}</div>
                            {proj.description && (
                                <div className={classes.elegantSidebarItemDesc}>
                                    {proj.description.slice(0, 120)}
                                    {proj.description.length > 120 ? "…" : ""}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}
        </>
    );
}

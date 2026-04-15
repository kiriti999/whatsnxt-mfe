"use client";

import type { ResumeData } from "../../../types";
import classes from "../PreviewPanel.module.css";

interface TemplateProps {
    resume: ResumeData;
}

/** Strips the day portion from dates like '22-Sep-1989' → 'Sep 1989'. Passes through other formats unchanged. */
function formatMonthYear(date: string): string {
    const match = date.match(/^\d{1,2}-(\w+)-(\d{4})$/);
    return match ? `${match[1]} ${match[2]}` : date;
}

/** Extracts only the year from dates like '22-Sep-1989' → '1989'. Passes through other formats unchanged. */
function formatYearOnly(date: string): string {
    const match = date.match(/(\d{4})/);
    return match ? match[1] : date;
}

function linkifyText(text: string): React.ReactNode[] {
    const urlRegex = /(https?:\/\/[^\s,)<>]+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(text)) !== null) {
        if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
        parts.push(
            <a key={match.index} href={match[0]} target="_blank" rel="noopener noreferrer"
                style={{ color: "#3B6FA0", textDecoration: "underline", wordBreak: "break-all" }}>
                {match[0]}
            </a>,
        );
        lastIndex = urlRegex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
}

function renderDescription(text: string, className: string) {
    const lines = text.split("\n").map((l) => l.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean);
    if (lines.length <= 1) {
        return <div className={className}>{linkifyText(text)}</div>;
    }
    return (
        <ul className={className} style={{ margin: "4px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
            {lines.map((line, i) => (
                <li key={i} style={{ marginBottom: 2 }}>{linkifyText(line)}</li>
            ))}
        </ul>
    );
}

export function TimelineTemplate({ resume }: TemplateProps) {
    const { personalInfo, sectionOrder } = resume;
    const visibleSections = sectionOrder.filter((s) => s.visible && s.type !== "personal-info");
    const skillsSection = visibleSections.find((s) => s.type === "skills");
    const otherSections = visibleSections.filter((s) => s.type !== "skills");

    return (
        <>
            <EnhHeader personalInfo={personalInfo} />
            {skillsSection && (
                <EnhSectionRenderer key={skillsSection.id} section={skillsSection} resume={resume} />
            )}
            {otherSections.map((section) => (
                <EnhSectionRenderer key={section.id} section={section} resume={resume} />
            ))}
        </>
    );
}

function EnhHeader({ personalInfo }: { personalInfo: ResumeData["personalInfo"] }) {
    const { fullName, jobTitle, email, phone, location } = personalInfo;

    const hasContent = fullName || jobTitle || email;
    if (!hasContent) {
        return (
            <div className={classes.enhHeader} data-breakable>
                <div className={classes.enhName}>Your Name</div>
                <div className={classes.enhTitle}>Job Title</div>
            </div>
        );
    }

    const contactItems: { icon: string; value: string }[] = [];
    if (phone) contactItems.push({ icon: "✆", value: phone });
    if (email) contactItems.push({ icon: "✉", value: email });
    if (location) contactItems.push({ icon: "●", value: location });

    return (
        <div className={classes.enhHeader} data-breakable>
            {fullName && <div className={classes.enhName}>{fullName}</div>}
            {jobTitle && <div className={classes.enhTitle}>{jobTitle}</div>}
            {contactItems.length > 0 && (
                <div className={classes.enhContact}>
                    {contactItems.map((c) => (
                        <span key={c.value} className={classes.enhContactItem}>
                            <span className={classes.enhContactIcon}>{c.icon}</span>
                            {c.value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function EnhSectionRenderer({
    section,
    resume,
}: {
    section: ResumeData["sectionOrder"][number];
    resume: ResumeData;
}) {
    switch (section.type) {
        case "skills":
            return <EnhSkillsSection resume={resume} />;
        case "experience":
            return <EnhExperienceSection resume={resume} />;
        case "education":
            return <EnhEducationSection resume={resume} />;
        case "projects":
            return <EnhProjectsSection resume={resume} />;
        case "additional-experience":
            return <EnhAdditionalExperienceSection resume={resume} />;
        case "certifications":
            return <EnhCertificationsSection resume={resume} />;
        case "languages":
            return <EnhLanguagesSection resume={resume} />;
        case "find-me-online":
            return <EnhFindMeOnlineSection resume={resume} />;
        default:
            return null;
    }
}

/* ---- Skills as Tags ---- */
function EnhSkillsSection({ resume }: { resume: ResumeData }) {
    const allSkills = resume.skills.flatMap((cat) => cat.skills);
    if (allSkills.length === 0) return null;

    return (
        <div className={classes.enhSection} data-breakable>
            <div className={classes.enhSectionTitle}>Skills</div>
            <div className={classes.enhSkillTags}>
                {allSkills.map((skill) => (
                    <span key={skill} className={classes.enhSkillTag}>
                        {skill}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---- Summary ---- */
function EnhSummaryBlock({ summary }: { summary: string }) {
    if (!summary) return null;
    return (
        <div className={classes.enhSection} data-breakable>
            <div className={classes.enhSectionTitle}>Summary</div>
            <div className={classes.enhSummary}>{summary}</div>
        </div>
    );
}

/* ---- Experience (Timeline) ---- */
function EnhExperienceSection({ resume }: { resume: ResumeData }) {
    if (resume.experience.length === 0) return null;
    const { summary } = resume.personalInfo;
    const [first, ...rest] = resume.experience;

    return (
        <>
            {summary && <EnhSummaryBlock summary={summary} />}
            <div className={classes.enhSection}>
                <div data-breakable>
                    <div className={classes.enhSectionTitle}>Experience</div>
                    <EnhExperienceItem item={first!} />
                </div>
                {rest.map((item) => (
                    <div key={item.id} data-breakable>
                        <EnhExperienceItem item={item} />
                    </div>
                ))}
            </div>
        </>
    );
}

function EnhExperienceItem({ item }: { item: ResumeData["experience"][number] }) {
    const start = formatMonthYear(item.startDate);
    const end = item.current ? "Present" : item.endDate ? formatMonthYear(item.endDate) : "";
    const dateStr = end ? `${start} - ${end}` : start;
    return (
        <div className={classes.enhTimeline}>
            <div className={classes.enhTimelineMeta}>
                <div className={classes.enhTimelineDates}>{dateStr}</div>
                {item.location && (
                    <div className={classes.enhTimelineLocation}>{item.location}</div>
                )}
            </div>
            <div className={classes.enhTimelineDot} />
            <div className={classes.enhTimelineContent}>
                <div className={classes.enhTimelineRole}>{item.position}</div>
                {item.company && (
                    <div className={classes.enhTimelineCompany}>{item.company}</div>
                )}
                {item.description && renderDescription(item.description, classes.enhTimelineDesc)}
            </div>
        </div>
    );
}

/* ---- Education (Timeline) ---- */
function EnhEducationSection({ resume }: { resume: ResumeData }) {
    if (resume.education.length === 0) return null;
    const [first, ...rest] = resume.education;

    return (
        <div className={classes.enhSection}>
            <div data-breakable>
                <div className={classes.enhSectionTitle}>Education</div>
                <EnhEducationItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <EnhEducationItem item={item} />
                </div>
            ))}
        </div>
    );
}

function EnhEducationItem({ item }: { item: ResumeData["education"][number] }) {
    const start = formatYearOnly(item.startDate);
    const end = item.endDate ? formatYearOnly(item.endDate) : "";
    const dateStr = end ? `${start} - ${end}` : start;
    return (
        <div className={classes.enhTimeline}>
            <div className={classes.enhTimelineMeta}>
                <div className={classes.enhTimelineDates}>{dateStr}</div>
                {item.location && (
                    <div className={classes.enhTimelineLocation}>{item.location}</div>
                )}
            </div>
            <div className={classes.enhTimelineDot} />
            <div className={classes.enhTimelineContent}>
                <div className={classes.enhTimelineRole}>
                    {item.degree}
                    {item.field && ` in ${item.field}`}
                </div>
                <div className={classes.enhTimelineCompany}>
                    {item.institution}
                    {item.gpa && ` | GPA: ${item.gpa}`}
                </div>
                {item.description && renderDescription(item.description, classes.enhTimelineDesc)}
            </div>
        </div>
    );
}

/* ---- Projects ---- */
function EnhProjectsSection({ resume }: { resume: ResumeData }) {
    if (resume.projects.length === 0) return null;
    const [first, ...rest] = resume.projects;

    return (
        <div className={classes.enhSection}>
            <div data-breakable>
                <div className={classes.enhSectionTitle}>Projects</div>
                <EnhProjectItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <EnhProjectItem item={item} />
                </div>
            ))}
        </div>
    );
}

function EnhProjectItem({ item }: { item: ResumeData["projects"][number] }) {
    return (
        <div style={{ marginBottom: 10 }}>
            <div className={classes.enhItemHeader}>
                <span className={classes.enhItemTitle}>
                    {item.name}
                    {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, color: "#E87722", verticalAlign: "middle" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                    )}
                </span>
                <span className={classes.enhItemDate}>
                    {formatMonthYear(item.startDate)}
                    {(item.endDate || item.current) &&
                        ` — ${item.current ? "Present" : formatMonthYear(item.endDate)}`}
                </span>
            </div>
            {item.description && renderDescription(item.description, classes.enhItemDesc)}
            {item.technologies.length > 0 && (
                <div className={classes.enhSkillTags} style={{ marginTop: 4 }}>
                    {item.technologies.map((t) => (
                        <span key={t} className={classes.enhSkillTag} style={{ fontSize: 10, padding: "2px 8px" }}>
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---- Certifications ---- */
function EnhCertificationsSection({ resume }: { resume: ResumeData }) {
    if (resume.certifications.length === 0) return null;
    const [first, ...rest] = resume.certifications;

    return (
        <div className={classes.enhSection}>
            <div data-breakable>
                <div className={classes.enhSectionTitle}>Certifications</div>
                <EnhCertItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <EnhCertItem item={item} />
                </div>
            ))}
        </div>
    );
}

function EnhCertItem({ item }: { item: ResumeData["certifications"][number] }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <div className={classes.enhItemHeader}>
                <span className={classes.enhItemTitle}>
                    {item.name}
                    {item.credentialUrl && (
                        <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, color: "#E87722", verticalAlign: "middle" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        </a>
                    )}
                </span>
                <span className={classes.enhItemDate}>
                    {item.issueDate}
                    {item.expiryDate && ` — ${item.expiryDate}`}
                </span>
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
                {item.issuer}
                {item.credentialId && ` | ID: ${item.credentialId}`}
            </div>
        </div>
    );
}

/* ---- Languages ---- */
function EnhLanguagesSection({ resume }: { resume: ResumeData }) {
    if (resume.languages.length === 0) return null;
    return (
        <div className={classes.enhSection} data-breakable>
            <div className={classes.enhSectionTitle}>Languages</div>
            <div className={classes.enhLanguageRow}>
                {resume.languages.map((item) => (
                    <div key={item.id}>
                        <span className={classes.enhLanguageName}>{item.name}</span>{" "}
                        <span className={classes.enhLanguageLevel}>({item.proficiency})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---- Additional Experience (Timeline) ---- */
function EnhAdditionalExperienceSection({ resume }: { resume: ResumeData }) {
    if (resume.additionalExperience.length === 0) return null;
    const [first, ...rest] = resume.additionalExperience;

    return (
        <div className={classes.enhSection}>
            <div data-breakable>
                <div className={classes.enhSectionTitle}>Additional Experience</div>
                <EnhAdditionalExpItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <EnhAdditionalExpItem item={item} />
                </div>
            ))}
        </div>
    );
}

function EnhAdditionalExpItem({ item }: { item: ResumeData["additionalExperience"][number] }) {
    const start = formatMonthYear(item.startDate);
    const end = item.current ? "Present" : item.endDate ? formatMonthYear(item.endDate) : "";
    const dateStr = end ? `${start} - ${end}` : start;

    return (
        <div className={classes.enhTimeline}>
            <div className={classes.enhTimelineMeta}>
                <div className={classes.enhTimelineDates}>{dateStr}</div>
            </div>
            <div className={classes.enhTimelineDot} />
            <div className={classes.enhTimelineContent}>
                <div className={classes.enhTimelineRole}>
                    {item.name}
                    {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6, color: "#E87722", verticalAlign: "middle" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                        </a>
                    )}
                </div>
                {item.url && (
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#555", textDecoration: "none" }}>
                            {item.url}
                        </a>
                    </div>
                )}
                {item.description && renderDescription(item.description, classes.enhTimelineDesc)}
                {item.technologies.length > 0 && (
                    <div className={classes.enhSkillTags} style={{ marginTop: 4 }}>
                        {item.technologies.map((t) => (
                            <span key={t} className={classes.enhSkillTag} style={{ fontSize: 10, padding: "2px 8px" }}>
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---- Find Me Online ---- */
function EnhFindMeOnlineSection({ resume }: { resume: ResumeData }) {
    const { linkedin, github } = resume.personalInfo;
    if (!linkedin && !github) return null;

    return (
        <div className={classes.enhSection} data-breakable>
            <div className={classes.enhSectionTitle}>Find Me Online</div>
            <div style={{ display: "flex", gap: 40, marginTop: 8 }}>
                {linkedin && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#E87722">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <div>
                            <div style={{ fontWeight: 700, color: "#1B365D", fontSize: 13 }}>LinkedIn</div>
                            <a href={`https://${linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: "#555", fontSize: 12, textDecoration: "none" }}>
                                {linkedin}
                            </a>
                        </div>
                    </div>
                )}
                {github && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#E87722">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        <div>
                            <div style={{ fontWeight: 700, color: "#1B365D", fontSize: 13 }}>GitHub</div>
                            <a href={`https://${github}`} target="_blank" rel="noopener noreferrer" style={{ color: "#555", fontSize: 12, textDecoration: "none" }}>
                                {github}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

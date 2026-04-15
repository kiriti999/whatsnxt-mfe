"use client";

import type { ResumeData } from "../../../types";
import classes from "../PreviewPanel.module.css";

interface TemplateProps {
    resume: ResumeData;
}

export function PolishedTemplate({ resume }: TemplateProps) {
    return (
        <div className={classes.polishedLayout}>
            <div className={classes.polishedSidebar}>
                <PolishedSidebarContent resume={resume} />
            </div>
            <div className={classes.polishedMain}>
                <PolishedMainHeader resume={resume} />
                <PolishedMainSections resume={resume} />
            </div>
        </div>
    );
}

/* ---- Left Sidebar ---- */
function PolishedSidebarContent({ resume }: { resume: ResumeData }) {
    const { fullName } = resume.personalInfo;
    const allSkills = resume.skills.flatMap((c) => c.skills);

    return (
        <>
            {fullName && <div className={classes.polishedSidebarName}>{fullName}</div>}

            {allSkills.length > 0 && (
                <>
                    <div className={classes.polishedSidebarTitle}>Skills</div>
                    <div className={classes.polishedSidebarSkills}>
                        {allSkills.map((s) => (
                            <span key={s} className={classes.polishedSidebarTag}>{s}</span>
                        ))}
                    </div>
                </>
            )}

            {resume.certifications.length > 0 && (
                <>
                    <div className={classes.polishedSidebarTitle}>Certifications</div>
                    {resume.certifications.map((cert) => (
                        <div key={cert.id} className={classes.polishedSidebarItem}>
                            <div className={classes.polishedSidebarItemTitle}>{cert.name}</div>
                            <div className={classes.polishedSidebarItemDesc}>
                                {cert.issuer}
                                {cert.issueDate && ` · ${cert.issueDate}`}
                            </div>
                        </div>
                    ))}
                </>
            )}

            {resume.languages.length > 0 && (
                <>
                    <div className={classes.polishedSidebarTitle}>Languages</div>
                    {resume.languages.map((lang) => (
                        <div key={lang.id} className={classes.polishedSidebarLang}>
                            <span>{lang.name}</span>
                            <span className={classes.polishedSidebarLangLevel}>{lang.proficiency}</span>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}

/* ---- Main Header (right side top) ---- */
function PolishedMainHeader({ resume }: { resume: ResumeData }) {
    const { jobTitle, email, phone, location, linkedin, website } = resume.personalInfo;

    const contacts: { icon: string; value: string }[] = [];
    if (email) contacts.push({ icon: "@", value: email });
    if (linkedin) contacts.push({ icon: "🔗", value: linkedin });
    if (phone) contacts.push({ icon: "✆", value: phone });
    if (location) contacts.push({ icon: "◉", value: location });
    if (website) contacts.push({ icon: "🌐", value: website });

    return (
        <div className={classes.polishedMainHeader} data-breakable>
            {jobTitle && <div className={classes.polishedMainTitle}>{jobTitle}</div>}
            {contacts.length > 0 && (
                <div className={classes.polishedMainContact}>
                    {contacts.map((c) => (
                        <span key={c.value}>
                            <span className={classes.polishedMainContactIcon}>{c.icon}</span>
                            {c.value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---- Main sections ---- */
function PolishedMainSections({ resume }: { resume: ResumeData }) {
    const { summary } = resume.personalInfo;
    const mainTypes = ["experience", "education", "projects"];
    const mainSections = resume.sectionOrder.filter(
        (s) => s.visible && mainTypes.includes(s.type),
    );

    return (
        <>
            {summary && (
                <div data-breakable>
                    <div className={classes.polishedSectionTitle}>Summary</div>
                    <div className={classes.polishedSummary}>{summary}</div>
                </div>
            )}
            {mainSections.map((section) => (
                <PolishedMainSection key={section.id} section={section} resume={resume} />
            ))}
            <PolishedSkillsInline resume={resume} />
        </>
    );
}

function PolishedMainSection({
    section,
    resume,
}: {
    section: ResumeData["sectionOrder"][number];
    resume: ResumeData;
}) {
    switch (section.type) {
        case "experience":
            return <PolishedExperience resume={resume} />;
        case "education":
            return <PolishedEducation resume={resume} />;
        case "projects":
            return <PolishedProjects resume={resume} />;
        default:
            return null;
    }
}

/* ---- Experience ---- */
function PolishedExperience({ resume }: { resume: ResumeData }) {
    if (resume.experience.length === 0) return null;
    const [first, ...rest] = resume.experience;
    return (
        <>
            <div data-breakable>
                <div className={classes.polishedSectionTitle}>Experience</div>
                <PolishedExpItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <PolishedExpItem item={item} />
                </div>
            ))}
        </>
    );
}

function PolishedExpItem({ item }: { item: ResumeData["experience"][number] }) {
    const dateStr = `${item.startDate}${item.endDate || item.current ? ` - ${item.current ? "Present" : item.endDate}` : ""}`;
    return (
        <div className={classes.polishedExpItem}>
            <div className={classes.polishedExpHeader}>
                <span className={classes.polishedExpRole}>{item.position}</span>
                <span className={classes.polishedExpDate}>{dateStr}</span>
            </div>
            <div>
                <span className={classes.polishedExpCompany}>{item.company}</span>
                {item.location && (
                    <span className={classes.polishedExpLocation}>{item.location}</span>
                )}
            </div>
            {item.description && (
                <div className={classes.polishedExpDesc}>{item.description}</div>
            )}
        </div>
    );
}

/* ---- Education ---- */
function PolishedEducation({ resume }: { resume: ResumeData }) {
    if (resume.education.length === 0) return null;
    const [first, ...rest] = resume.education;
    return (
        <>
            <div data-breakable>
                <div className={classes.polishedSectionTitle}>Education</div>
                <PolishedEduItem item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <PolishedEduItem item={item} />
                </div>
            ))}
        </>
    );
}

function PolishedEduItem({ item }: { item: ResumeData["education"][number] }) {
    const dateStr = `${item.startDate}${item.endDate ? ` - ${item.endDate}` : ""}`;
    return (
        <div className={classes.polishedEduItem}>
            <div className={classes.polishedEduHeader}>
                <span className={classes.polishedEduDegree}>
                    {item.degree}
                    {item.field && ` in ${item.field}`}
                </span>
                <span className={classes.polishedExpDate}>{dateStr}</span>
            </div>
            <div>
                <span className={classes.polishedEduSchool}>{item.institution}</span>
                {item.location && (
                    <span className={classes.polishedExpLocation}>{item.location}</span>
                )}
            </div>
        </div>
    );
}

/* ---- Projects ---- */
function PolishedProjects({ resume }: { resume: ResumeData }) {
    if (resume.projects.length === 0) return null;
    const [first, ...rest] = resume.projects;
    return (
        <>
            <div data-breakable>
                <div className={classes.polishedSectionTitle}>Projects</div>
                <PolishedProjInner item={first!} />
            </div>
            {rest.map((item) => (
                <div key={item.id} data-breakable>
                    <PolishedProjInner item={item} />
                </div>
            ))}
        </>
    );
}

function PolishedProjInner({ item }: { item: ResumeData["projects"][number] }) {
    return (
        <div className={classes.polishedExpItem}>
            <div className={classes.polishedExpHeader}>
                <span className={classes.polishedExpRole}>{item.name}</span>
                {item.startDate && <span className={classes.polishedExpDate}>{item.startDate}{(item.endDate || item.current) && ` - ${item.current ? "Present" : item.endDate}`}</span>}
            </div>
            {item.description && <div className={classes.polishedExpDesc}>{item.description}</div>}
        </div>
    );
}

/* ---- Skills inline (main column, text separated by dots) ---- */
function PolishedSkillsInline({ resume }: { resume: ResumeData }) {
    const allSkills = resume.skills.flatMap((c) => c.skills);
    if (allSkills.length === 0) return null;
    return (
        <div data-breakable>
            <div className={classes.polishedSectionTitle}>Skills</div>
            <div className={classes.polishedSkillTags}>
                {allSkills.map((skill, i) => (
                    <span key={skill}>
                        {skill}
                        {i < allSkills.length - 1 && <span className={classes.polishedSkillSep}> · </span>}
                    </span>
                ))}
            </div>
        </div>
    );
}

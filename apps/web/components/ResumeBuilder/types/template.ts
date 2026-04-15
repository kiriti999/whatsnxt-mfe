export interface TemplateConfig {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    accentColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    sidebarLayout: boolean;
}

export const TEMPLATES: TemplateConfig[] = [
    {
        id: "classic",
        name: "Classic",
        description: "Traditional single-column resume layout",
        thumbnail: "",
        accentColor: "#2563eb",
        fontFamily: "'Georgia', serif",
        fontSize: 14,
        lineHeight: 1.5,
        sidebarLayout: false,
    },
    {
        id: "timeline",
        name: "Timeline",
        description: "Skills-first layout with timeline experience",
        thumbnail: "",
        accentColor: "#1B365D",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
        sidebarLayout: false,
    },
    {
        id: "modern",
        name: "Modern",
        description: "Clean two-column layout with sidebar",
        thumbnail: "",
        accentColor: "#0891b2",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        lineHeight: 1.4,
        sidebarLayout: true,
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Minimalist design with subtle accents",
        thumbnail: "",
        accentColor: "#374151",
        fontFamily: "'Helvetica Neue', sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
        sidebarLayout: false,
    },
    {
        id: "elegant",
        name: "Elegant",
        description: "Two-column layout with right dark sidebar",
        thumbnail: "",
        accentColor: "#0891b2",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        lineHeight: 1.4,
        sidebarLayout: true,
    },
    {
        id: "polished",
        name: "Polished",
        description: "Two-column with left colored sidebar",
        thumbnail: "",
        accentColor: "#0d9488",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        lineHeight: 1.5,
        sidebarLayout: true,
    },
];

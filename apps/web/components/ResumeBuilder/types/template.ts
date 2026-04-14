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
];

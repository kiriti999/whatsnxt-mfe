/**
 * Blog / tutorial card cover image generation (AI SVG).
 */

export const CARD_IMAGE_GENERATION_MODE = {
	AUTO: "auto",
	MANUAL: "manual",
} as const;

export type CardImageGenerationMode =
	(typeof CARD_IMAGE_GENERATION_MODE)[keyof typeof CARD_IMAGE_GENERATION_MODE];

export const CARD_IMAGE_CONTENT_KIND = {
	BLOG: "blog",
	TUTORIAL: "tutorial",
} as const;

export type CardImageContentKind =
	(typeof CARD_IMAGE_CONTENT_KIND)[keyof typeof CARD_IMAGE_CONTENT_KIND];

export const CARD_IMAGE_VISUAL_TYPES = [
	{
		id: "flat-gradients",
		label: "Modern flat",
		promptHint:
			"Modern flat illustration with smooth gradients, rounded geometric shapes, and a polished SaaS aesthetic.",
	},
	{
		id: "minimal-line",
		label: "Minimal line",
		promptHint:
			"Sparse minimal line-art: thin strokes, generous whitespace, one or two accent colors, very little ornament.",
	},
	{
		id: "isometric",
		label: "Isometric",
		promptHint:
			"Isometric 3D-style blocks and platforms suggesting systems and layers — no photorealism, keep it vector and schematic.",
	},
	{
		id: "neon-cyber",
		label: "Neon cyber",
		promptHint:
			"Dark background with neon cyan, magenta, and purple glow accents; subtle grid or scan-line hints; futuristic tech vibe.",
	},
	{
		id: "blueprint",
		label: "Blueprint",
		promptHint:
			"Technical blueprint / engineering drawing: light lines on deep blue, measurement ticks, dashed construction lines.",
	},
	{
		id: "geometric-bold",
		label: "Bold geometric",
		promptHint:
			"Bold overlapping geometric shapes (circles, triangles, arcs) with high contrast and strong composition.",
	},
	{
		id: "soft-pastel",
		label: "Soft pastel",
		promptHint:
			"Editorial soft pastel palette, airy layout, gentle curves, friendly and approachable (not childish).",
	},
	{
		id: "dark-glass",
		label: "Glass on dark",
		promptHint:
			"Dark navy background with frosted glass panels, soft highlights, subtle depth — premium product look.",
	},
	{
		id: "sequence-diagram",
		label: "Sequence diagram",
		promptHint:
			"UML sequence-diagram aesthetic: vertical lifelines, horizontal message arrows (solid and dashed), optional activation bars; abstract the topic into a short interaction between a few named participants — readable engineering diagram look, not cluttered. Use a standard diagram layout across the canvas; render the article title centered over the diagram as overlay text only (light fill with fill-opacity roughly 0.82–0.92 plus dark stroke or slight glow for legibility — NO rounded panel, NO backdrop <rect> behind the title), listed after diagram elements in SVG so it paints on top. Not as a top header strip — do not relocate lifelines just to reserve space for the title.",
	},
	{
		id: "whiteboard",
		label: "Whiteboard",
		promptHint:
			"Dry-erase whiteboard: soft off-white or very light gray background, marker-style strokes (navy, black, red, blue), hand-sketched boxes and arrows as in a meeting — informal but legible, avoid messy scribbles.",
	},
	{
		id: "flowchart",
		label: "Flowchart",
		promptHint:
			"Classic flowchart: rounded rectangles for steps, diamond for decisions, clear directional arrows, optional swimlanes; crisp vector lines like technical documentation.",
	},
	{
		id: "architecture-blocks",
		label: "Architecture blocks",
		promptHint:
			"Layered system architecture: labeled boxes for client, API, services, queue, database in horizontal bands with arrows between layers — simplified integration or microservices map. Put the featured title centered on the canvas as overlay text only (light fill with fill-opacity roughly 0.82–0.92 plus stroke/outline for legibility — no backdrop rect or frosted panel over the map), not only in a narrow top header strip.",
	},
	{
		id: "network-topology",
		label: "Network topology",
		promptHint:
			"Network topology map: nodes as circles or small icons, links as lines or curves, optional hub-and-spoke; suggest connectivity and infrastructure without photoreal devices.",
	},
	{
		id: "state-machine",
		label: "State diagram",
		promptHint:
			"Finite-state / state-machine style: rounded states, labeled transitions as arrows, optional initial and final markers; clear graph layout for a small number of states.",
	},
] as const;

export type CardImageVisualTypeId =
	(typeof CARD_IMAGE_VISUAL_TYPES)[number]["id"];

export function isCardImageVisualTypeAllowed(
	visualType: string,
): visualType is CardImageVisualTypeId {
	return CARD_IMAGE_VISUAL_TYPES.some((t) => t.id === visualType);
}

export function getCardImageVisualPromptHint(
	visualType: string,
): string | undefined {
	const row = CARD_IMAGE_VISUAL_TYPES.find((t) => t.id === visualType);
	return row?.promptHint;
}

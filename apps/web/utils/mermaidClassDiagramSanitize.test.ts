import { describe, expect, it } from "vitest";
import {
	normalizeClassDiagramForPersist,
	prepareMermaidRenderSource,
	sanitizeClassDiagramPathTemplateBraces,
} from "./mermaidClassDiagramSanitize";

describe("sanitizeClassDiagramPathTemplateBraces", () => {
	it("rewrites OpenAPI path params on REST member lines", () => {
		const src = `classDiagram
    class Feed {
        +GET /api/v1/feed/user/{userId} : FeedResponse
    }`;
		const out = sanitizeClassDiagramPathTemplateBraces(src);
		expect(out).toContain("/api/v1/feed/user/:userId");
		expect(out).not.toContain("{userId}");
	});

	it("leaves non-classDiagram sources unchanged", () => {
		const src = "graph TD\n  A-->B";
		expect(sanitizeClassDiagramPathTemplateBraces(src)).toBe(src);
	});
});

describe("prepareMermaidRenderSource", () => {
	it("strips a mermaid fence then sanitizes", () => {
		const raw = "```mermaid\nclassDiagram\n  +GET /x/{id} : T\n```";
		expect(prepareMermaidRenderSource(raw)).toContain("/x/:id");
	});
});

describe("normalizeClassDiagramForPersist", () => {
	it("returns canonical body when no fence", () => {
		const raw = "classDiagram\n  +GET /a/{b} : C\n";
		expect(normalizeClassDiagramForPersist(raw)).toContain("/a/:b");
	});

	it("preserves raw when already canonical", () => {
		const raw = "  classDiagram\n+GET /a/:b : C\n";
		expect(normalizeClassDiagramForPersist(raw)).toBe(raw);
	});

	it("rewrites fenced classDiagram", () => {
		const raw = "```mermaid\nclassDiagram\n+GET /z/{q} : R\n```";
		const out = normalizeClassDiagramForPersist(raw);
		expect(out).toMatch(/^```mermaid\n/);
		expect(out).toContain("/z/:q");
	});
});

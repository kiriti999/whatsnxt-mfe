import { describe, expect, it } from "vitest";
import {
	normalizeClassDiagramForPersist,
	normalizeSequenceDiagramForPersist,
	prepareMermaidRenderSource,
	sanitizeClassDiagramPathTemplateBraces,
	sanitizeSequenceDiagramActivateDeactivate,
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

describe("sanitizeSequenceDiagramActivateDeactivate", () => {
	it("drops deactivate when participant was not activated", () => {
		const src = `sequenceDiagram
    Cache->>DB: get
    deactivate Cache`;
		const out = sanitizeSequenceDiagramActivateDeactivate(src);
		expect(out).not.toContain("deactivate Cache");
	});

	it("keeps balanced activate/deactivate", () => {
		const src = `sequenceDiagram
    activate Cache
    Cache->>DB: x
    deactivate Cache`;
		const out = sanitizeSequenceDiagramActivateDeactivate(src);
		expect(out).toContain("activate Cache");
		expect(out).toContain("deactivate Cache");
	});

	it("removes duplicate second deactivate", () => {
		const src = `sequenceDiagram
    activate Cache
    deactivate Cache
    deactivate Cache`;
		const out = sanitizeSequenceDiagramActivateDeactivate(src);
		const count = (out.match(/deactivate Cache/g) || []).length;
		expect(count).toBe(1);
	});

	it("leaves non-sequence sources unchanged", () => {
		const src = "graph TD\nA-->B";
		expect(sanitizeSequenceDiagramActivateDeactivate(src)).toBe(src);
	});
});

describe("normalizeSequenceDiagramForPersist", () => {
	it("rewrites body when orphan deactivate is removed", () => {
		const raw = "sequenceDiagram\n  deactivate Cache\n";
		const out = normalizeSequenceDiagramForPersist(raw);
		expect(out).not.toContain("deactivate");
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

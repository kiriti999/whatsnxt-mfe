/**
 * Mermaid classDiagram treats `{` as nested-member syntax. OpenAPI-style `{param}` in
 * REST paths must become `:param` (or similar) for valid diagrams.
 */

export function extractMermaidCode(text: string): string {
	const fenceMatch = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/);
	if (fenceMatch) return fenceMatch[1].trim();
	return text.trim();
}

const HTTP_METHODS_RE =
	/^(\s*(?:[+\-#~])?\s*)(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)(\s+)(.+)$/i;

export function sanitizeClassDiagramPathTemplateBraces(source: string): string {
	const trimmed = source.trim();
	if (!/^\s*classDiagram\b/i.test(trimmed)) {
		return source;
	}

	return source
		.split("\n")
		.map((line) => {
			const m = line.match(HTTP_METHODS_RE);
			if (!m) {
				return line;
			}
			const indent = m[1];
			const verb = m[2];
			const sp = m[3];
			const rest = m[4];
			const splitIdx = rest.indexOf(" : ");
			const pathPart = splitIdx === -1 ? rest : rest.slice(0, splitIdx);
			const suffix = splitIdx === -1 ? "" : rest.slice(splitIdx);
			const fixedPath = pathPart.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, ":$1");
			return `${indent}${verb}${sp}${fixedPath}${suffix}`;
		})
		.join("\n");
}

/** Code passed to `mermaid.render` (strip fences, then sanitize classDiagram paths). */
export function prepareMermaidRenderSource(text: string): string {
	const extracted = extractMermaidCode(text);
	return sanitizeClassDiagramPathTemplateBraces(extracted);
}

const FULL_DOCUMENT_FENCE = /^```(?:mermaid)?\s*\n([\s\S]*?)```\s*$/i;

/**
 * Returns Mermaid source safe for classDiagram storage. If the diagram is not a
 * classDiagram or nothing changed, returns `raw` unchanged (including surrounding text).
 */
export function normalizeClassDiagramForPersist(raw: string): string {
	const trimmed = raw.trim();
	const fence = FULL_DOCUMENT_FENCE.exec(trimmed);
	const body = fence ? fence[1].trim() : trimmed;
	if (!/^\s*classDiagram\b/i.test(body)) {
		return raw;
	}
	const nextBody = sanitizeClassDiagramPathTemplateBraces(body);
	if (nextBody === body) {
		return raw;
	}
	if (fence) {
		return `\`\`\`mermaid\n${nextBody}\n\`\`\``;
	}
	return nextBody;
}

/**
 * Mermaid render fixes: classDiagram path `{param}` → `:param`, and sequenceDiagram
 * orphan/duplicate `deactivate` lines removed (match activate/deactivate depth per id).
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

const ACTIVATE_LINE_RE = /^\s*activate\s+(.+?)\s*$/i;
const DEACTIVATE_LINE_RE = /^\s*deactivate\s+(.+?)\s*$/i;

function normalizeSeqParticipantId(raw: string): string {
	const t = raw.trim();
	if (
		(t.startsWith('"') && t.endsWith('"')) ||
		(t.startsWith("'") && t.endsWith("'"))
	) {
		return t.slice(1, -1).trim();
	}
	return t;
}

/**
 * Mermaid errors if `deactivate X` runs when X has no matching active span (duplicate or
 * orphan deactivate). Track nesting depth per participant id.
 */
export function sanitizeSequenceDiagramActivateDeactivate(
	source: string,
): string {
	const trimmed = source.trim();
	if (!/^\s*sequenceDiagram\b/i.test(trimmed)) {
		return source;
	}

	const depths = new Map<string, number>();
	const lines = source.split("\n");

	const nextLines = lines.map((rawLine) => {
		const line = rawLine.replace(/\r$/, "");
		const act = line.match(ACTIVATE_LINE_RE);
		if (act) {
			const id = normalizeSeqParticipantId(act[1]);
			depths.set(id, (depths.get(id) ?? 0) + 1);
			return rawLine;
		}
		const deact = line.match(DEACTIVATE_LINE_RE);
		if (deact) {
			const id = normalizeSeqParticipantId(deact[1]);
			const d = depths.get(id) ?? 0;
			if (d > 0) {
				depths.set(id, d - 1);
				return rawLine;
			}
			return null;
		}
		return rawLine;
	});

	return nextLines.filter((l): l is string => l !== null).join("\n");
}

/** Code passed to `mermaid.render` (strip fences, then diagram-specific fixes). */
export function prepareMermaidRenderSource(text: string): string {
	const extracted = extractMermaidCode(text);
	const afterClass = sanitizeClassDiagramPathTemplateBraces(extracted);
	return sanitizeSequenceDiagramActivateDeactivate(afterClass);
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

/**
 * Canonical sequenceDiagram for storage (drops orphan `deactivate` lines).
 */
export function normalizeSequenceDiagramForPersist(raw: string): string {
	const trimmed = raw.trim();
	const fence = FULL_DOCUMENT_FENCE.exec(trimmed);
	const body = fence ? fence[1].trim() : trimmed;
	if (!/^\s*sequenceDiagram\b/i.test(body)) {
		return raw;
	}
	const nextBody = sanitizeSequenceDiagramActivateDeactivate(body);
	if (nextBody === body) {
		return raw;
	}
	if (fence) {
		return `\`\`\`mermaid\n${nextBody}\n\`\`\``;
	}
	return nextBody;
}

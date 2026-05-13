"use client";

import * as d3 from "d3";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DiagramData, DiagramNode } from "../types";

interface PatternCatalogRendererProps {
	data: DiagramData;
	width: number;
	height: number;
}

/**
 * Pattern Catalog Renderer — grid of pattern cards.
 * When `node.metadata.miniFlow.boxes` is set (2–5 short strings), draws a compact
 * left-to-right flow inside that card (field guide / pattern sheet style).
 */
export const PatternCatalogRenderer: React.FC<PatternCatalogRendererProps> = ({
	data,
	width,
	height: _height,
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (!svgRef.current || !data?.nodes?.length) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const nodes = data.nodes;
		const columns =
			data.gridColumns || Math.min(Math.ceil(Math.sqrt(nodes.length)), 4);
		const rows = Math.ceil(nodes.length / columns);

		const padding = 44;
		const cardGap = 18;
		const availW = width - padding * 2;
		const cardW = Math.min(280, (availW - cardGap * (columns - 1)) / columns);
		const cardH = 220;

		const totalW = columns * cardW + (columns - 1) * cardGap + padding * 2;
		const totalH = rows * cardH + (rows - 1) * cardGap + padding * 2 + 92;

		svg
			.attr("viewBox", `0 0 ${totalW} ${totalH}`)
			.attr("width", "100%")
			.attr("preserveAspectRatio", "xMidYMid meet");

		const defs = svg.append("defs");
		const textColor = getTextColor(data.backgroundColor);

		const filter = defs
			.append("filter")
			.attr("id", "pc-shadow")
			.attr("x", "-8%")
			.attr("y", "-8%")
			.attr("width", "116%")
			.attr("height", "120%");
		filter
			.append("feDropShadow")
			.attr("dx", 0)
			.attr("dy", 3)
			.attr("stdDeviation", 5)
			.attr("flood-color", "#000")
			.attr("flood-opacity", 0.07);

		svg
			.append("rect")
			.attr("width", totalW)
			.attr("height", totalH)
			.attr("fill", data.backgroundColor || "#ffffff")
			.attr("rx", 16);

		// Show subtitle as main title (skip the preview/parent title)
		if (data.subtitle) {
			svg
				.append("text")
				.attr("x", totalW / 2)
				.attr("y", 44)
				.attr("text-anchor", "middle")
				.attr("font-size", 20)
				.attr("font-weight", "700")
				.attr("fill", textColor)
				.attr("font-family", "Inter, system-ui, sans-serif")
				.text(data.subtitle);
		}

		const titleOff = data.subtitle ? 72 : 44;

		nodes.forEach((node: DiagramNode, index: number) => {
			const col = index % columns;
			const row = Math.floor(index / columns);
			const x = padding + col * (cardW + cardGap);
			const y = titleOff + row * (cardH + cardGap);

			const g = svg
				.append("g")
				.attr("data-node-id", node.id)
				.attr("transform", `translate(${x}, ${y})`)
				.attr("filter", "url(#pc-shadow)")
				.style("cursor", "pointer");

			g.append("rect")
				.attr("width", cardW)
				.attr("height", cardH)
				.attr("rx", node.style.borderRadius || 14)
				.attr("fill", node.style.backgroundColor)
				.attr("stroke", node.style.borderColor)
				.attr("stroke-width", 1.5);

			const stripId = `pc-strip-${safeSvgId(node.id)}`;
			const stripGrad = defs
				.append("linearGradient")
				.attr("id", stripId)
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "0%");
			stripGrad
				.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", node.style.borderColor);
			stripGrad
				.append("stop")
				.attr("offset", "100%")
				.attr(
					"stop-color",
					d3.color(node.style.borderColor)?.brighter(0.6)?.formatHex() ||
						node.style.borderColor,
				);

			const clipId = `pc-clip-${safeSvgId(node.id)}`;
			defs
				.append("clipPath")
				.attr("id", clipId)
				.append("rect")
				.attr("width", cardW)
				.attr("height", 6)
				.attr("rx", node.style.borderRadius || 14);

			g.append("rect")
				.attr("width", cardW)
				.attr("height", 6)
				.attr("fill", `url(#${stripId})`)
				.attr("clip-path", `url(#${clipId})`);

			const badgeVal = node.badge || `${index + 1}`;
			const bSize = 26;
			const bG = g.append("g").attr("transform", "translate(12, 16)");
			bG.append("circle")
				.attr("cx", bSize / 2)
				.attr("cy", bSize / 2)
				.attr("r", bSize / 2)
				.attr("fill", node.style.borderColor)
				.attr("opacity", 0.15);
			bG.append("text")
				.attr("x", bSize / 2)
				.attr("y", bSize / 2 + 1)
				.attr("text-anchor", "middle")
				.attr("dominant-baseline", "central")
				.attr("font-size", 12)
				.attr("font-weight", "700")
				.attr("fill", node.style.borderColor)
				.attr("font-family", "Inter, system-ui, sans-serif")
				.text(badgeVal);

			const flowBoxes = getMiniFlowBoxes(node.metadata);
			const hasMiniFlow = flowBoxes !== null;

			if (!hasMiniFlow && node.icon) {
				g.append("text")
					.attr("x", cardW / 2)
					.attr("y", 50)
					.attr("text-anchor", "middle")
					.attr("font-size", 28)
					.text(node.icon);
			}

			const labelY = hasMiniFlow ? 44 : node.icon ? 78 : 52;
			g.append("text")
				.attr("x", cardW / 2)
				.attr("y", labelY)
				.attr("text-anchor", "middle")
				.attr("font-size", node.style.fontSize || 14)
				.attr("font-weight", "700")
				.attr("fill", node.style.textColor)
				.attr("font-family", "Inter, system-ui, sans-serif")
				.text(truncateForPixelWidth(node.label, cardW - 30));

			if (hasMiniFlow) {
				renderMiniFlowInCard(
					defs,
					g,
					node.id,
					flowBoxes,
					cardW,
					node.style.textColor,
					node.style.borderColor,
				);
			}

			if (node.description) {
				const descY = hasMiniFlow ? 146 : labelY + 20;
				const maxLines = hasMiniFlow ? 2 : 3;
				const maxChar = Math.floor((cardW - 30) / 6.5);
				const lines = wrapText(node.description, maxChar);
				lines.slice(0, maxLines).forEach((line, li) => {
					g.append("text")
						.attr("x", cardW / 2)
						.attr("y", descY + li * 17)
						.attr("text-anchor", "middle")
						.attr("font-size", 11)
						.attr("fill", node.style.textColor)
						.attr("opacity", 0.6)
						.attr("font-family", "Inter, system-ui, sans-serif")
						.text(
							li === maxLines - 1 && lines.length > maxLines
								? `${line.slice(0, -3)}…`
								: line,
						);
				});
			}

			const category = readCategory(node.metadata);
			if (category) {
				const chipW = category.length * 6.5 + 16;
				g.append("rect")
					.attr("x", cardW / 2 - chipW / 2)
					.attr("y", cardH - 28)
					.attr("width", chipW)
					.attr("height", 20)
					.attr("rx", 10)
					.attr("fill", node.style.borderColor)
					.attr("opacity", 0.1);
				g.append("text")
					.attr("x", cardW / 2)
					.attr("y", cardH - 14)
					.attr("text-anchor", "middle")
					.attr("font-size", 9)
					.attr("font-weight", "600")
					.attr("fill", node.style.borderColor)
					.attr("font-family", "Inter, system-ui, sans-serif")
					.text(category);
			}

			g.on("mouseenter", function () {
				d3.select(this)
					.transition()
					.duration(200)
					.attr("transform", `translate(${x}, ${y - 5})`);
			}).on("mouseleave", function () {
				d3.select(this)
					.transition()
					.duration(200)
					.attr("transform", `translate(${x}, ${y})`);
			});
		});
	}, [data, width]);

	return (
		<svg
			ref={svgRef}
			style={{ width: "100%", height: "100%", minHeight: 400 }}
		/>
	);
};

function safeSvgId(raw: string): string {
	return raw.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function getMiniFlowBoxes(meta: unknown): string[] | null {
	if (!meta || typeof meta !== "object") return null;
	const m = meta as { miniFlow?: { boxes?: unknown } };
	const boxes = m.miniFlow?.boxes;
	if (!Array.isArray(boxes)) return null;
	const labels = boxes
		.filter((b): b is string => typeof b === "string")
		.map((b) => b.trim())
		.filter((b) => b.length > 0 && !isPlaceholderMiniFlowLabel(b));
	if (labels.length < 2) return null;
	return labels.slice(0, 5);
}

function readCategory(meta: unknown): string | undefined {
	if (!meta || typeof meta !== "object") return undefined;
	const c = (meta as { category?: unknown }).category;
	return typeof c === "string" ? c : undefined;
}

function renderMiniFlowInCard(
	defs: d3.Selection<SVGDefsElement, unknown, null, undefined>,
	g: d3.Selection<SVGGElement, unknown, null, undefined>,
	nodeId: string,
	boxes: string[],
	cardW: number,
	textColor: string,
	accentColor: string,
): void {
	const margin = 10;
	const flowY = 54;
	const flowH = 78;
	const n = boxes.length;
	const innerW = cardW - margin * 2;
	const gap = 10;
	const nodeW = (innerW - gap * (n - 1)) / n;
	const headY = flowY + 8;
	const headH = 18;
	const lifeTop = headY + headH + 2;
	const lifeBottom = flowY + flowH - 8;
	const markerId = `pc-mf-${safeSvgId(nodeId)}`;

	g.append("rect")
		.attr("x", margin - 2)
		.attr("y", flowY)
		.attr("width", innerW + 4)
		.attr("height", flowH)
		.attr("rx", 10)
		.attr("fill", "#ffffff")
		.attr("opacity", 0.07)
		.attr("stroke", accentColor)
		.attr("stroke-width", 1)
		.attr("stroke-opacity", 0.25);

	defs
		.append("marker")
		.attr("id", markerId)
		.attr("markerWidth", 5)
		.attr("markerHeight", 5)
		.attr("refX", 4)
		.attr("refY", 2.5)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M0,0 L5,2.5 L0,5 z")
		.attr("fill", accentColor);

	let x = margin;
	const centers: number[] = [];

	for (let i = 0; i < n; i++) {
		const xPos = x;
		const cx = xPos + nodeW / 2;
		centers.push(cx);

		// Create a group for this mini-flow box (for animation targeting)
		const boxId = `${nodeId}-box-${i + 1}`;
		const boxGroup = g.append("g")
			.attr("data-box-id", boxId);

		// Participant header box (sequence style)
		boxGroup.append("rect")
			.attr("x", xPos)
			.attr("y", headY)
			.attr("width", nodeW)
			.attr("height", headH)
			.attr("rx", 4)
			.attr("fill", "#ffffff")
			.attr("opacity", 0.22)
			.attr("stroke", accentColor)
			.attr("stroke-width", 1.2);

		const nodeLabel = compactMiniFlowLabel(boxes[i] ?? "", n >= 5 ? 6 : 8);
		boxGroup.append("text")
			.attr("x", cx)
			.attr("y", headY + headH / 2 + 0.5)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "central")
			.attr("font-size", n >= 5 ? 6 : 7)
			.attr("font-weight", "600")
			.attr("fill", textColor)
			.attr("font-family", "Inter, system-ui, sans-serif")
			.text(nodeLabel);

		// Lifeline (also in box group for coordinated animation)
		boxGroup.append("line")
			.attr("x1", cx)
			.attr("y1", lifeTop)
			.attr("x2", cx)
			.attr("y2", lifeBottom)
			.attr("stroke", accentColor)
			.attr("stroke-opacity", 0.6)
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", "4,3");

		const captionMaxChars = Math.max(3, Math.floor(nodeW / 5));
		const caption = truncateToMaxChars(boxes[i] ?? "", captionMaxChars);
		boxGroup.append("text")
			.attr("x", cx)
			.attr("y", lifeBottom + 9)
			.attr("text-anchor", "middle")
			.attr("font-size", 6)
			.attr("fill", textColor)
			.attr("opacity", 0.62)
			.attr("font-family", "Inter, system-ui, sans-serif")
			.text(caption);

		x += nodeW + gap;
	}

	// Message arrows between consecutive lifelines (mini sequence diagram feel)
	// Each arrow gets a data-edge-id for animation targeting
	const messageRows = Math.min(n - 1, 3);
	for (let i = 0; i < messageRows; i++) {
		const y = lifeTop + 8 + i * 12;
		const from = centers[i] ?? 0;
		const to = centers[i + 1] ?? 0;
		if (!from || !to || to <= from) continue;

		const edgeId = `${nodeId}-edge-${i + 1}`;
		const arrowLine = g.append("line")
			.attr("data-edge-id", edgeId)
			.attr("x1", from + 1)
			.attr("y1", y)
			.attr("x2", to - 2)
			.attr("y2", y)
			.attr("stroke", accentColor)
			.attr("stroke-width", 1.4)
			.attr("marker-end", `url(#${markerId})`);

		// Calculate stroke length for animation support
		const strokeLen = Math.abs(to - from - 3);
		arrowLine
			.attr("stroke-dasharray", strokeLen)
			.attr("stroke-dashoffset", 0);

		// Add one dashed return arrow when possible.
		if (i === 0 && centers.length >= 3) {
			const returnEdgeId = `${nodeId}-edge-return-${i + 1}`;
			const returnLen = Math.abs((centers[2] ?? 0) - (centers[1] ?? 0) - 3);
			g.append("line")
				.attr("data-edge-id", returnEdgeId)
				.attr("x1", centers[2] - 1)
				.attr("y1", y + 10)
				.attr("x2", centers[1] + 2)
				.attr("y2", y + 10)
				.attr("stroke", accentColor)
				.attr("stroke-width", 1.1)
				.attr("stroke-dasharray", `4,3`)
				.attr("marker-end", `url(#${markerId})`);
		}
	}
}

function getTextColor(bg: string | undefined): string {
	if (!bg) return "#1a1a2e";
	const hex = bg.replace("#", "");
	if (hex.length < 6) return "#1a1a2e";
	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5
		? "#1a1a2e"
		: "#f0f0f0";
}

/** `approxPixelWidth` — rough horizontal space; ~7px per Latin char at UI scale. */
function truncateForPixelWidth(t: string, approxPixelWidth: number): string {
	const maxChars = Math.max(1, Math.floor(approxPixelWidth / 7));
	return truncateToMaxChars(t, maxChars);
}

/** Hard character cap (use inside fixed-width boxes, not for pixel width). */
function truncateToMaxChars(t: string, maxChars: number): string {
	const m = Math.max(1, Math.floor(maxChars));
	if (t.length <= m) return t;
	return `${t.substring(0, Math.max(1, m - 1))}…`;
}

function isPlaceholderMiniFlowLabel(s: string): boolean {
	const t = s.trim();
	if (t.length < 2) return true;
	if (/^[\u2026…]+$/.test(t)) return true;
	if (/^\.+$/.test(t)) return true;
	if (/^(tbd|n\/a|na|placeholder|lorem)$/i.test(t)) return true;
	return false;
}

function compactMiniFlowLabel(input: string, maxChars: number): string {
	const text = input.trim();
	if (!text) return "";

	const words = text.split(/\s+/).filter(Boolean);
	if (words.length >= 2) {
		const acronym = words.map((w) => w[0]?.toUpperCase() ?? "").join("");
		if (acronym.length >= 2 && acronym.length <= maxChars) {
			return acronym;
		}
	}

	return truncateToMaxChars(text, maxChars);
}

function wrapText(text: string, maxChars: number): string[] {
	const words = text.split(" ");
	const lines: string[] = [];
	let cur = "";
	for (const w of words) {
		if (`${cur} ${w}`.trim().length > maxChars) {
			if (cur) lines.push(cur.trim());
			cur = w;
		} else {
			cur = cur ? `${cur} ${w}` : w;
		}
	}
	if (cur) lines.push(cur.trim());
	return lines;
}

import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

// Animation durations (seconds) — keep in sync with gsap-svg-player/index.html
const NODE_DURATION = 0.5;
const EDGE_DURATION = 0.6;
const NODE_GAP = 0.2;
const CENTRAL_GAP = 0.3;
const FINAL_HOLD = 1.5;

export interface NodeInfo {
	el: Element;
	order: number;
	isCentral: boolean;
}

export interface EdgeInfo {
	el: Element;
	order: number;
}

function getNodeOrder(el: Element): number {
	const nodeId = el.getAttribute("data-node-id") ?? "";
	if (nodeId.includes("central") || nodeId.includes("center")) return -1;
	const m = nodeId.match(/node-(\d+)/);
	if (m) return parseInt(m[1], 10);
	const badge = el.querySelector("text")?.textContent?.trim();
	const bn = badge?.match(/^(\d+)$/);
	return bn ? parseInt(bn[1], 10) : 999;
}

function getEdgeOrder(el: Element): number {
	const edgeId = el.getAttribute("data-edge-id") ?? "";
	const m = edgeId.match(/edge-(\d+)/);
	return m ? parseInt(m[1], 10) : 999;
}

function collectNodes(container: Element): NodeInfo[] {
	return Array.from(container.querySelectorAll("[data-node-id]"))
		.map((el) => ({
			el,
			order: getNodeOrder(el),
			isCentral: getNodeOrder(el) === -1,
		}))
		.sort((a, b) => a.order - b.order);
}

function collectEdges(container: Element): EdgeInfo[] {
	return Array.from(container.querySelectorAll("[data-edge-id]"))
		.map((el) => ({ el, order: getEdgeOrder(el) }))
		.sort((a, b) => a.order - b.order);
}

function initElementStates(nodes: NodeInfo[], edges: EdgeInfo[]): void {
	for (const { el } of nodes) {
		gsap.set(el, { opacity: 0, scale: 0.95, transformOrigin: "center center" });
	}
	for (const { el } of edges) {
		gsap.set(el, { opacity: 0 });
		const strokeEls = el.querySelectorAll("line, path, polyline");
		strokeEls.forEach((s) => {
			if (s.getAttribute("stroke") || getComputedStyle(s).stroke !== "none") {
				gsap.set(s, { drawSVG: "0%" });
			}
		});
	}
}

function addEdgeToTimeline(tl: gsap.core.Timeline, edge: EdgeInfo): void {
	const { el } = edge;
	const strokeEl =
		el.querySelector("path[stroke], line[stroke], polyline[stroke]") ??
		el.querySelector("path, line, polyline");

	const hasStroke =
		strokeEl &&
		(strokeEl.getAttribute("stroke") ||
			getComputedStyle(strokeEl).stroke !== "none");

	tl.to(el, { opacity: 1, duration: 0.1 });
	if (hasStroke && strokeEl) {
		tl.to(strokeEl, {
			drawSVG: "100%",
			duration: EDGE_DURATION * 0.8,
			ease: "power1.inOut",
		});
	}
	tl.to({}, { duration: 0.1 });
}

function addNodeToTimeline(tl: gsap.core.Timeline, node: NodeInfo): void {
	tl.to(node.el, { opacity: 1, scale: 1, duration: NODE_DURATION, ease: "power2.out" });
	tl.to({}, { duration: NODE_GAP });
}

/**
 * Build a GSAP timeline that animates all nodes and edges in the container.
 * The timeline is paused and can be seeked via `.progress(p)`.
 */
export function buildGsapTimeline(container: Element): gsap.core.Timeline {
	const nodes = collectNodes(container);
	const edges = collectEdges(container);

	initElementStates(nodes, edges);

	const tl = gsap.timeline({ paused: true });

	const central = nodes.find((n) => n.isCentral);
	const numbered = nodes.filter((n) => !n.isCentral);

	if (central) {
		addNodeToTimeline(tl, central);
		tl.to({}, { duration: CENTRAL_GAP });
	}

	const maxCount = Math.max(numbered.length, edges.length);
	for (let i = 0; i < maxCount; i++) {
		if (i < edges.length) addEdgeToTimeline(tl, edges[i]);
		if (i < numbered.length) addNodeToTimeline(tl, numbered[i]);
	}

	tl.to({}, { duration: FINAL_HOLD });

	return tl;
}

/**
 * Estimate total GSAP timeline duration in seconds given node/edge counts.
 * Used by calculateMetadata to size the Remotion composition.
 */
export function estimateTimelineDuration(nodeCount: number, edgeCount: number): number {
	const hasCentral = nodeCount > 0;
	const numberedCount = hasCentral ? nodeCount - 1 : nodeCount;
	const pairs = Math.max(numberedCount, edgeCount);
	const centralSec = hasCentral ? NODE_DURATION + NODE_GAP + CENTRAL_GAP : 0;
	const pairSec = pairs * (EDGE_DURATION + NODE_DURATION + NODE_GAP + 0.2);
	return centralSec + pairSec + FINAL_HOLD;
}

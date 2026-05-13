import React from "react";
import { Composition, type CalculateMetadataFunction } from "remotion";
import { DiagramAnimation, type DiagramAnimationProps } from "./DiagramAnimation";
import { estimateTimelineDuration } from "./gsap-timeline";


const FPS = 30;
const RENDER_SCALE = 2;
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;

function parseViewBox(svg: string): { w: number; h: number } | null {
	const m = svg.match(/viewBox=["']([^"']+)["']/);
	if (!m) return null;
	const parts = m[1].trim().split(/[\s,]+/).map(Number);
	if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
		return { w: parts[2], h: parts[3] };
	}
	return null;
}

function countNodesEdges(diagramData: Record<string, unknown>): {
	nodeCount: number;
	edgeCount: number;
} {
	const data = diagramData as { nodes?: unknown[]; edges?: unknown[] };
	return {
		nodeCount: Array.isArray(data.nodes) ? data.nodes.length : 6,
		edgeCount: Array.isArray(data.edges) ? data.edges.length : 6,
	};
}

export const calculateMetadata: CalculateMetadataFunction<DiagramAnimationProps> = ({
	props,
}) => {
	const vb = parseViewBox(props.diagramSvg ?? "");
	const baseW = vb?.w ?? DEFAULT_WIDTH;
	const baseH = vb?.h ?? DEFAULT_HEIGHT;

	const { nodeCount, edgeCount } = countNodesEdges(props.diagramData ?? {});
	const totalSec = estimateTimelineDuration(nodeCount, edgeCount);
	const durationInFrames = Math.max(60, Math.ceil(totalSec * FPS));

	return {
		durationInFrames,
		fps: FPS,
		width: Math.ceil(baseW * RENDER_SCALE),
		height: Math.ceil(baseH * RENDER_SCALE),
	};
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="DiagramAnimation"
			component={DiagramAnimation}
			durationInFrames={300}
			fps={FPS}
			width={DEFAULT_WIDTH * RENDER_SCALE}
			height={DEFAULT_HEIGHT * RENDER_SCALE}
			defaultProps={{
				diagramSvg: "",
				diagramData: {},
				animationManifest: {},
			}}
			calculateMetadata={calculateMetadata}
		/>
	);
};

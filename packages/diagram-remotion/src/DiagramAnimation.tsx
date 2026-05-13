import React, { useEffect, useRef } from "react";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { buildGsapTimeline } from "./gsap-timeline";

export interface DiagramAnimationProps extends Record<string, unknown> {
	diagramSvg: string;
	diagramData: Record<string, unknown>;
	animationManifest: Record<string, unknown>;
}

export const DiagramAnimation: React.FC<DiagramAnimationProps> = ({ diagramSvg }) => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handle = delayRender("GSAP seek frame");

		// Reset SVG DOM for a clean slate each frame (GSAP mutations don't carry over)
		container.innerHTML = diagramSvg;

		const tl = buildGsapTimeline(container);

		// Seek timeline to this frame's position
		const progress = durationInFrames > 1 ? frame / (durationInFrames - 1) : 1;
		tl.progress(Math.min(progress, 1)).pause();

		continueRender(handle);

		return () => {
			tl.kill();
		};
	}, [frame, durationInFrames, diagramSvg]);

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				background: "#f8fafc",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "Inter, system-ui, sans-serif",
			}}
		>
			<div
				ref={containerRef}
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			/>
		</div>
	);
};

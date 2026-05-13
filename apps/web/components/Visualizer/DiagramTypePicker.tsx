"use client";

import { Paper, Text, Title } from "@mantine/core";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { DiagramType, DiagramTypeOption } from "./types";
import styles from "./visualizer.module.css";

const diagramTypes: DiagramTypeOption[] = [
	{
		type: "step-content",
		title: "Step Content",
		description:
			"Sequential numbered cards with descriptions — perfect for best practices, checklists, and how-to guides",
		icon: "📋",
		gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		color: "#667eea",
		previewImage: "/visualizer/diagram-type-previews/step-content.svg",
	},
	{
		type: "flow-diagram",
		title: "Flow Diagram",
		description:
			"Directional flow with nodes and arrows — great for data flow, request paths, and processes",
		icon: "🔀",
		gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
		color: "#f093fb",
		previewImage: "/visualizer/diagram-type-previews/flow-diagram.svg",
	},
	{
		type: "architecture",
		title: "Architecture Diagram",
		description:
			"System components with connections — ideal for Kubernetes, microservices, and cloud infrastructure",
		icon: "🏗️",
		gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
		color: "#4facfe",
		previewImage: "/visualizer/diagram-type-previews/architecture.svg",
	},
	{
		type: "comparison-grid",
		title: "Comparison Grid",
		description:
			"Side-by-side comparison of concepts — perfect for vs comparisons and trade-off analysis",
		icon: "⚖️",
		gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
		color: "#43e97b",
		previewImage: "/visualizer/diagram-type-previews/comparison-grid.svg",
	},
	{
		type: "concept-explainer",
		title: "Concept Explainer",
		description:
			"Central concept with supporting sub-concepts — great for explaining complex ideas visually",
		icon: "💡",
		gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
		color: "#fa709a",
		previewImage: "/visualizer/diagram-type-previews/concept-explainer.svg",
	},
	{
		type: "pattern-catalog",
		title: "Pattern Catalog",
		description:
			"Grid of related patterns with icons — ideal for design patterns, best practices, and knowledge bases",
		icon: "🧩",
		gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
		color: "#a18cd1",
		previewImage: "/visualizer/diagram-type-previews/pattern-catalog.svg",
	},
	{
		type: "cheat-sheet",
		title: "Cheat Sheet",
		description:
			"Categorized reference cards — perfect for HTTP status codes, Git commands, and quick-reference guides",
		icon: "📝",
		gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
		color: "#ff6b6b",
		previewImage: "/visualizer/diagram-type-previews/cheat-sheet.svg",
	},
	{
		type: "timeline",
		title: "Timeline",
		description:
			"Chronological progression with milestones — ideal for processes, version histories, and learning paths",
		icon: "⏳",
		gradient: "linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)",
		color: "#0984e3",
		previewImage: "/visualizer/diagram-type-previews/timeline.svg",
	},
	{
		type: "mind-map",
		title: "Mind Map",
		description:
			"Hierarchical branching from a central topic — great for brainstorming, topic organization, and knowledge trees",
		icon: "🧠",
		gradient: "linear-gradient(135deg, #00b894 0%, #55efc4 100%)",
		color: "#00b894",
		previewImage: "/visualizer/diagram-type-previews/mind-map.svg",
	},
	{
		type: "matrix-table",
		title: "Matrix Table",
		description:
			"Structured grid with headers and cells — perfect for feature comparisons, decision matrices, and data tables",
		icon: "📊",
		gradient: "linear-gradient(135deg, #636e72 0%, #b2bec3 100%)",
		color: "#636e72",
		previewImage: "/visualizer/diagram-type-previews/matrix-table.svg",
	},
	{
		type: "decision-tree",
		title: "Decision Tree",
		description:
			"Binary branching paths with yes/no decisions — ideal for troubleshooting guides, algorithms, and decision logic",
		icon: "🌳",
		gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
		color: "#11998e",
		previewImage: "/visualizer/diagram-type-previews/decision-tree.svg",
	},
	{
		type: "hierarchy-chart",
		title: "Hierarchy Chart",
		description:
			"Top-down organizational structure — perfect for org charts, class hierarchies, and taxonomy trees",
		icon: "🏛️",
		gradient: "linear-gradient(135deg, #6a3093 0%, #a044ff 100%)",
		color: "#6a3093",
		previewImage: "/visualizer/diagram-type-previews/hierarchy-chart.svg",
	},
	{
		type: "sequence-diagram",
		title: "Sequence Diagram",
		description:
			"Actor interactions over time with request/response arrows — great for API flows, auth sequences, and protocols",
		icon: "🔄",
		gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
		color: "#ff9a9e",
		previewImage: "/visualizer/diagram-type-previews/sequence-diagram.svg",
	},
	{
		type: "kanban-board",
		title: "Kanban Board",
		description:
			"Column-based task board with cards — ideal for project workflows, sprint planning, and status tracking",
		icon: "📌",
		gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
		color: "#f7971e",
		previewImage: "/visualizer/diagram-type-previews/kanban-board.svg",
	},
	{
		type: "swot-analysis",
		title: "SWOT Analysis",
		description:
			"Four-quadrant grid for Strengths, Weaknesses, Opportunities, and Threats — perfect for strategic planning",
		icon: "🎯",
		gradient: "linear-gradient(135deg, #e44d26 0%, #f16529 100%)",
		color: "#e44d26",
		previewImage: "/visualizer/diagram-type-previews/swot-analysis.svg",
	},
	{
		type: "network-topology",
		title: "Network Topology",
		description:
			"Network devices with connections — ideal for routers, switches, servers, and infrastructure layouts",
		icon: "🌐",
		gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
		color: "#2193b0",
		previewImage: "/visualizer/diagram-type-previews/network-topology.svg",
	},
	{
		type: "hub-spoke-reference",
		title: "Hub & spoke reference",
		description:
			"Central topic with numbered spokes and detail cards — ideal for “N concepts around one theme” (e.g. database concepts around SQL)",
		icon: "🎯",
		gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
		color: "#0ea5e9",
		previewImage: "/visualizer/diagram-type-previews/hub-spoke-reference.png",
	},
	{
		type: "vertical-layer-stack",
		title: "Layered stack",
		description:
			"Numbered vertical layers with tech/context per layer — ideal for AI agent stacks, OSI-style layers, or platform slices",
		icon: "🧱",
		gradient: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
		color: "#22c55e",
		previewImage: "/visualizer/diagram-type-previews/vertical-layer-stack.png",
	},
	{
		type: "microservices-field-guide",
		title: "Microservices field guide",
		description:
			"Many small pattern mini-diagrams in a grid — ideal for API gateway, CQRS, saga, service mesh, and related microservice patterns",
		icon: "🛰️",
		gradient: "linear-gradient(135deg, #64748b 0%, #0ea5e9 100%)",
		color: "#64748b",
		previewImage:
			"/visualizer/diagram-type-previews/microservices-field-guide.png",
	},
	{
		type: "radial-domain-map",
		title: "Radial domain map",
		description:
			"Hub categories with child “cards” on curved paths — ideal for visa pathways, policy trees, or domain exploration maps",
		icon: "🗺️",
		gradient: "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)",
		color: "#f472b6",
		previewImage: "/visualizer/diagram-type-previews/radial-domain-map.png",
	},
	{
		type: "sectioned-playbook",
		title: "Sectioned playbook",
		description:
			"Multiple titled sections with tip cards — ideal for habit guides, checklists, and “how to optimize X” playbooks",
		icon: "📖",
		gradient: "linear-gradient(135deg, #f59e0b 0%, #eab308 100%)",
		color: "#f59e0b",
		previewImage: "/visualizer/diagram-type-previews/sectioned-playbook.png",
	},
	{
		type: "parallel-pipelines",
		title: "Parallel pipelines",
		description:
			"Side-by-side pipeline stories (source → bus → sinks) — ideal for event sourcing, CDC, CMS pipelines, and streaming architectures",
		icon: "⚡",
		gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
		color: "#ca8a04",
		previewImage: "/visualizer/diagram-type-previews/parallel-pipelines.png",
	},
	{
		type: "tier-list-ranking",
		title: "Tier list ranking",
		description:
			"Rows grouped by difficulty or priority tiers — ideal for interview question tier lists, roadmap prioritization, or skill ladders",
		icon: "🏆",
		gradient: "linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)",
		color: "#dc2626",
		previewImage: "/visualizer/diagram-type-previews/tier-list-ranking.png",
	},
	{
		type: "poster-blueprint",
		title: "Poster blueprint",
		description:
			"Large end-to-end system poster (client → gateways → services → data) — ideal for “master template” style system design overviews",
		icon: "🖼️",
		gradient: "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)",
		color: "#2563eb",
		previewImage: "/visualizer/diagram-type-previews/poster-blueprint.png",
	},
	{
		type: "numbered-pattern-sheet",
		title: "Numbered pattern sheet",
		description:
			"Numbered boxes each with a mini-diagram and caption — ideal for ambassador, circuit breaker, CQRS, sharding, pub/sub, etc.",
		icon: "🔢",
		gradient: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
		color: "#334155",
		previewImage:
			"/visualizer/diagram-type-previews/numbered-pattern-sheet.png",
	},
];

interface DiagramTypePickerProps {
	selectedType: DiagramType | null;
	onSelect: (type: DiagramType) => void;
}

export function DiagramTypePicker({
	selectedType,
	onSelect,
}: DiagramTypePickerProps) {
	return (
		<div className={styles.fadeIn}>
			<Title order={3} mb="xs" ta="center">
				Choose a diagram type
			</Title>
			<Text size="sm" c="dimmed" ta="center" mb="xl">
				Each card shows a short preview and description so you can match layout
				to your use case
			</Text>

			<div className={styles.typePickerGrid}>
				{diagramTypes.map((dt) => (
					<Paper
						key={dt.type}
						className={`${styles.typeCard} ${selectedType === dt.type ? styles.selected : ""}`}
						shadow="sm"
						withBorder
						onClick={() => onSelect(dt.type)}
						style={
							{
								"--type-gradient": dt.gradient,
							} as CSSProperties
						}
					>
						<div className={styles.typeCardMedia} aria-hidden>
							{dt.previewImage ? (
								<Image
									className={styles.typeCardPreviewImg}
									src={dt.previewImage}
									alt={`${dt.title} layout preview`}
									fill
									sizes="(max-width: 768px) 100vw, 320px"
									unoptimized
								/>
							) : (
								<div className={styles.typeCardPreviewGradient} />
							)}
						</div>
						<div className={styles.typeCardBody}>
							<div className={styles.typeCardIcon}>{dt.icon}</div>
							<Text className={styles.typeCardTitle}>{dt.title}</Text>
							<Text className={styles.typeCardDescription}>
								{dt.description}
							</Text>
						</div>
					</Paper>
				))}
			</div>
		</div>
	);
}

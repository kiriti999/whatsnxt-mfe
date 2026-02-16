'use client';

import React from 'react';
import { Paper, Text, Title } from '@mantine/core';
import type { DiagramType, DiagramTypeOption } from './types';
import styles from './visualizer.module.css';

const diagramTypes: DiagramTypeOption[] = [
    {
        type: 'step-content',
        title: 'Step Content',
        description: 'Sequential numbered cards with descriptions — perfect for best practices, checklists, and how-to guides',
        icon: '📋',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea',
    },
    {
        type: 'flow-diagram',
        title: 'Flow Diagram',
        description: 'Directional flow with nodes and arrows — great for showing data flow, request paths, and processes',
        icon: '🔀',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f093fb',
    },
    {
        type: 'architecture',
        title: 'Architecture Diagram',
        description: 'System components with connections — ideal for Kubernetes, microservices, and cloud infrastructure',
        icon: '🏗️',
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#4facfe',
    },
    {
        type: 'comparison-grid',
        title: 'Comparison Grid',
        description: 'Side-by-side comparison of concepts — perfect for vs comparisons and trade-off analysis',
        icon: '⚖️',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        color: '#43e97b',
    },
    {
        type: 'concept-explainer',
        title: 'Concept Explainer',
        description: 'Central concept with supporting sub-concepts — great for explaining complex ideas visually',
        icon: '💡',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        color: '#fa709a',
    },
    {
        type: 'pattern-catalog',
        title: 'Pattern Catalog',
        description: 'Grid of related patterns with icons — ideal for design patterns, best practices, and knowledge bases',
        icon: '🧩',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        color: '#a18cd1',
    },
    {
        type: 'cheat-sheet',
        title: 'Cheat Sheet',
        description: 'Categorized reference cards — perfect for HTTP status codes, Git commands, and quick-reference guides',
        icon: '📝',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
        color: '#ff6b6b',
    },
    {
        type: 'timeline',
        title: 'Timeline',
        description: 'Chronological progression with milestones — ideal for processes, version histories, and learning paths',
        icon: '⏳',
        gradient: 'linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)',
        color: '#0984e3',
    },
    {
        type: 'mind-map',
        title: 'Mind Map',
        description: 'Hierarchical branching from a central topic — great for brainstorming, topic organization, and knowledge trees',
        icon: '🧠',
        gradient: 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)',
        color: '#00b894',
    },
    {
        type: 'matrix-table',
        title: 'Matrix Table',
        description: 'Structured grid with headers and cells — perfect for feature comparisons, decision matrices, and data tables',
        icon: '📊',
        gradient: 'linear-gradient(135deg, #636e72 0%, #b2bec3 100%)',
        color: '#636e72',
    },
    {
        type: 'decision-tree',
        title: 'Decision Tree',
        description: 'Binary branching paths with yes/no decisions — ideal for troubleshooting guides, algorithms, and decision logic',
        icon: '🌳',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        color: '#11998e',
    },
    {
        type: 'hierarchy-chart',
        title: 'Hierarchy Chart',
        description: 'Top-down organizational structure — perfect for org charts, class hierarchies, and taxonomy trees',
        icon: '🏛️',
        gradient: 'linear-gradient(135deg, #6a3093 0%, #a044ff 100%)',
        color: '#6a3093',
    },
    {
        type: 'sequence-diagram',
        title: 'Sequence Diagram',
        description: 'Actor interactions over time with request/response arrows — great for API flows, auth sequences, and protocols',
        icon: '🔄',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        color: '#ff9a9e',
    },
    {
        type: 'kanban-board',
        title: 'Kanban Board',
        description: 'Column-based task board with cards — ideal for project workflows, sprint planning, and status tracking',
        icon: '📌',
        gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        color: '#f7971e',
    },
    {
        type: 'swot-analysis',
        title: 'SWOT Analysis',
        description: 'Four-quadrant grid for Strengths, Weaknesses, Opportunities, and Threats — perfect for strategic planning',
        icon: '🎯',
        gradient: 'linear-gradient(135deg, #e44d26 0%, #f16529 100%)',
        color: '#e44d26',
    },
    {
        type: 'network-topology',
        title: 'Network Topology',
        description: 'Network devices with connections — ideal for visualizing routers, switches, servers, and infrastructure layouts',
        icon: '🌐',
        gradient: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
        color: '#2193b0',
    },
];

interface DiagramTypePickerProps {
    selectedType: DiagramType | null;
    onSelect: (type: DiagramType) => void;
}

export function DiagramTypePicker({ selectedType, onSelect }: DiagramTypePickerProps) {
    return (
        <div className={styles.fadeIn}>
            <Title order={3} mb="xs" ta="center">
                Choose a diagram type
            </Title>
            <Text size="sm" c="dimmed" ta="center" mb="xl">
                Select the style that best fits your visualization needs
            </Text>

            <div className={styles.typePickerGrid}>
                {diagramTypes.map((dt) => (
                    <Paper
                        key={dt.type}
                        className={`${styles.typeCard} ${selectedType === dt.type ? styles.selected : ''}`}
                        shadow="sm"
                        withBorder
                        onClick={() => onSelect(dt.type)}
                        style={{
                            '--type-gradient': dt.gradient,
                        } as React.CSSProperties}
                    >
                        <div>
                            <div className={styles.typeCardIcon}>{dt.icon}</div>
                            <Text className={styles.typeCardTitle}>{dt.title}</Text>
                            <Text className={styles.typeCardDescription}>{dt.description}</Text>
                        </div>
                    </Paper>
                ))}
            </div>
        </div>
    );
}

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

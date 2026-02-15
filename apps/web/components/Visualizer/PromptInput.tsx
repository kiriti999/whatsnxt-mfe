'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Select, Stack, Group, Button, Text, Loader } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import type { DiagramOptions, DiagramType } from './types';
import { AISuggestionButton } from '../Common/AISuggestionButton';
import styles from './visualizer.module.css';

const LexicalEditor = dynamic(
    () =>
        import('../StructuredTutorial/Editor/LexicalEditor').then((mod) => ({
            default: mod.LexicalEditor,
        })),
    { ssr: false, loading: () => <Loader size="sm" /> },
);

/** Recursively extract plain text from a Lexical JSON node tree. */
function getTextFromNode(node: Record<string, unknown>): string {
    if (node.type === 'text') return (node.text as string) || '';
    if (!Array.isArray(node.children)) return '';
    const texts = (node.children as Record<string, unknown>[]).map(getTextFromNode);
    return node.type === 'root' ? texts.join('\n') : texts.join('');
}

/** Convert serialized Lexical JSON state to plain text. */
function extractTextContent(json: string): string {
    try {
        const state = JSON.parse(json);
        return getTextFromNode(state.root).trim();
    } catch {
        return json;
    }
}

const THEME_OPTIONS = [
    { value: 'default', label: '🔵 Default Blue' },
    { value: 'dark', label: '🌙 Dark Mode' },
    { value: 'pastel', label: '🎀 Pastel' },
    { value: 'vibrant', label: '🌈 Vibrant' },
    { value: 'monochrome', label: '⬛ Monochrome' },
    { value: 'ocean', label: '🌊 Ocean' },
    { value: 'sunset', label: '🌅 Sunset' },
    { value: 'forest', label: '🌲 Forest' },
];

const LAYOUT_OPTIONS = [
    { value: 'auto', label: 'Auto (AI decides)' },
    { value: 'grid', label: 'Grid' },
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
];

const STYLE_OPTIONS = [
    { value: 'detailed', label: 'Detailed' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'infographic', label: 'Infographic' },
];

const TYPE_LABELS: Record<DiagramType, { label: string; icon: string }> = {
    'step-content': { label: 'Step Content', icon: '📋' },
    'flow-diagram': { label: 'Flow Diagram', icon: '🔀' },
    'architecture': { label: 'Architecture', icon: '🏗️' },
    'comparison-grid': { label: 'Comparison Grid', icon: '⚖️' },
    'concept-explainer': { label: 'Concept Explainer', icon: '💡' },
    'pattern-catalog': { label: 'Pattern Catalog', icon: '🧩' },
};

const PLACEHOLDER_PROMPTS: Record<DiagramType, string> = {
    'step-content': 'Create a diagram showing 10 coding best practices every developer should follow...',
    'flow-diagram': 'Show how a request flows through a load balancer to multiple backend servers with caching and database layers...',
    'architecture': 'Create a Kubernetes architecture showing Pods, ReplicaSets, Deployments, Services, and Ingress...',
    'comparison-grid': 'Compare SQL vs NoSQL databases across performance, scalability, schema flexibility, and use cases...',
    'concept-explainer': 'Explain the concept of idempotency in distributed systems with strategies and examples...',
    'pattern-catalog': 'Show 12 system design patterns including Circuit Breaker, CQRS, Event Sourcing, Saga...',
};

interface PromptInputProps {
    diagramType: DiagramType;
    prompt: string;
    options: DiagramOptions;
    isLoading: boolean;
    onPromptChange: (prompt: string) => void;
    onOptionsChange: (options: Partial<DiagramOptions>) => void;
    onGenerate: () => void;
    onBack: () => void;
}

export function PromptInput({
    diagramType,
    prompt,
    options,
    isLoading,
    onPromptChange,
    onOptionsChange,
    onGenerate,
    onBack,
}: PromptInputProps) {
    const typeInfo = TYPE_LABELS[diagramType];
    const [editorJson, setEditorJson] = useState('');
    const promptRef = useRef(prompt);
    promptRef.current = prompt;

    const handleGenerate = () => {
        if (prompt.trim().length > 0 && !isLoading) {
            onGenerate();
        }
    };

    const handleEditorChange = useCallback(
        (json: string) => {
            setEditorJson(json);
            onPromptChange(extractTextContent(json));
        },
        [onPromptChange],
    );

    /** Push AI suggestion into the editor by resetting editorJson so editorValue falls back to the new prompt. */
    const handleAISuggestion = useCallback(
        (suggestion: string) => {
            setEditorJson('');
            onPromptChange(suggestion);
        },
        [onPromptChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleGenerate();
        }
    };

    const editorValue = editorJson || prompt;

    return (
        <div className={`${styles.promptContainer} ${styles.fadeIn}`}>
            <button type="button" className={styles.backButton} onClick={onBack}>
                ← Back to diagram types
            </button>

            <div className={styles.selectedTypeTag}>
                <span>{typeInfo.icon}</span>
                <span>{typeInfo.label}</span>
            </div>

            <Stack gap="md">
                <div>
                    <Group gap={4} mb={4}>
                        <Text component="label" size="sm" fw={500}>
                            Describe your diagram
                        </Text>
                        <AISuggestionButton
                            prompt={() => promptRef.current}
                            onSuggestion={handleAISuggestion}
                            label="AI-generate description from prompt"
                        />
                    </Group>
                    <Text size="xs" c="dimmed" mb={6}>
                        Be specific about the concepts, number of items, and relationships you want to visualize
                    </Text>
                    <div onKeyDown={handleKeyDown}>
                        <LexicalEditor
                            value={editorValue}
                            onChange={handleEditorChange}
                            placeholder={PLACEHOLDER_PROMPTS[diagramType]}
                        />
                    </div>
                </div>

                <div className={styles.optionsGrid}>
                    <div>
                        <Select
                            label="Color Theme"
                            data={THEME_OPTIONS}
                            value={options.theme}
                            onChange={(val) => onOptionsChange({ theme: val ?? 'default' })}
                            size="sm"
                        />
                    </div>
                    <div>
                        <Select
                            label="Layout"
                            data={LAYOUT_OPTIONS}
                            value={options.layout}
                            onChange={(val) => onOptionsChange({ layout: val ?? 'auto' })}
                            size="sm"
                        />
                    </div>
                    <div>
                        <Select
                            label="Visual Style"
                            data={STYLE_OPTIONS}
                            value={options.style}
                            onChange={(val) => onOptionsChange({ style: val ?? 'detailed' })}
                            size="sm"
                        />
                    </div>
                </div>

                <Group justify="center" mt="md">
                    <Button
                        className={styles.generateButton}
                        onClick={onGenerate}
                        disabled={!prompt.trim() || isLoading}
                        loading={isLoading}
                        leftSection={<IconSparkles size={20} />}
                        size="lg"
                        variant="filled"
                        style={{
                            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            color: '#1a1a2e',
                        }}
                    >
                        {isLoading ? 'Generating...' : 'Generate Diagram ✨'}
                    </Button>
                </Group>

                <Text size="xs" c="dimmed" ta="center" mt="xs">
                    Press <b>⌘ + Enter</b> to generate quickly
                </Text>
            </Stack>
        </div>
    );
}

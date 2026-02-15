'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Group,
    ThemeIcon,
    Notification,
} from '@mantine/core';
import {
    IconPalette,
    IconEdit,
    IconHistory,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import { DiagramTypePicker } from './DiagramTypePicker';
import { PromptInput } from './PromptInput';
import { DiagramCanvas } from './DiagramCanvas';
import { ExportToolbar } from './ExportToolbar';
import { DiagramEditPanel } from './DiagramEditPanel';
import { VisualizerAPI } from '../../apis/v1/visualizer';
import { useUndoRedo } from './hooks/useUndoRedo';
import type { DiagramType, DiagramData, DiagramOptions, BuilderStep } from './types';
import styles from './visualizer.module.css';
import { AIConfigModal } from '../Common/AIConfigModal';
import { useAIConfig } from '../../context/AIConfigContext';
import useAuth from '../../hooks/Authentication/useAuth';

const STEP_LABELS: Record<BuilderStep, { label: string; number: string }> = {
    'select-type': { label: 'Choose Type', number: '1' },
    'prompt': { label: 'Describe', number: '2' },
    'preview': { label: 'Preview & Export', number: '3' },
};

export function VisualizerBuilder() {
    const router = useRouter();
    const { user } = useAuth();

    // Builder state
    const [step, setStep] = useState<BuilderStep>('select-type');
    const [selectedType, setSelectedType] = useState<DiagramType | null>(null);
    const [prompt, setPrompt] = useState('');
    const [options, setOptions] = useState<DiagramOptions>({
        theme: 'default',
        layout: 'auto',
        style: 'detailed',
    });

    // Generation state
    const [isLoading, setIsLoading] = useState(false);
    const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aiModel, setAiModel] = useState<string>('');
    const [notification, setNotification] = useState<{ message: string; color: string } | null>(null);

    // Phase 3: Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const { canUndo, canRedo, pushState, undo, redo, reset } = useUndoRedo(null);

    // AI Config from context
    const aiConfig = useAIConfig();

    // API Key Modal state
    const [apiKeyModalOpened, { open: openApiKeyModal, close: closeApiKeyModal }] = useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState('');
    const [pendingGenerate, setPendingGenerate] = useState(false);

    // Reset undo stack when new diagram is generated
    const setDiagramWithHistory = useCallback(
        (data: DiagramData) => {
            setDiagramData(data);
            reset(data);
        },
        [reset],
    );

    const handleTypeSelect = useCallback((type: DiagramType) => {
        setSelectedType(type);
        setStep('prompt');
        setError(null);
    }, []);

    const handleOptionsChange = useCallback((partial: Partial<DiagramOptions>) => {
        setOptions((prev) => ({ ...prev, ...partial }));
    }, []);

    /**
     * Check if an error is an API key issue and show the modal
     */
    const handleApiError = useCallback(
        (err: any): boolean => {
            let errorMessage = err?.message || '';
            const status = err?.response?.status;
            const backendMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                '';

            if (backendMsg) errorMessage = backendMsg;

            const isKeyError =
                status === 401 ||
                status === 429 ||
                status === 422 ||
                errorMessage.toLowerCase().includes('api key') ||
                errorMessage.toLowerCase().includes('rate limit') ||
                errorMessage.toLowerCase().includes('quota') ||
                errorMessage.toLowerCase().includes('billing') ||
                errorMessage.toLowerCase().includes('not active') ||
                errorMessage.toLowerCase().includes('insufficient') ||
                errorMessage.toLowerCase().includes('overloaded') ||
                errorMessage.toLowerCase().includes('not_found_error') ||
                errorMessage.toLowerCase().includes('model not found') ||
                errorMessage.toLowerCase().includes('authentication') ||
                errorMessage.toLowerCase().includes('unauthorized');

            if (isKeyError) {
                let displayMsg = errorMessage;
                if (status === 422 || errorMessage.toLowerCase().includes('not_found_error')) {
                    displayMsg =
                        'The selected AI model is unavailable or deprecated. Please choose a different model and try again.';
                } else if (status === 429) {
                    displayMsg =
                        backendMsg ||
                        'API rate limit exceeded. Please provide your own API key or try a different provider.';
                } else if (status === 401) {
                    displayMsg =
                        backendMsg ||
                        'Authentication failed. Please provide a valid API key.';
                } else if (!backendMsg) {
                    displayMsg =
                        'AI generation failed. Please provide your own API key to continue.';
                }
                setApiKeyError(displayMsg);
                openApiKeyModal();
                return true;
            }
            return false;
        },
        [openApiKeyModal],
    );

    const handleGenerate = useCallback(async () => {
        if (!selectedType || !prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setStep('preview');
        setIsEditing(false);
        setSelectedNodeId(null);

        try {
            const response = await VisualizerAPI.generateDiagram({
                diagramType: selectedType,
                prompt: prompt.trim(),
                options: {
                    theme: options.theme,
                    layout: options.layout === 'auto' ? undefined : options.layout,
                    style: options.style,
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
                },
            });

            if (response?.success && response?.data?.diagramData) {
                setDiagramWithHistory(response.data.diagramData);
                setAiModel(response.data.aiModel || '');
            } else {
                const errMsg = response?.error || 'Failed to generate diagram';
                if (!handleApiError({ message: errMsg, response: { status: 0, data: response } })) {
                    throw new Error(errMsg);
                }
            }
        } catch (err: any) {
            console.error('Generate error:', err);
            if (!handleApiError(err)) {
                setError(err.message || 'An unexpected error occurred');
                setDiagramData(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedType, prompt, options, setDiagramWithHistory, handleApiError, aiConfig.selectedAI, aiConfig.selectedModel]);

    const handleRegenerate = useCallback(async () => {
        if (!selectedType || !prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setIsEditing(false);
        setSelectedNodeId(null);

        try {
            const response = await VisualizerAPI.regenerateDiagram({
                diagramType: selectedType,
                prompt: prompt.trim(),
                options: {
                    theme: options.theme,
                    layout: options.layout === 'auto' ? undefined : options.layout,
                    style: options.style,
                    aiModel: aiConfig.selectedAI,
                    modelVersion: aiConfig.selectedModel,
                },
            });

            if (response?.success && response?.data?.diagramData) {
                setDiagramWithHistory(response.data.diagramData);
                setAiModel(response.data.aiModel || '');
            } else {
                const errMsg = response?.error || 'Failed to regenerate diagram';
                if (!handleApiError({ message: errMsg, response: { status: 0, data: response } })) {
                    throw new Error(errMsg);
                }
            }
        } catch (err: any) {
            console.error('Regenerate error:', err);
            if (!handleApiError(err)) {
                setError(err.message || 'An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedType, prompt, options, setDiagramWithHistory, handleApiError, aiConfig.selectedAI, aiConfig.selectedModel]);

    const handleSave = useCallback(async () => {
        if (!selectedType || !diagramData) return;

        try {
            await VisualizerAPI.saveDiagram({
                title: diagramData.title || 'Untitled Diagram',
                diagramType: selectedType,
                prompt,
                options: {
                    theme: options.theme,
                    layout: options.layout,
                    style: options.style,
                },
                diagramData,
                aiModel,
            });

            setNotification({ message: 'Diagram saved to your history!', color: 'green' });
            setTimeout(() => setNotification(null), 3000);
        } catch (err: any) {
            console.error('Save error:', err);
            setNotification({
                message: err.message || 'Failed to save diagram',
                color: 'red',
            });
            setTimeout(() => setNotification(null), 4000);
        }
    }, [selectedType, diagramData, prompt, options, aiModel]);

    // --- API Key Modal handlers ---
    const handleModalGenerate = useCallback(() => {
        setApiKeyError('');
        closeApiKeyModal();
        setPendingGenerate(true);
    }, [closeApiKeyModal]);

    const handleSaveKeyAndGenerate = useCallback(() => {
        setApiKeyError('');
        closeApiKeyModal();
        setPendingGenerate(true);
    }, [closeApiKeyModal]);

    // Effect to trigger generation after modal closes with pending generate
    useEffect(() => {
        if (pendingGenerate && !apiKeyModalOpened) {
            setPendingGenerate(false);
            handleGenerate();
        }
    }, [pendingGenerate, apiKeyModalOpened, handleGenerate]);

    // Phase 3: Edit handlers
    const handleUpdateDiagram = useCallback(
        (newData: DiagramData) => {
            setDiagramData(newData);
            pushState(newData);
        },
        [pushState],
    );

    const handleUndo = useCallback(() => {
        const prevData = undo();
        if (prevData) setDiagramData(prevData);
    }, [undo]);

    const handleRedo = useCallback(() => {
        const nextData = redo();
        if (nextData) setDiagramData(nextData);
    }, [redo]);

    const handleNodeSelect = useCallback(
        (nodeId: string | null) => {
            setSelectedNodeId(nodeId);
            if (nodeId && !isEditing) setIsEditing(true);
        },
        [isEditing],
    );

    const toggleEditing = useCallback(() => {
        setIsEditing((prev) => {
            if (prev) setSelectedNodeId(null);
            return !prev;
        });
    }, []);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleUndo, handleRedo]);

    const handleBackToTypes = useCallback(() => {
        setStep('select-type');
        setError(null);
        setIsEditing(false);
        setSelectedNodeId(null);
    }, []);

    const handleBackToPrompt = useCallback(() => {
        setStep('prompt');
        setError(null);
        setIsEditing(false);
        setSelectedNodeId(null);
    }, []);

    const isStepCompleted = (s: BuilderStep): boolean => {
        if (s === 'select-type') return !!selectedType;
        if (s === 'prompt') return !!prompt.trim();
        return false;
    };

    return (
        <div className={styles.builderContainer}>
            <Container size="xl" py="xl">
                {/* Header */}
                <div className={styles.header}>
                    <Group justify="center" gap="xs" mb="xs">
                        <ThemeIcon
                            size="xl"
                            radius="md"
                            variant="gradient"
                            gradient={{ from: '#fa709a', to: '#fee140', deg: 135 }}
                        >
                            <IconPalette size={24} />
                        </ThemeIcon>
                        <Title
                            order={1}
                            size="h2"
                            className={styles.headerTitle}
                        >
                            Visualizer Builder
                        </Title>
                    </Group>
                    <Text className={styles.headerSubtitle} c="dimmed">
                        Create stunning architectural diagrams with AI assistance
                    </Text>
                </div>

                {/* Step Indicators */}
                <div className={styles.stepper}>
                    {(['select-type', 'prompt', 'preview'] as BuilderStep[]).map((s, i) => (
                        <React.Fragment key={s}>
                            {i > 0 && <div className={styles.stepDivider} />}
                            <div
                                className={`${styles.stepIndicator} ${step === s ? 'active' : ''} ${isStepCompleted(s) ? 'completed' : ''}`}
                                style={{
                                    opacity: step === s ? 1 : isStepCompleted(s) ? 0.8 : 0.4,
                                    background: step === s ? 'rgba(250, 112, 154, 0.1)' : 'transparent',
                                    border: step === s ? '1px solid rgba(250, 112, 154, 0.3)' : '1px solid transparent',
                                    cursor: isStepCompleted(s) && step !== s ? 'pointer' : 'default',
                                    borderRadius: '2rem',
                                    padding: '0.5rem 1rem',
                                }}
                                onClick={() => {
                                    if (s === 'select-type') handleBackToTypes();
                                    if (s === 'prompt' && isStepCompleted('select-type')) setStep('prompt');
                                }}
                            >
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: step === s ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'rgba(0,0,0,0.08)',
                                    color: step === s ? '#1a1a2e' : 'inherit',
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}>
                                    {isStepCompleted(s) && step !== s ? '✓' : STEP_LABELS[s].number}
                                </span>
                                <span>{STEP_LABELS[s].label}</span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Notifications */}
                {notification && (
                    <Notification
                        color={notification.color}
                        onClose={() => setNotification(null)}
                        mb="md"
                        withCloseButton
                    >
                        {notification.message}
                    </Notification>
                )}

                {/* Error Banner */}
                {error && step === 'preview' && (
                    <div className={styles.errorBanner}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Content based on step */}
                {step === 'select-type' && (
                    <DiagramTypePicker
                        selectedType={selectedType}
                        onSelect={handleTypeSelect}
                    />
                )}

                {step === 'prompt' && selectedType && (
                    <PromptInput
                        diagramType={selectedType}
                        prompt={prompt}
                        options={options}
                        isLoading={isLoading}
                        onPromptChange={setPrompt}
                        onOptionsChange={handleOptionsChange}
                        onGenerate={handleGenerate}
                        onBack={handleBackToTypes}
                    />
                )}

                {step === 'preview' && selectedType && (
                    <div className={styles.previewLayout}>
                        <div className={styles.previewHeader}>
                            <Group gap="sm">
                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={handleBackToPrompt}
                                    style={{ marginBottom: 0 }}
                                >
                                    ← Edit Prompt
                                </button>
                                {aiModel && (
                                    <Text size="xs" c="dimmed">
                                        Generated with {aiModel}
                                    </Text>
                                )}
                            </Group>
                            <Group gap="sm">
                                {diagramData && (
                                    <button
                                        type="button"
                                        className={`${styles.editToggle} ${isEditing ? styles.editToggleActive : ''}`}
                                        onClick={toggleEditing}
                                    >
                                        <IconEdit size={14} />
                                        {isEditing ? 'Close Editor' : 'Edit'}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.galleryLink}
                                    onClick={() => router.push('/form/diagrams')}
                                >
                                    <IconHistory size={14} />
                                    My Diagrams
                                </button>
                            </Group>
                        </div>

                        {/* Canvas + (optional) Edit Panel */}
                        <div className={isEditing ? styles.previewWithEdit : undefined}>
                            <DiagramCanvas
                                diagramData={diagramData}
                                diagramType={selectedType}
                                isLoading={isLoading}
                                error={error}
                                onNodeSelect={isEditing ? handleNodeSelect : undefined}
                                selectedNodeId={isEditing ? selectedNodeId : null}
                            />

                            {isEditing && diagramData && (
                                <DiagramEditPanel
                                    diagramData={diagramData}
                                    selectedNodeId={selectedNodeId}
                                    onSelectNode={handleNodeSelect}
                                    onUpdateDiagram={handleUpdateDiagram}
                                    onClose={() => setIsEditing(false)}
                                    canUndo={canUndo}
                                    canRedo={canRedo}
                                    onUndo={handleUndo}
                                    onRedo={handleRedo}
                                />
                            )}
                        </div>

                        {diagramData && (
                            <ExportToolbar
                                onRegenerate={handleRegenerate}
                                onSave={handleSave}
                                isLoading={isLoading}
                                hasDiagram={!!diagramData}
                                diagramTitle={diagramData.title}
                                prompt={prompt}
                                email={user?.email}
                            />
                        )}
                    </div>
                )}

                {/* API Key Modal */}
                <AIConfigModal
                    opened={apiKeyModalOpened}
                    onClose={closeApiKeyModal}
                    selectedAI={aiConfig.selectedAI}
                    selectedModel={aiConfig.selectedModel}
                    onProviderChange={aiConfig.setSelectedAI}
                    onModelChange={aiConfig.setSelectedModel}
                    onGenerate={handleModalGenerate}
                    onSaveKeyAndGenerate={handleSaveKeyAndGenerate}
                    onNotification={(n) => {
                        setNotification(n);
                        setTimeout(() => setNotification(null), 3000);
                    }}
                    error={apiKeyError}
                />
            </Container>
        </div>
    );
}

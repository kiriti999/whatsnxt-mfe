'use client';

import React, { useState, useCallback } from 'react';
import { ActionIcon, Loader, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconSparkles } from '@tabler/icons-react';
import { AISuggestions } from '../../apis/v1/blog/aiSuggestions';
import { AIConfigModal } from './AIConfigModal';
import { useAIConfig } from '../../context/AIConfigContext';

export interface AISuggestionButtonProps {
    /** The prompt/question to send to the AI — string or getter function (getter avoids re-renders) */
    prompt: string | (() => string);
    /** Called with the AI-generated suggestion text */
    onSuggestion: (suggestion: string) => void;
    /** Tooltip label (default: "Generate with AI") */
    label?: string;
    /** Optional: called when prompt is empty */
    onEmptyPrompt?: () => void;
    /** Icon size (default: 18) */
    iconSize?: number;
    /** Additional props */
    disabled?: boolean;
    className?: string;
}

export function AISuggestionButton({
    prompt,
    onSuggestion,
    label = 'Generate with AI',
    onEmptyPrompt,
    iconSize = 18,
    disabled,
    className,
}: AISuggestionButtonProps) {
    const aiConfig = useAIConfig();
    const [isFetching, setIsFetching] = useState(false);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [apiKeyError, setApiKeyError] = useState('');

    const fetchSuggestion = useCallback(async () => {
        const resolvedPrompt = typeof prompt === 'function' ? prompt() : prompt;
        if (!resolvedPrompt.trim()) {
            if (onEmptyPrompt) {
                onEmptyPrompt();
            } else {
                notifications.show({
                    position: 'bottom-right',
                    color: 'orange',
                    title: 'Empty Prompt',
                    message: 'Please enter a prompt first',
                });
            }
            return;
        }

        setIsFetching(true);
        try {
            const response = await AISuggestions.getSuggestionByAI({
                question: resolvedPrompt,
                aiModel: aiConfig.selectedAI,
                modelVersion: aiConfig.selectedModel,
            });

            if (response.status === 200 && response.data?.suggestion) {
                onSuggestion(response.data.suggestion);
                notifications.show({
                    position: 'bottom-right',
                    color: 'green',
                    title: 'Success',
                    message: `AI suggestions loaded using ${response.data.model || aiConfig.selectedAI}`,
                });
            } else {
                const errorMsg =
                    response.data?.message ||
                    response.data?.error ||
                    'API request failed. Please provide your API key.';
                setApiKeyError(errorMsg);
                openModal();
            }
        } catch (error: any) {
            console.error('Error fetching suggestion:', error);

            let errorMessage = 'Failed to fetch AI suggestions. Please provide your API key.';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            if (!error?.response?.data?.message && !error?.response?.data?.error) {
                if (error?.response?.status === 429) {
                    errorMessage =
                        'API rate limit exceeded. Please provide your own API key to continue.';
                } else if (error?.response?.status === 401) {
                    errorMessage =
                        error?.message || 'Authentication failed. Please provide a valid API key.';
                } else if (error?.response?.status === 500 && !error?.message) {
                    errorMessage =
                        'Server error. The API account may be inactive or have billing issues. Please provide your own API key.';
                }
            }

            setApiKeyError(errorMessage);
            openModal();
        } finally {
            setIsFetching(false);
        }
    }, [prompt, aiConfig.selectedAI, aiConfig.selectedModel, onSuggestion, onEmptyPrompt, openModal]);

    const handleModalGenerate = useCallback(() => {
        setApiKeyError('');
        closeModal();
        fetchSuggestion();
    }, [closeModal, fetchSuggestion]);

    const handleSaveKeyAndGenerate = useCallback(() => {
        setApiKeyError('');
        closeModal();
        fetchSuggestion();
    }, [closeModal, fetchSuggestion]);

    return (
        <>
            <Tooltip label={label} withArrow>
                <ActionIcon
                    variant="subtle"
                    color="violet"
                    onClick={fetchSuggestion}
                    disabled={disabled || isFetching}
                    className={className}
                    size="sm"
                    style={{ display: 'inline-flex' }}
                >
                    {isFetching ? <Loader size={14} /> : <IconSparkles size={iconSize} />}
                </ActionIcon>
            </Tooltip>

            <AIConfigModal
                opened={modalOpened}
                onClose={closeModal}
                selectedAI={aiConfig.selectedAI}
                selectedModel={aiConfig.selectedModel}
                onProviderChange={aiConfig.setSelectedAI}
                onModelChange={aiConfig.setSelectedModel}
                onGenerate={handleModalGenerate}
                onSaveKeyAndGenerate={handleSaveKeyAndGenerate}
                onNotification={(n) => {
                    notifications.show({
                        position: 'bottom-right',
                        color: n.color,
                        title: 'API Key Saved',
                        message: n.message,
                    });
                }}
                error={apiKeyError}
            />
        </>
    );
}

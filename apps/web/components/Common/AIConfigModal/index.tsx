"use client";

import {
    Alert,
    Anchor,
    Button,
    Group,
    Modal,
    Select,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import React, { useCallback, useState } from "react";
import { AISuggestions } from "../../../apis/v1/blog/aiSuggestions";

const AI_PROVIDERS = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "gemini", label: "Google (Gemini)" },
];

const AI_MODELS: Record<string, { value: string; label: string }[]> = {
    openai: [
        { value: "gpt-4.1", label: "GPT-4.1 (Latest)" },
        { value: "gpt-4.1-mini", label: "GPT-4.1 Mini (Fast & Affordable)" },
        { value: "gpt-4.1-nano", label: "GPT-4.1 Nano (Cheapest)" },
        { value: "o3", label: "o3 (Advanced Reasoning)" },
        { value: "o4-mini", label: "o4-mini (Fast Reasoning)" },
    ],
    anthropic: [
        { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5 (Balanced)" },
        { value: process.env.NEXT_PUBLIC_DEFAULT_MODEL_VERSION as string, label: "Claude Haiku 4.5 (Fast)" },
        { value: "claude-opus-4-6", label: "Claude Opus 4.6 (Most Capable)" },
    ],
    gemini: [
        { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast)" },
        { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Advanced)" },
        {
            value: "gemini-2.5-flash-lite",
            label: "Gemini 2.5 Flash Lite (Cheapest)",
        },
    ],
};

const DEFAULT_MODELS: Record<string, string> = {
    openai: "gpt-4.1-mini",
    anthropic: "claude-sonnet-4-5",
    gemini: "gemini-2.5-flash",
};

const API_KEY_LINKS: Record<string, { label: string; href: string }> = {
    openai: {
        label: "OpenAI API Keys",
        href: "https://platform.openai.com/api-keys",
    },
    anthropic: {
        label: "Anthropic API Keys",
        href: "https://console.anthropic.com/settings/keys",
    },
    gemini: {
        label: "Google AI Studio",
        href: "https://aistudio.google.com/app/apikey",
    },
};

const API_KEY_PLACEHOLDERS: Record<string, string> = {
    openai: "sk-...",
    anthropic: "sk-ant-...",
    gemini: "AI...",
};

export interface AIConfigModalProps {
    opened: boolean;
    onClose: () => void;
    selectedAI: string;
    selectedModel: string;
    onProviderChange: (provider: string) => void;
    onModelChange: (model: string) => void;
    /** Called when user clicks "Generate" (no key save) */
    onGenerate: () => void;
    /** Called after a successful API key save + generate */
    onSaveKeyAndGenerate?: () => void;
    /** Optional notification callback for key save success */
    onNotification?: (notification: { message: string; color: string }) => void;
    /** External error message to display (e.g. from a failed generation) */
    error?: string;
}

export function AIConfigModal({
    opened,
    onClose,
    selectedAI,
    selectedModel,
    onProviderChange,
    onModelChange,
    onGenerate,
    onSaveKeyAndGenerate,
    onNotification,
    error,
}: AIConfigModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [apiKeyError, setApiKeyError] = useState("");

    const handleProviderChange = useCallback(
        (value: string | null) => {
            const provider = value || "openai";
            onProviderChange(provider);
            onModelChange(DEFAULT_MODELS[provider] || "gpt-4.1-mini");
        },
        [onProviderChange, onModelChange],
    );

    const handleSaveKeyAndGenerate = useCallback(async () => {
        if (!apiKey.trim()) {
            setApiKeyError("Please enter a valid API key");
            return;
        }

        console.log('[AIConfigModal] Saving AI config:', {
            provider: selectedAI,
            model: selectedModel,
            hasApiKey: !!apiKey
        });

        try {
            const response = await AISuggestions.saveAIConfig({
                apiKey,
                aiModel: selectedAI,
                modelVersion: selectedModel,
            });

            console.log('[AIConfigModal] Save response:', {
                status: response.status,
                message: response.data?.message
            });

            if (response.status === 200 || response.status === 201) {
                onNotification?.({
                    message:
                        response.data?.message ||
                        "Your API key has been saved successfully",
                    color: "green",
                });
                setApiKey("");
                setApiKeyError("");
                onSaveKeyAndGenerate?.();
            } else {
                setApiKeyError(
                    response.data?.message ||
                    response.data?.error ||
                    "Failed to save API key",
                );
            }
        } catch (err: any) {
            let errorMessage = "Failed to save API key. Please try again.";

            if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err?.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err?.message) {
                errorMessage = err.message;
                if (
                    err.message.includes("Route") &&
                    err.message.includes("not found")
                ) {
                    errorMessage = `${err.message}. Please contact support.`;
                }
            }

            if (
                !err?.response?.data?.message &&
                !err?.response?.data?.error &&
                !err?.message
            ) {
                if (err?.response?.status === 404) {
                    errorMessage =
                        "API endpoint not found. This feature may not be available yet.";
                } else if (err?.response?.status === 401) {
                    errorMessage = "Invalid API key. Please check and try again.";
                }
            }

            setApiKeyError(errorMessage);
        }
    }, [apiKey, selectedAI, selectedModel, onSaveKeyAndGenerate, onNotification]);

    const displayError = apiKeyError || error;
    const keyLink = API_KEY_LINKS[selectedAI];

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Configure AI Assistant"
            centered
            size="lg"
            zIndex={1000000}
        >
            <Stack gap="md">
                {displayError && (
                    <Alert color="red" variant="light">
                        {displayError}
                    </Alert>
                )}

                <Text size="sm" fw={500}>
                    Select your AI provider and model. Optionally add your own API key to
                    overcome rate limits.
                </Text>

                <Select
                    label="Select AI Provider"
                    placeholder="Choose AI provider"
                    value={selectedAI}
                    onChange={handleProviderChange}
                    data={AI_PROVIDERS}
                    comboboxProps={{ withinPortal: false }}
                />

                <Select
                    label="Select Model Version"
                    placeholder="Choose model"
                    value={selectedModel}
                    onChange={(value) => onModelChange(value || selectedModel)}
                    data={AI_MODELS[selectedAI] || AI_MODELS.openai}
                    comboboxProps={{ withinPortal: false }}
                />

                {keyLink && (
                    <Text size="xs" c="dimmed">
                        Get your key:{" "}
                        <Anchor href={keyLink.href} target="_blank">
                            {keyLink.label}
                        </Anchor>
                    </Text>
                )}

                <TextInput
                    label="Your API Key (Optional)"
                    placeholder={`Paste your ${API_KEY_PLACEHOLDERS[selectedAI] || "API"} key here`}
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        setApiKeyError("");
                    }}
                    description="Optional — leave blank to use the default system key"
                />

                <Group justify="flex-end">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    {apiKey.trim() && (
                        <Button variant="light" onClick={handleSaveKeyAndGenerate}>
                            Save Key & Generate
                        </Button>
                    )}
                    <Button onClick={onGenerate}>Generate</Button>
                </Group>
            </Stack>
        </Modal>
    );
}

export { AI_PROVIDERS, AI_MODELS, DEFAULT_MODELS };

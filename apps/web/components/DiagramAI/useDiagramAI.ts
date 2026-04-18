"use client";

import { useState, useCallback, useRef } from "react";

const MAX_REQUESTS = 5;
const STORAGE_KEY = "diagram_ai_usage";

/** Persist/restore the usage count across page reloads within the same session */
const getStoredCount = (): number => {
    if (typeof window === "undefined") return 0;
    try {
        const val = sessionStorage.getItem(STORAGE_KEY);
        return val ? parseInt(val, 10) : 0;
    } catch {
        return 0;
    }
};

const storeCount = (count: number) => {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(STORAGE_KEY, String(count));
    } catch { }
};

export interface DiagramSummary {
    svgHtml: string;       // raw SVG HTML that was analysed
    summary: string;       // AI-generated summary text
    diagramIndex: number;  // which diagram it belongs to on the page
}

export function useDiagramAI() {
    const [usageCount, setUsageCount] = useState<number>(getStoredCount);
    const [isOpen, setIsOpen] = useState(false);
    const [summaries, setSummaries] = useState<DiagramSummary[]>([]);
    const [activeSummary, setActiveSummary] = useState<DiagramSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    const isExhausted = usageCount >= MAX_REQUESTS;
    const remaining = MAX_REQUESTS - usageCount;

    const openSidebar = useCallback(() => setIsOpen(true), []);
    const closeSidebar = useCallback(() => {
        setIsOpen(false);
        setActiveSummary(null);
        setError(null);
    }, []);

    const summariseDiagram = useCallback(
        async (svgHtml: string, diagramIndex: number) => {
            if (isExhausted) return;

            // Increment usage first
            const newCount = usageCount + 1;
            setUsageCount(newCount);
            storeCount(newCount);

            setIsLoading(true);
            setError(null);
            setIsOpen(true);

            // Cancel any in-flight request
            abortRef.current?.abort();
            abortRef.current = new AbortController();

            try {
                const question = `You are an AI assistant that helps users understand technical diagrams.
Analyse the following SVG diagram and provide a clear, concise summary in 3-5 sentences.
Describe: what the diagram shows, the key components, and what the flow/architecture/relationship means.
Keep the language simple and accessible.

SVG content:
${svgHtml.substring(0, 4000)}`; // Trim to avoid token overflow

                const baseUrl = process.env.NEXT_PUBLIC_BFF_HOST_COMMON_API as string;

                const response = await fetch(`${baseUrl}/ai/suggestion`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        question,
                        aiModel: "gemini",
                        modelVersion: "gemini-2.0-flash",
                    }),
                    signal: abortRef.current.signal,
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || `Request failed (${response.status})`);
                }

                const data = await response.json();
                // BFF returns { data: { text: "..." } } or { text: "..." }
                const summaryText: string =
                    data?.data?.text ||
                    data?.data?.response ||
                    data?.text ||
                    data?.response ||
                    data?.message ||
                    "No summary returned.";

                const entry: DiagramSummary = { svgHtml, summary: summaryText, diagramIndex };
                setSummaries((prev) => {
                    const filtered = prev.filter((s) => s.diagramIndex !== diagramIndex);
                    return [...filtered, entry];
                });
                setActiveSummary(entry);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                setError(err.message || "Failed to get AI summary. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        [isExhausted, usageCount]
    );

    return {
        usageCount,
        remaining,
        isExhausted,
        isOpen,
        isLoading,
        error,
        summaries,
        activeSummary,
        openSidebar,
        closeSidebar,
        summariseDiagram,
    };
}

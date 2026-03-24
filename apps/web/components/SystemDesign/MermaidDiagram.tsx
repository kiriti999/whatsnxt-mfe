"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Box, Text } from "@mantine/core";
import { useIsDark } from "../../hooks/useIsDark";
import classes from "./SystemDesignForm.module.css";

interface MermaidDiagramProps {
    code: string;
}

const LIGHT_THEME = {
    theme: "base" as const,
    themeVariables: {
        primaryColor: "#e8f4fd",
        primaryTextColor: "#1a1a2e",
        primaryBorderColor: "#4a90d9",
        lineColor: "#5c7cfa",
        secondaryColor: "#f1f3f5",
        tertiaryColor: "#d0ebff",
        fontSize: "14px",
        fontFamily: "sans-serif",
        edgeLabelBackground: "#ffffff",
        nodeBorder: "#4a90d9",
        mainBkg: "#e8f4fd",
        clusterBkg: "#f1f3f5",
        clusterBorder: "#adb5bd",
        titleColor: "#1a1a2e",
        actorBkg: "#e8f4fd",
        actorBorder: "#4a90d9",
        actorTextColor: "#1a1a2e",
        actorLineColor: "#5c7cfa",
        signalColor: "#1a1a2e",
        signalTextColor: "#1a1a2e",
        noteBkgColor: "#fff9db",
        noteBorderColor: "#fab005",
        noteTextColor: "#1a1a2e",
        activationBkgColor: "#d0ebff",
        activationBorderColor: "#4a90d9",
        sequenceNumberColor: "#ffffff",
        entityFill: "#e8f4fd",
        entityStroke: "#4a90d9",
    },
};

const DARK_THEME = {
    theme: "base" as const,
    themeVariables: {
        primaryColor: "#1e3a5f",
        primaryTextColor: "#c9d1d9",
        primaryBorderColor: "#5c7cfa",
        lineColor: "#748ffc",
        secondaryColor: "#2c2e33",
        tertiaryColor: "#1c3a5e",
        fontSize: "14px",
        fontFamily: "sans-serif",
        edgeLabelBackground: "#25262b",
        nodeBorder: "#5c7cfa",
        mainBkg: "#1e3a5f",
        clusterBkg: "#2c2e33",
        clusterBorder: "#495057",
        titleColor: "#c9d1d9",
        actorBkg: "#1e3a5f",
        actorBorder: "#5c7cfa",
        actorTextColor: "#c9d1d9",
        actorLineColor: "#748ffc",
        signalColor: "#c9d1d9",
        signalTextColor: "#c9d1d9",
        noteBkgColor: "#3b3520",
        noteBorderColor: "#fab005",
        noteTextColor: "#e9ecef",
        activationBkgColor: "#1c3a5e",
        activationBorderColor: "#5c7cfa",
        sequenceNumberColor: "#ffffff",
        entityFill: "#1e3a5f",
        entityStroke: "#5c7cfa",
    },
};

function extractMermaidCode(text: string): string {
    const fenceMatch = text.match(/```(?:mermaid)?\s*\n([\s\S]*?)```/);
    if (fenceMatch) return fenceMatch[1].trim();
    return text.trim();
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId().replace(/:/g, "-");
    const [svgOutput, setSvgOutput] = useState<string>("");
    const [renderError, setRenderError] = useState<string>("");
    const isDark = useIsDark();

    useEffect(() => {
        if (!code.trim()) return;

        let cancelled = false;

        async function renderDiagram() {
            try {
                const mermaid = (await import("mermaid")).default;
                const themeConfig = isDark ? DARK_THEME : LIGHT_THEME;
                mermaid.initialize({
                    startOnLoad: false,
                    ...themeConfig,
                    securityLevel: "strict",
                });

                const cleanCode = extractMermaidCode(code);
                const themeSuffix = isDark ? "dark" : "light";
                const { svg } = await mermaid.render(`mermaid-${uniqueId}-${themeSuffix}`, cleanCode);
                if (!cancelled) {
                    setSvgOutput(svg);
                    setRenderError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setRenderError((err as Error).message || "Failed to render diagram");
                    setSvgOutput("");
                }
            }
        }

        renderDiagram();
        return () => {
            cancelled = true;
        };
    }, [code, uniqueId, isDark]);

    if (renderError) {
        return (
            <Box className={classes.diagramPreview}>
                <Text size="sm" c="red">
                    Diagram syntax error: {renderError}
                </Text>
            </Box>
        );
    }

    if (!svgOutput) {
        return (
            <Box className={classes.diagramPreview}>
                <Text size="sm" c="dimmed">
                    Rendering diagram...
                </Text>
            </Box>
        );
    }

    return (
        <Box
            ref={containerRef}
            className={classes.diagramPreview}
            dangerouslySetInnerHTML={{ __html: svgOutput }}
        />
    );
}

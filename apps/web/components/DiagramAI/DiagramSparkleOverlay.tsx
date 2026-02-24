"use client";

/**
 * DiagramSparkleOverlay
 * ---------------------
 * Wraps a content container and, after the DOM is painted, scans for
 * <svg> elements (architectural / flow diagrams). For each SVG found
 * it injects an absolutely-positioned ✨ sparkle button in the bottom-
 * right corner. Clicking the button sends the SVG markup to the AI API
 * and slides in the summary sidebar.
 *
 * Usage:
 *   <DiagramSparkleOverlay>
 *     {children}  {/* content that may contain SVGs *\/}
 *   </DiagramSparkleOverlay>
 */

import React, {
    useEffect,
    useRef,
    useCallback,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./DiagramAI.module.css";
import { DiagramAISidebar } from "./DiagramAISidebar";
import { useDiagramAI } from "./useDiagramAI";

interface DiagramSparkleOverlayProps {
    children: ReactNode;
    /** Extra class names to forward to the wrapper div */
    className?: string;
}

/** Minimum size for an SVG to be considered a "diagram" (not an icon) */
const MIN_WIDTH = 80;
const MIN_HEIGHT = 80;

export function DiagramSparkleOverlay({
    children,
    className,
}: DiagramSparkleOverlayProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

    const {
        usageCount,
        remaining,
        isExhausted,
        isOpen,
        isLoading,
        error,
        activeSummary,
        closeSidebar,
        summariseDiagram,
    } = useDiagramAI();

    const isInjectingRef = useRef(false);

    /** Inject sparkle buttons next to every qualifying <svg> */
    const injectButtons = useCallback(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || isInjectingRef.current) return;

        isInjectingRef.current = true;
        try {
            // Remove previously injected buttons (avoid duplicates on re-renders)
            wrapper
                .querySelectorAll("[data-diagram-ai-btn]")
                .forEach((el) => el.remove());
            buttonsRef.current = [];

            const svgs = Array.from(wrapper.querySelectorAll<SVGSVGElement>("svg"));

            // Filter to diagrams only (skip tiny inline SVG icons)
            const diagramSvgs = svgs.filter((svg) => {
                const box = svg.getBoundingClientRect();
                // Also check viewBox dimensions as a fallback when element isn't visible yet
                const vb = svg.getAttribute("viewBox")?.split(" ").map(Number);
                const w = box.width || (vb ? vb[2] : 0);
                const h = box.height || (vb ? vb[3] : 0);
                return w >= MIN_WIDTH && h >= MIN_HEIGHT;
            });

            diagramSvgs.forEach((svg, index) => {
                // Ensure the parent is positioned so we can absolutely-place the button
                const parent = svg.parentElement as HTMLElement | null;
                if (!parent) return;

                const parentStyle = window.getComputedStyle(parent);
                if (
                    parentStyle.position === "static" ||
                    parentStyle.position === ""
                ) {
                    parent.style.position = "relative";
                }

                // Create the sparkle button
                const btn = document.createElement("button");
                btn.setAttribute("data-diagram-ai-btn", String(index));
                btn.setAttribute("aria-label", "Get AI summary of this diagram");
                btn.setAttribute(
                    "title",
                    isExhausted
                        ? "AI request limit reached (5/5)"
                        : "Get AI summary ✨"
                );
                btn.className = [
                    styles.sparkleTrigger,
                    isExhausted ? styles.sparkleTriggerExhausted : "",
                ]
                    .join(" ")
                    .trim();

                // Tooltip span
                const tooltip = document.createElement("span");
                tooltip.className = styles.sparkleTooltip;
                tooltip.textContent = isExhausted
                    ? "No requests remaining"
                    : "Summarise with AI";
                btn.appendChild(tooltip);

                // Sparkle emoji text node
                const emoji = document.createTextNode(" ✨");
                btn.prepend(emoji);

                btn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (isExhausted) return;
                    const svgHtml = svg.outerHTML;
                    summariseDiagram(svgHtml, index);
                });

                // Insert the button AFTER the <svg> inside the same parent
                parent.style.display = "block"; // ensure relative pos works in flex
                parent.insertBefore(btn, svg.nextSibling);
                buttonsRef.current[index] = btn;
            });
        } finally {
            isInjectingRef.current = false;
        }
    }, [isExhausted, summariseDiagram]);

    // Inject buttons after initial render & whenever children change
    useEffect(() => {
        // Use a small delay so lazy-loaded / async content finishes painting
        const timeoutId = setTimeout(injectButtons, 400);
        return () => clearTimeout(timeoutId);
    }, [injectButtons, children]);

    // Re-inject buttons when exhaustion state changes (to update tooltips/styles)
    useEffect(() => {
        injectButtons();
    }, [isExhausted, injectButtons]);

    // Watch for dynamically inserted SVGs (e.g. Excalidraw / Lexical lazy content)
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        let debounce: ReturnType<typeof setTimeout>;
        const observer = new MutationObserver(() => {
            clearTimeout(debounce);
            debounce = setTimeout(injectButtons, 300);
        });

        observer.observe(wrapper, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            clearTimeout(debounce);
        };
    }, [injectButtons]);

    return (
        <>
            <div ref={wrapperRef} className={className}>
                {children}
            </div>

            {/* Sidebar portal — rendered at document body level */}
            {typeof window !== "undefined" &&
                createPortal(
                    <DiagramAISidebar
                        isOpen={isOpen}
                        isLoading={isLoading}
                        error={error}
                        summary={activeSummary?.summary ?? null}
                        usageCount={usageCount}
                        remaining={remaining}
                        isExhausted={isExhausted}
                        onClose={closeSidebar}
                    />,
                    document.body
                )}
        </>
    );
}

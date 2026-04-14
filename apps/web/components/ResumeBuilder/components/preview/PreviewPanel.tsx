"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useResumeStore } from "../../store";
import { TEMPLATES } from "../../types";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import classes from "./PreviewPanel.module.css";

// Page layout constants (px at 96 dpi)
const FIRST_PAGE_TOP = 24;
const CONTINUATION_TOP = 64;
const PAGE_BOTTOM_MARGIN = 55;

/**
 * Measure breakable blocks from an element and compute page break offsets.
 * Uses the ACTUAL rendered container so measurements are always consistent.
 */
function computeBreakOffsets(
    measureEl: HTMLElement,
    pageH: number,
): number[] {
    const contentH = measureEl.scrollHeight;
    const firstUsable = pageH - FIRST_PAGE_TOP - PAGE_BOTTOM_MARGIN;
    const restUsable = pageH - CONTINUATION_TOP - PAGE_BOTTOM_MARGIN;

    if (contentH <= firstUsable) return [0];

    const breakables = measureEl.querySelectorAll("[data-breakable]");
    const containerRect = measureEl.getBoundingClientRect();
    const positions: { top: number; bottom: number }[] = [];

    for (const node of breakables) {
        const rect = (node as HTMLElement).getBoundingClientRect();
        positions.push({
            top: Math.round(rect.top - containerRect.top),
            bottom: Math.round(rect.bottom - containerRect.top),
        });
    }

    const offsets: number[] = [0];
    let pageStart = 0;
    let pageLimit = firstUsable;

     
    console.log("[PageBreak] pageH:", pageH, "firstUsable:", firstUsable, "restUsable:", restUsable, "contentH:", contentH);
    console.log("[PageBreak] blocks:", positions.map((p, i) => `#${i} top=${p.top} bot=${p.bottom}`));

    for (const pos of positions) {
        if (pos.bottom - pageStart > pageLimit) {
            console.log("[PageBreak] OVERFLOW block top=", pos.top, "bot=", pos.bottom, "pageStart=", pageStart, "pageLimit=", pageLimit, "overflow=", pos.bottom - pageStart);
            if (pos.top > pageStart) {
                pageStart = pos.top;
                offsets.push(pageStart);
                pageLimit = restUsable;
                console.log("[PageBreak] -> break at", pageStart);
            }
            if (pos.bottom - pageStart > pageLimit) {
                pageStart = pos.bottom;
                offsets.push(pageStart);
                pageLimit = restUsable;
                console.log("[PageBreak] -> big block, break after at", pageStart);
            }
        }
    }
     

    console.log("[PageBreak] final offsets:", offsets);

    return offsets;
}

export function PreviewPanel() {
    const { resume } = useResumeStore();
    const template = TEMPLATES.find((t) => t.id === resume.templateId) ?? TEMPLATES[0];
    const accentColor = template?.accentColor ?? "#2563eb";
    const fontFamily = template?.fontFamily ?? "'Inter', sans-serif";

    const measureRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageH, setPageH] = useState(1122);
    const [breakOffsets, setBreakOffsets] = useState<number[]>([0]);

    const recalculate = useCallback(() => {
        const measureEl = measureRef.current;
        if (!measureEl) return;
        const measuredPageH = pageRef.current?.clientHeight ?? 1122;
        setPageH(measuredPageH);
        setBreakOffsets(computeBreakOffsets(measureEl, measuredPageH));
    }, []);

    useEffect(() => {
        const measureEl = measureRef.current;
        if (!measureEl) return;

        const raf = requestAnimationFrame(recalculate);
        const ro = new ResizeObserver(recalculate);
        ro.observe(measureEl);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [resume, recalculate]);

    const cssVars = {
        "--resume-accent": accentColor,
        fontFamily,
    } as React.CSSProperties;

    const pageCount = breakOffsets.length;

    return (
        <div className={classes.pagesWrapper}>
            {/* Measurement container — same width as pageViewport for accurate measurement */}
            <div ref={measureRef} className={classes.measureContainer} style={cssVars}>
                <ClassicTemplate resume={resume} />
            </div>

            {Array.from({ length: pageCount }, (_, i) => {
                const top = i === 0 ? FIRST_PAGE_TOP : CONTINUATION_TOP;
                const maxViewport = pageH - top - PAGE_BOTTOM_MARGIN;
                const contentStart = breakOffsets[i] ?? 0;
                const nextBreak = breakOffsets[i + 1];
                const sliceHeight =
                    nextBreak !== undefined ? nextBreak - contentStart : undefined;
                const viewportHeight =
                    sliceHeight !== undefined ? Math.min(maxViewport, sliceHeight) : maxViewport;

                return (
                    <div
                        key={i}
                        ref={i === 0 ? pageRef : undefined}
                        className={classes.previewContainer}
                        data-resume-preview=""
                        style={cssVars}
                    >
                        <div
                            className={classes.pageViewport}
                            style={{ top, height: viewportHeight }}
                        >
                            <div style={{ transform: `translateY(-${contentStart}px)` }}>
                                <ClassicTemplate resume={resume} />
                            </div>
                        </div>
                        {pageCount > 1 && (
                            <div className={classes.pageNumber}>
                                {i + 1} / {pageCount}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

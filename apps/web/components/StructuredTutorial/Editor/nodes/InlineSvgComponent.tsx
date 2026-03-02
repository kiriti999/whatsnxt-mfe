"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { validateAndFixSvg } from "../../../../utils/validateSvgDiagram";
import styles from "./InlineSvgComponent.module.css";

interface InlineSvgComponentProps {
    svg: string;
    caption?: string;
}

const InlineSvgComponent: React.FC<InlineSvgComponentProps> = ({ svg, caption }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const sanitizedSvg = useMemo(() => {
        if (!svg) return "";
        return svg.trim();
    }, [svg]);

    useEffect(() => {
        if (!containerRef.current || !sanitizedSvg) return;
        containerRef.current.innerHTML = sanitizedSvg;

        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) validateAndFixSvg(svgEl);
    }, [sanitizedSvg]);

    return (
        <figure className={styles.inlineSvgFigure}>
            <div ref={containerRef} className={styles.svgContainer} />
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
        </figure>
    );
};

export default InlineSvgComponent;

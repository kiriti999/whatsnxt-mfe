"use client";

import React, { useEffect, useRef } from "react";
import styles from "./DiagramAI.module.css";

interface DiagramAISidebarProps {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    summary: string | null;
    usageCount: number;
    remaining: number;
    isExhausted: boolean;
    onClose: () => void;
}

export function DiagramAISidebar({
    isOpen,
    isLoading,
    error,
    summary,
    usageCount,
    remaining,
    isExhausted,
    onClose,
}: DiagramAISidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.backdrop}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
            aria-label="AI Diagram Summary"
        >
            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
            >
                {/* Header */}
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarHeaderLeft}>
                        <span className={styles.sparkleIcon} aria-hidden="true">✨</span>
                        <div>
                            <h2 className={styles.sidebarTitle}>AI Diagram Summary</h2>
                            <p className={styles.sidebarSubtitle}>Powered by Gemini</p>
                        </div>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close AI sidebar"
                    >
                        ✕
                    </button>
                </div>

                {/* Usage tracker */}
                <div className={styles.usageSection}>
                    <div className={styles.usageHeader}>
                        <span className={styles.usageLabel}>AI Requests Used</span>
                        <span
                            className={`${styles.usageBadge} ${isExhausted ? styles.usageBadgeExhausted : ""}`}
                        >
                            {usageCount} / 5
                        </span>
                    </div>
                    <div className={styles.usageBar}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.usageDot} ${i < usageCount ? styles.usageDotFilled : ""} ${i === usageCount - 1 ? styles.usageDotLatest : ""
                                    }`}
                            />
                        ))}
                    </div>
                    {isExhausted ? (
                        <p className={styles.usageWarning}>
                            🚫 You have used all 5 AI requests for this session.
                        </p>
                    ) : (
                        <p className={styles.usageRemaining}>
                            {remaining} request{remaining !== 1 ? "s" : ""} remaining this session
                        </p>
                    )}
                </div>

                <div className={styles.divider} />

                {/* Content area */}
                <div className={styles.contentArea}>
                    {isLoading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}>
                                <span className={styles.sparkleAnim}>✨</span>
                                <span className={styles.sparkleAnim} style={{ animationDelay: "0.3s" }}>✨</span>
                                <span className={styles.sparkleAnim} style={{ animationDelay: "0.6s" }}>✨</span>
                            </div>
                            <div className={styles.loadingSkeletons}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={styles.loadingSkeleton}
                                        style={{
                                            width: `${[92, 85, 95, 78, 65][i]}%`,
                                            animationDelay: `${i * 0.12}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <p className={styles.loadingText}>Analysing diagram…</p>
                        </div>
                    )}

                    {error && !isLoading && (
                        <div className={styles.errorBox}>
                            <span className={styles.errorIcon}>⚠️</span>
                            <p className={styles.errorText}>{error}</p>
                        </div>
                    )}

                    {summary && !isLoading && !error && (
                        <div className={styles.summaryContainer}>
                            <div className={styles.summaryBadge}>
                                <span>📊</span>
                                <span>Diagram Analysis</span>
                            </div>
                            <div className={styles.summaryText}>
                                {summary.split("\n").map((paragraph, i) =>
                                    paragraph.trim() ? (
                                        <p key={i} className={styles.summaryParagraph}>
                                            {paragraph}
                                        </p>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && !summary && (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>🔍</span>
                            <p className={styles.emptyText}>
                                Click the <strong>✨ sparkle</strong> button on any diagram to get an AI-powered summary.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.sidebarFooter}>
                    <p className={styles.footerText}>
                        AI summaries help you understand diagrams, flows, and architecture at a glance.
                    </p>
                </div>
            </aside>
        </div>
    );
}

/**
 * Setup Highlight.js languages for syntax highlighting in TipTap
 * This module configures lowlight with comprehensive language support
 * for code blocks in the rich text editor.
 */

import { createLowlight } from "lowlight";

// Import all commonly used languages
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import php from "highlight.js/lib/languages/php";
import cpp from "highlight.js/lib/languages/cpp";
import c from "highlight.js/lib/languages/c";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import ruby from "highlight.js/lib/languages/ruby";
import sql from "highlight.js/lib/languages/sql";
import html from "highlight.js/lib/languages/xml"; // HTML is an XML variant
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import less from "highlight.js/lib/languages/less";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import xml from "highlight.js/lib/languages/xml";
import bash from "highlight.js/lib/languages/bash";
import shell from "highlight.js/lib/languages/shell";
import markdown from "highlight.js/lib/languages/markdown";
import r from "highlight.js/lib/languages/r";
import docker from "highlight.js/lib/languages/dockerfile";
import graphql from "highlight.js/lib/languages/graphql";
import diff from "highlight.js/lib/languages/diff";
import plaintext from "highlight.js/lib/languages/plaintext";

/**
 * Create and configure lowlight instance with all supported languages
 */
export function createConfiguredLowlight() {
    const lowlight = createLowlight();

    // Register languages
    lowlight.register({
        javascript,
        typescript,
        python,
        java,
        csharp,
        php,
        cpp,
        c,
        go,
        rust,
        kotlin,
        swift,
        ruby,
        sql,
        html,
        css,
        scss,
        less,
        json,
        yaml,
        xml,
        bash,
        shell,
        markdown,
        r,
        docker,
        graphql,
        diff,
        plaintext,
    });

    return lowlight;
}

/**
 * Language aliases for common variations
 * Maps user-provided language names to registered lowlight languages
 */
export const languageAliases: Record<string, string> = {
    // JavaScript variants
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",

    // TypeScript variants
    ts: "typescript",
    mts: "typescript",
    cts: "typescript",

    // React variants (TypeScript handles JSX and TSX)
    jsx: "typescript",
    tsx: "typescript",

    // Python variants
    py: "python",
    python3: "python",
    python2: "python",

    // Shell variants
    sh: "bash",
    zsh: "bash",
    ksh: "bash",

    // Markup variants
    html: "html",
    htm: "html",
    xhtml: "xml",

    // Data formats
    yml: "yaml",
    toml: "plaintext",
    ini: "plaintext",

    // SQL variants
    psql: "sql",
    mysql: "sql",
    sqlite: "sql",
    plsql: "sql",

    // No language specified
    "": "plaintext",
    txt: "plaintext",
    text: "plaintext",
};

/**
 * Detect language from code content
 * Uses pattern matching and common code indicators
 */
export function autoDetectLanguage(code: string): string {
    if (!code || code.trim().length === 0) {
        return "plaintext";
    }

    const trimmedCode = code.trim();

    // Check for common language indicators
    const indicators: Array<{ pattern: RegExp; language: string }> = [
        // TypeScript/JavaScript
        { pattern: /^import\s+.*\s+from\s+['"]/, language: "typescript" },
        { pattern: /^export\s+(default\s+)?(interface|type|class)/, language: "typescript" },
        { pattern: /^interface\s+\w+/, language: "typescript" },
        { pattern: /^type\s+\w+\s*=/, language: "typescript" },
        { pattern: /:\s*\w+\s*[=;]/, language: "typescript" }, // Type annotations
        { pattern: /\?\s*:/, language: "typescript" }, // Optional type annotations

        // Python
        { pattern: /^import\s+\w+/, language: "python" },
        { pattern: /^from\s+\w+\s+import/, language: "python" },
        { pattern: /^def\s+\w+\(/, language: "python" },
        { pattern: /^class\s+\w+/, language: "python" },
        { pattern: /^if\s+__name__\s*==\s*['"]__main__['"]/, language: "python" },

        // Java
        { pattern: /^package\s+\w+/, language: "java" },
        { pattern: /^import\s+java\./, language: "java" },
        { pattern: /^public\s+(class|interface|enum)/, language: "java" },

        // C#
        { pattern: /^using\s+\w+/, language: "csharp" },
        { pattern: /^namespace\s+\w+/, language: "csharp" },
        { pattern: /^public\s+class/, language: "csharp" },

        // Go
        { pattern: /^package\s+main/, language: "go" },
        { pattern: /^func\s+\w+/, language: "go" },

        // Rust
        { pattern: /^fn\s+\w+/, language: "rust" },
        { pattern: /^impl\s+\w+/, language: "rust" },

        // SQL
        { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+/, language: "sql" },
        { pattern: /^(select|insert|update|delete|create|drop|alter)\s+/, language: "sql" },

        // HTML/XML
        { pattern: /^<!DOCTYPE\s+html/i, language: "html" },
        { pattern: /^<html/i, language: "html" },
        { pattern: /^<\?xml/, language: "xml" },

        // CSS
        { pattern: /^\w+\s*\{[\s\S]*:/, language: "css" },
        { pattern: /^\.[\w-]+\s*\{/, language: "css" },
        { pattern: /^#[\w-]+\s*\{/, language: "css" },

        // YAML
        { pattern: /^---$/, language: "yaml" },
        { pattern: /^\w+:\s*/, language: "yaml" },

        // JSON
        { pattern: /^\{[\s\n]*["']/, language: "json" },
        { pattern: /^\[/, language: "json" },

        // Bash
        { pattern: /^#!\/bin\/(ba)?sh/, language: "bash" },
        { pattern: /^#!\/usr\/bin\/(ba)?sh/, language: "bash" },

        // Docker
        { pattern: /^FROM\s+/, language: "docker" },
        { pattern: /^RUN\s+/, language: "docker" },
    ];

    for (const { pattern, language } of indicators) {
        if (pattern.test(trimmedCode)) {
            return language;
        }
    }

    // Check common keywords
    const hasJsKeywords = /(const|let|var|function|async|await|=>)\s+/.test(trimmedCode);
    const hasPyKeywords = /(def|class|import|from|if|for|while|return|async)\s+/.test(trimmedCode);

    if (hasJsKeywords) return "typescript";
    if (hasPyKeywords) return "python";

    return "plaintext";
}

/**
 * Normalize language name for lowlight
 */
export function normalizeLanguage(language: string | null | undefined): string {
    if (!language) {
        return "plaintext";
    }

    const normalized = language.toLowerCase().trim();
    return languageAliases[normalized] || normalized;
}

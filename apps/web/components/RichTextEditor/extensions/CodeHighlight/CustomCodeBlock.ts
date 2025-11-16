/**
 * Custom CodeBlock extension configuration with auto-language detection
 * This module provides a helper to configure CodeBlockLowlight with
 * automatic language detection capabilities
 */

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { autoDetectLanguage } from "./setupHighlightLanguages";

export function configureCodeBlockWithAutoDetect(lowlight: object) {
    return CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
    }).extend({
        addAttributes() {
            return {
                language: {
                    default: null,
                    parseHTML: (element: HTMLElement) => {
                        const codeElement = element.querySelector("code");
                        if (!codeElement) return null;

                        // Try to get language from class
                        const classes = codeElement.className.split(" ");
                        const languageClass = classes.find((c) =>
                            c.startsWith("language-")
                        );
                        if (languageClass) {
                            return languageClass.replace("language-", "");
                        }

                        // If no explicit language, auto-detect from content
                        const content = codeElement.textContent || "";
                        const detected = autoDetectLanguage(content);
                        return detected !== "plaintext" ? detected : null;
                    },
                    renderHTML: (attributes: { language?: string | null }) => ({
                        "data-language": attributes.language || "plaintext",
                        class: `language-${attributes.language || "plaintext"}`,
                    }),
                },
            };
        },
        renderHTML({ node }) {
            const language = node.attrs.language || "plaintext";
            return [
                "pre",
                { class: "hljs" },
                [
                    "code",
                    {
                        class: `language-${language} hljs`,
                        "data-language": language,
                    },
                    0,
                ],
            ];
        },
    });
}
import { config } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...config,
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "dist/**",
            "out/**",
            ".turbo/**",
            "apps/**/node_modules/**",
            "packages/**/node_modules/**",
        ],
    },
];

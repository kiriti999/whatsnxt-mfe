/**
 * Environment variable validation for the web app.
 * Import this in the root layout to fail fast at startup if required vars are missing.
 */

const requiredClientVars = [
    "NEXT_PUBLIC_MFE_HOST",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_BFF_HOST_COMMON_API",
    "NEXT_PUBLIC_COOKIES_ACCESS_TOKEN",
    "NEXT_PUBLIC_COOKIES_USER",
    "NEXT_PUBLIC_DEFAULT_MODEL_VERSION",
] as const;

const requiredServerVars = [
    "BFF_HOST_COURSE_API",
    "BFF_ARTICLE_HOST_API",
    "BFF_HOST_COMMON_API",
    "BFF_HOST_CLOUDINARY_API",
] as const;

function validateVars(vars: readonly string[], label: string) {
    const missing = vars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `❌ ${label} environment validation failed.\nMissing variables:\n${missing.map((v) => `  - ${v}`).join("\n")}`,
        );
    }
}

export function validateEnv() {
    validateVars(requiredClientVars, "Client-side");

    if (typeof window === "undefined") {
        validateVars(requiredServerVars, "Server-side");
    }
}

// Auto-validate on import
validateEnv();

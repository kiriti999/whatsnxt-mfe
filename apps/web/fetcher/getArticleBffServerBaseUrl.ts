/**
 * Server-side base URL for routes backed by the article/content BFF cluster
 * (system-design, interview-experiences, blog content).
 *
 * Prefer `BFF_ARTICLE_HOST_API`; fall back to `NEXT_PUBLIC_API_URL` (and common host)
 * so Vercel/prod still resolves `/system-design/published` when only the public gateway is set.
 */
export function getArticleBffServerBaseUrl(): string {
    const raw =
        process.env.BFF_ARTICLE_HOST_API ||
        process.env.BFF_HOST_COMMON_API ||
        process.env.NEXT_PUBLIC_API_URL ||
        "";
    let base = raw.trim().replace(/\/+$/, "");
    base = base.replace(/\/blog$/i, "").replace(/\/article$/i, "");
    return base.replace(/\/+$/, "");
}

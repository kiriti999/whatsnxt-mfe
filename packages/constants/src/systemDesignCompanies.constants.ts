/**
 * Curated companies for system design course metadata (interview / browse filters).
 * Logos use vendored SVG paths (Simple Icons v9.14.0, CC0-1.0) — see `systemDesignCompanyBrandGlyphs.ts`.
 */

import { SYSTEM_DESIGN_COMPANY_BRAND_GLYPHS } from "./systemDesignCompanyBrandGlyphs";

export type SystemDesignCompanyLogoVariant = "color" | "mono";

export interface SystemDesignCompanyLibraryEntry {
	readonly key: string;
	readonly name: string;
	/** Fallback pad for mono variant behind the glyph */
	readonly monoBg: string;
}

export const SYSTEM_DESIGN_COMPANY_LOGO_VARIANT_DEFAULT: SystemDesignCompanyLogoVariant =
	"color";

/** Neutral pad so black-only marks (Apple, Uber) stay visible in “color” mode on dark UI */
const COLOR_VARIANT_PAD = "#f1f3f5";

export const SYSTEM_DESIGN_COMPANY_LIBRARY: readonly SystemDesignCompanyLibraryEntry[] =
	[
		{ key: "amazon", name: "Amazon", monoBg: "#232F3E" },
		{ key: "google", name: "Google", monoBg: "#202124" },
		{ key: "meta", name: "Meta", monoBg: "#050505" },
		{ key: "apple", name: "Apple", monoBg: "#1D1D1F" },
		{ key: "microsoft", name: "Microsoft", monoBg: "#0078D4" },
		{ key: "netflix", name: "Netflix", monoBg: "#221F1F" },
		{ key: "uber", name: "Uber", monoBg: "#276EF1" },
		{ key: "airbnb", name: "Airbnb", monoBg: "#484848" },
		{ key: "stripe", name: "Stripe", monoBg: "#0A2540" },
		{ key: "linkedin", name: "LinkedIn", monoBg: "#004182" },
		{ key: "salesforce", name: "Salesforce", monoBg: "#032D60" },
		{ key: "oracle", name: "Oracle", monoBg: "#C74634" },
		{ key: "ibm", name: "IBM", monoBg: "#161616" },
		{ key: "adobe", name: "Adobe", monoBg: "#2E001F" },
		{ key: "twitter", name: "X (Twitter)", monoBg: "#14171A" },
	];

export const SYSTEM_DESIGN_COMPANY_BY_KEY: Record<
	string,
	SystemDesignCompanyLibraryEntry
> = Object.fromEntries(SYSTEM_DESIGN_COMPANY_LIBRARY.map((e) => [e.key, e]));

/** Pre–brand-glyph saves used abbreviation pills; keep for `resolveLibraryCompanyFromSaved`. */
const LEGACY_COMPANY_ABBREV: Record<string, string> = {
	amazon: "AMZ",
	google: "GO",
	meta: "META",
	apple: "AAPL",
	microsoft: "MSFT",
	netflix: "NFLX",
	uber: "UBER",
	airbnb: "AIR",
	stripe: "STR",
	linkedin: "LI",
	salesforce: "SF",
	oracle: "ORCL",
	ibm: "IBM",
	adobe: "ADBE",
	twitter: "X",
};

const LEGACY_COMPANY_COLOR_BG: Record<string, string> = {
	amazon: "#FF9900",
	google: "#4285F4",
	meta: "#0866FF",
	apple: "#555555",
	microsoft: "#00A4EF",
	netflix: "#E50914",
	uber: "#000000",
	airbnb: "#FF5A5F",
	stripe: "#635BFF",
	linkedin: "#0A66C2",
	salesforce: "#00A1E0",
	oracle: "#F80000",
	ibm: "#0530AD",
	adobe: "#FF0000",
	twitter: "#000000",
};

function legacyAbbrevBadgeDataUri(
	entry: SystemDesignCompanyLibraryEntry,
	variant: SystemDesignCompanyLogoVariant,
): string {
	const abbrev = LEGACY_COMPANY_ABBREV[entry.key] ?? "CO";
	const colorBg = LEGACY_COMPANY_COLOR_BG[entry.key] ?? "#333333";
	const bg = variant === "color" ? colorBg : entry.monoBg;
	const fg = "#ffffff";
	const safeAbbrev = abbrev.replace(/[<>&'"]/g, "");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 36"><rect width="72" height="36" rx="8" fill="${bg}"/><text x="36" y="23" text-anchor="middle" fill="${fg}" font-size="11" font-weight="700" font-family="system-ui,Segoe UI,sans-serif">${safeAbbrev}</text></svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function systemDesignCompanyBadgeDataUri(
	entry: SystemDesignCompanyLibraryEntry,
	variant: SystemDesignCompanyLogoVariant,
): string {
	const glyph = SYSTEM_DESIGN_COMPANY_BRAND_GLYPHS[entry.key];
	if (!glyph) {
		return legacyAbbrevBadgeDataUri(entry, variant);
	}
	const pad = variant === "color" ? COLOR_VARIANT_PAD : entry.monoBg;
	const fill = variant === "color" ? `#${glyph.hex}` : "#ffffff";
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="${pad}"/><path d="${glyph.path}" fill="${fill}"/></svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Match saved API rows to the library (by display name or exact badge data URI). */
export function resolveLibraryCompanyFromSaved(ref: {
	name?: string;
	logoUrl?: string;
}): { key: string; variant: SystemDesignCompanyLogoVariant } | null {
	const name = (ref.name || "").trim().toLowerCase();
	const url = (ref.logoUrl || "").trim();
	const byName = SYSTEM_DESIGN_COMPANY_LIBRARY.find(
		(e) => e.name.toLowerCase() === name,
	);
	if (byName) {
		const monoUri = systemDesignCompanyBadgeDataUri(byName, "mono");
		const colorUri = systemDesignCompanyBadgeDataUri(byName, "color");
		const legacyMono = legacyAbbrevBadgeDataUri(byName, "mono");
		const legacyColor = legacyAbbrevBadgeDataUri(byName, "color");
		if (url && monoUri === url) return { key: byName.key, variant: "mono" };
		if (url && colorUri === url) return { key: byName.key, variant: "color" };
		if (url && legacyMono === url) return { key: byName.key, variant: "mono" };
		if (url && legacyColor === url)
			return { key: byName.key, variant: "color" };
		return { key: byName.key, variant: "color" };
	}
	if (url) {
		for (const e of SYSTEM_DESIGN_COMPANY_LIBRARY) {
			if (url === systemDesignCompanyBadgeDataUri(e, "color")) {
				return { key: e.key, variant: "color" };
			}
			if (url === systemDesignCompanyBadgeDataUri(e, "mono")) {
				return { key: e.key, variant: "mono" };
			}
			if (url === legacyAbbrevBadgeDataUri(e, "color")) {
				return { key: e.key, variant: "color" };
			}
			if (url === legacyAbbrevBadgeDataUri(e, "mono")) {
				return { key: e.key, variant: "mono" };
			}
		}
	}
	return null;
}

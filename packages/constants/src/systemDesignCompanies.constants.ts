/**
 * Curated companies for system design course metadata (interview / browse filters).
 * SVG badges are generated as compact data-URIs (color vs monochrome).
 */

export type SystemDesignCompanyLogoVariant = "color" | "mono";

export interface SystemDesignCompanyLibraryEntry {
	readonly key: string;
	readonly name: string;
	readonly abbrev: string;
	readonly colorBg: string;
	readonly monoBg: string;
}

export const SYSTEM_DESIGN_COMPANY_LOGO_VARIANT_DEFAULT: SystemDesignCompanyLogoVariant =
	"color";

export const SYSTEM_DESIGN_COMPANY_LIBRARY: readonly SystemDesignCompanyLibraryEntry[] =
	[
		{
			key: "amazon",
			name: "Amazon",
			abbrev: "AMZ",
			colorBg: "#FF9900",
			monoBg: "#232F3E",
		},
		{
			key: "google",
			name: "Google",
			abbrev: "GO",
			colorBg: "#4285F4",
			monoBg: "#202124",
		},
		{
			key: "meta",
			name: "Meta",
			abbrev: "META",
			colorBg: "#0866FF",
			monoBg: "#050505",
		},
		{
			key: "apple",
			name: "Apple",
			abbrev: "AAPL",
			colorBg: "#555555",
			monoBg: "#1D1D1F",
		},
		{
			key: "microsoft",
			name: "Microsoft",
			abbrev: "MSFT",
			colorBg: "#00A4EF",
			monoBg: "#0078D4",
		},
		{
			key: "netflix",
			name: "Netflix",
			abbrev: "NFLX",
			colorBg: "#E50914",
			monoBg: "#221F1F",
		},
		{
			key: "uber",
			name: "Uber",
			abbrev: "UBER",
			colorBg: "#000000",
			monoBg: "#276EF1",
		},
		{
			key: "airbnb",
			name: "Airbnb",
			abbrev: "AIR",
			colorBg: "#FF5A5F",
			monoBg: "#484848",
		},
		{
			key: "stripe",
			name: "Stripe",
			abbrev: "STR",
			colorBg: "#635BFF",
			monoBg: "#0A2540",
		},
		{
			key: "linkedin",
			name: "LinkedIn",
			abbrev: "LI",
			colorBg: "#0A66C2",
			monoBg: "#004182",
		},
		{
			key: "salesforce",
			name: "Salesforce",
			abbrev: "SF",
			colorBg: "#00A1E0",
			monoBg: "#032D60",
		},
		{
			key: "oracle",
			name: "Oracle",
			abbrev: "ORCL",
			colorBg: "#F80000",
			monoBg: "#C74634",
		},
		{
			key: "ibm",
			name: "IBM",
			abbrev: "IBM",
			colorBg: "#0530AD",
			monoBg: "#161616",
		},
		{
			key: "adobe",
			name: "Adobe",
			abbrev: "ADBE",
			colorBg: "#FF0000",
			monoBg: "#2E001F",
		},
		{
			key: "twitter",
			name: "X (Twitter)",
			abbrev: "X",
			colorBg: "#000000",
			monoBg: "#14171A",
		},
	];

export const SYSTEM_DESIGN_COMPANY_BY_KEY: Record<
	string,
	SystemDesignCompanyLibraryEntry
> = Object.fromEntries(SYSTEM_DESIGN_COMPANY_LIBRARY.map((e) => [e.key, e]));

export function systemDesignCompanyBadgeDataUri(
	entry: SystemDesignCompanyLibraryEntry,
	variant: SystemDesignCompanyLogoVariant,
): string {
	const bg = variant === "color" ? entry.colorBg : entry.monoBg;
	const fg = "#ffffff";
	const safeAbbrev = entry.abbrev.replace(/[<>&'"]/g, "");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 36"><rect width="72" height="36" rx="8" fill="${bg}"/><text x="36" y="23" text-anchor="middle" fill="${fg}" font-size="11" font-weight="700" font-family="system-ui,Segoe UI,sans-serif">${safeAbbrev}</text></svg>`;
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
		const variant =
			url && systemDesignCompanyBadgeDataUri(byName, "mono") === url
				? "mono"
				: "color";
		return { key: byName.key, variant };
	}
	if (url) {
		for (const e of SYSTEM_DESIGN_COMPANY_LIBRARY) {
			if (url === systemDesignCompanyBadgeDataUri(e, "color")) {
				return { key: e.key, variant: "color" };
			}
			if (url === systemDesignCompanyBadgeDataUri(e, "mono")) {
				return { key: e.key, variant: "mono" };
			}
		}
	}
	return null;
}

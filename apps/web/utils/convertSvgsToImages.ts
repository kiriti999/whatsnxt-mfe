/**
 * Converts inline <svg> elements in HTML to <img> tags with SVG data URIs.
 *
 * This is necessary because Lexical's $generateNodesFromDOM only handles
 * <img> elements (via ImageNode.importDOM), not raw <svg> elements.
 * By converting SVGs to base64 data URI images, the editor can parse
 * and display them correctly.
 */
export function convertSvgsToImages(html: string): string {
    if (!html || typeof html !== "string") return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const svgElements = doc.querySelectorAll("svg");

    if (svgElements.length === 0) return html;

    for (const svg of svgElements) {
        const imgElement = createImageFromSvg(svg, doc);
        if (!imgElement) continue;

        replaceSvgWithImage(svg, imgElement);
    }

    return doc.body.innerHTML;
}

/**
 * Creates an <img> element from an SVG element using a base64 data URI
 */
function createImageFromSvg(
    svg: SVGElement,
    doc: Document,
): HTMLImageElement | null {
    ensureSvgNamespace(svg);
    const svgString = new XMLSerializer().serializeToString(svg);
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUri = `data:image/svg+xml;base64,${base64}`;

    const img = doc.createElement("img");
    img.setAttribute("src", dataUri);
    img.setAttribute("alt", extractSvgAlt(svg));
    img.setAttribute("width", "100%");
    img.setAttribute("style", "max-width: 100%; height: auto;");

    return img;
}

/**
 * Replaces an SVG element with an img element, preserving <figure> wrappers
 */
function replaceSvgWithImage(svg: SVGElement, img: HTMLImageElement): void {
    const parent = svg.parentElement;
    if (parent) {
        parent.replaceChild(img, svg);
    }
}

/**
 * Ensures the SVG element has the xmlns attribute for proper serialization
 */
function ensureSvgNamespace(svg: SVGElement): void {
    if (!svg.getAttribute("xmlns")) {
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }
}

/**
 * Extracts alt text from a <figcaption> sibling or SVG title element
 */
function extractSvgAlt(svg: SVGElement): string {
    const figcaption = svg.parentElement?.querySelector("figcaption");
    if (figcaption?.textContent) return figcaption.textContent.trim();

    const titleEl = svg.querySelector("title");
    if (titleEl?.textContent) return titleEl.textContent.trim();

    return "Diagram";
}

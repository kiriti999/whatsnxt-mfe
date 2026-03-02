/**
 * Wraps inline <svg> elements in HTML with <figure data-lexical-inline-svg="true">
 * containers so that Lexical's InlineSvgNode.importDOM() can recognize and import them
 * as proper editor nodes.
 *
 * Also validates and fixes each SVG (tight viewBox, font clamping, zero-length
 * line removal) via validateAndFixSvg before wrapping.
 *
 * This keeps SVGs as native inline SVG throughout the pipeline — no lossy base64
 * conversion. The InlineSvgNode stores the raw SVG markup, renders it natively
 * in the editor, and exports it back as inline SVG via exportDOM().
 */
import { validateAndFixSvg } from "./validateSvgDiagram";

export function wrapSvgsForLexical(html: string): string {
    if (!html || typeof html !== "string") return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const svgElements = doc.querySelectorAll("svg");

    if (svgElements.length === 0) return html;

    for (const svg of svgElements) {
        validateAndFixSvg(svg);
        wrapSvgInFigure(svg, doc);
    }

    return doc.body.innerHTML;
}

/**
 * Wraps a single <svg> element in a <figure data-lexical-inline-svg="true"> container.
 * If the SVG is already inside a <figure> with that attribute, it's left as-is.
 * If the SVG is inside a plain <figure>, the attribute is added to it.
 */
function wrapSvgInFigure(svg: SVGElement, doc: Document): void {
    const parent = svg.parentElement;

    if (isAlreadyWrapped(parent)) return;

    if (isPlainFigure(parent)) {
        parent.setAttribute("data-lexical-inline-svg", "true");
        return;
    }

    const figure = doc.createElement("figure");
    figure.setAttribute("data-lexical-inline-svg", "true");

    const caption = extractCaption(svg);
    svg.parentNode?.replaceChild(figure, svg);
    figure.appendChild(svg);

    if (caption) {
        const figcaption = doc.createElement("figcaption");
        figcaption.textContent = caption;
        figure.appendChild(figcaption);
    }
}

function isAlreadyWrapped(parent: HTMLElement | null): boolean {
    return parent?.tagName === "FIGURE" && parent.hasAttribute("data-lexical-inline-svg");
}

function isPlainFigure(parent: HTMLElement | null): parent is HTMLElement {
    return parent?.tagName === "FIGURE" && !parent.hasAttribute("data-lexical-inline-svg");
}

/**
 * Extracts caption text from a sibling <figcaption> or an SVG <title> element
 */
function extractCaption(svg: SVGElement): string {
    const figcaption = svg.parentElement?.querySelector("figcaption");
    if (figcaption?.textContent) return figcaption.textContent.trim();

    const titleEl = svg.querySelector("title");
    if (titleEl?.textContent) return titleEl.textContent.trim();

    return "";
}

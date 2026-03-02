/**
 * Post-generation SVG validation and auto-fix utility.
 *
 * Fixes common AI-generated SVG issues:
 * 1. viewBox too large (excess whitespace) — recalculates tight viewBox
 * 2. Missing viewBox — adds one based on content bounds
 * 3. Text overflowing shapes — clamps font sizes
 * 4. Missing preserveAspectRatio — adds it
 * 5. Lines/arrows with zero-length endpoints
 * 6. Stray diagonal lines whose endpoints don't land near any shape
 */

const VIEWBOX_PADDING = 24;
const MAX_FONT_SIZE = 16;
const MIN_SHAPE_DIMENSION = 40;
const NEAR_SHAPE_TOLERANCE = 30;

/**
 * Validates and fixes a single SVG element in-place.
 */
export function validateAndFixSvg(svg: SVGElement): void {
    ensurePreserveAspectRatio(svg);
    clampTextFontSizes(svg);
    removeZeroLengthLines(svg);
    removeStrayLines(svg);
    fixTightViewBox(svg);
}

/**
 * Adds preserveAspectRatio if missing, ensuring proper scaling.
 */
function ensurePreserveAspectRatio(svg: SVGElement): void {
    if (!svg.getAttribute("preserveAspectRatio")) {
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    }
}

/**
 * Clamps all text font-sizes to MAX_FONT_SIZE to prevent text overflow.
 */
function clampTextFontSizes(svg: SVGElement): void {
    const textElements = svg.querySelectorAll("text");
    for (const textEl of textElements) {
        clampSingleTextElement(textEl);
    }
}

function clampSingleTextElement(textEl: SVGTextElement): void {
    const fontSize = extractFontSize(textEl);
    if (fontSize <= MAX_FONT_SIZE) return;

    applyFontSize(textEl, MAX_FONT_SIZE);
}

function extractFontSize(el: Element): number {
    const attr = el.getAttribute("font-size");
    if (attr) return Number.parseFloat(attr);

    const style = el.getAttribute("style") || "";
    const match = style.match(/font-size:\s*(\d+(?:\.\d+)?)/);
    return match ? Number.parseFloat(match[1]) : 14;
}

function applyFontSize(el: Element, size: number): void {
    el.setAttribute("font-size", String(size));

    const style = el.getAttribute("style");
    if (style?.includes("font-size")) {
        el.setAttribute(
            "style",
            style.replace(/font-size:\s*\d+(?:\.\d+)?(?:px)?/, `font-size: ${size}px`),
        );
    }
}

/**
 * Removes <line> and <path> elements with zero length (start === end)
 * which render as invisible dots and waste space.
 */
function removeZeroLengthLines(svg: SVGElement): void {
    const lines = svg.querySelectorAll("line");
    for (const line of lines) {
        if (isZeroLengthLine(line)) line.remove();
    }
}

function isZeroLengthLine(line: SVGLineElement): boolean {
    const x1 = line.getAttribute("x1") || "0";
    const y1 = line.getAttribute("y1") || "0";
    const x2 = line.getAttribute("x2") || "0";
    const y2 = line.getAttribute("y2") || "0";
    return x1 === x2 && y1 === y2;
}

/**
 * Removes stray connector lines/paths whose endpoints don't land near any shape.
 * AI models often generate diagonal lines from (0,0) or random coordinates
 * that don't connect to anything meaningful.
 */
function removeStrayLines(svg: SVGElement): void {
    const shapeBoxes = collectShapeBoundingBoxes(svg);
    if (shapeBoxes.length === 0) return;

    removeStrayLineElements(svg, shapeBoxes);
    removeStrayPathElements(svg, shapeBoxes);
}

function removeStrayLineElements(svg: SVGElement, shapes: ShapeBox[]): void {
    const lines = svg.querySelectorAll("line");
    for (const line of lines) {
        const x1 = num(line, "x1");
        const y1 = num(line, "y1");
        const x2 = num(line, "x2");
        const y2 = num(line, "y2");

        const startNear = isPointNearAnyShape(x1, y1, shapes);
        const endNear = isPointNearAnyShape(x2, y2, shapes);

        if (!startNear || !endNear) line.remove();
    }
}

function removeStrayPathElements(svg: SVGElement, shapes: ShapeBox[]): void {
    const paths = svg.querySelectorAll("path");
    for (const path of paths) {
        if (isInsideDefs(path)) continue;

        const endpoints = extractPathEndpoints(path);
        if (!endpoints) continue;

        const startNear = isPointNearAnyShape(endpoints.x1, endpoints.y1, shapes);
        const endNear = isPointNearAnyShape(endpoints.x2, endpoints.y2, shapes);

        if (!startNear || !endNear) path.remove();
    }
}

function isInsideDefs(el: Element): boolean {
    let parent = el.parentElement;
    while (parent) {
        if (parent.tagName.toLowerCase() === "defs") return true;
        if (parent.tagName.toLowerCase() === "svg") return false;
        parent = parent.parentElement;
    }
    return false;
}

/**
 * Extracts start and end coordinates from a path's d attribute.
 * Only works on simple M...L/C/Q paths (connectors). Returns null for
 * complex shape paths (many commands) — those are real shapes, not stray lines.
 */
function extractPathEndpoints(
    path: SVGPathElement,
): { x1: number; y1: number; x2: number; y2: number } | null {
    const d = path.getAttribute("d")?.trim();
    if (!d) return null;

    // Only process simple connector paths (M + a few commands)
    // Complex paths with many commands are shapes, not connectors
    const commands = d.match(/[MLHVCSQTAZ]/gi);
    if (!commands || commands.length > 6) return null;

    const startMatch = d.match(/^M\s*(-?[\d.]+)[,\s]+(-?[\d.]+)/i);
    if (!startMatch) return null;

    const x1 = Number.parseFloat(startMatch[1]);
    const y1 = Number.parseFloat(startMatch[2]);

    // Find the last coordinate pair in the path
    const coordPairs = [...d.matchAll(/(-?[\d.]+)[,\s]+(-?[\d.]+)/g)];
    if (coordPairs.length < 2) return null;

    const lastPair = coordPairs[coordPairs.length - 1];
    const x2 = Number.parseFloat(lastPair[1]);
    const y2 = Number.parseFloat(lastPair[2]);

    return { x1, y1, x2, y2 };
}

interface ShapeBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Collects bounding boxes of all visible shapes (rect, circle, ellipse)
 * that connectors should attach to.
 */
function collectShapeBoundingBoxes(svg: SVGElement): ShapeBox[] {
    const boxes: ShapeBox[] = [];

    for (const rect of svg.querySelectorAll("rect")) {
        if (isInsideDefs(rect)) continue;
        const w = num(rect, "width");
        const h = num(rect, "height");
        if (w > 0 && h > 0) boxes.push({ x: num(rect, "x"), y: num(rect, "y"), w, h });
    }

    for (const circle of svg.querySelectorAll("circle")) {
        if (isInsideDefs(circle)) continue;
        const r = num(circle, "r");
        if (r > 0) boxes.push({ x: num(circle, "cx") - r, y: num(circle, "cy") - r, w: r * 2, h: r * 2 });
    }

    for (const ellipse of svg.querySelectorAll("ellipse")) {
        if (isInsideDefs(ellipse)) continue;
        const rx = num(ellipse, "rx");
        const ry = num(ellipse, "ry");
        if (rx > 0 && ry > 0) {
            boxes.push({ x: num(ellipse, "cx") - rx, y: num(ellipse, "cy") - ry, w: rx * 2, h: ry * 2 });
        }
    }

    return boxes;
}

/**
 * Checks if a point is within NEAR_SHAPE_TOLERANCE pixels of any shape's edge or interior.
 */
function isPointNearAnyShape(px: number, py: number, shapes: ShapeBox[]): boolean {
    return shapes.some((s) => isPointNearShape(px, py, s));
}

function isPointNearShape(px: number, py: number, s: ShapeBox): boolean {
    const t = NEAR_SHAPE_TOLERANCE;
    return (
        px >= s.x - t &&
        px <= s.x + s.w + t &&
        py >= s.y - t &&
        py <= s.y + s.h + t
    );
}

/**
 * Recalculates viewBox to tightly fit the SVG content by scanning all
 * positioned elements (rect, circle, ellipse, line, text, path, polygon,
 * polyline, use, foreignObject) and computing their bounding box.
 */
function fixTightViewBox(svg: SVGElement): void {
    const bounds = computeContentBounds(svg);
    if (!bounds) return;

    const { minX, minY, maxX, maxY } = bounds;
    const width = maxX - minX + VIEWBOX_PADDING * 2;
    const height = maxY - minY + VIEWBOX_PADDING * 2;

    if (width < MIN_SHAPE_DIMENSION || height < MIN_SHAPE_DIMENSION) return;

    const vbX = Math.max(0, minX - VIEWBOX_PADDING);
    const vbY = Math.max(0, minY - VIEWBOX_PADDING);

    svg.setAttribute("viewBox", `${vbX} ${vbY} ${width} ${height}`);

    if (!svg.getAttribute("width")) {
        svg.setAttribute("width", "100%");
    }
    svg.removeAttribute("height");
}

interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function computeContentBounds(svg: SVGElement): Bounds | null {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let hasContent = false;

    const expandBounds = (x1: number, y1: number, x2: number, y2: number) => {
        minX = Math.min(minX, x1);
        minY = Math.min(minY, y1);
        maxX = Math.max(maxX, x2);
        maxY = Math.max(maxY, y2);
        hasContent = true;
    };

    collectRectBounds(svg, expandBounds);
    collectCircleBounds(svg, expandBounds);
    collectEllipseBounds(svg, expandBounds);
    collectLineBounds(svg, expandBounds);
    collectTextBounds(svg, expandBounds);
    collectPolygonBounds(svg, expandBounds);

    return hasContent ? { minX, minY, maxX, maxY } : null;
}

type ExpandFn = (x1: number, y1: number, x2: number, y2: number) => void;

function collectRectBounds(svg: SVGElement, expand: ExpandFn): void {
    for (const rect of svg.querySelectorAll("rect")) {
        const x = num(rect, "x");
        const y = num(rect, "y");
        const w = num(rect, "width");
        const h = num(rect, "height");
        if (w > 0 && h > 0) expand(x, y, x + w, y + h);
    }
}

function collectCircleBounds(svg: SVGElement, expand: ExpandFn): void {
    for (const circle of svg.querySelectorAll("circle")) {
        const cx = num(circle, "cx");
        const cy = num(circle, "cy");
        const r = num(circle, "r");
        if (r > 0) expand(cx - r, cy - r, cx + r, cy + r);
    }
}

function collectEllipseBounds(svg: SVGElement, expand: ExpandFn): void {
    for (const ellipse of svg.querySelectorAll("ellipse")) {
        const cx = num(ellipse, "cx");
        const cy = num(ellipse, "cy");
        const rx = num(ellipse, "rx");
        const ry = num(ellipse, "ry");
        if (rx > 0 && ry > 0) expand(cx - rx, cy - ry, cx + rx, cy + ry);
    }
}

function collectLineBounds(svg: SVGElement, expand: ExpandFn): void {
    for (const line of svg.querySelectorAll("line")) {
        const x1 = num(line, "x1");
        const y1 = num(line, "y1");
        const x2 = num(line, "x2");
        const y2 = num(line, "y2");
        expand(Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2));
    }
}

function collectTextBounds(svg: SVGElement, expand: ExpandFn): void {
    for (const text of svg.querySelectorAll("text")) {
        const x = num(text, "x");
        const y = num(text, "y");
        const fontSize = extractFontSize(text);
        const charCount = (text.textContent?.length || 0);
        const estWidth = charCount * fontSize * 0.6;
        const estHeight = fontSize * 1.4;

        expand(x - estWidth / 2, y - estHeight, x + estWidth / 2, y + estHeight / 4);
    }
}

function collectPolygonBounds(svg: SVGElement, expand: ExpandFn): void {
    const selectors = "polygon, polyline";
    for (const poly of svg.querySelectorAll(selectors)) {
        const points = poly.getAttribute("points")?.trim();
        if (!points) continue;

        for (const pair of points.split(/\s+/)) {
            const [xStr, yStr] = pair.split(",");
            const x = Number.parseFloat(xStr);
            const y = Number.parseFloat(yStr);
            if (!Number.isNaN(x) && !Number.isNaN(y)) expand(x, y, x, y);
        }
    }
}

function num(el: Element, attr: string): number {
    return Number.parseFloat(el.getAttribute(attr) || "0") || 0;
}

/**
 * Tech Stack Shape Definition Interface
 * Contract for all tech stack shape implementations
 * 
 * This interface defines the structure that all tech stack shapes must follow.
 * It ensures consistency across all shape implementations and enables type-safe
 * integration with the shape registry and canvas rendering system.
 */

import * as d3 from 'd3';

/**
 * TechStackShapeDefinition
 * 
 * Represents a single technology shape that can be rendered on the diagram canvas.
 * Each shape includes metadata (id, name, type) and a render function that creates
 * the SVG representation using D3.js.
 * 
 * @example
 * ```typescript
 * const reactShape: TechStackShapeDefinition = {
 *   id: 'tech-react',
 *   name: 'React',
 *   type: 'react',
 *   width: 80,
 *   height: 80,
 *   render: (g, width = 80, height = 80) => {
 *     const color = '#61DAFB';
 *     const cx = width / 2;
 *     const cy = height / 2;
 *     
 *     // Draw React atom logo
 *     g.append('circle')
 *       .attr('cx', cx)
 *       .attr('cy', cy)
 *       .attr('r', width * 0.1)
 *       .attr('fill', color);
 *     // ... additional SVG elements
 *   }
 * };
 * ```
 */
export interface TechStackShapeDefinition {
  /**
   * Unique identifier for the shape
   * MUST be prefixed with 'tech-' to avoid collisions with other architecture shapes
   * @example 'tech-react', 'tech-nodejs', 'tech-docker'
   */
  id: string;

  /**
   * Human-readable display name shown in the shape library panel
   * @example 'React', 'Node.js', 'Docker'
   */
  name: string;

  /**
   * Lowercase type identifier used for shape lookups
   * Should match the key in the techStackD3Shapes record
   * @example 'react', 'nodejs', 'docker'
   */
  type: string;

  /**
   * Default width of the shape in pixels
   * Used as initial size when shape is dragged onto canvas
   * Typically 80 pixels for most shapes
   * @minimum 40
   * @maximum 200
   */
  width: number;

  /**
   * Default height of the shape in pixels
   * Used as initial size when shape is dragged onto canvas
   * Typically 80 pixels for most shapes
   * @minimum 40
   * @maximum 200
   */
  height: number;

  /**
   * D3.js render function that creates the SVG representation of the shape
   * 
   * The function receives:
   * - g: A D3 selection representing an SVG group element where shape content should be appended
   * - width: The target width for rendering (may differ from default width if shape is resized)
   * - height: The target height for rendering (may differ from default height if shape is resized)
   * 
   * Requirements:
   * - MUST append SVG elements (path, rect, circle, etc.) to the provided group selection
   * - MUST use relative positioning based on width and height parameters (e.g., cx = width / 2)
   * - MUST NOT modify global state or access external DOM elements
   * - SHOULD complete rendering in <50ms for performance
   * - SHOULD include stroke attributes for contrast and definition
   * - SHOULD use brand-accurate colors from official guidelines
   * 
   * @param g - D3 selection of the SVG group element to append content to
   * @param width - Target width for the shape rendering
   * @param height - Target height for the shape rendering
   * 
   * @example
   * ```typescript
   * render: (g, width = 80, height = 80) => {
   *   const cx = width / 2;
   *   const cy = height / 2;
   *   const radius = width * 0.4;
   *   
   *   g.append('circle')
   *     .attr('cx', cx)
   *     .attr('cy', cy)
   *     .attr('r', radius)
   *     .attr('fill', '#61DAFB')
   *     .attr('stroke', '#4A9EC9')
   *     .attr('stroke-width', 2);
   * }
   * ```
   */
  render: (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => void;
}

/**
 * TechStackShapesCollection
 * 
 * Record mapping lowercase shape type identifiers to their shape definitions.
 * This is the main export from tech-stack-d3-shapes.ts that gets registered
 * in the ARCHITECTURE_LIBRARIES registry.
 * 
 * @example
 * ```typescript
 * export const techStackD3Shapes: Record<string, TechStackShapeDefinition> = {
 *   react: reactShapeDefinition,
 *   nextjs: nextjsShapeDefinition,
 *   nodejs: nodejsShapeDefinition,
 *   docker: dockerShapeDefinition,
 *   mongodb: mongodbShapeDefinition,
 *   mcpagent: mcpAgentShapeDefinition,
 *   ai: aiShapeDefinition,
 * };
 * ```
 */
export type TechStackShapesCollection = Record<string, TechStackShapeDefinition>;

/**
 * Shape Metadata
 * 
 * Additional metadata for the TechStack architecture type.
 * Used by getArchitectureMetadata() in the shape registry.
 */
export interface TechStackArchitectureMetadata {
  /**
   * Display name shown in architecture selection dropdown
   */
  name: 'Tech Stack';

  /**
   * Brand color for the architecture type (used in UI elements)
   * Distinct from other architectures: AWS (#FF9900), Azure (#0078D4),
   * GCP (#4285F4), Kubernetes (#326CE5), Generic (#666666)
   */
  color: '#5C7CFA';

  /**
   * Description shown in tooltips or help text
   */
  description: 'Modern web development technology shapes';
}

/**
 * Shape Color Constants
 * 
 * Official brand colors for each technology.
 * These should be used consistently across all shape implementations.
 */
export const TECH_STACK_COLORS = {
  REACT: '#61DAFB',           // Official React cyan
  NEXTJS: '#000000',          // Official Next.js black
  NEXTJS_WHITE: '#FFFFFF',    // Next.js white accent
  NODEJS: '#339933',          // Official Node.js green
  DOCKER: '#2496ED',          // Official Docker blue
  MONGODB: '#00684A',         // Official MongoDB green
  MCP_AGENT: '#6C757D',       // Neutral gray for abstract concept
  AI: '#7950F2',              // Purple for futuristic AI theme
} as const;

/**
 * Validation Rules
 */
export const SHAPE_VALIDATION = {
  /**
   * ID must start with 'tech-' prefix
   */
  ID_PREFIX: 'tech-',

  /**
   * Minimum shape dimensions
   */
  MIN_WIDTH: 40,
  MIN_HEIGHT: 40,

  /**
   * Maximum shape dimensions
   */
  MAX_WIDTH: 200,
  MAX_HEIGHT: 200,

  /**
   * Performance target for render function execution
   */
  MAX_RENDER_TIME_MS: 50,

  /**
   * WCAG AA minimum contrast ratio for graphics
   */
  MIN_CONTRAST_RATIO: 3.0,
} as const;

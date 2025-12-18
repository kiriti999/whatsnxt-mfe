/**
 * Tech Stack D3 Shape Library
 * Professional D3.js implementations of modern web technology shapes
 * Based on official brand guidelines where available
 */

import * as d3 from "d3";

export interface TechStackShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number,
  ) => void;
}

/**
 * Official brand colors for tech stack shapes
 */
export const TECH_STACK_COLORS = {
  REACT: "#61DAFB", // Official React cyan
  NEXTJS: "#000000", // Official Next.js black
  NEXTJS_WHITE: "#FFFFFF", // Next.js white accent
  NODEJS: "#339933", // Official Node.js green
  DOCKER: "#2496ED", // Official Docker blue
  MONGODB: "#00684A", // Official MongoDB green
  MCP_AGENT: "#6C757D", // Neutral gray for abstract concept
  AI: "#7950F2", // Purple for futuristic AI theme
} as const;

export const techStackD3Shapes: Record<string, TechStackShapeDefinition> = {
  /**
   * React - Atom logo with nucleus and orbiting electrons
   */
  react: {
    id: "tech-react",
    name: "React",
    type: "react",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const color = TECH_STACK_COLORS.REACT;
      const strokeColor = "#4A9EC9";
      const cx = width / 2;
      const cy = height / 2;

      // Nucleus (center circle)
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", width * 0.08)
        .attr("fill", color);

      // Three elliptical orbits at 60° intervals
      for (let i = 0; i < 3; i++) {
        const angle = i * 60;
        g.append("ellipse")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("rx", width * 0.45)
          .attr("ry", height * 0.15)
          .attr("transform", `rotate(${angle} ${cx} ${cy})`)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2);
      }
    },
  },

  /**
   * Next.js - Geometric design with black triangle
   */
  nextjs: {
    id: "tech-nextjs",
    name: "Next.js",
    type: "nextjs",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const black = TECH_STACK_COLORS.NEXTJS;
      const white = TECH_STACK_COLORS.NEXTJS_WHITE;
      const cx = width / 2;
      const cy = height / 2;

      // Black circle background
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", width * 0.45)
        .attr("fill", black);

      // White triangle (stylized N)
      const trianglePath = `
        M ${cx - width * 0.15} ${cy + height * 0.25}
        L ${cx - width * 0.15} ${cy - height * 0.25}
        L ${cx + width * 0.25} ${cy + height * 0.25}
        Z
      `;

      g.append("path").attr("d", trianglePath).attr("fill", white);
    },
  },

  /**
   * Node.js - Hexagon shape
   */
  nodejs: {
    id: "tech-nodejs",
    name: "Node.js",
    type: "nodejs",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const color = TECH_STACK_COLORS.NODEJS;
      const strokeColor = "#2E7D2E";
      const cx = width / 2;
      const cy = height / 2;

      // Hexagon path
      const hexPath = `
        M ${cx} ${cy - height * 0.45}
        L ${cx + width * 0.4} ${cy - height * 0.23}
        L ${cx + width * 0.4} ${cy + height * 0.23}
        L ${cx} ${cy + height * 0.45}
        L ${cx - width * 0.4} ${cy + height * 0.23}
        L ${cx - width * 0.4} ${cy - height * 0.23}
        Z
      `;

      g.append("path")
        .attr("d", hexPath)
        .attr("fill", color)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
    },
  },

  /**
   * Docker - Whale with container blocks
   */
  docker: {
    id: "tech-docker",
    name: "Docker",
    type: "docker",
    width: 90,
    height: 80,
    render: (g, width = 90, height = 80) => {
      const color = TECH_STACK_COLORS.DOCKER;
      const strokeColor = "#1A73C9";

      // Container blocks (3x2 grid)
      const blockWidth = width * 0.12;
      const blockHeight = height * 0.12;
      const startX = width * 0.25;
      const startY = height * 0.2;
      const gap = width * 0.02;

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          g.append("rect")
            .attr("x", startX + col * (blockWidth + gap))
            .attr("y", startY + row * (blockHeight + gap))
            .attr("width", blockWidth)
            .attr("height", blockHeight)
            .attr("fill", color)
            .attr("stroke", strokeColor)
            .attr("stroke-width", 1)
            .attr("rx", 1);
        }
      }

      // Whale body (simplified)
      const whaleY = height * 0.6;
      const whaleWidth = width * 0.6;
      const whaleHeight = height * 0.25;

      g.append("ellipse")
        .attr("cx", width / 2)
        .attr("cy", whaleY)
        .attr("rx", whaleWidth / 2)
        .attr("ry", whaleHeight / 2)
        .attr("fill", color)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
    },
  },

  /**
   * MongoDB - Leaf logo
   */
  mongodb: {
    id: "tech-mongodb",
    name: "MongoDB",
    type: "mongodb",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const color = TECH_STACK_COLORS.MONGODB;
      const strokeColor = "#004D37";
      const cx = width / 2;
      const cy = height / 2;

      // Leaf shape using bezier curves
      const leafPath = `
        M ${cx} ${cy - height * 0.45}
        Q ${cx + width * 0.25} ${cy - height * 0.15}, ${cx + width * 0.15} ${cy + height * 0.2}
        Q ${cx + width * 0.05} ${cy + height * 0.4}, ${cx} ${cy + height * 0.45}
        Q ${cx - width * 0.05} ${cy + height * 0.4}, ${cx - width * 0.15} ${cy + height * 0.2}
        Q ${cx - width * 0.25} ${cy - height * 0.15}, ${cx} ${cy - height * 0.45}
        Z
      `;

      g.append("path")
        .attr("d", leafPath)
        .attr("fill", color)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);

      // Center vein line
      g.append("line")
        .attr("x1", cx)
        .attr("y1", cy - height * 0.4)
        .attr("x2", cx)
        .attr("y2", cy + height * 0.4)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
    },
  },

  /**
   * MCP Agent - Robot/bot icon
   */
  mcpagent: {
    id: "tech-mcpagent",
    name: "MCP Agent",
    type: "mcpagent",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const color = TECH_STACK_COLORS.MCP_AGENT;
      const strokeColor = "#495057";
      const cx = width / 2;
      const cy = height / 2;

      // Robot head (rounded rectangle)
      const headWidth = width * 0.5;
      const headHeight = height * 0.4;
      const headX = cx - headWidth / 2;
      const headY = cy - headHeight / 2;

      g.append("rect")
        .attr("x", headX)
        .attr("y", headY)
        .attr("width", headWidth)
        .attr("height", headHeight)
        .attr("fill", color)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .attr("rx", 4);

      // Two eyes (circles)
      const eyeRadius = width * 0.06;
      const eyeOffsetX = width * 0.12;

      g.append("circle")
        .attr("cx", cx - eyeOffsetX)
        .attr("cy", cy)
        .attr("r", eyeRadius)
        .attr("fill", "#FFFFFF");

      g.append("circle")
        .attr("cx", cx + eyeOffsetX)
        .attr("cy", cy)
        .attr("r", eyeRadius)
        .attr("fill", "#FFFFFF");

      // Antenna (line with circle on top)
      const antennaHeight = height * 0.2;

      g.append("line")
        .attr("x1", cx)
        .attr("y1", headY)
        .attr("x2", cx)
        .attr("y2", headY - antennaHeight)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);

      g.append("circle")
        .attr("cx", cx)
        .attr("cy", headY - antennaHeight)
        .attr("r", width * 0.05)
        .attr("fill", color)
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2);
    },
  },

  /**
   * AI - Neural network/brain icon
   */
  ai: {
    id: "tech-ai",
    name: "AI",
    type: "ai",
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const color = TECH_STACK_COLORS.AI;
      const strokeColor = "#6741D9";
      const cx = width / 2;
      const cy = height / 2;

      // Neural network nodes (5 nodes in a pattern)
      const nodes = [
        { x: cx - width * 0.3, y: cy - height * 0.2 },
        { x: cx + width * 0.3, y: cy - height * 0.2 },
        { x: cx, y: cy },
        { x: cx - width * 0.3, y: cy + height * 0.2 },
        { x: cx + width * 0.3, y: cy + height * 0.2 },
      ];

      // Draw connections between nodes
      const connections = [
        [0, 2],
        [1, 2],
        [2, 3],
        [2, 4],
        [0, 3],
        [1, 4],
      ];

      connections.forEach(([from, to]) => {
        g.append("line")
          .attr("x1", nodes[from].x)
          .attr("y1", nodes[from].y)
          .attr("x2", nodes[to].x)
          .attr("y2", nodes[to].y)
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("opacity", 0.6);
      });

      // Draw nodes
      nodes.forEach((node) => {
        g.append("circle")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", width * 0.08)
          .attr("fill", color)
          .attr("stroke", strokeColor)
          .attr("stroke-width", 2);
      });
    },
  },
};

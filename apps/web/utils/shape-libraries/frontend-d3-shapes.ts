/**
 * Frontend Development Shape Library
 * Covers L3 topics: React, Vue, Angular, Svelte, CSS, Build Tools, Components, State, DOM
 */
import * as d3 from 'd3';

export interface FrontendShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const frontendD3Shapes: Record<string, FrontendShapeDefinition> = {
    component: {
        id: 'fe-component',
        name: 'Component',
        type: 'component',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#3498db').attr('stroke-width', 2);
            // Component tag
            g.append('text').attr('x', width * 0.12).attr('y', height * 0.22).attr('fill', '#e74c3c').attr('font-size', 8).text('<');
            g.append('text').attr('x', width * 0.22).attr('y', height * 0.22).attr('fill', '#2e86c1').attr('font-size', 8).attr('font-weight', 'bold').text('Comp');
            g.append('text').attr('x', width * 0.68).attr('y', height * 0.22).attr('fill', '#e74c3c').attr('font-size', 8).text('/>');
            // Child components
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.32).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#d6eaf8').attr('stroke', '#5dade2').attr('stroke-width', 1);
            g.append('rect').attr('x', width * 0.55).attr('y', height * 0.32).attr('width', width * 0.35).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#d6eaf8').attr('stroke', '#5dade2').attr('stroke-width', 1);
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.65).attr('width', width * 0.5).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#d6eaf8').attr('stroke', '#5dade2').attr('stroke-width', 1);
        },
    },

    statestore: {
        id: 'fe-state',
        name: 'State',
        type: 'statestore',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // State icon (atom-like)
            g.append('ellipse').attr('cx', width / 2).attr('cy', height / 2).attr('rx', width * 0.3).attr('ry', height * 0.12).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('ellipse').attr('cx', width / 2).attr('cy', height / 2).attr('rx', width * 0.12).attr('ry', height * 0.3).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5).attr('transform', `rotate(60 ${width / 2} ${height / 2})`);
            g.append('ellipse').attr('cx', width / 2).attr('cy', height / 2).attr('rx', width * 0.12).attr('ry', height * 0.3).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5).attr('transform', `rotate(-60 ${width / 2} ${height / 2})`);
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 4).attr('fill', '#8e44ad');
        },
    },

    router: {
        id: 'fe-router',
        name: 'Router',
        type: 'router',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Route paths
            g.append('circle').attr('cx', width * 0.15).attr('cy', height * 0.5).attr('r', 5).attr('fill', '#27ae60');
            // Branching routes
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.5).attr('x2', width * 0.4).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Fork
            g.append('line').attr('x1', width * 0.4).attr('y1', height * 0.5).attr('x2', width * 0.6).attr('y2', height * 0.2).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.4).attr('y1', height * 0.5).attr('x2', width * 0.6).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.4).attr('y1', height * 0.5).attr('x2', width * 0.6).attr('y2', height * 0.8).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // Page endpoints
            g.append('rect').attr('x', width * 0.62).attr('y', height * 0.1).attr('width', width * 0.3).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#a9dfbf');
            g.append('text').attr('x', width * 0.77).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#1e8449').attr('font-size', 6).text('/home');
            g.append('rect').attr('x', width * 0.62).attr('y', height * 0.4).attr('width', width * 0.3).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#a9dfbf');
            g.append('text').attr('x', width * 0.77).attr('y', height * 0.52).attr('text-anchor', 'middle').attr('fill', '#1e8449').attr('font-size', 6).text('/about');
            g.append('rect').attr('x', width * 0.62).attr('y', height * 0.7).attr('width', width * 0.3).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#a9dfbf');
            g.append('text').attr('x', width * 0.77).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#1e8449').attr('font-size', 6).text('/api');
        },
    },

    domtree: {
        id: 'fe-dom',
        name: 'DOM Tree',
        type: 'domtree',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Tree structure
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.15).attr('x2', width * 0.25).attr('y2', height * 0.42).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.15).attr('x2', width * 0.75).attr('y2', height * 0.42).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.42).attr('x2', width * 0.15).attr('y2', height * 0.68).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.42).attr('x2', width * 0.38).attr('y2', height * 0.68).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.42).attr('x2', width * 0.62).attr('y2', height * 0.68).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.42).attr('x2', width * 0.85).attr('y2', height * 0.68).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            // HTML nodes
            g.append('rect').attr('x', width * 0.38).attr('y', height * 0.07).attr('width', width * 0.24).attr('height', height * 0.14).attr('rx', 3).attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.17).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('html');
            [[0.25, 0.42], [0.75, 0.42]].forEach(([x, y], i) => {
                g.append('rect').attr('x', width * (x - 0.08)).attr('y', height * (y - 0.05)).attr('width', width * 0.16).attr('height', height * 0.1).attr('rx', 2).attr('fill', i === 0 ? '#3498db' : '#27ae60');
                g.append('text').attr('x', width * x).attr('y', height * (y + 0.02)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text(i === 0 ? 'head' : 'body');
            });
            [[0.15, 0.68], [0.38, 0.68], [0.62, 0.68], [0.85, 0.68]].forEach(([x, y]) => {
                g.append('rect').attr('x', width * (x - 0.06)).attr('y', height * (y - 0.04)).attr('width', width * 0.12).attr('height', height * 0.08).attr('rx', 2).attr('fill', '#f39c12');
            });
        },
    },

    csslayout: {
        id: 'fe-css',
        name: 'CSS Layout',
        type: 'csslayout',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Grid layout
            g.append('rect').attr('x', width * 0.06).attr('y', height * 0.06).attr('width', width * 0.88).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#3498db').attr('opacity', 0.6);
            g.append('rect').attr('x', width * 0.06).attr('y', height * 0.3).attr('width', width * 0.25).attr('height', height * 0.5).attr('rx', 2).attr('fill', '#2ecc71').attr('opacity', 0.6);
            g.append('rect').attr('x', width * 0.37).attr('y', height * 0.3).attr('width', width * 0.57).attr('height', height * 0.22).attr('rx', 2).attr('fill', '#e74c3c').attr('opacity', 0.5);
            g.append('rect').attr('x', width * 0.37).attr('y', height * 0.56).attr('width', width * 0.57).attr('height', height * 0.24).attr('rx', 2).attr('fill', '#f39c12').attr('opacity', 0.5);
            g.append('rect').attr('x', width * 0.06).attr('y', height * 0.84).attr('width', width * 0.88).attr('height', height * 0.12).attr('rx', 2).attr('fill', '#95a5a6').attr('opacity', 0.5);
            // Labels
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.19).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('header');
            g.append('text').attr('x', width * 0.18).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('nav');
        },
    },

    hook: {
        id: 'fe-hook',
        name: 'Hook',
        type: 'hook',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Hook shape
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.15} L${width * 0.3},${height * 0.5} Q${width * 0.3},${height * 0.78} ${width * 0.5},${height * 0.78} Q${width * 0.7},${height * 0.78} ${width * 0.7},${height * 0.55}`)
                .attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 3).attr('stroke-linecap', 'round');
            // Arrow at end
            g.append('polygon')
                .attr('points', `${width * 0.7},${height * 0.55} ${width * 0.62},${height * 0.48} ${width * 0.78},${height * 0.48}`)
                .attr('fill', '#2e86c1');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.93).attr('text-anchor', 'middle').attr('fill', '#2e86c1').attr('font-size', 7).text('use...');
        },
    },

    browserwindow: {
        id: 'fe-browser',
        name: 'Browser',
        type: 'browserwindow',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            // Browser chrome
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#ecf0f1').attr('stroke', '#bdc3c7').attr('stroke-width', 1.5);
            // Title bar
            g.append('rect').attr('width', width).attr('height', height * 0.22).attr('rx', 4).attr('fill', '#bdc3c7');
            // Traffic lights
            g.append('circle').attr('cx', width * 0.06).attr('cy', height * 0.11).attr('r', 3).attr('fill', '#e74c3c');
            g.append('circle').attr('cx', width * 0.14).attr('cy', height * 0.11).attr('r', 3).attr('fill', '#f1c40f');
            g.append('circle').attr('cx', width * 0.22).attr('cy', height * 0.11).attr('r', 3).attr('fill', '#27ae60');
            // URL bar
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.05).attr('width', width * 0.6).attr('height', height * 0.12).attr('rx', 2).attr('fill', '#fff');
            // Content area - simple boxes
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.3).attr('width', width * 0.84).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#3498db').attr('opacity', 0.3);
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.56).attr('width', width * 0.38).attr('height', height * 0.35).attr('rx', 2).attr('fill', '#27ae60').attr('opacity', 0.3);
            g.append('rect').attr('x', width * 0.52).attr('y', height * 0.56).attr('width', width * 0.4).attr('height', height * 0.35).attr('rx', 2).attr('fill', '#e74c3c').attr('opacity', 0.3);
        },
    },

    bundler: {
        id: 'fe-bundler',
        name: 'Bundler',
        type: 'bundler',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Multiple files converging
            [[0.12, 0.15], [0.12, 0.4], [0.12, 0.65]].forEach(([x, y]) => {
                g.append('rect').attr('x', width * x).attr('y', height * y).attr('width', width * 0.15).attr('height', height * 0.15).attr('rx', 2).attr('fill', '#f39c12').attr('opacity', 0.6);
                g.append('line').attr('x1', width * (x + 0.15)).attr('y1', height * (y + 0.075)).attr('x2', width * 0.5).attr('y2', height * 0.5).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            });
            // Central funnel/gear
            g.append('circle').attr('cx', width * 0.55).attr('cy', height * 0.5).attr('r', width * 0.12).attr('fill', '#f39c12');
            g.append('circle').attr('cx', width * 0.55).attr('cy', height * 0.5).attr('r', width * 0.05).attr('fill', '#fef9e7');
            // Output bundle
            g.append('line').attr('x1', width * 0.67).attr('y1', height * 0.5).attr('x2', width * 0.82).attr('y2', height * 0.5).attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('rect').attr('x', width * 0.75).attr('y', height * 0.35).attr('width', width * 0.2).attr('height', height * 0.3).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.85).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('.js');
        },
    },

    ssr: {
        id: 'fe-ssr',
        name: 'SSR / SSG',
        type: 'ssr',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Server side
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.12).attr('width', width * 0.35).attr('height', height * 0.76).attr('rx', 3).attr('fill', '#8e44ad');
            g.append('text').attr('x', width * 0.225).attr('y', height * 0.35).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('Server');
            // HTML generation lines
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.5).attr('x2', width * 0.35).attr('y2', height * 0.5).attr('stroke', '#d7bde2').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.62).attr('x2', width * 0.3).attr('y2', height * 0.62).attr('stroke', '#d7bde2').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.74).attr('x2', width * 0.25).attr('y2', height * 0.74).attr('stroke', '#d7bde2').attr('stroke-width', 1);
            // Arrow
            g.append('line').attr('x1', width * 0.42).attr('y1', height * 0.5).attr('x2', width * 0.55).attr('y2', height * 0.5).attr('stroke', '#f1c40f').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.55},${height * 0.5} ${width * 0.52},${height * 0.4} ${width * 0.52},${height * 0.6}`)
                .attr('fill', '#f1c40f');
            // Client side
            g.append('rect').attr('x', width * 0.6).attr('y', height * 0.12).attr('width', width * 0.35).attr('height', height * 0.76).attr('rx', 3).attr('fill', '#2e86c1');
            g.append('text').attr('x', width * 0.775).attr('y', height * 0.35).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('Client');
            g.append('text').attr('x', width * 0.775).attr('y', height * 0.62).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).text('🌐');
        },
    },
};

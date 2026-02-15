/**
 * Database Shape Library
 * Covers: Relational Databases, NoSQL, NewSQL, Vector Databases, Search Engines
 */
import * as d3 from 'd3';

export interface DatabaseShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const databaseD3Shapes: Record<string, DatabaseShapeDefinition> = {
    sqltable: {
        id: 'db-sqltable',
        name: 'SQL Table',
        type: 'sqltable',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Table body
            g.append('rect')
                .attr('x', 0).attr('y', height * 0.15)
                .attr('width', width).attr('height', height * 0.85)
                .attr('rx', 3).attr('fill', '#e8f4fd').attr('stroke', '#2980b9').attr('stroke-width', 2);
            // Header row
            g.append('rect')
                .attr('x', 0).attr('y', height * 0.15)
                .attr('width', width).attr('height', height * 0.25)
                .attr('rx', 3).attr('fill', '#2980b9').attr('stroke', '#2980b9').attr('stroke-width', 2);
            // Column lines
            g.append('line').attr('x1', width * 0.33).attr('y1', height * 0.15).attr('x2', width * 0.33).attr('y2', height).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.66).attr('y1', height * 0.15).attr('x2', width * 0.66).attr('y2', height).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            // Row lines
            g.append('line').attr('x1', 0).attr('y1', height * 0.55).attr('x2', width).attr('y2', height * 0.55).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('line').attr('x1', 0).attr('y1', height * 0.75).attr('x2', width).attr('y2', height * 0.75).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            // Label
            g.append('text').attr('x', width / 2).attr('y', height * 0.33).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('SQL');
        },
    },

    nosqldoc: {
        id: 'db-nosqldoc',
        name: 'Document DB',
        type: 'nosqldoc',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Document shape
            g.append('path')
                .attr('d', `M${width * 0.1},0 L${width * 0.7},0 L${width * 0.9},${height * 0.2} L${width * 0.9},${height} L${width * 0.1},${height} Z`)
                .attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Fold corner
            g.append('path')
                .attr('d', `M${width * 0.7},0 L${width * 0.7},${height * 0.2} L${width * 0.9},${height * 0.2}`)
                .attr('fill', '#a3e4d7').attr('stroke', '#1abc9c').attr('stroke-width', 1.5);
            // JSON braces
            g.append('text').attr('x', width / 2).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#1abc9c').attr('font-size', 16).attr('font-weight', 'bold').text('{ }');
        },
    },

    graphdb: {
        id: 'db-graphdb',
        name: 'Graph DB',
        type: 'graphdb',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Background
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Nodes
            const nodes = [[0.25, 0.3], [0.75, 0.25], [0.5, 0.7], [0.2, 0.65]];
            nodes.forEach(([cx, cy]) => {
                g.append('circle').attr('cx', width * cx).attr('cy', height * cy).attr('r', 5).attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 1.5);
            });
            // Edges
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.3).attr('x2', width * 0.75).attr('y2', height * 0.25).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.25).attr('x2', width * 0.5).attr('y2', height * 0.7).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.7).attr('x2', width * 0.2).attr('y2', height * 0.65).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.65).attr('x2', width * 0.25).attr('y2', height * 0.3).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
        },
    },

    keyvalue: {
        id: 'db-keyvalue',
        name: 'Key-Value Store',
        type: 'keyvalue',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Key-value rows
            const rows = [0.2, 0.45, 0.7];
            rows.forEach((y) => {
                g.append('rect').attr('x', width * 0.08).attr('y', height * y).attr('width', width * 0.35).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#e74c3c');
                g.append('rect').attr('x', width * 0.52).attr('y', height * y).attr('width', width * 0.4).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#f5b7b1');
            });
            g.append('text').attr('x', width * 0.47).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 12).attr('font-weight', 'bold').text(':');
        },
    },

    columnar: {
        id: 'db-columnar',
        name: 'Column Store',
        type: 'columnar',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Columns
            const cols = [0.12, 0.37, 0.62];
            const colors = ['#3498db', '#2ecc71', '#e67e22'];
            cols.forEach((x, i) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.15).attr('width', width * 0.22).attr('height', height * 0.7).attr('rx', 2).attr('fill', colors[i]).attr('opacity', 0.7);
            });
        },
    },

    vectordb: {
        id: 'db-vectordb',
        name: 'Vector DB',
        type: 'vectordb',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Vector arrows at different angles
            const cx = width / 2;
            const cy = height / 2;
            const angles = [0, 60, 120, 200, 280];
            angles.forEach((a) => {
                const rad = (a * Math.PI) / 180;
                const len = width * 0.3;
                g.append('line')
                    .attr('x1', cx).attr('y1', cy)
                    .attr('x2', cx + Math.cos(rad) * len).attr('y2', cy + Math.sin(rad) * len)
                    .attr('stroke', '#8e44ad').attr('stroke-width', 2).attr('marker-end', 'none');
                g.append('circle').attr('cx', cx + Math.cos(rad) * len).attr('cy', cy + Math.sin(rad) * len).attr('r', 3).attr('fill', '#8e44ad');
            });
            g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 4).attr('fill', '#8e44ad');
        },
    },

    searchindex: {
        id: 'db-searchindex',
        name: 'Search Engine',
        type: 'searchindex',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Magnifying glass
            g.append('circle').attr('cx', width * 0.4).attr('cy', height * 0.4).attr('r', width * 0.2).attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 3);
            g.append('line').attr('x1', width * 0.55).attr('y1', height * 0.55).attr('x2', width * 0.75).attr('y2', height * 0.75).attr('stroke', '#f39c12').attr('stroke-width', 3).attr('stroke-linecap', 'round');
        },
    },

    timeseries: {
        id: 'db-timeseries',
        name: 'Time Series DB',
        type: 'timeseries',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#e8f8f5').attr('stroke', '#16a085').attr('stroke-width', 2);
            // Time series line chart
            const points = [[0.1, 0.6], [0.25, 0.35], [0.4, 0.5], [0.55, 0.25], [0.7, 0.45], [0.9, 0.2]];
            const line = d3.line<number[]>().x((d) => width * d[0]).y((d) => height * d[1]).curve(d3.curveMonotoneX);
            g.append('path').attr('d', line(points)).attr('fill', 'none').attr('stroke', '#16a085').attr('stroke-width', 2.5);
            // Dots
            points.forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 2.5).attr('fill', '#16a085');
            });
            // Axis
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.8).attr('x2', width * 0.92).attr('y2', height * 0.8).attr('stroke', '#16a085').attr('stroke-width', 1);
        },
    },

    replica: {
        id: 'db-replica',
        name: 'DB Replica',
        type: 'replica',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Stacked cylinders
            const drawCylinder = (x: number, y: number, w: number, h: number, fill: string) => {
                g.append('ellipse').attr('cx', x + w / 2).attr('cy', y + h).attr('rx', w / 2).attr('ry', h * 0.2).attr('fill', fill).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
                g.append('rect').attr('x', x).attr('y', y + h * 0.2).attr('width', w).attr('height', h * 0.8).attr('fill', fill).attr('stroke', 'none');
                g.append('line').attr('x1', x).attr('y1', y + h * 0.2).attr('x2', x).attr('y2', y + h).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
                g.append('line').attr('x1', x + w).attr('y1', y + h * 0.2).attr('x2', x + w).attr('y2', y + h).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
                g.append('ellipse').attr('cx', x + w / 2).attr('cy', y + h * 0.2).attr('rx', w / 2).attr('ry', h * 0.2).attr('fill', fill).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
            };
            drawCylinder(width * 0.15, height * 0.05, width * 0.35, height * 0.4, '#aed6f1');
            drawCylinder(width * 0.5, height * 0.05, width * 0.35, height * 0.4, '#aed6f1');
            drawCylinder(width * 0.32, height * 0.5, width * 0.35, height * 0.4, '#85c1e9');
            // Sync arrows
            g.append('text').attr('x', width / 2).attr('y', height * 0.52).attr('text-anchor', 'middle').attr('fill', '#2c3e50').attr('font-size', 10).text('⇄');
        },
    },

    cache: {
        id: 'db-cache',
        name: 'Cache',
        type: 'cache',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Lightning bolt
            g.append('polygon')
                .attr('points', `${width * 0.55},${height * 0.1} ${width * 0.35},${height * 0.48} ${width * 0.5},${height * 0.48} ${width * 0.42},${height * 0.9} ${width * 0.65},${height * 0.45} ${width * 0.5},${height * 0.45}`)
                .attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
        },
    },
};

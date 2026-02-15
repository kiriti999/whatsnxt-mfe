/**
 * Data Science & Analytics Shape Library
 * Covers: Data Engineering, Data Lakes, Data Warehouses, BI, Data Visualization, Data Governance
 */
import * as d3 from 'd3';

export interface DataScienceShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const dataScienceD3Shapes: Record<string, DataScienceShapeDefinition> = {
    pipeline: {
        id: 'ds-pipeline',
        name: 'Data Pipeline',
        type: 'pipeline',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            // Funnel shape
            g.append('path')
                .attr('d', `M0,${height * 0.1} L${width},${height * 0.1} L${width * 0.7},${height * 0.5} L${width * 0.7},${height * 0.9} L${width * 0.3},${height * 0.9} L${width * 0.3},${height * 0.5} Z`)
                .attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Flow arrows
            g.append('text').attr('x', width / 2).attr('y', height * 0.35).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 12).text('▼');
        },
    },

    datalake: {
        id: 'ds-datalake',
        name: 'Data Lake',
        type: 'datalake',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            // Lake shape (wavy bottom)
            g.append('path')
                .attr('d', `M${width * 0.05},${height * 0.3} Q${width * 0.25},${height * 0.15} ${width * 0.5},${height * 0.2} Q${width * 0.75},${height * 0.25} ${width * 0.95},${height * 0.3} L${width * 0.95},${height * 0.75} Q${width * 0.75},${height * 0.9} ${width * 0.5},${height * 0.85} Q${width * 0.25},${height * 0.8} ${width * 0.05},${height * 0.75} Z`)
                .attr('fill', '#aed6f1').attr('stroke', '#2980b9').attr('stroke-width', 2);
            // Wave line
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.55} Q${width * 0.3},${height * 0.45} ${width * 0.5},${height * 0.55} Q${width * 0.7},${height * 0.65} ${width * 0.9},${height * 0.55}`)
                .attr('fill', 'none').attr('stroke', '#2980b9').attr('stroke-width', 1.5).attr('opacity', 0.5);
        },
    },

    datawarehouse: {
        id: 'ds-datawarehouse',
        name: 'Data Warehouse',
        type: 'datawarehouse',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Building shape
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.15).attr('width', width * 0.8).attr('height', height * 0.8).attr('fill', '#e8daef').attr('stroke', '#7d3c98').attr('stroke-width', 2);
            // Roof
            g.append('polygon')
                .attr('points', `${width * 0.05},${height * 0.2} ${width * 0.5},0 ${width * 0.95},${height * 0.2}`)
                .attr('fill', '#7d3c98').attr('stroke', '#7d3c98').attr('stroke-width', 2);
            // Shelves
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.45).attr('x2', width * 0.85).attr('y2', height * 0.45).attr('stroke', '#7d3c98').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.65).attr('x2', width * 0.85).attr('y2', height * 0.65).attr('stroke', '#7d3c98').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.2).attr('x2', width * 0.5).attr('y2', height * 0.95).attr('stroke', '#7d3c98').attr('stroke-width', 1);
        },
    },

    dashboard: {
        id: 'ds-dashboard',
        name: 'Dashboard',
        type: 'dashboard',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#f0f3f4').attr('stroke', '#566573').attr('stroke-width', 2);
            // Header bar
            g.append('rect').attr('width', width).attr('height', height * 0.18).attr('rx', 4).attr('fill', '#2c3e50');
            // Mini chart 1 - bar chart
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.5).attr('width', width * 0.08).attr('height', height * 0.35).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.4).attr('width', width * 0.08).attr('height', height * 0.45).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.32).attr('y', height * 0.55).attr('width', width * 0.08).attr('height', height * 0.3).attr('fill', '#3498db');
            // Mini chart 2 - pie
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.6).attr('r', height * 0.2).attr('fill', '#e74c3c');
            g.append('path')
                .attr('d', `M${width * 0.65},${height * 0.6} L${width * 0.65},${height * 0.4} A${height * 0.2},${height * 0.2} 0 0,1 ${width * 0.82},${height * 0.68} Z`)
                .attr('fill', '#2ecc71');
        },
    },

    barchart: {
        id: 'ds-barchart',
        name: 'Bar Chart',
        type: 'barchart',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#ebf5fb').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Bars
            const bars = [0.7, 0.45, 0.85, 0.55, 0.65];
            bars.forEach((h, i) => {
                g.append('rect')
                    .attr('x', width * (0.1 + i * 0.17)).attr('y', height * (0.85 - h * 0.65))
                    .attr('width', width * 0.13).attr('height', height * h * 0.65)
                    .attr('fill', '#2e86c1').attr('rx', 1);
            });
            // Axis
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.85).attr('x2', width * 0.92).attr('y2', height * 0.85).attr('stroke', '#2e86c1').attr('stroke-width', 1);
        },
    },

    notebook: {
        id: 'ds-notebook',
        name: 'Notebook',
        type: 'notebook',
        width: 55,
        height: 65,
        render: (g, width, height) => {
            g.append('rect').attr('x', width * 0.08).attr('width', width * 0.92).attr('height', height).attr('rx', 3).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Spine rings
            [0.15, 0.35, 0.55, 0.75].forEach((y) => {
                g.append('circle').attr('cx', width * 0.08).attr('cy', height * y).attr('r', 3).attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            });
            // Code cells
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.1).attr('width', width * 0.7).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#f9e79f');
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.38).attr('width', width * 0.7).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#f9e79f');
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.66).attr('width', width * 0.7).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#f9e79f');
        },
    },

    etl: {
        id: 'ds-etl',
        name: 'ETL Process',
        type: 'etl',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            // Three boxes E-T-L with arrows
            const boxes = [{ x: 0.02, label: 'E', color: '#3498db' }, { x: 0.37, label: 'T', color: '#e67e22' }, { x: 0.72, label: 'L', color: '#27ae60' }];
            boxes.forEach(({ x, label, color }) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.2).attr('width', width * 0.26).attr('height', height * 0.6).attr('rx', 4).attr('fill', color).attr('stroke', 'none');
                g.append('text').attr('x', width * (x + 0.13)).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 12).attr('font-weight', 'bold').text(label);
            });
            // Arrows
            g.append('text').attr('x', width * 0.325).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#7f8c8d').attr('font-size', 12).text('→');
            g.append('text').attr('x', width * 0.675).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#7f8c8d').attr('font-size', 12).text('→');
        },
    },

    schema: {
        id: 'ds-schema',
        name: 'Data Schema',
        type: 'schema',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#eaf2f8').attr('stroke', '#2c3e50').attr('stroke-width', 2);
            // Schema representation - entity with fields
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.08).attr('width', width * 0.8).attr('height', height * 0.2).attr('fill', '#2c3e50').attr('rx', 2);
            g.append('text').attr('x', width / 2).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('Schema');
            // Field rows
            [0.35, 0.5, 0.65, 0.8].forEach((y) => {
                g.append('line').attr('x1', width * 0.1).attr('y1', height * y).attr('x2', width * 0.9).attr('y2', height * y).attr('stroke', '#bdc3c7').attr('stroke-width', 0.5);
                g.append('circle').attr('cx', width * 0.18).attr('cy', height * (y + 0.05)).attr('r', 2).attr('fill', '#3498db');
                g.append('line').attr('x1', width * 0.24).attr('y1', height * (y + 0.05)).attr('x2', width * 0.75).attr('y2', height * (y + 0.05)).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
            });
        },
    },

    datacatalog: {
        id: 'ds-datacatalog',
        name: 'Data Catalog',
        type: 'datacatalog',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Stacked cards
            g.append('rect').attr('x', width * 0.15).attr('y', 0).attr('width', width * 0.8).attr('height', height * 0.7).attr('rx', 3).attr('fill', '#d5d8dc').attr('stroke', '#5d6d7e').attr('stroke-width', 1);
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.08).attr('width', width * 0.8).attr('height', height * 0.7).attr('rx', 3).attr('fill', '#e8e8e8').attr('stroke', '#5d6d7e').attr('stroke-width', 1);
            g.append('rect').attr('x', 0).attr('y', height * 0.16).attr('width', width * 0.8).attr('height', height * 0.7).attr('rx', 3).attr('fill', '#fff').attr('stroke', '#5d6d7e').attr('stroke-width', 2);
            // Tag icon
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.5).attr('fill', '#5d6d7e').attr('font-size', 10).text('🏷');
            g.append('line').attr('x1', width * 0.28).attr('y1', height * 0.45).attr('x2', width * 0.65).attr('y2', height * 0.45).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.28).attr('y1', height * 0.6).attr('x2', width * 0.55).attr('y2', height * 0.6).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
        },
    },

    report: {
        id: 'ds-report',
        name: 'Report',
        type: 'report',
        width: 55,
        height: 65,
        render: (g, width, height) => {
            // Paper
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 3).attr('fill', '#fff').attr('stroke', '#5d6d7e').attr('stroke-width', 2);
            // Header
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.06).attr('width', width * 0.8).attr('height', height * 0.08).attr('fill', '#5d6d7e').attr('rx', 1);
            // Text lines
            [0.22, 0.3, 0.38].forEach((y) => {
                g.append('line').attr('x1', width * 0.1).attr('y1', height * y).attr('x2', width * 0.9).attr('y2', height * y).attr('stroke', '#d5d8dc').attr('stroke-width', 1.5);
            });
            // Mini chart
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.48).attr('width', width * 0.8).attr('height', height * 0.4).attr('fill', '#eaf2f8').attr('rx', 2);
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.6).attr('width', width * 0.12).attr('height', height * 0.22).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.55).attr('width', width * 0.12).attr('height', height * 0.27).attr('fill', '#2ecc71');
            g.append('rect').attr('x', width * 0.52).attr('y', height * 0.65).attr('width', width * 0.12).attr('height', height * 0.17).attr('fill', '#e74c3c');
            g.append('rect').attr('x', width * 0.69).attr('y', height * 0.52).attr('width', width * 0.12).attr('height', height * 0.3).attr('fill', '#f39c12');
        },
    },
};

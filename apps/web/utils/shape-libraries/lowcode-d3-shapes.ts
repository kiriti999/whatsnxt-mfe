/**
 * Low-Code / No-Code Platform Shape Library
 * Covers: Application Dev Platforms, Automation Platforms, Database/Spreadsheet Tools
 */
import * as d3 from 'd3';

export interface LowCodeShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const lowCodeD3Shapes: Record<string, LowCodeShapeDefinition> = {
    dragdrop: {
        id: 'lc-dragdrop',
        name: 'Drag & Drop',
        type: 'dragdrop',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Component being dragged
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.12).attr('width', width * 0.45).attr('height', height * 0.22).attr('rx', 3).attr('fill', '#3498db').attr('stroke', '#2e86c1').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
            // Arrow showing drag
            g.append('path').attr('d', `M${width * 0.45},${height * 0.38} L${width * 0.55},${height * 0.52} L${width * 0.48},${height * 0.52} L${width * 0.48},${height * 0.65}`).attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Target area
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.62).attr('width', width * 0.6).attr('height', height * 0.28).attr('rx', 3).attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 1.5).attr('stroke-dasharray', '5,3');
            // Plus icon in target
            g.append('line').attr('x1', width * 0.45).attr('y1', height * 0.7).attr('x2', width * 0.45).attr('y2', height * 0.85).attr('stroke', '#2e86c1').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.37).attr('y1', height * 0.775).attr('x2', width * 0.53).attr('y2', height * 0.775).attr('stroke', '#2e86c1').attr('stroke-width', 2);
        },
    },

    workflow: {
        id: 'lc-workflow',
        name: 'Workflow',
        type: 'workflow',
        width: 75,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Start
            g.append('circle').attr('cx', width * 0.1).attr('cy', height * 0.5).attr('r', 6).attr('fill', '#27ae60');
            // Steps
            g.append('rect').attr('x', width * 0.22).attr('y', height * 0.3).attr('width', width * 0.16).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#8e44ad');
            g.append('polygon')
                .attr('points', `${width * 0.48},${height * 0.5} ${width * 0.55},${height * 0.25} ${width * 0.65},${height * 0.5} ${width * 0.55},${height * 0.75}`)
                .attr('fill', '#f39c12');
            g.append('rect').attr('x', width * 0.7).attr('y', height * 0.3).attr('width', width * 0.16).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#8e44ad');
            // Arrows
            g.append('line').attr('x1', width * 0.16).attr('y1', height * 0.5).attr('x2', width * 0.22).attr('y2', height * 0.5).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.38).attr('y1', height * 0.5).attr('x2', width * 0.47).attr('y2', height * 0.5).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.65).attr('y1', height * 0.5).attr('x2', width * 0.7).attr('y2', height * 0.5).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            // End
            g.append('circle').attr('cx', width * 0.92).attr('cy', height * 0.5).attr('r', 6).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            g.append('circle').attr('cx', width * 0.92).attr('cy', height * 0.5).attr('r', 3.5).attr('fill', '#e74c3c');
        },
    },

    formbuilder: {
        id: 'lc-form',
        name: 'Form Builder',
        type: 'formbuilder',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fff').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Labels and inputs
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.08).attr('width', width * 0.5).attr('height', height * 0.06).attr('fill', '#2e86c1');
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.18).attr('width', width * 0.8).attr('height', height * 0.1).attr('rx', 2).attr('fill', 'none').attr('stroke', '#bdc3c7').attr('stroke-width', 1);

            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.35).attr('width', width * 0.35).attr('height', height * 0.06).attr('fill', '#2e86c1');
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.45).attr('width', width * 0.8).attr('height', height * 0.1).attr('rx', 2).attr('fill', 'none').attr('stroke', '#bdc3c7').attr('stroke-width', 1);

            // Checkbox
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.65).attr('width', height * 0.08).attr('height', height * 0.08).attr('fill', 'none').attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('rect').attr('x', width * 0.22).attr('y', height * 0.65).attr('width', width * 0.6).attr('height', height * 0.06).attr('fill', '#bdc3c7');

            // Submit button
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.82).attr('width', width * 0.6).attr('height', height * 0.12).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.91).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('Submit');
        },
    },

    connector: {
        id: 'lc-connector',
        name: 'Connector',
        type: 'connector',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Two puzzle pieces connecting
            // Left piece
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.25).attr('width', width * 0.35).attr('height', height * 0.5).attr('rx', 3).attr('fill', '#3498db');
            g.append('circle').attr('cx', width * 0.43).attr('cy', height * 0.5).attr('r', width * 0.08).attr('fill', '#3498db');
            // Right piece
            g.append('rect').attr('x', width * 0.52).attr('y', height * 0.25).attr('width', width * 0.35).attr('height', height * 0.5).attr('rx', 3).attr('fill', '#e74c3c');
            g.append('circle').attr('cx', width * 0.52).attr('cy', height * 0.5).attr('r', width * 0.08).attr('fill', '#fef9e7');
            // Lightning = connected
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.15).attr('text-anchor', 'middle').attr('fill', '#f1c40f').attr('font-size', 10).text('⚡');
        },
    },

    trigger: {
        id: 'lc-trigger',
        name: 'Trigger',
        type: 'trigger',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.35} ${width * 0.82},${height * 0.95} ${width * 0.18},${height * 0.95} ${width * 0.05},${height * 0.35}`)
                .attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Lightning bolt
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.2} ${width * 0.35},${height * 0.52} ${width * 0.45},${height * 0.52} ${width * 0.4},${height * 0.82} ${width * 0.62},${height * 0.45} ${width * 0.52},${height * 0.45}`)
                .attr('fill', '#e67e22');
        },
    },

    action: {
        id: 'lc-action',
        name: 'Action',
        type: 'action',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 10).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Play button
            g.append('polygon')
                .attr('points', `${width * 0.35},${height * 0.2} ${width * 0.35},${height * 0.8} ${width * 0.72},${height * 0.5}`)
                .attr('fill', '#27ae60');
        },
    },

    template: {
        id: 'lc-template',
        name: 'Template',
        type: 'template',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            // Paper with fold
            g.append('polygon')
                .attr('points', `0,0 ${width * 0.7},0 ${width},${height * 0.15} ${width},${height} 0,${height}`)
                .attr('fill', '#fff').attr('stroke', '#7f8c8d').attr('stroke-width', 1.5);
            // Fold corner
            g.append('polygon')
                .attr('points', `${width * 0.7},0 ${width * 0.7},${height * 0.15} ${width},${height * 0.15}`)
                .attr('fill', '#bdc3c7');
            // Template content lines
            g.append('rect').attr('x', width * 0.12).attr('y', height * 0.22).attr('width', width * 0.76).attr('height', height * 0.08).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.12).attr('y', height * 0.38).attr('width', width * 0.5).attr('height', height * 0.04).attr('fill', '#bdc3c7');
            g.append('rect').attr('x', width * 0.12).attr('y', height * 0.48).attr('width', width * 0.65).attr('height', height * 0.04).attr('fill', '#bdc3c7');
            g.append('rect').attr('x', width * 0.12).attr('y', height * 0.58).attr('width', width * 0.4).attr('height', height * 0.04).attr('fill', '#bdc3c7');
            // Stamp
            g.append('rect').attr('x', width * 0.45).attr('y', height * 0.7).attr('width', width * 0.42).attr('height', height * 0.16).attr('rx', 2).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,1');
            g.append('text').attr('x', width * 0.66).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 6).text('TMPL');
        },
    },

    integration: {
        id: 'lc-integration',
        name: 'Integration',
        type: 'integration',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Two interlocking gears
            // Gear 1
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.4).attr('r', width * 0.18).attr('fill', '#8e44ad');
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.4).attr('r', width * 0.08).attr('fill', '#f4ecf7');
            [0, 45, 90, 135, 180, 225, 270, 315].forEach((angle) => {
                const rad = (angle * Math.PI) / 180;
                g.append('rect')
                    .attr('x', width * 0.35 + Math.cos(rad) * width * 0.16 - 2)
                    .attr('y', height * 0.4 + Math.sin(rad) * width * 0.16 - 2)
                    .attr('width', 4).attr('height', 4)
                    .attr('fill', '#8e44ad');
            });
            // Gear 2
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.6).attr('r', width * 0.13).attr('fill', '#e67e22');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.6).attr('r', width * 0.06).attr('fill', '#f4ecf7');
            [0, 60, 120, 180, 240, 300].forEach((angle) => {
                const rad = (angle * Math.PI) / 180;
                g.append('rect')
                    .attr('x', width * 0.62 + Math.cos(rad) * width * 0.12 - 1.5)
                    .attr('y', height * 0.6 + Math.sin(rad) * width * 0.12 - 1.5)
                    .attr('width', 3).attr('height', 3)
                    .attr('fill', '#e67e22');
            });
        },
    },
};

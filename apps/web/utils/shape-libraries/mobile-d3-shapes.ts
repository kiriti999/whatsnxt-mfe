/**
 * Mobile Development Shape Library
 * Covers: iOS, Android, Cross-Platform, Mobile Backend
 */
import * as d3 from 'd3';

export interface MobileShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const mobileD3Shapes: Record<string, MobileShapeDefinition> = {
    smartphone: {
        id: 'mob-smartphone',
        name: 'Smartphone',
        type: 'smartphone',
        width: 40,
        height: 70,
        render: (g, width, height) => {
            // Phone body
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Screen
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.1).attr('width', width * 0.8).attr('height', height * 0.75).attr('rx', 2).attr('fill', '#3498db');
            // Home indicator
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.92).attr('x2', width * 0.7).attr('y2', height * 0.92).attr('stroke', '#7f8c8d').attr('stroke-width', 2).attr('stroke-linecap', 'round');
            // Notch
            g.append('rect').attr('x', width * 0.3).attr('y', 0).attr('width', width * 0.4).attr('height', height * 0.04).attr('rx', 2).attr('fill', '#1a252f');
        },
    },

    tablet: {
        id: 'mob-tablet',
        name: 'Tablet',
        type: 'tablet',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Screen
            g.append('rect').attr('x', width * 0.06).attr('y', height * 0.1).attr('width', width * 0.82).attr('height', height * 0.8).attr('rx', 2).attr('fill', '#5dade2');
            // Camera dot
            g.append('circle').attr('cx', width * 0.94).attr('cy', height * 0.5).attr('r', 2).attr('fill', '#1a252f');
        },
    },

    appstore: {
        id: 'mob-appstore',
        name: 'App Store',
        type: 'appstore',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 12).attr('fill', '#2e86c1').attr('stroke', '#1f618d').attr('stroke-width', 2);
            // App grid
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    g.append('rect')
                        .attr('x', width * (0.15 + c * 0.25)).attr('y', height * (0.15 + r * 0.25))
                        .attr('width', width * 0.18).attr('height', height * 0.18)
                        .attr('rx', 3).attr('fill', '#fff').attr('opacity', 0.8);
                }
            }
        },
    },

    pushnotif: {
        id: 'mob-push',
        name: 'Push Notification',
        type: 'pushnotif',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            // Notification card
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fff').attr('stroke', '#d5d8dc').attr('stroke-width', 2);
            // App icon
            g.append('rect').attr('x', width * 0.06).attr('y', height * 0.15).attr('width', width * 0.18).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#e74c3c');
            // Title line
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.3).attr('x2', width * 0.85).attr('y2', height * 0.3).attr('stroke', '#2c3e50').attr('stroke-width', 2);
            // Body lines
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.52).attr('x2', width * 0.9).attr('y2', height * 0.52).attr('stroke', '#bdc3c7').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.7).attr('x2', width * 0.65).attr('y2', height * 0.7).attr('stroke', '#bdc3c7').attr('stroke-width', 1.5);
            // Badge
            g.append('circle').attr('cx', width * 0.2).attr('cy', height * 0.2).attr('r', 5).attr('fill', '#e74c3c');
        },
    },

    gps: {
        id: 'mob-gps',
        name: 'Location',
        type: 'gps',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Map pin
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.85} L${width * 0.25},${height * 0.45} Q${width * 0.15},${height * 0.15} ${width * 0.5},${height * 0.1} Q${width * 0.85},${height * 0.15} ${width * 0.75},${height * 0.45} Z`)
                .attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1.5);
            // Inner dot
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.35).attr('r', width * 0.12).attr('fill', '#fff');
        },
    },

    sensor: {
        id: 'mob-sensor',
        name: 'Sensor',
        type: 'sensor',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Signal waves
            [0.15, 0.25, 0.35].forEach((r) => {
                g.append('path')
                    .attr('d', `M${width * 0.55},${height * (0.5 - r)} A${width * r},${height * r} 0 0,1 ${width * 0.55},${height * (0.5 + r)}`)
                    .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            });
            // Sensor dot
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.5).attr('r', 6).attr('fill', '#f39c12');
        },
    },

    sdk: {
        id: 'mob-sdk',
        name: 'SDK',
        type: 'sdk',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Puzzle piece
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.2} L${width * 0.4},${height * 0.2} L${width * 0.4},${height * 0.15} Q${width * 0.5},${height * 0.05} ${width * 0.6},${height * 0.15} L${width * 0.6},${height * 0.2} L${width * 0.85},${height * 0.2} L${width * 0.85},${height * 0.45} L${width * 0.9},${height * 0.45} Q${width},${height * 0.55} ${width * 0.9},${height * 0.65} L${width * 0.85},${height * 0.65} L${width * 0.85},${height * 0.8} L${width * 0.15},${height * 0.8} L${width * 0.15},${height * 0.65} L${width * 0.1},${height * 0.65} Q0,${height * 0.55} ${width * 0.1},${height * 0.45} L${width * 0.15},${height * 0.45} Z`)
                .attr('fill', '#d7bde2').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('text').attr('x', width / 2).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 9).attr('font-weight', 'bold').text('SDK');
        },
    },

    mobilebackend: {
        id: 'mob-backend',
        name: 'Mobile Backend',
        type: 'mobilebackend',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Cloud with phone
            g.append('path')
                .attr('d', `M${width * 0.2},${height * 0.55} Q${width * 0.05},${height * 0.55} ${width * 0.05},${height * 0.4} Q${width * 0.05},${height * 0.2} ${width * 0.25},${height * 0.2} Q${width * 0.3},${height * 0.05} ${width * 0.5},${height * 0.05} Q${width * 0.75},${height * 0.05} ${width * 0.78},${height * 0.25} Q${width * 0.95},${height * 0.25} ${width * 0.95},${height * 0.4} Q${width * 0.95},${height * 0.55} ${width * 0.8},${height * 0.55} Z`)
                .attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Mini phone
            g.append('rect').attr('x', width * 0.4).attr('y', height * 0.55).attr('width', width * 0.2).attr('height', height * 0.38).attr('rx', 3).attr('fill', '#2c3e50');
            g.append('rect').attr('x', width * 0.43).attr('y', height * 0.6).attr('width', width * 0.14).attr('height', height * 0.25).attr('fill', '#3498db');
            // Arrow between
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.5).attr('x2', width * 0.5).attr('y2', height * 0.58).attr('stroke', '#2e86c1').attr('stroke-width', 2);
        },
    },
};

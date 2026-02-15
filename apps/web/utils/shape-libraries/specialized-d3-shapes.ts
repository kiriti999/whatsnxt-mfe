/**
 * Specialized Domains Shape Library
 * Covers: Game Dev, Embedded Systems, GIS, FinTech, Healthcare, Audio, Video, Bioinformatics
 */
import * as d3 from 'd3';

export interface SpecializedShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const specializedD3Shapes: Record<string, SpecializedShapeDefinition> = {
    gamepad: {
        id: 'spec-gamepad',
        name: 'Game Controller',
        type: 'gamepad',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            // Controller body
            g.append('path')
                .attr('d', `M${width * 0.25},${height * 0.15} Q${width * 0.5},${height * 0.05} ${width * 0.75},${height * 0.15} Q${width * 0.95},${height * 0.25} ${width * 0.95},${height * 0.55} Q${width * 0.92},${height * 0.9} ${width * 0.7},${height * 0.9} L${width * 0.55},${height * 0.6} L${width * 0.45},${height * 0.6} L${width * 0.3},${height * 0.9} Q${width * 0.08},${height * 0.9} ${width * 0.05},${height * 0.55} Q${width * 0.05},${height * 0.25} ${width * 0.25},${height * 0.15}`)
                .attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // D-pad
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.32).attr('width', width * 0.16).attr('height', height * 0.08).attr('fill', '#7f8c8d');
            g.append('rect').attr('x', width * 0.22).attr('y', height * 0.24).attr('width', width * 0.08).attr('height', height * 0.24).attr('fill', '#7f8c8d');
            // Buttons
            g.append('circle').attr('cx', width * 0.68).attr('cy', height * 0.3).attr('r', 4).attr('fill', '#e74c3c');
            g.append('circle').attr('cx', width * 0.76).attr('cy', height * 0.38).attr('r', 4).attr('fill', '#3498db');
            g.append('circle').attr('cx', width * 0.6).attr('cy', height * 0.38).attr('r', 4).attr('fill', '#27ae60');
            g.append('circle').attr('cx', width * 0.68).attr('cy', height * 0.46).attr('r', 4).attr('fill', '#f1c40f');
        },
    },

    microcontroller: {
        id: 'spec-mcu',
        name: 'Microcontroller',
        type: 'microcontroller',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // IC chip body
            g.append('rect').attr('x', width * 0.18).attr('y', height * 0.18).attr('width', width * 0.64).attr('height', height * 0.64).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Pin 1 indicator
            g.append('circle').attr('cx', width * 0.28).attr('cy', height * 0.28).attr('r', 3).attr('fill', '#7f8c8d');
            // Pins
            [0.3, 0.42, 0.54, 0.66].forEach((p) => {
                // Top pins
                g.append('line').attr('x1', width * p).attr('y1', height * 0.18).attr('x2', width * p).attr('y2', height * 0.08).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
                // Bottom pins
                g.append('line').attr('x1', width * p).attr('y1', height * 0.82).attr('x2', width * p).attr('y2', height * 0.92).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
                // Left pins
                g.append('line').attr('x1', height * 0.18).attr('y1', height * p).attr('x2', height * 0.08).attr('y2', height * p).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
                // Right pins
                g.append('line').attr('x1', width * 0.82).attr('y1', height * p).attr('x2', width * 0.92).attr('y2', height * p).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
            });
            // Label
            g.append('text').attr('x', width / 2).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#ecf0f1').attr('font-size', 7).attr('font-weight', 'bold').text('MCU');
        },
    },

    mappin: {
        id: 'spec-gis',
        name: 'GIS / Map',
        type: 'mappin',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d4efdf').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Map grid
            g.append('line').attr('x1', 0).attr('y1', height * 0.5).attr('x2', width).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 0.5).attr('opacity', 0.3);
            g.append('line').attr('x1', width * 0.5).attr('y1', 0).attr('x2', width * 0.5).attr('y2', height).attr('stroke', '#27ae60').attr('stroke-width', 0.5).attr('opacity', 0.3);
            // Map pin
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.82} L${width * 0.3},${height * 0.45} Q${width * 0.2},${height * 0.2} ${width * 0.5},${height * 0.12} Q${width * 0.8},${height * 0.2} ${width * 0.7},${height * 0.45} Z`)
                .attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.35).attr('r', 5).attr('fill', '#fff');
        },
    },

    stockchart: {
        id: 'spec-fintech',
        name: 'FinTech',
        type: 'stockchart',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#1a1a2e').attr('stroke', '#16213e').attr('stroke-width', 2);
            // Candlestick chart
            const candles = [
                { x: 0.12, o: 0.5, c: 0.3, h: 0.2, l: 0.65, up: true },
                { x: 0.28, o: 0.35, c: 0.55, h: 0.25, l: 0.7, up: false },
                { x: 0.44, o: 0.5, c: 0.25, h: 0.15, l: 0.6, up: true },
                { x: 0.6, o: 0.3, c: 0.15, h: 0.08, l: 0.4, up: true },
                { x: 0.76, o: 0.2, c: 0.35, h: 0.1, l: 0.5, up: false },
            ];
            candles.forEach(({ x, o, c, h, l, up }) => {
                const color = up ? '#27ae60' : '#e74c3c';
                // Wick
                g.append('line').attr('x1', width * (x + 0.04)).attr('y1', height * h).attr('x2', width * (x + 0.04)).attr('y2', height * l).attr('stroke', color).attr('stroke-width', 1);
                // Body
                g.append('rect').attr('x', width * x).attr('y', height * Math.min(o, c)).attr('width', width * 0.08).attr('height', height * Math.abs(o - c)).attr('fill', color);
            });
        },
    },

    heartmonitor: {
        id: 'spec-health',
        name: 'Healthcare',
        type: 'heartmonitor',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Heart
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.42} Q${width * 0.5},${height * 0.2} ${width * 0.35},${height * 0.2} Q${width * 0.15},${height * 0.2} ${width * 0.15},${height * 0.4} Q${width * 0.15},${height * 0.6} ${width * 0.5},${height * 0.78} Q${width * 0.85},${height * 0.6} ${width * 0.85},${height * 0.4} Q${width * 0.85},${height * 0.2} ${width * 0.65},${height * 0.2} Q${width * 0.5},${height * 0.2} ${width * 0.5},${height * 0.42}`)
                .attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1);
            // Pulse line
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.5} L${width * 0.3},${height * 0.5} L${width * 0.38},${height * 0.3} L${width * 0.45},${height * 0.65} L${width * 0.52},${height * 0.35} L${width * 0.58},${height * 0.5} L${width * 0.9},${height * 0.5}`)
                .attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2);
        },
    },

    speaker: {
        id: 'spec-audio',
        name: 'Audio',
        type: 'speaker',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Speaker
            g.append('polygon')
                .attr('points', `${width * 0.15},${height * 0.38} ${width * 0.3},${height * 0.38} ${width * 0.45},${height * 0.2} ${width * 0.45},${height * 0.8} ${width * 0.3},${height * 0.62} ${width * 0.15},${height * 0.62}`)
                .attr('fill', '#ecf0f1');
            // Sound waves
            [0.12, 0.2, 0.28].forEach((r) => {
                g.append('path')
                    .attr('d', `M${width * 0.55},${height * (0.5 - r)} Q${width * (0.6 + r)},${height * 0.5} ${width * 0.55},${height * (0.5 + r)}`)
                    .attr('fill', 'none').attr('stroke', '#3498db').attr('stroke-width', 1.5).attr('opacity', 1 - r);
            });
        },
    },

    videocam: {
        id: 'spec-video',
        name: 'Video',
        type: 'videocam',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Camera body
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.15).attr('width', width * 0.55).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#e74c3c');
            // Lens
            g.append('polygon')
                .attr('points', `${width * 0.62},${height * 0.25} ${width * 0.85},${height * 0.15} ${width * 0.85},${height * 0.85} ${width * 0.62},${height * 0.75}`)
                .attr('fill', '#c0392b');
            // Record dot
            g.append('circle').attr('cx', width * 0.15).attr('cy', height * 0.3).attr('r', 4).attr('fill', '#e74c3c').attr('stroke', '#fff').attr('stroke-width', 1);
        },
    },

    dna: {
        id: 'spec-bio',
        name: 'Bioinformatics',
        type: 'dna',
        width: 50,
        height: 65,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // DNA double helix
            const points = 8;
            for (let i = 0; i < points; i++) {
                const y = height * (0.08 + i * 0.12);
                const phase = i * 0.8;
                const x1 = width * (0.3 + 0.2 * Math.sin(phase));
                const x2 = width * (0.7 - 0.2 * Math.sin(phase));
                // Backbone
                if (i > 0) {
                    const prevY = height * (0.08 + (i - 1) * 0.12);
                    const prevPhase = (i - 1) * 0.8;
                    const prevX1 = width * (0.3 + 0.2 * Math.sin(prevPhase));
                    const prevX2 = width * (0.7 - 0.2 * Math.sin(prevPhase));
                    g.append('line').attr('x1', prevX1).attr('y1', prevY).attr('x2', x1).attr('y2', y).attr('stroke', '#1abc9c').attr('stroke-width', 2);
                    g.append('line').attr('x1', prevX2).attr('y1', prevY).attr('x2', x2).attr('y2', y).attr('stroke', '#e74c3c').attr('stroke-width', 2);
                }
                // Cross bars (base pairs)
                if (i % 2 === 0) {
                    g.append('line').attr('x1', x1).attr('y1', y).attr('x2', x2).attr('y2', y).attr('stroke', '#7f8c8d').attr('stroke-width', 1);
                }
                g.append('circle').attr('cx', x1).attr('cy', y).attr('r', 2.5).attr('fill', '#1abc9c');
                g.append('circle').attr('cx', x2).attr('cy', y).attr('r', 2.5).attr('fill', '#e74c3c');
            }
        },
    },
};

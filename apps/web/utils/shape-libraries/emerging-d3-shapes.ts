/**
 * Emerging Technologies Shape Library
 * Covers: Web3/Blockchain, Quantum Computing, XR, WASM, IoT, Robotics, 3D Graphics
 */
import * as d3 from 'd3';

export interface EmergingShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const emergingD3Shapes: Record<string, EmergingShapeDefinition> = {
    blockchain: {
        id: 'em-blockchain',
        name: 'Blockchain',
        type: 'blockchain',
        width: 75,
        height: 45,
        render: (g, width, height) => {
            // Chain of blocks
            [0, 0.28, 0.56].forEach((x) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.15).attr('width', width * 0.22).attr('height', height * 0.7).attr('rx', 3).attr('fill', '#3498db').attr('stroke', '#1f618d').attr('stroke-width', 1.5);
                // Hash lines
                g.append('line').attr('x1', width * (x + 0.04)).attr('y1', height * 0.35).attr('x2', width * (x + 0.18)).attr('y2', height * 0.35).attr('stroke', '#fff').attr('stroke-width', 1);
                g.append('line').attr('x1', width * (x + 0.04)).attr('y1', height * 0.5).attr('x2', width * (x + 0.18)).attr('y2', height * 0.5).attr('stroke', '#fff').attr('stroke-width', 1);
                g.append('line').attr('x1', width * (x + 0.04)).attr('y1', height * 0.65).attr('x2', width * (x + 0.12)).attr('y2', height * 0.65).attr('stroke', '#fff').attr('stroke-width', 1);
            });
            // Chain links
            [0.22, 0.5].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.5).attr('x2', width * (x + 0.06)).attr('y2', height * 0.5).attr('stroke', '#1f618d').attr('stroke-width', 2);
                g.append('circle').attr('cx', width * (x + 0.03)).attr('cy', height * 0.5).attr('r', 3).attr('fill', '#1f618d');
            });
            // Lock
            g.append('rect').attr('x', width * 0.82).attr('y', height * 0.3).attr('width', width * 0.14).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#f1c40f');
        },
    },

    smartcontract: {
        id: 'em-contract',
        name: 'Smart Contract',
        type: 'smartcontract',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            // Scroll/contract shape
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.05).attr('width', width * 0.8).attr('height', height * 0.85).attr('rx', 3).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Code lines
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.25).attr('fill', '#8e44ad').attr('font-size', 7).text('if (');
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.35).attr('x2', width * 0.75).attr('y2', height * 0.35).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.52).attr('fill', '#8e44ad').attr('font-size', 7).text(') {');
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.62).attr('x2', width * 0.7).attr('y2', height * 0.62).attr('stroke', '#d4ac0d').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.78).attr('fill', '#8e44ad').attr('font-size', 7).text('}');
            // Ethereum diamond
            g.append('polygon')
                .attr('points', `${width * 0.78},${height * 0.1} ${width * 0.88},${height * 0.2} ${width * 0.78},${height * 0.3} ${width * 0.68},${height * 0.2}`)
                .attr('fill', '#3498db').attr('stroke', '#1f618d').attr('stroke-width', 1);
        },
    },

    quantumgate: {
        id: 'em-quantum',
        name: 'Quantum Gate',
        type: 'quantumgate',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Qubit lines
            g.append('line').attr('x1', 0).attr('y1', height * 0.35).attr('x2', width).attr('y2', height * 0.35).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('line').attr('x1', 0).attr('y1', height * 0.65).attr('x2', width).attr('y2', height * 0.65).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            // Gate box
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.2).attr('width', width * 0.4).attr('height', height * 0.3).attr('fill', '#8e44ad').attr('stroke', '#6c3483').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 10).attr('font-weight', 'bold').text('H');
            // CNOT control
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.35).attr('r', 3).attr('fill', '#fff');
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.5).attr('x2', width * 0.5).attr('y2', height * 0.65).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.65).attr('r', 5).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.58).attr('x2', width * 0.5).attr('y2', height * 0.72).attr('stroke', '#8e44ad').attr('stroke-width', 1);
        },
    },

    iotsensor: {
        id: 'em-iot',
        name: 'IoT Device',
        type: 'iotsensor',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Circuit board
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.3).attr('width', width * 0.6).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#1abc9c');
            // Chip
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.4).attr('width', width * 0.3).attr('height', height * 0.2).attr('fill', '#2c3e50');
            // Pins
            [0.25, 0.35, 0.45, 0.55, 0.65, 0.75].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.3).attr('x2', width * x).attr('y2', height * 0.22).attr('stroke', '#1abc9c').attr('stroke-width', 1.5);
                g.append('line').attr('x1', width * x).attr('y1', height * 0.7).attr('x2', width * x).attr('y2', height * 0.78).attr('stroke', '#1abc9c').attr('stroke-width', 1.5);
            });
            // Wifi waves
            g.append('path').attr('d', `M${width * 0.82},${height * 0.3} Q${width * 0.95},${height * 0.2} ${width * 0.88},${height * 0.1}`).attr('fill', 'none').attr('stroke', '#1abc9c').attr('stroke-width', 1.5);
        },
    },

    robot: {
        id: 'em-robot',
        name: 'Robot',
        type: 'robot',
        width: 55,
        height: 65,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Robot head
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.08).attr('width', width * 0.6).attr('height', height * 0.35).attr('rx', 4).attr('fill', '#2e86c1');
            // Eyes
            g.append('rect').attr('x', width * 0.28).attr('y', height * 0.18).attr('width', width * 0.15).attr('height', height * 0.1).attr('rx', 2).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.57).attr('y', height * 0.18).attr('width', width * 0.15).attr('height', height * 0.1).attr('rx', 2).attr('fill', '#3498db');
            // Antenna
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.08).attr('x2', width * 0.5).attr('y2', 0).attr('stroke', '#2e86c1').attr('stroke-width', 2);
            g.append('circle').attr('cx', width * 0.5).attr('cy', 0).attr('r', 3).attr('fill', '#e74c3c');
            // Body
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.48).attr('width', width * 0.5).attr('height', height * 0.35).attr('rx', 3).attr('fill', '#2e86c1');
            // Arms
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.5).attr('width', width * 0.12).attr('height', height * 0.25).attr('rx', 2).attr('fill', '#5dade2');
            g.append('rect').attr('x', width * 0.8).attr('y', height * 0.5).attr('width', width * 0.12).attr('height', height * 0.25).attr('rx', 2).attr('fill', '#5dade2');
            // Legs
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.85).attr('width', width * 0.12).attr('height', height * 0.12).attr('rx', 1).attr('fill', '#2e86c1');
            g.append('rect').attr('x', width * 0.58).attr('y', height * 0.85).attr('width', width * 0.12).attr('height', height * 0.12).attr('rx', 1).attr('fill', '#2e86c1');
        },
    },

    wasmmodule: {
        id: 'em-wasm',
        name: 'WASM Module',
        type: 'wasmmodule',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#624de8').attr('stroke', '#4527a0').attr('stroke-width', 2);
            // WASM logo approximation
            g.append('text').attr('x', width / 2).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 11).attr('font-weight', 'bold').text('Wasm');
            // Binary dots
            [[0.15, 0.18], [0.35, 0.12], [0.65, 0.15], [0.85, 0.2], [0.2, 0.85], [0.5, 0.82], [0.8, 0.88]].forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 2).attr('fill', '#fff').attr('opacity', 0.5);
            });
        },
    },

    vrheadset: {
        id: 'em-vr',
        name: 'VR/AR',
        type: 'vrheadset',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Headset body
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.35} Q${width * 0.1},${height * 0.15} ${width * 0.5},${height * 0.15} Q${width * 0.9},${height * 0.15} ${width * 0.9},${height * 0.35} L${width * 0.9},${height * 0.65} Q${width * 0.9},${height * 0.8} ${width * 0.7},${height * 0.8} L${width * 0.58},${height * 0.65} L${width * 0.42},${height * 0.65} L${width * 0.3},${height * 0.8} Q${width * 0.1},${height * 0.8} ${width * 0.1},${height * 0.65} Z`)
                .attr('fill', '#5dade2').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Lenses
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.42).attr('r', width * 0.12).attr('fill', '#1a1a2e').attr('stroke', '#5dade2').attr('stroke-width', 1);
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.42).attr('r', width * 0.12).attr('fill', '#1a1a2e').attr('stroke', '#5dade2').attr('stroke-width', 1);
        },
    },

    cube3d: {
        id: 'em-3d',
        name: '3D Object',
        type: 'cube3d',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // 3D cube
            // Front face
            g.append('polygon')
                .attr('points', `${width * 0.2},${height * 0.4} ${width * 0.6},${height * 0.4} ${width * 0.6},${height * 0.85} ${width * 0.2},${height * 0.85}`)
                .attr('fill', '#f9e79f').attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            // Top face
            g.append('polygon')
                .attr('points', `${width * 0.2},${height * 0.4} ${width * 0.45},${height * 0.15} ${width * 0.85},${height * 0.15} ${width * 0.6},${height * 0.4}`)
                .attr('fill', '#f7dc6f').attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            // Right face
            g.append('polygon')
                .attr('points', `${width * 0.6},${height * 0.4} ${width * 0.85},${height * 0.15} ${width * 0.85},${height * 0.6} ${width * 0.6},${height * 0.85}`)
                .attr('fill', '#f4d03f').attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
        },
    },
};

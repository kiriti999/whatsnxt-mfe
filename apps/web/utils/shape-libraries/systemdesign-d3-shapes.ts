/**
 * System Design & Architecture Shape Library
 * Covers: Architectural Patterns, Design Patterns, Distributed Systems, Scalability
 */
import * as d3 from 'd3';

export interface SystemDesignShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const systemDesignD3Shapes: Record<string, SystemDesignShapeDefinition> = {
    microservice: {
        id: 'sd-microservice',
        name: 'Microservice',
        type: 'microservice',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.02} ${width * 0.93},${height * 0.25} ${width * 0.93},${height * 0.75} ${width * 0.5},${height * 0.98} ${width * 0.07},${height * 0.75} ${width * 0.07},${height * 0.25}`)
                .attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Gear icon
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.15).attr('fill', '#27ae60');
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.07).attr('fill', '#d5f5e3');
            // Gear teeth
            [0, 60, 120, 180, 240, 300].forEach((angle) => {
                const rad = (angle * Math.PI) / 180;
                g.append('rect')
                    .attr('x', width / 2 + Math.cos(rad) * width * 0.14 - 2)
                    .attr('y', height / 2 + Math.sin(rad) * height * 0.14 - 2)
                    .attr('width', 4).attr('height', 4)
                    .attr('fill', '#27ae60');
            });
        },
    },

    monolith: {
        id: 'sd-monolith',
        name: 'Monolith',
        type: 'monolith',
        width: 50,
        height: 65,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fadbd8').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Layers
            const colors = ['#e74c3c', '#eb6b56', '#f09e8f', '#f5c6c0'];
            colors.forEach((color, i) => {
                g.append('rect').attr('x', width * 0.1).attr('y', height * (0.05 + i * 0.23)).attr('width', width * 0.8).attr('height', height * 0.2).attr('rx', 2).attr('fill', color);
            });
        },
    },

    eventbus: {
        id: 'sd-eventbus',
        name: 'Event Bus',
        type: 'eventbus',
        width: 75,
        height: 40,
        render: (g, width, height) => {
            // Horizontal bus
            g.append('rect').attr('x', 0).attr('y', height * 0.3).attr('width', width).attr('height', height * 0.4).attr('rx', 4).attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Connection stubs top
            [0.2, 0.4, 0.6, 0.8].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', 0).attr('x2', width * x).attr('y2', height * 0.3).attr('stroke', '#e67e22').attr('stroke-width', 2);
                g.append('circle').attr('cx', width * x).attr('cy', 0).attr('r', 3).attr('fill', '#e67e22');
            });
            // Connection stubs bottom
            [0.3, 0.5, 0.7].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.7).attr('x2', width * x).attr('y2', height).attr('stroke', '#e67e22').attr('stroke-width', 2);
                g.append('circle').attr('cx', width * x).attr('cy', height).attr('r', 3).attr('fill', '#e67e22');
            });
            // Label
            g.append('text').attr('x', width / 2).attr('y', height * 0.57).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('EVENT BUS');
        },
    },

    messagequeue: {
        id: 'sd-mq',
        name: 'Message Queue',
        type: 'messagequeue',
        width: 70,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Queue items
            [0.08, 0.28, 0.48, 0.68].forEach((x, i) => {
                const opacity = 1 - i * 0.15;
                g.append('rect').attr('x', width * x).attr('y', height * 0.2).attr('width', width * 0.17).attr('height', height * 0.6).attr('rx', 3).attr('fill', '#2e86c1').attr('opacity', opacity);
            });
            // Arrow
            g.append('polygon')
                .attr('points', `${width * 0.92},${height * 0.5} ${width * 0.85},${height * 0.3} ${width * 0.85},${height * 0.7}`)
                .attr('fill', '#2e86c1');
        },
    },

    apigateway: {
        id: 'sd-apigateway',
        name: 'API Gateway',
        type: 'apigateway',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Funnel
            g.append('polygon')
                .attr('points', `${width * 0.1},${height * 0.1} ${width * 0.9},${height * 0.1} ${width * 0.65},${height * 0.5} ${width * 0.65},${height * 0.9} ${width * 0.35},${height * 0.9} ${width * 0.35},${height * 0.5}`)
                .attr('fill', '#f9e79f').attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            // API text
            g.append('text').attr('x', width / 2).attr('y', height * 0.32).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 9).attr('font-weight', 'bold').text('API');
        },
    },

    cachelayer: {
        id: 'sd-cache',
        name: 'Cache Layer',
        type: 'cachelayer',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Lightning bolt (fast)
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.3},${height * 0.45} ${width * 0.45},${height * 0.45} ${width * 0.38},${height * 0.95} ${width * 0.65},${height * 0.45} ${width * 0.52},${height * 0.45}`)
                .attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
        },
    },

    ratelimiter: {
        id: 'sd-ratelimiter',
        name: 'Rate Limiter',
        type: 'ratelimiter',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Clock face
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.45).attr('r', width * 0.28).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Clock hands
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.45).attr('x2', width * 0.5).attr('y2', height * 0.22).attr('stroke', '#e74c3c').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.45).attr('x2', width * 0.68).attr('y2', height * 0.45).attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Stop hand
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.85).attr('x2', width * 0.85).attr('y2', height * 0.85).attr('stroke', '#e74c3c').attr('stroke-width', 3).attr('stroke-linecap', 'round');
        },
    },

    circuitbreaker: {
        id: 'sd-circuitbreaker',
        name: 'Circuit Breaker',
        type: 'circuitbreaker',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.45).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Circuit path (broken)
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.5).attr('x2', width * 0.35).attr('y2', height * 0.5).attr('stroke', '#e74c3c').attr('stroke-width', 3);
            g.append('line').attr('x1', width * 0.35).attr('y1', height * 0.5).attr('x2', width * 0.5).attr('y2', height * 0.3).attr('stroke', '#e74c3c').attr('stroke-width', 3);
            // Gap
            g.append('line').attr('x1', width * 0.6).attr('y1', height * 0.5).attr('x2', width * 0.9).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 3);
            // Dot at junction
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.5).attr('r', 3).attr('fill', '#2c3e50');
            g.append('circle').attr('cx', width * 0.6).attr('cy', height * 0.5).attr('r', 3).attr('fill', '#2c3e50');
        },
    },

    servicemesh: {
        id: 'sd-servicemesh',
        name: 'Service Mesh',
        type: 'servicemesh',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Mesh grid
            const nodes = [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]];
            // Connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    g.append('line').attr('x1', width * nodes[i][0]).attr('y1', height * nodes[i][1]).attr('x2', width * nodes[j][0]).attr('y2', height * nodes[j][1]).attr('stroke', '#8e44ad').attr('stroke-width', 1).attr('opacity', 0.4);
                }
            }
            // Nodes
            nodes.forEach(([cx, cy]) => {
                g.append('circle').attr('cx', width * cx).attr('cy', height * cy).attr('r', 5).attr('fill', '#8e44ad').attr('stroke', '#6c3483').attr('stroke-width', 1);
            });
        },
    },

    distributedsys: {
        id: 'sd-distributed',
        name: 'Distributed System',
        type: 'distributedsys',
        width: 65,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Three connected nodes
            const positions = [[0.2, 0.3], [0.8, 0.3], [0.5, 0.75]];
            // Bidirectional connections
            positions.forEach(([x1, y1], i) => {
                positions.forEach(([x2, y2], j) => {
                    if (j > i) {
                        g.append('line').attr('x1', width * x1).attr('y1', height * y1).attr('x2', width * x2).attr('y2', height * y2).attr('stroke', '#2e86c1').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2');
                    }
                });
            });
            // Server nodes
            positions.forEach(([x, y]) => {
                g.append('rect').attr('x', width * x - 8).attr('y', height * y - 6).attr('width', 16).attr('height', 12).attr('rx', 2).attr('fill', '#2e86c1');
                g.append('line').attr('x1', width * x - 5).attr('y1', height * y - 2).attr('x2', width * x + 5).attr('y2', height * y - 2).attr('stroke', '#fff').attr('stroke-width', 1);
                g.append('line').attr('x1', width * x - 5).attr('y1', height * y + 1).attr('x2', width * x + 5).attr('y2', height * y + 1).attr('stroke', '#fff').attr('stroke-width', 1);
            });
        },
    },
};

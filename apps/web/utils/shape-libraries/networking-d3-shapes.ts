/**
 * Networking Shape Library
 * Covers: Network Protocols, API Paradigms, Network Architecture
 */
import * as d3 from 'd3';

export interface NetworkingShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const networkingD3Shapes: Record<string, NetworkingShapeDefinition> = {
    router: {
        id: 'net-router',
        name: 'Router',
        type: 'router',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Router circle with arrows
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.25).attr('fill', 'none').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Cross arrows
            const arrowLen = width * 0.18;
            [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => {
                g.append('line').attr('x1', width / 2).attr('y1', height / 2).attr('x2', width / 2 + dx * arrowLen).attr('y2', height / 2 + dy * arrowLen).attr('stroke', '#1abc9c').attr('stroke-width', 2);
            });
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', 3).attr('fill', '#1abc9c');
        },
    },

    switchnet: {
        id: 'net-switch',
        name: 'Switch',
        type: 'switchnet',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Ports
            for (let i = 0; i < 6; i++) {
                g.append('rect').attr('x', width * (0.08 + i * 0.145)).attr('y', height * 0.25).attr('width', width * 0.1).attr('height', height * 0.3).attr('rx', 1).attr('fill', '#27ae60');
            }
            // Status LEDs
            for (let i = 0; i < 6; i++) {
                g.append('circle').attr('cx', width * (0.13 + i * 0.145)).attr('cy', height * 0.7).attr('r', 2).attr('fill', i < 4 ? '#27ae60' : '#7f8c8d');
            }
        },
    },

    gateway: {
        id: 'net-gateway',
        name: 'Gateway',
        type: 'gateway',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Arch/gate shape
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.95} L${width * 0.1},${height * 0.3} Q${width * 0.1},${height * 0.05} ${width * 0.5},${height * 0.05} Q${width * 0.9},${height * 0.05} ${width * 0.9},${height * 0.3} L${width * 0.9},${height * 0.95}`)
                .attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Inner arch (opening)
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.95} L${width * 0.3},${height * 0.5} Q${width * 0.3},${height * 0.3} ${width * 0.5},${height * 0.3} Q${width * 0.7},${height * 0.3} ${width * 0.7},${height * 0.5} L${width * 0.7},${height * 0.95}`)
                .attr('fill', '#fff').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Arrow through
            g.append('polygon')
                .attr('points', `${width * 0.42},${height * 0.65} ${width * 0.58},${height * 0.65} ${width * 0.58},${height * 0.55} ${width * 0.65},${height * 0.7} ${width * 0.5},${height * 0.85} ${width * 0.35},${height * 0.7} ${width * 0.42},${height * 0.55}`)
                .attr('fill', '#2e86c1');
        },
    },

    dns: {
        id: 'net-dns',
        name: 'DNS',
        type: 'dns',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.45).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Globe lines
            g.append('ellipse').attr('cx', width / 2).attr('cy', height / 2).attr('rx', width * 0.2).attr('ry', width * 0.45).attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.05).attr('y1', height / 2).attr('x2', width * 0.95).attr('y2', height / 2).attr('stroke', '#f39c12').attr('stroke-width', 1);
            g.append('line').attr('x1', width / 2).attr('y1', height * 0.05).attr('x2', width / 2).attr('y2', height * 0.95).attr('stroke', '#f39c12').attr('stroke-width', 1);
            // DNS label
            g.append('text').attr('x', width / 2).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 9).attr('font-weight', 'bold').text('DNS');
        },
    },

    loadbalancer: {
        id: 'net-lb',
        name: 'Load Balancer',
        type: 'loadbalancer',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Incoming arrow
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.5).attr('x2', width * 0.35).attr('y2', height * 0.5).attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Distribution node
            g.append('circle').attr('cx', width * 0.4).attr('cy', height * 0.5).attr('r', 6).attr('fill', '#1abc9c');
            // Fan-out arrows
            [[0.2], [0.5], [0.8]].forEach(([y]) => {
                g.append('line').attr('x1', width * 0.45).attr('y1', height * 0.5).attr('x2', width * 0.7).attr('y2', height * y).attr('stroke', '#1abc9c').attr('stroke-width', 1.5);
                g.append('rect').attr('x', width * 0.72).attr('y', height * y - 6).attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', '#1abc9c');
            });
        },
    },

    proxy: {
        id: 'net-proxy',
        name: 'Proxy',
        type: 'proxy',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Two-way arrow through shield
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.1} L${width * 0.75},${height * 0.2} L${width * 0.75},${height * 0.55} Q${width * 0.75},${height * 0.75} ${width * 0.5},${height * 0.85} Q${width * 0.25},${height * 0.75} ${width * 0.25},${height * 0.55} L${width * 0.25},${height * 0.2} Z`)
                .attr('fill', '#d7bde2').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            // Bidirectional arrows
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.5).attr('x2', width * 0.85).attr('y2', height * 0.5).attr('stroke', '#8e44ad').attr('stroke-width', 2);
            g.append('polygon').attr('points', `${width * 0.12},${height * 0.5} ${width * 0.2},${height * 0.42} ${width * 0.2},${height * 0.58}`).attr('fill', '#8e44ad');
            g.append('polygon').attr('points', `${width * 0.88},${height * 0.5} ${width * 0.8},${height * 0.42} ${width * 0.8},${height * 0.58}`).attr('fill', '#8e44ad');
        },
    },

    cdn: {
        id: 'net-cdn',
        name: 'CDN',
        type: 'cdn',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Globe
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.45).attr('r', width * 0.28).attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Edge nodes around globe
            const edgePositions = [[0.15, 0.3], [0.85, 0.3], [0.15, 0.65], [0.85, 0.65], [0.5, 0.1]];
            edgePositions.forEach(([x, y]) => {
                g.append('rect').attr('x', width * x - 4).attr('y', height * y - 4).attr('width', 8).attr('height', 8).attr('rx', 1).attr('fill', '#2e86c1');
                g.append('line').attr('x1', width * x).attr('y1', height * y).attr('x2', width * 0.5).attr('y2', height * 0.45).attr('stroke', '#2e86c1').attr('stroke-width', 0.5).attr('opacity', 0.4);
            });
        },
    },

    endpoint: {
        id: 'net-endpoint',
        name: 'API Endpoint',
        type: 'endpoint',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // HTTP method badge
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.15).attr('width', width * 0.3).attr('height', height * 0.3).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.23).attr('y', height * 0.37).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).attr('font-weight', 'bold').text('GET');
            // URL path
            g.append('line').attr('x1', width * 0.42).attr('y1', height * 0.3).attr('x2', width * 0.88).attr('y2', height * 0.3).attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Response
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 8).text('{ }');
        },
    },

    vpn: {
        id: 'net-vpn',
        name: 'VPN',
        type: 'vpn',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Tunnel shape
            g.append('path')
                .attr('d', `M${width * 0.05},${height * 0.75} Q${width * 0.5},${height * 0.1} ${width * 0.95},${height * 0.75}`)
                .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.75} Q${width * 0.5},${height * 0.25} ${width * 0.85},${height * 0.75}`)
                .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3');
            // Lock
            g.append('rect').attr('x', width * 0.42).attr('y', height * 0.35).attr('width', width * 0.16).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#f39c12');
            g.append('path')
                .attr('d', `M${width * 0.45},${height * 0.37} L${width * 0.45},${height * 0.3} Q${width * 0.5},${height * 0.22} ${width * 0.55},${height * 0.3} L${width * 0.55},${height * 0.37}`)
                .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 1.5);
        },
    },
};

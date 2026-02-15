/**
 * Backend Development Shape Library
 * Covers L3 topics: Express, Django, Spring Boot, NestJS, Middleware, Controllers, ORM, APIs
 */
import * as d3 from 'd3';

export interface BackendShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const backendD3Shapes: Record<string, BackendShapeDefinition> = {
    server: {
        id: 'be-server',
        name: 'Server',
        type: 'server',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            // Server rack unit
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Rack slots
            [0.08, 0.32, 0.56].forEach((y) => {
                g.append('rect').attr('x', width * 0.08).attr('y', height * y).attr('width', width * 0.84).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#34495e');
                // Status LED
                g.append('circle').attr('cx', width * 0.18).attr('cy', height * (y + 0.1)).attr('r', 3).attr('fill', '#2ecc71');
                // Drive slots
                g.append('line').attr('x1', width * 0.35).attr('y1', height * (y + 0.04)).attr('x2', width * 0.35).attr('y2', height * (y + 0.16)).attr('stroke', '#7f8c8d').attr('stroke-width', 1);
                g.append('line').attr('x1', width * 0.5).attr('y1', height * (y + 0.04)).attr('x2', width * 0.5).attr('y2', height * (y + 0.16)).attr('stroke', '#7f8c8d').attr('stroke-width', 1);
                g.append('line').attr('x1', width * 0.65).attr('y1', height * (y + 0.04)).attr('x2', width * 0.65).attr('y2', height * (y + 0.16)).attr('stroke', '#7f8c8d').attr('stroke-width', 1);
            });
            // Ventilation
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.82).attr('width', width * 0.84).attr('height', height * 0.12).attr('rx', 2).attr('fill', '#2c3e50');
            [0.2, 0.35, 0.5, 0.65, 0.8].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.84).attr('x2', width * x).attr('y2', height * 0.92).attr('stroke', '#7f8c8d').attr('stroke-width', 0.5);
            });
        },
    },

    middleware: {
        id: 'be-middleware',
        name: 'Middleware',
        type: 'middleware',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            // Pipeline with filter stages
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Request arrow in
            g.append('line').attr('x1', 0).attr('y1', height * 0.5).attr('x2', width * 0.12).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Middleware layers
            const colors = ['#e74c3c', '#f39c12', '#3498db'];
            const labels = ['Auth', 'Log', 'Parse'];
            colors.forEach((color, i) => {
                const x = 0.15 + i * 0.25;
                g.append('rect').attr('x', width * x).attr('y', height * 0.15).attr('width', width * 0.18).attr('height', height * 0.7).attr('rx', 3).attr('fill', color).attr('opacity', 0.8);
                g.append('text').attr('x', width * (x + 0.09)).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text(labels[i]);
                if (i < 2) {
                    g.append('line').attr('x1', width * (x + 0.18)).attr('y1', height * 0.5).attr('x2', width * (x + 0.25)).attr('y2', height * 0.5).attr('stroke', '#7f8c8d').attr('stroke-width', 1.5);
                }
            });
            // Response arrow out
            g.append('line').attr('x1', width * 0.88).attr('y1', height * 0.5).attr('x2', width).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width},${height * 0.5} ${width * 0.95},${height * 0.38} ${width * 0.95},${height * 0.62}`)
                .attr('fill', '#27ae60');
        },
    },

    controller: {
        id: 'be-controller',
        name: 'Controller',
        type: 'controller',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Route sign
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.05).attr('width', width * 0.8).attr('height', height * 0.18).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.17).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('/api/v1');
            // HTTP methods
            const methods = [
                { method: 'GET', color: '#3498db', y: 0.3 },
                { method: 'POST', color: '#27ae60', y: 0.48 },
                { method: 'PUT', color: '#f39c12', y: 0.66 },
                { method: 'DEL', color: '#e74c3c', y: 0.84 },
            ];
            methods.forEach(({ method, color, y }) => {
                g.append('rect').attr('x', width * 0.1).attr('y', height * (y - 0.02)).attr('width', width * 0.3).attr('height', height * 0.13).attr('rx', 2).attr('fill', color);
                g.append('text').attr('x', width * 0.25).attr('y', height * (y + 0.08)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text(method);
                g.append('line').attr('x1', width * 0.42).attr('y1', height * (y + 0.05)).attr('x2', width * 0.85).attr('y2', height * (y + 0.05)).attr('stroke', '#bdc3c7').attr('stroke-width', 0.5);
            });
        },
    },

    orm: {
        id: 'be-orm',
        name: 'ORM / Model',
        type: 'orm',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Class to Table mapping
            // Object side
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.08).attr('width', width * 0.38).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.24).attr('y', height * 0.2).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('User');
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.25).attr('x2', width * 0.4).attr('y2', height * 0.25).attr('stroke', '#fff').attr('stroke-width', 0.5);
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.35).attr('fill', '#d6eaf8').attr('font-size', 5).text('.name');
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.44).attr('fill', '#d6eaf8').attr('font-size', 5).text('.email');
            // Bidirectional arrow
            g.append('line').attr('x1', width * 0.45).attr('y1', height * 0.28).attr('x2', width * 0.55).attr('y2', height * 0.28).attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#f39c12').attr('font-size', 8).text('⇄');
            // Table side
            g.append('rect').attr('x', width * 0.57).attr('y', height * 0.08).attr('width', width * 0.38).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#1abc9c');
            g.append('text').attr('x', width * 0.76).attr('y', height * 0.2).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('users');
            g.append('line').attr('x1', width * 0.6).attr('y1', height * 0.25).attr('x2', width * 0.92).attr('y2', height * 0.25).attr('stroke', '#fff').attr('stroke-width', 0.5);
            g.append('text').attr('x', width * 0.62).attr('y', height * 0.35).attr('fill', '#d1f2eb').attr('font-size', 5).text('name');
            g.append('text').attr('x', width * 0.62).attr('y', height * 0.44).attr('fill', '#d1f2eb').attr('font-size', 5).text('email');
            // Query text
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.6).attr('width', width * 0.8).attr('height', height * 0.3).attr('rx', 3).attr('fill', '#2c3e50');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.78).attr('text-anchor', 'middle').attr('fill', '#2ecc71').attr('font-size', 6).text('SELECT * FROM');
        },
    },

    apiendpoint: {
        id: 'be-endpoint',
        name: 'API Endpoint',
        type: 'apiendpoint',
        width: 60,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', height * 0.5).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // HTTP method badge
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.22).attr('width', width * 0.25).attr('height', height * 0.56).attr('rx', 3).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.175).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).attr('font-weight', 'bold').text('GET');
            // Path
            g.append('text').attr('x', width * 0.38).attr('y', height * 0.58).attr('fill', '#2c3e50').attr('font-size', 8).text('/users');
        },
    },

    session: {
        id: 'be-session',
        name: 'Session',
        type: 'session',
        width: 55,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Cookie
            g.append('circle').attr('cx', width * 0.25).attr('cy', height * 0.5).attr('r', width * 0.15).attr('fill', '#d4ac0d').attr('stroke', '#b7950b').attr('stroke-width', 1);
            // Cookie chips
            g.append('circle').attr('cx', width * 0.22).attr('cy', height * 0.42).attr('r', 2).attr('fill', '#6d4c41');
            g.append('circle').attr('cx', width * 0.3).attr('cy', height * 0.55).attr('r', 2).attr('fill', '#6d4c41');
            // Session data
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.38).attr('fill', '#8e44ad').attr('font-size', 6).text('sid:');
            g.append('rect').attr('x', width * 0.45).attr('y', height * 0.45).attr('width', width * 0.45).attr('height', height * 0.22).attr('rx', 2).attr('fill', '#8e44ad').attr('opacity', 0.2);
            g.append('text').attr('x', width * 0.67).attr('y', height * 0.6).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 5).text('abc123...');
        },
    },

    websocket: {
        id: 'be-ws',
        name: 'WebSocket',
        type: 'websocket',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Bidirectional arrows (full duplex)
            // Top arrow (client to server)
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.32).attr('x2', width * 0.9).attr('y2', height * 0.32).attr('stroke', '#3498db').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.9},${height * 0.32} ${width * 0.84},${height * 0.22} ${width * 0.84},${height * 0.42}`)
                .attr('fill', '#3498db');
            // Bottom arrow (server to client)
            g.append('line').attr('x1', width * 0.9).attr('y1', height * 0.68).attr('x2', width * 0.1).attr('y2', height * 0.68).attr('stroke', '#e74c3c').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.1},${height * 0.68} ${width * 0.16},${height * 0.58} ${width * 0.16},${height * 0.78}`)
                .attr('fill', '#e74c3c');
            // WS label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 8).attr('font-weight', 'bold').text('WS');
        },
    },

    queue: {
        id: 'be-queue',
        name: 'Job Queue',
        type: 'queue',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Queue items
            [0.05, 0.22, 0.39, 0.56].forEach((x, i) => {
                const opacity = 1 - i * 0.15;
                g.append('rect').attr('x', width * x).attr('y', height * 0.2).attr('width', width * 0.14).attr('height', height * 0.6).attr('rx', 2).attr('fill', '#e67e22').attr('opacity', opacity);
                g.append('text').attr('x', width * (x + 0.07)).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text(`J${i + 1}`);
            });
            // Worker processing
            g.append('polygon')
                .attr('points', `${width * 0.75},${height * 0.5} ${width * 0.82},${height * 0.25} ${width * 0.82},${height * 0.75}`)
                .attr('fill', '#27ae60');
            g.append('circle').attr('cx', width * 0.9).attr('cy', height * 0.5).attr('r', 6).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.9).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('W');
        },
    },

    graphqlschema: {
        id: 'be-graphql',
        name: 'GraphQL',
        type: 'graphqlschema',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // GraphQL hexagon logo approximation
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.92},${height * 0.27} ${width * 0.92},${height * 0.73} ${width * 0.5},${height * 0.95} ${width * 0.08},${height * 0.73} ${width * 0.08},${height * 0.27}`)
                .attr('fill', '#e535ab').attr('stroke', '#c2008f').attr('stroke-width', 1.5).attr('opacity', 0.15);
            // Schema type box
            g.append('rect').attr('x', width * 0.12).attr('y', height * 0.12).attr('width', width * 0.76).attr('height', height * 0.76).attr('rx', 4).attr('fill', '#fce4ec').attr('stroke', '#e535ab').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.3).attr('text-anchor', 'middle').attr('fill', '#e535ab').attr('font-size', 7).attr('font-weight', 'bold').text('type User');
            g.append('line').attr('x1', width * 0.18).attr('y1', height * 0.36).attr('x2', width * 0.82).attr('y2', height * 0.36).attr('stroke', '#e535ab').attr('stroke-width', 0.5);
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.5).attr('fill', '#880e4f').attr('font-size', 6).text('id: ID!');
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.63).attr('fill', '#880e4f').attr('font-size', 6).text('name: String');
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.76).attr('fill', '#880e4f').attr('font-size', 6).text('posts: [Post]');
        },
    },
};

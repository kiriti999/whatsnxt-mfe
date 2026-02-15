/**
 * DevOps & Automation Shape Library
 * Covers: CI/CD, Version Control, GitOps, Containerization, Service Mesh, Monitoring, Config Mgmt
 */
import * as d3 from 'd3';

export interface DevOpsShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const devopsD3Shapes: Record<string, DevOpsShapeDefinition> = {
    cicdpipeline: {
        id: 'devops-cicd',
        name: 'CI/CD Pipeline',
        type: 'cicdpipeline',
        width: 80,
        height: 45,
        render: (g, width, height) => {
            // Pipeline stages
            const stages = [
                { x: 0.02, color: '#3498db', label: 'B' },
                { x: 0.22, color: '#2ecc71', label: 'T' },
                { x: 0.42, color: '#f39c12', label: 'S' },
                { x: 0.62, color: '#e74c3c', label: 'D' },
            ];
            stages.forEach(({ x, color, label }) => {
                g.append('polygon')
                    .attr('points', `${width * x},${height * 0.15} ${width * (x + 0.16)},${height * 0.15} ${width * (x + 0.2)},${height * 0.5} ${width * (x + 0.16)},${height * 0.85} ${width * x},${height * 0.85} ${width * (x + 0.04)},${height * 0.5}`)
                    .attr('fill', color).attr('stroke', 'none');
                g.append('text').attr('x', width * (x + 0.1)).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 10).attr('font-weight', 'bold').text(label);
            });
            // Final check
            g.append('circle').attr('cx', width * 0.88).attr('cy', height * 0.5).attr('r', width * 0.06).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.88).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 9).text('✓');
        },
    },

    gitrepo: {
        id: 'devops-git',
        name: 'Git Repository',
        type: 'gitrepo',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f5f5f5').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Git branch lines
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.15).attr('x2', width * 0.3).attr('y2', height * 0.85).attr('stroke', '#e74c3c').attr('stroke-width', 2.5);
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.4).attr('x2', width * 0.65).attr('y2', height * 0.4).attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.65).attr('y1', height * 0.4).attr('x2', width * 0.65).attr('y2', height * 0.65).attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.65).attr('y1', height * 0.65).attr('x2', width * 0.3).attr('y2', height * 0.65).attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Commit dots
            [0.2, 0.4, 0.65, 0.8].forEach((y) => {
                g.append('circle').attr('cx', width * 0.3).attr('cy', height * y).attr('r', 4).attr('fill', '#e74c3c');
            });
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.4).attr('r', 4).attr('fill', '#27ae60');
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.65).attr('r', 4).attr('fill', '#27ae60');
        },
    },

    container: {
        id: 'devops-container',
        name: 'Container',
        type: 'container',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Shipping container
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 3).attr('fill', '#2980b9').attr('stroke', '#1f618d').attr('stroke-width', 2);
            // Container ridges
            [0.25, 0.5, 0.75].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', 0).attr('x2', width * x).attr('y2', height).attr('stroke', '#1f618d').attr('stroke-width', 1.5);
            });
            // Door handles
            g.append('rect').attr('x', width * 0.85).attr('y', height * 0.3).attr('width', width * 0.05).attr('height', height * 0.15).attr('fill', '#f1c40f');
            g.append('rect').attr('x', width * 0.85).attr('y', height * 0.55).attr('width', width * 0.05).attr('height', height * 0.15).attr('fill', '#f1c40f');
        },
    },

    registry: {
        id: 'devops-registry',
        name: 'Container Registry',
        type: 'registry',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#2c3e50').attr('stroke-width', 2);
            // Stack of container icons
            [0.15, 0.4, 0.65].forEach((y) => {
                g.append('rect').attr('x', width * 0.15).attr('y', height * y).attr('width', width * 0.5).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#2980b9');
                g.append('rect').attr('x', width * 0.68).attr('y', height * y).attr('width', width * 0.18).attr('height', height * 0.18).attr('rx', 2).attr('fill', '#3498db');
            });
        },
    },

    artifact: {
        id: 'devops-artifact',
        name: 'Artifact',
        type: 'artifact',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Package box
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.25} ${width * 0.95},${height * 0.75} ${width * 0.5},${height * 0.95} ${width * 0.05},${height * 0.75} ${width * 0.05},${height * 0.25}`)
                .attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Top face
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.25} ${width * 0.5},${height * 0.45} ${width * 0.05},${height * 0.25}`)
                .attr('fill', '#f0b27a').attr('stroke', '#e67e22').attr('stroke-width', 1);
            // Center line
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.45).attr('x2', width * 0.5).attr('y2', height * 0.95).attr('stroke', '#e67e22').attr('stroke-width', 1);
        },
    },

    secret: {
        id: 'devops-secret',
        name: 'Secret',
        type: 'secret',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Key shape
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.4).attr('r', width * 0.18).attr('fill', 'none').attr('stroke', '#f1c40f').attr('stroke-width', 3);
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.4).attr('r', width * 0.08).attr('fill', '#f1c40f');
            g.append('line').attr('x1', width * 0.53).attr('y1', height * 0.4).attr('x2', width * 0.85).attr('y2', height * 0.4).attr('stroke', '#f1c40f').attr('stroke-width', 3);
            g.append('line').attr('x1', width * 0.72).attr('y1', height * 0.4).attr('x2', width * 0.72).attr('y2', height * 0.55).attr('stroke', '#f1c40f').attr('stroke-width', 2.5);
            g.append('line').attr('x1', width * 0.82).attr('y1', height * 0.4).attr('x2', width * 0.82).attr('y2', height * 0.52).attr('stroke', '#f1c40f').attr('stroke-width', 2.5);
        },
    },

    monitor: {
        id: 'devops-monitor',
        name: 'Monitoring',
        type: 'monitor',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Heartbeat line
            const points = [[0.05, 0.5], [0.2, 0.5], [0.3, 0.2], [0.4, 0.75], [0.5, 0.3], [0.55, 0.5], [0.95, 0.5]];
            const line = d3.line<number[]>().x((d) => width * d[0]).y((d) => height * d[1]);
            g.append('path').attr('d', line(points)).attr('fill', 'none').attr('stroke', '#1abc9c').attr('stroke-width', 2.5);
            // Alert dot
            g.append('circle').attr('cx', width * 0.85).attr('cy', height * 0.2).attr('r', 5).attr('fill', '#e74c3c');
        },
    },

    alertrule: {
        id: 'devops-alert',
        name: 'Alert',
        type: 'alertrule',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Bell icon
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.12} Q${width * 0.2},${height * 0.25} ${width * 0.2},${height * 0.55} L${width * 0.15},${height * 0.65} L${width * 0.85},${height * 0.65} L${width * 0.8},${height * 0.55} Q${width * 0.8},${height * 0.25} ${width * 0.5},${height * 0.12}`)
                .attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1);
            // Clapper
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.73).attr('r', 4).attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1);
        },
    },

    logsink: {
        id: 'devops-logs',
        name: 'Logs',
        type: 'logsink',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Terminal text lines
            const lines = [
                { y: 0.15, w: 0.6, color: '#27ae60' },
                { y: 0.3, w: 0.75, color: '#3498db' },
                { y: 0.45, w: 0.5, color: '#f39c12' },
                { y: 0.6, w: 0.65, color: '#27ae60' },
                { y: 0.75, w: 0.4, color: '#e74c3c' },
            ];
            lines.forEach(({ y, w, color }) => {
                g.append('text').attr('x', width * 0.08).attr('y', height * y + 4).attr('fill', '#27ae60').attr('font-size', 7).text('>');
                g.append('line').attr('x1', width * 0.18).attr('y1', height * y + 2).attr('x2', width * (0.18 + w * 0.7)).attr('y2', height * y + 2).attr('stroke', color).attr('stroke-width', 2).attr('opacity', 0.8);
            });
        },
    },

    scanner: {
        id: 'devops-scanner',
        name: 'Scanner',
        type: 'scanner',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#5dade2').attr('stroke-width', 2);
            // Radar sweep
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.5).attr('r', width * 0.35).attr('fill', 'none').attr('stroke', '#5dade2').attr('stroke-width', 1);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.5).attr('r', width * 0.22).attr('fill', 'none').attr('stroke', '#5dade2').attr('stroke-width', 1).attr('opacity', 0.6);
            // Sweep line
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.5).attr('x2', width * 0.8).attr('y2', height * 0.25).attr('stroke', '#5dade2').attr('stroke-width', 2);
            // Blip
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.35).attr('r', 3).attr('fill', '#e74c3c');
        },
    },
};

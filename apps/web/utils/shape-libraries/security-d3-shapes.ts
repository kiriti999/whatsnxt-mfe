/**
 * Cybersecurity Shape Library
 * Covers: AppSec, Network Security, IAM, SIEM, Cloud Security, DevSecOps
 */
import * as d3 from 'd3';

export interface SecurityShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const securityD3Shapes: Record<string, SecurityShapeDefinition> = {
    shield: {
        id: 'sec-shield',
        name: 'Shield',
        type: 'shield',
        width: 55,
        height: 65,
        render: (g, width, height) => {
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.02} L${width * 0.95},${height * 0.2} L${width * 0.95},${height * 0.55} Q${width * 0.95},${height * 0.85} ${width * 0.5},${height * 0.98} Q${width * 0.05},${height * 0.85} ${width * 0.05},${height * 0.55} L${width * 0.05},${height * 0.2} Z`)
                .attr('fill', '#d4efdf').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Checkmark
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.5} L${width * 0.45},${height * 0.65} L${width * 0.7},${height * 0.35}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 3).attr('stroke-linecap', 'round');
        },
    },

    firewall: {
        id: 'sec-firewall',
        name: 'Firewall',
        type: 'firewall',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Brick wall
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 3).attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 2);
            // Brick pattern
            [0.2, 0.4, 0.6, 0.8].forEach((y, i) => {
                g.append('line').attr('x1', 0).attr('y1', height * y).attr('x2', width).attr('y2', height * y).attr('stroke', '#c0392b').attr('stroke-width', 1);
                const offset = i % 2 === 0 ? 0.33 : 0.66;
                g.append('line').attr('x1', width * offset).attr('y1', height * (y - 0.2)).attr('x2', width * offset).attr('y2', height * y).attr('stroke', '#c0392b').attr('stroke-width', 1);
            });
            // Lock overlay
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.45).attr('r', 8).attr('fill', '#f39c12').attr('opacity', 0.9);
            g.append('rect').attr('x', width * 0.38).attr('y', height * 0.42).attr('width', width * 0.24).attr('height', height * 0.22).attr('rx', 2).attr('fill', '#e67e22');
        },
    },

    lock: {
        id: 'sec-lock',
        name: 'Encryption',
        type: 'lock',
        width: 50,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Lock body
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.45).attr('width', width * 0.6).attr('height', height * 0.42).attr('rx', 4).attr('fill', '#f1c40f');
            // Shackle
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.47} L${width * 0.3},${height * 0.3} Q${width * 0.3},${height * 0.15} ${width * 0.5},${height * 0.15} Q${width * 0.7},${height * 0.15} ${width * 0.7},${height * 0.3} L${width * 0.7},${height * 0.47}`)
                .attr('fill', 'none').attr('stroke', '#f1c40f').attr('stroke-width', 4).attr('stroke-linecap', 'round');
            // Keyhole
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.6).attr('r', 4).attr('fill', '#2c3e50');
            g.append('rect').attr('x', width * 0.47).attr('y', height * 0.6).attr('width', width * 0.06).attr('height', height * 0.15).attr('fill', '#2c3e50');
        },
    },

    certificate: {
        id: 'sec-certificate',
        name: 'Certificate',
        type: 'certificate',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fff').attr('stroke', '#2c3e50').attr('stroke-width', 2);
            // Header
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.08).attr('width', width * 0.7).attr('height', height * 0.12).attr('fill', '#2c3e50').attr('rx', 1);
            // Text lines
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.32).attr('x2', width * 0.85).attr('y2', height * 0.32).attr('stroke', '#d5d8dc').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.42).attr('x2', width * 0.75).attr('y2', height * 0.42).attr('stroke', '#d5d8dc').attr('stroke-width', 1.5);
            // Seal
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.68).attr('r', width * 0.12).attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('SSL');
            // Ribbon
            g.append('line').attr('x1', width * 0.45).attr('y1', height * 0.78).attr('x2', width * 0.38).attr('y2', height * 0.92).attr('stroke', '#e74c3c').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.55).attr('y1', height * 0.78).attr('x2', width * 0.62).attr('y2', height * 0.92).attr('stroke', '#e74c3c').attr('stroke-width', 2);
        },
    },

    waf: {
        id: 'sec-waf',
        name: 'WAF',
        type: 'waf',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Shield with web pattern
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.08} L${width * 0.85},${height * 0.22} L${width * 0.85},${height * 0.55} Q${width * 0.85},${height * 0.8} ${width * 0.5},${height * 0.92} Q${width * 0.15},${height * 0.8} ${width * 0.15},${height * 0.55} L${width * 0.15},${height * 0.22} Z`)
                .attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Web grid lines
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.1).attr('x2', width * 0.5).attr('y2', height * 0.9).attr('stroke', '#2e86c1').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.18).attr('y1', height * 0.5).attr('x2', width * 0.82).attr('y2', height * 0.5).attr('stroke', '#2e86c1').attr('stroke-width', 1);
            g.append('text').attr('x', width / 2).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#2e86c1').attr('font-size', 8).attr('font-weight', 'bold').text('WAF');
        },
    },

    identity: {
        id: 'sec-identity',
        name: 'Identity',
        type: 'identity',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Person silhouette
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.28).attr('r', width * 0.15).attr('fill', '#8e44ad');
            g.append('path')
                .attr('d', `M${width * 0.2},${height * 0.78} Q${width * 0.2},${height * 0.48} ${width * 0.5},${height * 0.48} Q${width * 0.8},${height * 0.48} ${width * 0.8},${height * 0.78}`)
                .attr('fill', '#8e44ad');
            // Badge indicator
            g.append('circle').attr('cx', width * 0.75).attr('cy', height * 0.2).attr('r', 6).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.75).attr('y', height * 0.24).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('✓');
        },
    },

    vault: {
        id: 'sec-vault',
        name: 'Vault',
        type: 'vault',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            // Safe door
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#5d6d7e').attr('stroke', '#2c3e50').attr('stroke-width', 3);
            // Dial
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.45).attr('r', width * 0.2).attr('fill', '#aab7b8').attr('stroke', '#2c3e50').attr('stroke-width', 2);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.45).attr('r', width * 0.08).attr('fill', '#2c3e50');
            // Handle
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.72).attr('width', width * 0.3).attr('height', height * 0.08).attr('rx', 2).attr('fill', '#f1c40f');
            // Tick marks on dial
            [0, 90, 180, 270].forEach((angle) => {
                const rad = (angle * Math.PI) / 180;
                const r1 = width * 0.15;
                const r2 = width * 0.19;
                g.append('line')
                    .attr('x1', width * 0.5 + Math.cos(rad) * r1).attr('y1', height * 0.45 + Math.sin(rad) * r1)
                    .attr('x2', width * 0.5 + Math.cos(rad) * r2).attr('y2', height * 0.45 + Math.sin(rad) * r2)
                    .attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
            });
        },
    },

    auditlog: {
        id: 'sec-auditlog',
        name: 'Audit Log',
        type: 'auditlog',
        width: 55,
        height: 65,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fff').attr('stroke', '#2c3e50').attr('stroke-width', 2);
            // Clipboard top
            g.append('rect').attr('x', width * 0.3).attr('y', 0).attr('width', width * 0.4).attr('height', height * 0.1).attr('rx', 2).attr('fill', '#2c3e50');
            // Log entries with status
            [0.18, 0.33, 0.48, 0.63, 0.78].forEach((y, i) => {
                const color = i === 3 ? '#e74c3c' : '#27ae60';
                g.append('circle').attr('cx', width * 0.15).attr('cy', height * (y + 0.04)).attr('r', 3).attr('fill', color);
                g.append('line').attr('x1', width * 0.25).attr('y1', height * (y + 0.04)).attr('x2', width * 0.85).attr('y2', height * (y + 0.04)).attr('stroke', '#d5d8dc').attr('stroke-width', 2);
            });
        },
    },

    siem: {
        id: 'sec-siem',
        name: 'SIEM',
        type: 'siem',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Screen with alerts
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.08).attr('width', width * 0.84).attr('height', height * 0.6).attr('rx', 3).attr('fill', '#1a252f');
            // Alert dots
            g.append('circle').attr('cx', width * 0.25).attr('cy', height * 0.3).attr('r', 4).attr('fill', '#e74c3c');
            g.append('circle').attr('cx', width * 0.45).attr('cy', height * 0.25).attr('r', 4).attr('fill', '#f39c12');
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.35).attr('r', 4).attr('fill', '#27ae60');
            // Status bars
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.48).attr('width', width * 0.2).attr('height', height * 0.08).attr('fill', '#e74c3c');
            g.append('rect').attr('x', width * 0.4).attr('y', height * 0.48).attr('width', width * 0.15).attr('height', height * 0.08).attr('fill', '#f39c12');
            g.append('rect').attr('x', width * 0.6).attr('y', height * 0.48).attr('width', width * 0.25).attr('height', height * 0.08).attr('fill', '#27ae60');
            // Label
            g.append('text').attr('x', width / 2).attr('y', height * 0.85).attr('text-anchor', 'middle').attr('fill', '#ecf0f1').attr('font-size', 8).attr('font-weight', 'bold').text('SIEM');
        },
    },
};

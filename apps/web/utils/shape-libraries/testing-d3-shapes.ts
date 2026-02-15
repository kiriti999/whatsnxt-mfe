/**
 * Software Testing Shape Library
 * Covers: Unit, Integration, E2E, Performance, Chaos, Accessibility, Automation, Code Quality
 */
import * as d3 from 'd3';

export interface TestingShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const testingD3Shapes: Record<string, TestingShapeDefinition> = {
    testsuite: {
        id: 'test-suite',
        name: 'Test Suite',
        type: 'testsuite',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#e8f8f5').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Checklist
            [0.15, 0.35, 0.55, 0.75].forEach((y, i) => {
                const passed = i !== 2;
                g.append('rect').attr('x', width * 0.1).attr('y', height * y).attr('width', height * 0.12).attr('height', height * 0.12).attr('rx', 2).attr('fill', 'none').attr('stroke', passed ? '#27ae60' : '#e74c3c').attr('stroke-width', 1.5);
                if (passed) {
                    g.append('path').attr('d', `M${width * 0.12},${height * (y + 0.06)} L${width * 0.16},${height * (y + 0.1)} L${width * 0.22},${height * (y + 0.02)}`).attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 1.5);
                } else {
                    g.append('line').attr('x1', width * 0.12).attr('y1', height * (y + 0.02)).attr('x2', width * 0.22).attr('y2', height * (y + 0.1)).attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
                    g.append('line').attr('x1', width * 0.22).attr('y1', height * (y + 0.02)).attr('x2', width * 0.12).attr('y2', height * (y + 0.1)).attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
                }
                g.append('line').attr('x1', width * 0.3).attr('y1', height * (y + 0.06)).attr('x2', width * 0.85).attr('y2', height * (y + 0.06)).attr('stroke', '#bdc3c7').attr('stroke-width', 2);
            });
        },
    },

    testcase: {
        id: 'test-case',
        name: 'Test Case',
        type: 'testcase',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Code icon with checkmark
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.45).attr('fill', '#27ae60').attr('font-size', 14).text('⟨');
            g.append('text').attr('x', width * 0.55).attr('y', height * 0.45).attr('fill', '#27ae60').attr('font-size', 14).text('⟩');
            // Checkmark
            g.append('circle').attr('cx', width * 0.72).attr('cy', height * 0.72).attr('r', 8).attr('fill', '#27ae60');
            g.append('path').attr('d', `M${width * 0.63},${height * 0.72} L${width * 0.7},${height * 0.8} L${width * 0.82},${height * 0.64}`).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2);
        },
    },

    bug: {
        id: 'test-bug',
        name: 'Bug',
        type: 'bug',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Bug body
            g.append('ellipse').attr('cx', width / 2).attr('cy', height * 0.55).attr('rx', width * 0.22).attr('ry', height * 0.25).attr('fill', '#e74c3c');
            // Bug head
            g.append('circle').attr('cx', width / 2).attr('cy', height * 0.25).attr('r', width * 0.12).attr('fill', '#e74c3c');
            // Legs
            [[-1, 0.35], [-1, 0.55], [-1, 0.72], [1, 0.35], [1, 0.55], [1, 0.72]].forEach(([dir, y]) => {
                g.append('line')
                    .attr('x1', width * 0.5 + dir * width * 0.2).attr('y1', height * y)
                    .attr('x2', width * 0.5 + dir * width * 0.38).attr('y2', height * (y - 0.05))
                    .attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            });
            // Antennae
            g.append('line').attr('x1', width * 0.42).attr('y1', height * 0.18).attr('x2', width * 0.3).attr('y2', height * 0.08).attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.58).attr('y1', height * 0.18).attr('x2', width * 0.7).attr('y2', height * 0.08).attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
        },
    },

    coverage: {
        id: 'test-coverage',
        name: 'Coverage',
        type: 'coverage',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Donut chart
            const cx = width / 2;
            const cy = height * 0.45;
            const r = width * 0.25;
            // Background circle
            g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', '#e8e8e8').attr('stroke-width', 6);
            // Coverage arc (85%)
            const angle = 0.85 * 2 * Math.PI;
            const endX = cx + r * Math.sin(angle);
            const endY = cy - r * Math.cos(angle);
            g.append('path')
                .attr('d', `M${cx},${cy - r} A${r},${r} 0 1,1 ${endX},${endY}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 6).attr('stroke-linecap', 'round');
            // Percentage text
            g.append('text').attr('x', cx).attr('y', cy + 2).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 9).attr('font-weight', 'bold').text('85%');
        },
    },

    loadtest: {
        id: 'test-load',
        name: 'Load Test',
        type: 'loadtest',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Gauge
            const cx = width / 2;
            const cy = height * 0.55;
            const r = width * 0.3;
            g.append('path')
                .attr('d', `M${cx - r},${cy} A${r},${r} 0 0,1 ${cx + r},${cy}`)
                .attr('fill', 'none').attr('stroke', '#d5d8dc').attr('stroke-width', 4);
            // Colored segments
            g.append('path')
                .attr('d', `M${cx - r},${cy} A${r},${r} 0 0,1 ${cx - r * 0.7},${cy - r * 0.7}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 4);
            g.append('path')
                .attr('d', `M${cx - r * 0.7},${cy - r * 0.7} A${r},${r} 0 0,1 ${cx + r * 0.7},${cy - r * 0.7}`)
                .attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 4);
            g.append('path')
                .attr('d', `M${cx + r * 0.7},${cy - r * 0.7} A${r},${r} 0 0,1 ${cx + r},${cy}`)
                .attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 4);
            // Needle
            g.append('line').attr('x1', cx).attr('y1', cy).attr('x2', cx + r * 0.5).attr('y2', cy - r * 0.55).attr('stroke', '#2c3e50').attr('stroke-width', 2);
            g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 3).attr('fill', '#2c3e50');
        },
    },

    chaos: {
        id: 'test-chaos',
        name: 'Chaos Test',
        type: 'chaos',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Lightning bolt
            g.append('polygon')
                .attr('points', `${width * 0.55},${height * 0.05} ${width * 0.3},${height * 0.45} ${width * 0.48},${height * 0.45} ${width * 0.38},${height * 0.95} ${width * 0.7},${height * 0.45} ${width * 0.52},${height * 0.45}`)
                .attr('fill', '#8e44ad').attr('stroke', '#6c3483').attr('stroke-width', 1);
        },
    },

    a11y: {
        id: 'test-a11y',
        name: 'Accessibility',
        type: 'a11y',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('circle').attr('cx', width / 2).attr('cy', height / 2).attr('r', width * 0.45).attr('fill', '#2e86c1').attr('stroke', '#1f618d').attr('stroke-width', 2);
            // Accessibility person icon
            // Head
            g.append('circle').attr('cx', width / 2).attr('cy', height * 0.28).attr('r', 4).attr('fill', '#fff');
            // Body
            g.append('line').attr('x1', width / 2).attr('y1', height * 0.35).attr('x2', width / 2).attr('y2', height * 0.6).attr('stroke', '#fff').attr('stroke-width', 2);
            // Arms
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.42).attr('x2', width * 0.7).attr('y2', height * 0.42).attr('stroke', '#fff').attr('stroke-width', 2);
            // Legs
            g.append('line').attr('x1', width / 2).attr('y1', height * 0.6).attr('x2', width * 0.32).attr('y2', height * 0.78).attr('stroke', '#fff').attr('stroke-width', 2);
            g.append('line').attr('x1', width / 2).attr('y1', height * 0.6).attr('x2', width * 0.68).attr('y2', height * 0.78).attr('stroke', '#fff').attr('stroke-width', 2);
        },
    },

    assertion: {
        id: 'test-assert',
        name: 'Assertion',
        type: 'assertion',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d4efdf').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Equals sign
            g.append('text').attr('x', width / 2).attr('y', height * 0.45).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 18).attr('font-weight', 'bold').text('≡');
            // Expected vs Actual labels
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.85).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 6).text('exp');
            g.append('text').attr('x', width * 0.8).attr('y', height * 0.85).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 6).text('act');
        },
    },

    mock: {
        id: 'test-mock',
        name: 'Mock / Stub',
        type: 'mock',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Dashed outline box (indicating fake)
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f39c12').attr('stroke-width', 2).attr('stroke-dasharray', '5,3');
            // Mask icon
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.35} Q${width * 0.5},${height * 0.15} ${width * 0.85},${height * 0.35} Q${width * 0.85},${height * 0.6} ${width * 0.5},${height * 0.65} Q${width * 0.15},${height * 0.6} ${width * 0.15},${height * 0.35}`)
                .attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 1);
            // Eye holes
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.42).attr('r', 4).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.65).attr('cy', height * 0.42).attr('r', 4).attr('fill', '#fff');
        },
    },
};

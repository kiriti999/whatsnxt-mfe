/**
 * CI/CD Pipeline Shape Library
 * Covers L3 topics: GitHub Actions, GitLab CI, Jenkins, Build, Test, Deploy stages, Git workflows
 */
import * as d3 from 'd3';

export interface CICDShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const cicdD3Shapes: Record<string, CICDShapeDefinition> = {
    pipelinestage: {
        id: 'cicd-stage',
        name: 'Pipeline Stage',
        type: 'pipelinestage',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            // Chevron/ribbon shape
            g.append('polygon')
                .attr('points', `0,0 ${width * 0.85},0 ${width},${height * 0.5} ${width * 0.85},${height} 0,${height} ${width * 0.15},${height * 0.5}`)
                .attr('fill', '#3498db').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('Build');
        },
    },

    gitbranch: {
        id: 'cicd-branch',
        name: 'Git Branch',
        type: 'gitbranch',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Main branch line
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.1).attr('x2', width * 0.3).attr('y2', height * 0.9).attr('stroke', '#e74c3c').attr('stroke-width', 2.5);
            // Feature branch
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.35} Q${width * 0.5},${height * 0.35} ${width * 0.7},${height * 0.2}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.7).attr('y1', height * 0.2).attr('x2', width * 0.7).attr('y2', height * 0.55).attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Merge back
            g.append('path')
                .attr('d', `M${width * 0.7},${height * 0.55} Q${width * 0.5},${height * 0.65} ${width * 0.3},${height * 0.7}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Commit dots
            [0.2, 0.35, 0.55, 0.7, 0.85].forEach((y) => {
                g.append('circle').attr('cx', width * 0.3).attr('cy', height * y).attr('r', 3.5).attr('fill', '#e74c3c').attr('stroke', '#c0392b').attr('stroke-width', 1);
            });
            [0.3, 0.45].forEach((y) => {
                g.append('circle').attr('cx', width * 0.7).attr('cy', height * y).attr('r', 3.5).attr('fill', '#27ae60').attr('stroke', '#1e8449').attr('stroke-width', 1);
            });
        },
    },

    buildstep: {
        id: 'cicd-build',
        name: 'Build',
        type: 'buildstep',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Hammer icon
            g.append('rect').attr('x', width * 0.42).attr('y', height * 0.12).attr('width', width * 0.08).attr('height', height * 0.55).attr('fill', '#8b6914').attr('rx', 1);
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.08).attr('width', width * 0.42).attr('height', height * 0.2).attr('rx', 3).attr('fill', '#7f8c8d').attr('stroke', '#5d6d7e').attr('stroke-width', 1);
            // Spark
            g.append('text').attr('x', width * 0.78).attr('y', height * 0.35).attr('fill', '#f39c12').attr('font-size', 10).text('⚡');
            // Progress bar
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.78).attr('width', width * 0.8).attr('height', height * 0.12).attr('rx', 3).attr('fill', '#ecf0f1');
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.78).attr('width', width * 0.56).attr('height', height * 0.12).attr('rx', 3).attr('fill', '#f1c40f');
        },
    },

    teststep: {
        id: 'cicd-test',
        name: 'Test',
        type: 'teststep',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Checkmark in circle
            g.append('circle').attr('cx', width / 2).attr('cy', height * 0.38).attr('r', width * 0.2).attr('fill', '#27ae60');
            g.append('path')
                .attr('d', `M${width * 0.35},${height * 0.38} L${width * 0.46},${height * 0.48} L${width * 0.65},${height * 0.28}`)
                .attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2.5).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
            // Test results
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.78).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 7).text('42 passed');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.92).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 6).text('0 failed');
        },
    },

    deploystep: {
        id: 'cicd-deploy',
        name: 'Deploy',
        type: 'deploystep',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Rocket
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.08} ${width * 0.62},${height * 0.5} ${width * 0.5},${height * 0.45} ${width * 0.38},${height * 0.5}`)
                .attr('fill', '#2e86c1').attr('stroke', '#1f618d').attr('stroke-width', 1);
            // Rocket body
            g.append('rect').attr('x', width * 0.38).attr('y', height * 0.35).attr('width', width * 0.24).attr('height', height * 0.32).attr('rx', 4).attr('fill', '#3498db');
            // Window
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.48).attr('r', 4).attr('fill', '#eaf2f8');
            // Fins
            g.append('polygon')
                .attr('points', `${width * 0.38},${height * 0.55} ${width * 0.28},${height * 0.7} ${width * 0.38},${height * 0.67}`)
                .attr('fill', '#e74c3c');
            g.append('polygon')
                .attr('points', `${width * 0.62},${height * 0.55} ${width * 0.72},${height * 0.7} ${width * 0.62},${height * 0.67}`)
                .attr('fill', '#e74c3c');
            // Flame
            g.append('polygon')
                .attr('points', `${width * 0.42},${height * 0.67} ${width * 0.5},${height * 0.92} ${width * 0.58},${height * 0.67}`)
                .attr('fill', '#f39c12');
            g.append('polygon')
                .attr('points', `${width * 0.44},${height * 0.67} ${width * 0.5},${height * 0.82} ${width * 0.56},${height * 0.67}`)
                .attr('fill', '#e74c3c');
        },
    },

    runner: {
        id: 'cicd-runner',
        name: 'Runner / Agent',
        type: 'runner',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Runner figure (simplified)
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.2).attr('r', 7).attr('fill', '#8e44ad');
            // Body
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.32).attr('x2', width * 0.5).attr('y2', height * 0.6).attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Arms with gear
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.42).attr('x2', width * 0.7).attr('y2', height * 0.42).attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Legs (running)
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.6).attr('x2', width * 0.32).attr('y2', height * 0.82).attr('stroke', '#8e44ad').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.6).attr('x2', width * 0.68).attr('y2', height * 0.82).attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Gear symbol
            g.append('circle').attr('cx', width * 0.78).attr('cy', height * 0.35).attr('r', 5).attr('fill', '#d7bde2');
            g.append('circle').attr('cx', width * 0.78).attr('cy', height * 0.35).attr('r', 2).attr('fill', '#8e44ad');
        },
    },

    artifact: {
        id: 'cicd-artifact',
        name: 'Artifact',
        type: 'artifact',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            // Package/box
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Box flaps
            g.append('polygon')
                .attr('points', `0,${height * 0.25} ${width * 0.5},${height * 0.08} ${width},${height * 0.25} ${width * 0.5},${height * 0.4}`)
                .attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
            // Version tag
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.52).attr('width', width * 0.6).attr('height', height * 0.18).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.64).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('v2.1.0');
            // Hash
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('sha256:abc...');
        },
    },

    envgate: {
        id: 'cicd-gate',
        name: 'Environment Gate',
        type: 'envgate',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Gate barrier
            g.append('rect').attr('x', width * 0.42).attr('y', height * 0.12).attr('width', width * 0.08).attr('height', height * 0.76).attr('fill', '#e74c3c');
            // Barrier arm (raised)
            g.append('line').attr('x1', width * 0.46).attr('y1', height * 0.35).attr('x2', width * 0.85).attr('y2', height * 0.2).attr('stroke', '#e74c3c').attr('stroke-width', 4).attr('stroke-linecap', 'round');
            // Stripes on arm
            g.append('line').attr('x1', width * 0.56).attr('y1', height * 0.34).attr('x2', width * 0.6).attr('y2', height * 0.3).attr('stroke', '#f9e79f').attr('stroke-width', 3);
            g.append('line').attr('x1', width * 0.68).attr('y1', height * 0.29).attr('x2', width * 0.72).attr('y2', height * 0.25).attr('stroke', '#f9e79f').attr('stroke-width', 3);
            // Labels
            g.append('text').attr('x', width * 0.2).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 6).text('DEV');
            g.append('text').attr('x', width * 0.75).attr('y', height * 0.56).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 6).text('PROD');
            // Approval icon
            g.append('circle').attr('cx', width * 0.46).attr('cy', height * 0.78).attr('r', 6).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.46).attr('y', height * 0.81).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text('✓');
        },
    },

    workflow: {
        id: 'cicd-workflow',
        name: 'Workflow',
        type: 'workflow',
        width: 75,
        height: 40,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Steps with connecting arrows
            const steps = [
                { x: 0.04, color: '#e74c3c', label: 'PR' },
                { x: 0.24, color: '#f39c12', label: 'Lint' },
                { x: 0.44, color: '#3498db', label: 'Build' },
                { x: 0.64, color: '#27ae60', label: 'Test' },
                { x: 0.84, color: '#8e44ad', label: '🚀' },
            ];
            steps.forEach(({ x, color, label }, i) => {
                g.append('circle').attr('cx', width * (x + 0.06)).attr('cy', height * 0.5).attr('r', 8).attr('fill', color);
                g.append('text').attr('x', width * (x + 0.06)).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text(label);
                if (i < 4) {
                    g.append('line').attr('x1', width * (x + 0.12)).attr('y1', height * 0.5).attr('x2', width * (x + 0.2)).attr('y2', height * 0.5).attr('stroke', '#bdc3c7').attr('stroke-width', 1.5);
                }
            });
        },
    },
};

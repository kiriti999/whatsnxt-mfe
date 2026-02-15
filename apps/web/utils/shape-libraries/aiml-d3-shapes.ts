/**
 * AI & Machine Learning Shape Library
 * Covers: Deep Learning, Classical ML, LLMs, NLP, Computer Vision, GenAI, MLOps, AI Agents, RAG
 */
import * as d3 from 'd3';

export interface AIMLShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const aimlD3Shapes: Record<string, AIMLShapeDefinition> = {
    neuralnet: {
        id: 'ai-neuralnet',
        name: 'Neural Network',
        type: 'neuralnet',
        width: 70,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Network layers
            const layers = [[0.2, [0.2, 0.5, 0.8]], [0.5, [0.15, 0.4, 0.6, 0.85]], [0.8, [0.3, 0.7]]];
            layers.forEach(([x, ys]) => {
                (ys as number[]).forEach((y) => {
                    g.append('circle').attr('cx', width * (x as number)).attr('cy', height * y).attr('r', 4).attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
                });
            });
            // Connections between layers
            const l0 = [0.2, 0.5, 0.8];
            const l1 = [0.15, 0.4, 0.6, 0.85];
            const l2 = [0.3, 0.7];
            l0.forEach((y0) => l1.forEach((y1) => {
                g.append('line').attr('x1', width * 0.2).attr('y1', height * y0).attr('x2', width * 0.5).attr('y2', height * y1).attr('stroke', '#e67e22').attr('stroke-width', 0.5).attr('opacity', 0.4);
            }));
            l1.forEach((y1) => l2.forEach((y2) => {
                g.append('line').attr('x1', width * 0.5).attr('y1', height * y1).attr('x2', width * 0.8).attr('y2', height * y2).attr('stroke', '#e67e22').attr('stroke-width', 0.5).attr('opacity', 0.4);
            }));
        },
    },

    model: {
        id: 'ai-model',
        name: 'ML Model',
        type: 'model',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            // Brain-like shape using circles
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 10).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Brain hemispheres
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.2} Q${width * 0.2},${height * 0.15} ${width * 0.2},${height * 0.45} Q${width * 0.18},${height * 0.75} ${width * 0.5},${height * 0.8} Q${width * 0.82},${height * 0.75} ${width * 0.8},${height * 0.45} Q${width * 0.8},${height * 0.15} ${width * 0.5},${height * 0.2}`)
                .attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            // Center line
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.2).attr('x2', width * 0.5).attr('y2', height * 0.8).attr('stroke', '#8e44ad').attr('stroke-width', 1);
            // Folds
            g.append('path').attr('d', `M${width * 0.3},${height * 0.3} Q${width * 0.4},${height * 0.45} ${width * 0.3},${height * 0.6}`).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1);
            g.append('path').attr('d', `M${width * 0.7},${height * 0.3} Q${width * 0.6},${height * 0.45} ${width * 0.7},${height * 0.6}`).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1);
        },
    },

    dataset: {
        id: 'ai-dataset',
        name: 'Dataset',
        type: 'dataset',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Cylinder
            g.append('ellipse').attr('cx', width / 2).attr('cy', height * 0.82).attr('rx', width * 0.45).attr('ry', height * 0.15).attr('fill', '#d4efdf').attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.18).attr('width', width * 0.9).attr('height', height * 0.65).attr('fill', '#d4efdf').attr('stroke', 'none');
            g.append('line').attr('x1', width * 0.05).attr('y1', height * 0.18).attr('x2', width * 0.05).attr('y2', height * 0.82).attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.95).attr('y1', height * 0.18).attr('x2', width * 0.95).attr('y2', height * 0.82).attr('stroke', '#27ae60').attr('stroke-width', 2);
            g.append('ellipse').attr('cx', width / 2).attr('cy', height * 0.18).attr('rx', width * 0.45).attr('ry', height * 0.15).attr('fill', '#a9dfbf').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Data rows
            g.append('text').attr('x', width / 2).attr('y', height * 0.52).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 9).attr('font-weight', 'bold').text('DATA');
        },
    },

    gpu: {
        id: 'ai-gpu',
        name: 'GPU',
        type: 'gpu',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // GPU chip grid
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) {
                    g.append('rect')
                        .attr('x', width * (0.12 + c * 0.2)).attr('y', height * (0.15 + r * 0.28))
                        .attr('width', width * 0.15).attr('height', height * 0.2)
                        .attr('fill', '#27ae60').attr('rx', 1);
                }
            }
            // Heatsink lines at top
            g.append('line').attr('x1', width * 0.3).attr('y1', 0).attr('x2', width * 0.3).attr('y2', height * 0.08).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.5).attr('y1', 0).attr('x2', width * 0.5).attr('y2', height * 0.08).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.7).attr('y1', 0).attr('x2', width * 0.7).attr('y2', height * 0.08).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
        },
    },

    llm: {
        id: 'ai-llm',
        name: 'LLM',
        type: 'llm',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 10).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Chat bubble
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.15} L${width * 0.85},${height * 0.15} Q${width * 0.9},${height * 0.15} ${width * 0.9},${height * 0.22} L${width * 0.9},${height * 0.55} Q${width * 0.9},${height * 0.62} ${width * 0.85},${height * 0.62} L${width * 0.35},${height * 0.62} L${width * 0.2},${height * 0.78} L${width * 0.25},${height * 0.62} L${width * 0.15},${height * 0.62} Q${width * 0.1},${height * 0.62} ${width * 0.1},${height * 0.55} L${width * 0.1},${height * 0.22} Q${width * 0.1},${height * 0.15} ${width * 0.15},${height * 0.15}`)
                .attr('fill', '#2e86c1').attr('stroke', 'none');
            // Text lines in bubble
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.3).attr('x2', width * 0.8).attr('y2', height * 0.3).attr('stroke', '#fff').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.42).attr('x2', width * 0.65).attr('y2', height * 0.42).attr('stroke', '#fff').attr('stroke-width', 2);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.54).attr('x2', width * 0.72).attr('y2', height * 0.54).attr('stroke', '#fff').attr('stroke-width', 2);
        },
    },

    agent: {
        id: 'ai-agent',
        name: 'AI Agent',
        type: 'agent',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 10).attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Robot head
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.12).attr('width', width * 0.5).attr('height', height * 0.45).attr('rx', 6).attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 1.5);
            // Eyes
            g.append('circle').attr('cx', width * 0.38).attr('cy', height * 0.32).attr('r', 4).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.38).attr('cy', height * 0.32).attr('r', 2).attr('fill', '#2c3e50');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.32).attr('r', 4).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.32).attr('r', 2).attr('fill', '#2c3e50');
            // Antenna
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.12).attr('x2', width * 0.5).attr('y2', height * 0.02).attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.02).attr('r', 3).attr('fill', '#e74c3c');
            // Body
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.62).attr('width', width * 0.4).attr('height', height * 0.28).attr('rx', 3).attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 1.5);
        },
    },

    embedding: {
        id: 'ai-embedding',
        name: 'Embedding',
        type: 'embedding',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#7d3c98').attr('stroke-width', 2);
            // Vector space with dots
            const dots = [[0.2, 0.3], [0.35, 0.25], [0.3, 0.4], [0.6, 0.55], [0.65, 0.65], [0.55, 0.7], [0.7, 0.35], [0.75, 0.45], [0.4, 0.75], [0.25, 0.6]];
            dots.forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 2.5).attr('fill', '#7d3c98').attr('opacity', 0.7);
            });
            // Cluster circles
            g.append('circle').attr('cx', width * 0.3).attr('cy', height * 0.35).attr('r', width * 0.15).attr('fill', 'none').attr('stroke', '#7d3c98').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.6).attr('r', width * 0.15).attr('fill', 'none').attr('stroke', '#7d3c98').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
        },
    },

    knowledgebase: {
        id: 'ai-knowledgebase',
        name: 'Knowledge Base',
        type: 'knowledgebase',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Book icon
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.15).attr('width', width * 0.3).attr('height', height * 0.55).attr('rx', 2).attr('fill', '#1abc9c');
            g.append('rect').attr('x', width * 0.5).attr('y', height * 0.15).attr('width', width * 0.3).attr('height', height * 0.55).attr('rx', 2).attr('fill', '#16a085');
            // Spine
            g.append('line').attr('x1', width * 0.48).attr('y1', height * 0.12).attr('x2', width * 0.48).attr('y2', height * 0.72).attr('stroke', '#117864').attr('stroke-width', 2);
            // Sparkle
            g.append('text').attr('x', width * 0.78).attr('y', height * 0.25).attr('fill', '#f1c40f').attr('font-size', 10).text('✦');
        },
    },

    training: {
        id: 'ai-training',
        name: 'Training Pipeline',
        type: 'training',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Progress bars representing epochs
            [0.2, 0.4, 0.6, 0.8].forEach((y, i) => {
                const fill = i < 3 ? '#27ae60' : '#f39c12';
                const w = [0.9, 0.75, 0.55, 0.3][i];
                g.append('rect').attr('x', width * 0.1).attr('y', height * y).attr('width', width * w).attr('height', height * 0.12).attr('rx', 2).attr('fill', fill).attr('opacity', 0.7);
            });
            // Arrow down
            g.append('text').attr('x', width * 0.88).attr('y', height * 0.65).attr('text-anchor', 'middle').attr('fill', '#f1c40f').attr('font-size', 14).text('⟳');
        },
    },

    inference: {
        id: 'ai-inference',
        name: 'Inference',
        type: 'inference',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Input arrow
            g.append('polygon')
                .attr('points', `${width * 0.05},${height * 0.45} ${width * 0.25},${height * 0.35} ${width * 0.25},${height * 0.55}`)
                .attr('fill', '#e67e22');
            // Processing box
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.25).attr('width', width * 0.4).attr('height', height * 0.5).attr('rx', 4).attr('fill', '#e67e22');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('f(x)');
            // Output arrow
            g.append('polygon')
                .attr('points', `${width * 0.95},${height * 0.45} ${width * 0.75},${height * 0.35} ${width * 0.75},${height * 0.55}`)
                .attr('fill', '#e67e22');
        },
    },
};

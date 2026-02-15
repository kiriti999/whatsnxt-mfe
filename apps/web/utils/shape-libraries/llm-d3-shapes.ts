/**
 * LLM / Generative AI Shape Library
 * Covers L3 topics: Tokens, Prompts, RAG, Embeddings, Fine-tuning, Agents, Chains, Context Windows
 */
import * as d3 from 'd3';

export interface LLMShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const llmD3Shapes: Record<string, LLMShapeDefinition> = {
    llmmodel: {
        id: 'llm-model',
        name: 'LLM Model',
        type: 'llmmodel',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Brain-like neural network
            const layers = [[0.2], [0.15, 0.4], [0.1, 0.28, 0.46], [0.15, 0.4], [0.2]];
            layers.forEach((ys, li) => {
                const x = 0.15 + li * 0.175;
                ys.forEach((yOff) => {
                    const y = yOff + 0.18;
                    g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 4).attr('fill', '#8e44ad').attr('opacity', 0.7);
                });
            });
            // Connections
            layers.forEach((ys, li) => {
                if (li < layers.length - 1) {
                    const nextYs = layers[li + 1];
                    const x1 = 0.15 + li * 0.175;
                    const x2 = 0.15 + (li + 1) * 0.175;
                    ys.forEach((y1Off) => {
                        nextYs.forEach((y2Off) => {
                            g.append('line')
                                .attr('x1', width * x1).attr('y1', height * (y1Off + 0.18))
                                .attr('x2', width * x2).attr('y2', height * (y2Off + 0.18))
                                .attr('stroke', '#d7bde2').attr('stroke-width', 0.5);
                        });
                    });
                }
            });
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 8).attr('font-weight', 'bold').text('LLM');
        },
    },

    prompt: {
        id: 'llm-prompt',
        name: 'Prompt',
        type: 'prompt',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Chat bubble
            g.append('path')
                .attr('d', `M${width * 0.08},${height * 0.08} L${width * 0.92},${height * 0.08} L${width * 0.92},${height * 0.7} L${width * 0.35},${height * 0.7} L${width * 0.2},${height * 0.92} L${width * 0.2},${height * 0.7} L${width * 0.08},${height * 0.7} Z`)
                .attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2).attr('rx', 6);
            // Prompt text lines
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.28).attr('fill', '#2e86c1').attr('font-size', 6).text('System:');
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.38).attr('x2', width * 0.8).attr('y2', height * 0.38).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.5).attr('fill', '#27ae60').attr('font-size', 6).text('User:');
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.58).attr('x2', width * 0.7).attr('y2', height * 0.58).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
        },
    },

    tokenwindow: {
        id: 'llm-tokens',
        name: 'Token Window',
        type: 'tokenwindow',
        width: 60,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Token boxes
            const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
            tokens.forEach((tok, i) => {
                const x = 0.04 + (i % 6) * 0.155;
                const y = i < 6 ? 0.15 : 0.55;
                const colors = ['#3498db', '#27ae60', '#e74c3c', '#f39c12', '#8e44ad', '#1abc9c'];
                g.append('rect').attr('x', width * x).attr('y', height * y).attr('width', width * 0.14).attr('height', height * 0.3).attr('rx', 2).attr('fill', colors[i]).attr('opacity', 0.7);
                g.append('text').attr('x', width * (x + 0.07)).attr('y', height * (y + 0.2)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text(tok);
            });
            // Context window bar
            g.append('rect').attr('x', width * 0.04).attr('y', height * 0.72).attr('width', width * 0.92).attr('height', height * 0.12).attr('rx', 2).attr('fill', '#ecf0f1');
            g.append('rect').attr('x', width * 0.04).attr('y', height * 0.72).attr('width', width * 0.45).attr('height', height * 0.12).attr('rx', 2).attr('fill', '#f1c40f');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.93).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('2k / 4k tokens');
        },
    },

    ragpipeline: {
        id: 'llm-rag',
        name: 'RAG Pipeline',
        type: 'ragpipeline',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Query → Retriever → Context → LLM → Response
            // Query
            g.append('rect').attr('x', width * 0.02).attr('y', height * 0.25).attr('width', width * 0.15).attr('height', height * 0.5).attr('rx', 3).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.095).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('Q');
            // Arrow
            g.append('line').attr('x1', width * 0.17).attr('y1', height * 0.5).attr('x2', width * 0.22).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // Vector DB / Retriever
            g.append('ellipse').attr('cx', width * 0.32).attr('cy', height * 0.5).attr('rx', width * 0.08).attr('ry', height * 0.22).attr('fill', '#f39c12').attr('stroke', '#d35400').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.32).attr('y', height * 0.45).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 4).text('Vec');
            g.append('text').attr('x', width * 0.32).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 4).text('DB');
            // Arrow
            g.append('line').attr('x1', width * 0.4).attr('y1', height * 0.5).attr('x2', width * 0.45).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // Context
            g.append('rect').attr('x', width * 0.45).attr('y', height * 0.2).attr('width', width * 0.18).attr('height', height * 0.6).attr('rx', 3).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.54).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 4).text('Ctx');
            g.append('text').attr('x', width * 0.54).attr('y', height * 0.58).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 4).text('+Q');
            // Arrow
            g.append('line').attr('x1', width * 0.63).attr('y1', height * 0.5).attr('x2', width * 0.68).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // LLM
            g.append('circle').attr('cx', width * 0.77).attr('cy', height * 0.5).attr('r', width * 0.08).attr('fill', '#8e44ad');
            g.append('text').attr('x', width * 0.77).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('LLM');
            // Arrow
            g.append('line').attr('x1', width * 0.85).attr('y1', height * 0.5).attr('x2', width * 0.88).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // Response
            g.append('rect').attr('x', width * 0.88).attr('y', height * 0.3).attr('width', width * 0.1).attr('height', height * 0.4).attr('rx', 3).attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.93).attr('y', height * 0.54).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('A');
        },
    },

    embedding: {
        id: 'llm-embed',
        name: 'Embedding',
        type: 'embedding',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Vector space with dots
            const points = [
                [0.2, 0.25, '#3498db'], [0.25, 0.3, '#3498db'], [0.3, 0.2, '#3498db'],
                [0.6, 0.7, '#e74c3c'], [0.65, 0.65, '#e74c3c'], [0.7, 0.75, '#e74c3c'],
                [0.2, 0.7, '#27ae60'], [0.3, 0.65, '#27ae60'],
                [0.7, 0.25, '#f39c12'], [0.75, 0.35, '#f39c12'],
            ];
            points.forEach(([x, y, color]) => {
                g.append('circle').attr('cx', width * (x as number)).attr('cy', height * (y as number)).attr('r', 3).attr('fill', color as string).attr('opacity', 0.8);
            });
            // Axes
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.92).attr('x2', width * 0.08).attr('y2', height * 0.08).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.92).attr('x2', width * 0.92).attr('y2', height * 0.92).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            // Dimension labels
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.99).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('dim₁');
            g.append('text').attr('x', width * 0.04).attr('y', height * 0.5).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('d₂');
        },
    },

    chain: {
        id: 'llm-chain',
        name: 'Chain',
        type: 'chain',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Chain links as connected steps
            const steps = [
                { x: 0.05, label: 'Parse', color: '#3498db' },
                { x: 0.28, label: 'Think', color: '#8e44ad' },
                { x: 0.51, label: 'Act', color: '#27ae60' },
                { x: 0.74, label: 'Out', color: '#e67e22' },
            ];
            steps.forEach(({ x, label, color }, i) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.2).attr('width', width * 0.2).attr('height', height * 0.6).attr('rx', 4).attr('fill', color);
                g.append('text').attr('x', width * (x + 0.1)).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text(label);
                if (i < 3) {
                    // Chain arrow
                    g.append('line').attr('x1', width * (x + 0.2)).attr('y1', height * 0.5).attr('x2', width * (x + 0.28)).attr('y2', height * 0.5).attr('stroke', '#bdc3c7').attr('stroke-width', 1.5);
                    g.append('polygon')
                        .attr('points', `${width * (x + 0.28)},${height * 0.5} ${width * (x + 0.25)},${height * 0.4} ${width * (x + 0.25)},${height * 0.6}`)
                        .attr('fill', '#bdc3c7');
                }
            });
        },
    },

    agent: {
        id: 'llm-agent',
        name: 'AI Agent',
        type: 'agent',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 10).attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Robot head
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.1).attr('width', width * 0.5).attr('height', height * 0.4).attr('rx', 6).attr('fill', '#2e86c1');
            // Eyes
            g.append('circle').attr('cx', width * 0.38).attr('cy', height * 0.28).attr('r', 4).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.38).attr('cy', height * 0.28).attr('r', 2).attr('fill', '#2c3e50');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.28).attr('r', 4).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.62).attr('cy', height * 0.28).attr('r', 2).attr('fill', '#2c3e50');
            // Antenna
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.1).attr('x2', width * 0.5).attr('y2', height * 0.02).attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.02).attr('r', 3).attr('fill', '#f1c40f');
            // Mouth / speaker
            g.append('line').attr('x1', width * 0.35).attr('y1', height * 0.42).attr('x2', width * 0.65).attr('y2', height * 0.42).attr('stroke', '#fff').attr('stroke-width', 1);
            // Tool belt
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.58).attr('width', width * 0.7).attr('height', height * 0.15).attr('rx', 3).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.69).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('🔧 🔍 📝');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.9).attr('text-anchor', 'middle').attr('fill', '#2e86c1').attr('font-size', 7).text('Agent');
        },
    },

    finetune: {
        id: 'llm-finetune',
        name: 'Fine-Tune',
        type: 'finetune',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Base model
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.08).attr('width', width * 0.35).attr('height', height * 0.35).attr('rx', 4).attr('fill', '#e74c3c').attr('opacity', 0.3);
            g.append('text').attr('x', width * 0.255).attr('y', height * 0.3).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 6).text('Base');
            // Plus arrow
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.3).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 12).text('+');
            // Data
            g.append('rect').attr('x', width * 0.57).attr('y', height * 0.08).attr('width', width * 0.35).attr('height', height * 0.35).attr('rx', 4).attr('fill', '#3498db').attr('opacity', 0.3);
            g.append('text').attr('x', width * 0.745).attr('y', height * 0.3).attr('text-anchor', 'middle').attr('fill', '#3498db').attr('font-size', 6).text('Data');
            // Training arrow
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.48).attr('x2', width * 0.5).attr('y2', height * 0.62).attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.62} ${width * 0.44},${height * 0.56} ${width * 0.56},${height * 0.56}`)
                .attr('fill', '#f39c12');
            // Tuned model
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.65).attr('width', width * 0.6).attr('height', height * 0.28).attr('rx', 4).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).attr('font-weight', 'bold').text('Tuned');
        },
    },
};

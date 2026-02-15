/**
 * Data Structures & Algorithms Shape Library
 * Covers: Data Structures, Algorithms, Complexity Analysis, Problem-Solving
 */
import * as d3 from 'd3';

export interface DSAShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const dsaD3Shapes: Record<string, DSAShapeDefinition> = {
    array: {
        id: 'dsa-array',
        name: 'Array',
        type: 'array',
        width: 75,
        height: 40,
        render: (g, width, height) => {
            // Array cells
            const cells = 5;
            const cellW = width / cells;
            for (let i = 0; i < cells; i++) {
                g.append('rect').attr('x', i * cellW).attr('y', height * 0.15).attr('width', cellW).attr('height', height * 0.7).attr('fill', i === 2 ? '#3498db' : '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
                g.append('text').attr('x', i * cellW + cellW / 2).attr('y', height * 0.6).attr('text-anchor', 'middle').attr('fill', i === 2 ? '#fff' : '#2e86c1').attr('font-size', 9).text(`${i}`);
            }
        },
    },

    linkedlist: {
        id: 'dsa-linkedlist',
        name: 'Linked List',
        type: 'linkedlist',
        width: 80,
        height: 40,
        render: (g, width, height) => {
            // Nodes with arrows
            [0, 0.28, 0.56].forEach((x) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.2).attr('width', width * 0.2).attr('height', height * 0.6).attr('rx', 3).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 1.5);
                g.append('line').attr('x1', width * (x + 0.14)).attr('y1', height * 0.2).attr('x2', width * (x + 0.14)).attr('y2', height * 0.8).attr('stroke', '#27ae60').attr('stroke-width', 1);
                // Pointer dot
                g.append('circle').attr('cx', width * (x + 0.17)).attr('cy', height * 0.5).attr('r', 2.5).attr('fill', '#27ae60');
            });
            // Arrows between nodes
            [0.2, 0.48].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.5).attr('x2', width * (x + 0.08)).attr('y2', height * 0.5).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
                g.append('polygon').attr('points', `${width * (x + 0.08)},${height * 0.5} ${width * (x + 0.05)},${height * 0.4} ${width * (x + 0.05)},${height * 0.6}`).attr('fill', '#27ae60');
            });
            // Null at end
            g.append('text').attr('x', width * 0.82).attr('y', height * 0.55).attr('fill', '#e74c3c').attr('font-size', 8).text('null');
        },
    },

    stack: {
        id: 'dsa-stack',
        name: 'Stack',
        type: 'stack',
        width: 45,
        height: 65,
        render: (g, width, height) => {
            // Stack container
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.05).attr('width', width * 0.8).attr('height', height * 0.9).attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Stack items
            const items = [0.7, 0.5, 0.3];
            items.forEach((y, i) => {
                g.append('rect').attr('x', width * 0.15).attr('y', height * y).attr('width', width * 0.7).attr('height', height * 0.17).attr('rx', 2).attr('fill', i === 0 ? '#8e44ad' : '#d7bde2').attr('stroke', '#8e44ad').attr('stroke-width', 1);
            });
            // Top arrow
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.02} ${width * 0.4},${height * 0.12} ${width * 0.6},${height * 0.12}`)
                .attr('fill', '#8e44ad');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.2).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 6).text('TOP');
        },
    },

    queue: {
        id: 'dsa-queue',
        name: 'Queue',
        type: 'queue',
        width: 75,
        height: 40,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', 'none').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Queue items
            [0.05, 0.25, 0.45, 0.65].forEach((x, i) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.15).attr('width', width * 0.17).attr('height', height * 0.7).attr('rx', 2).attr('fill', i === 0 ? '#e67e22' : '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 1);
            });
            // Enqueue arrow
            g.append('polygon')
                .attr('points', `${width * 0.95},${height * 0.5} ${width * 0.88},${height * 0.35} ${width * 0.88},${height * 0.65}`)
                .attr('fill', '#27ae60');
            // Dequeue arrow
            g.append('line').attr('x1', width * 0.05).attr('y1', height * 0.5).attr('x2', 0).attr('y2', height * 0.5).attr('stroke', '#e74c3c').attr('stroke-width', 2);
        },
    },

    binarytree: {
        id: 'dsa-bintree',
        name: 'Binary Tree',
        type: 'binarytree',
        width: 65,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Tree edges
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.18).attr('x2', width * 0.25).attr('y2', height * 0.45).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.18).attr('x2', width * 0.75).attr('y2', height * 0.45).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.45).attr('x2', width * 0.13).attr('y2', height * 0.72).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.25).attr('y1', height * 0.45).attr('x2', width * 0.38).attr('y2', height * 0.72).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.45).attr('x2', width * 0.63).attr('y2', height * 0.72).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.75).attr('y1', height * 0.45).attr('x2', width * 0.88).attr('y2', height * 0.72).attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            // Nodes
            [[0.5, 0.18], [0.25, 0.45], [0.75, 0.45], [0.13, 0.72], [0.38, 0.72], [0.63, 0.72], [0.88, 0.72]].forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 6).attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            });
        },
    },

    graph: {
        id: 'dsa-graph',
        name: 'Graph',
        type: 'graph',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Nodes
            const nodes = [[0.2, 0.2], [0.8, 0.2], [0.15, 0.65], [0.5, 0.8], [0.85, 0.65], [0.5, 0.45]];
            // Edges
            const edges = [[0, 1], [0, 2], [0, 5], [1, 4], [1, 5], [2, 3], [3, 4], [3, 5], [4, 5]];
            edges.forEach(([i, j]) => {
                g.append('line').attr('x1', width * nodes[i][0]).attr('y1', height * nodes[i][1]).attr('x2', width * nodes[j][0]).attr('y2', height * nodes[j][1]).attr('stroke', '#2e86c1').attr('stroke-width', 1).attr('opacity', 0.5);
            });
            nodes.forEach(([x, y]) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 5).attr('fill', '#2e86c1').attr('stroke', '#1f618d').attr('stroke-width', 1);
            });
        },
    },

    hashtable: {
        id: 'dsa-hash',
        name: 'Hash Table',
        type: 'hashtable',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#e8f8f5').attr('stroke', '#1abc9c').attr('stroke-width', 2);
            // Buckets
            [0.1, 0.3, 0.5, 0.7].forEach((y, i) => {
                g.append('rect').attr('x', width * 0.08).attr('y', height * y).attr('width', width * 0.25).attr('height', height * 0.15).attr('fill', '#1abc9c').attr('rx', 1);
                g.append('text').attr('x', width * 0.2).attr('y', height * (y + 0.11)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 7).text(`${i}`);
                // Chain
                if (i < 3) {
                    g.append('line').attr('x1', width * 0.33).attr('y1', height * (y + 0.075)).attr('x2', width * 0.45).attr('y2', height * (y + 0.075)).attr('stroke', '#1abc9c').attr('stroke-width', 1);
                    g.append('rect').attr('x', width * 0.45).attr('y', height * y).attr('width', width * 0.2).attr('height', height * 0.15).attr('fill', '#a3e4d7').attr('stroke', '#1abc9c').attr('stroke-width', 0.5).attr('rx', 1);
                    if (i === 1) {
                        g.append('line').attr('x1', width * 0.65).attr('y1', height * (y + 0.075)).attr('x2', width * 0.72).attr('y2', height * (y + 0.075)).attr('stroke', '#1abc9c').attr('stroke-width', 1);
                        g.append('rect').attr('x', width * 0.72).attr('y', height * y).attr('width', width * 0.2).attr('height', height * 0.15).attr('fill', '#a3e4d7').attr('stroke', '#1abc9c').attr('stroke-width', 0.5).attr('rx', 1);
                    }
                }
            });
        },
    },

    heap: {
        id: 'dsa-heap',
        name: 'Heap',
        type: 'heap',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Heap tree (min heap) - triangle shape
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.12} ${width * 0.12},${height * 0.88} ${width * 0.88},${height * 0.88}`)
                .attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
            // Nodes in heap order
            const positions = [[0.5, 0.2], [0.3, 0.45], [0.7, 0.45], [0.18, 0.72], [0.42, 0.72], [0.58, 0.72], [0.82, 0.72]];
            // Edges
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.2).attr('x2', width * 0.3).attr('y2', height * 0.45).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.2).attr('x2', width * 0.7).attr('y2', height * 0.45).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.45).attr('x2', width * 0.18).attr('y2', height * 0.72).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.3).attr('y1', height * 0.45).attr('x2', width * 0.42).attr('y2', height * 0.72).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.7).attr('y1', height * 0.45).attr('x2', width * 0.58).attr('y2', height * 0.72).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.7).attr('y1', height * 0.45).attr('x2', width * 0.82).attr('y2', height * 0.72).attr('stroke', '#e74c3c').attr('stroke-width', 1);
            positions.forEach(([x, y], i) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 6).attr('fill', i === 0 ? '#e74c3c' : '#f5b7b1').attr('stroke', '#c0392b').attr('stroke-width', 1);
            });
        },
    },

    bigo: {
        id: 'dsa-bigo',
        name: 'Big O',
        type: 'bigo',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Complexity curves
            // O(1) - flat
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.7).attr('x2', width * 0.85).attr('y2', height * 0.7).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            // O(log n) - gentle
            g.append('path').attr('d', `M${width * 0.15},${height * 0.7} Q${width * 0.35},${height * 0.45} ${width * 0.85},${height * 0.4}`).attr('fill', 'none').attr('stroke', '#3498db').attr('stroke-width', 1.5);
            // O(n) - linear
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.7).attr('x2', width * 0.85).attr('y2', height * 0.2).attr('stroke', '#f39c12').attr('stroke-width', 1.5);
            // O(n²) - steep
            g.append('path').attr('d', `M${width * 0.15},${height * 0.7} Q${width * 0.45},${height * 0.65} ${width * 0.65},${height * 0.15}`).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            // Axes
            g.append('line').attr('x1', width * 0.12).attr('y1', height * 0.1).attr('x2', width * 0.12).attr('y2', height * 0.8).attr('stroke', '#8e44ad').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.12).attr('y1', height * 0.8).attr('x2', width * 0.9).attr('y2', height * 0.8).attr('stroke', '#8e44ad').attr('stroke-width', 1);
        },
    },
};

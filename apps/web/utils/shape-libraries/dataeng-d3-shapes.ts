/**
 * Data Engineering Shape Library
 * Covers L3 topics: ETL, DAGs, Streaming, Batch Processing, Data Lakes, Connectors, Spark, Kafka
 */
import * as d3 from 'd3';

export interface DataEngShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const dataengD3Shapes: Record<string, DataEngShapeDefinition> = {
    dag: {
        id: 'de-dag',
        name: 'DAG',
        type: 'dag',
        width: 65,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // DAG nodes
            const nodes = [
                [0.15, 0.2], [0.15, 0.55], [0.45, 0.2], [0.45, 0.55], [0.75, 0.38],
            ];
            // Edges (directed)
            const edges: number[][] = [[0, 2], [0, 3], [1, 3], [2, 4], [3, 4]];
            edges.forEach(([from, to]) => {
                const [x1, y1] = nodes[from];
                const [x2, y2] = nodes[to];
                g.append('line').attr('x1', width * x1).attr('y1', height * y1).attr('x2', width * x2).attr('y2', height * y2).attr('stroke', '#2e86c1').attr('stroke-width', 1.5).attr('marker-end', 'url(#de-arrow)');
            });
            // Arrowhead marker
            g.append('defs').append('marker').attr('id', 'de-arrow').attr('viewBox', '0 0 6 6').attr('refX', 6).attr('refY', 3).attr('markerWidth', 4).attr('markerHeight', 4).attr('orient', 'auto')
                .append('path').attr('d', 'M0,0 L6,3 L0,6 Z').attr('fill', '#2e86c1');
            // Node circles
            const colors = ['#3498db', '#3498db', '#f39c12', '#f39c12', '#27ae60'];
            nodes.forEach(([x, y], i) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 8).attr('fill', colors[i]).attr('stroke', '#2c3e50').attr('stroke-width', 1);
                g.append('text').attr('x', width * x).attr('y', height * y + 3).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text(`T${i + 1}`);
            });
        },
    },

    etlpipeline: {
        id: 'de-etl',
        name: 'ETL Pipeline',
        type: 'etlpipeline',
        width: 75,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // E - Extract
            g.append('rect').attr('x', width * 0.03).attr('y', height * 0.15).attr('width', width * 0.22).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.14).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('E');
            g.append('text').attr('x', width * 0.14).attr('y', height * 0.65).attr('text-anchor', 'middle').attr('fill', '#d6eaf8').attr('font-size', 5).text('Extract');
            // Arrow
            g.append('polygon')
                .attr('points', `${width * 0.28},${height * 0.5} ${width * 0.33},${height * 0.35} ${width * 0.33},${height * 0.65}`)
                .attr('fill', '#27ae60');
            // T - Transform
            g.append('rect').attr('x', width * 0.36).attr('y', height * 0.15).attr('width', width * 0.22).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.47).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('T');
            g.append('text').attr('x', width * 0.47).attr('y', height * 0.65).attr('text-anchor', 'middle').attr('fill', '#fef9e7').attr('font-size', 5).text('Transform');
            // Arrow
            g.append('polygon')
                .attr('points', `${width * 0.61},${height * 0.5} ${width * 0.66},${height * 0.35} ${width * 0.66},${height * 0.65}`)
                .attr('fill', '#27ae60');
            // L - Load
            g.append('rect').attr('x', width * 0.69).attr('y', height * 0.15).attr('width', width * 0.22).attr('height', height * 0.7).attr('rx', 4).attr('fill', '#27ae60');
            g.append('text').attr('x', width * 0.8).attr('y', height * 0.42).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('L');
            g.append('text').attr('x', width * 0.8).attr('y', height * 0.65).attr('text-anchor', 'middle').attr('fill', '#d5f5e3').attr('font-size', 5).text('Load');
        },
    },

    datastream: {
        id: 'de-stream',
        name: 'Data Stream',
        type: 'datastream',
        width: 70,
        height: 40,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Stream of data events
            const events = 8;
            for (let i = 0; i < events; i++) {
                const x = 0.06 + i * 0.115;
                const size = 3 + Math.random() * 2;
                const yPos = 0.4 + (i % 2 === 0 ? -0.1 : 0.1);
                g.append('circle').attr('cx', width * x).attr('cy', height * yPos).attr('r', size).attr('fill', '#8e44ad').attr('opacity', 0.3 + i * 0.08);
            }
            // Flow arrow underneath
            g.append('path')
                .attr('d', `M${width * 0.05},${height * 0.75} Q${width * 0.3},${height * 0.65} ${width * 0.5},${height * 0.75} Q${width * 0.7},${height * 0.85} ${width * 0.95},${height * 0.75}`)
                .attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
            g.append('polygon')
                .attr('points', `${width * 0.95},${height * 0.75} ${width * 0.9},${height * 0.65} ${width * 0.9},${height * 0.85}`)
                .attr('fill', '#8e44ad');
        },
    },

    datalake: {
        id: 'de-lake',
        name: 'Data Lake',
        type: 'datalake',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            // Lake shape
            g.append('ellipse').attr('cx', width / 2).attr('cy', height * 0.65).attr('rx', width * 0.45).attr('ry', height * 0.3).attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Waves
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.55} Q${width * 0.3},${height * 0.48} ${width * 0.45},${height * 0.55} Q${width * 0.6},${height * 0.62} ${width * 0.75},${height * 0.55}`)
                .attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 1).attr('opacity', 0.5);
            // Data items floating
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.62).attr('width', 8).attr('height', 6).attr('fill', '#3498db').attr('opacity', 0.6);
            g.append('circle').attr('cx', width * 0.55).attr('cy', height * 0.68).attr('r', 4).attr('fill', '#f39c12').attr('opacity', 0.6);
            g.append('polygon')
                .attr('points', `${width * 0.7},${height * 0.6} ${width * 0.75},${height * 0.72} ${width * 0.65},${height * 0.72}`)
                .attr('fill', '#e74c3c').attr('opacity', 0.6);
            // Data streams flowing in
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.1).attr('x2', width * 0.25).attr('y2', height * 0.4).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.05).attr('x2', width * 0.5).attr('y2', height * 0.38).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.85).attr('y1', height * 0.1).attr('x2', width * 0.75).attr('y2', height * 0.4).attr('stroke', '#27ae60').attr('stroke-width', 1.5);
        },
    },

    batchjob: {
        id: 'de-batch',
        name: 'Batch Job',
        type: 'batchjob',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Stacked documents
            [0.18, 0.12, 0.06].forEach((offset, i) => {
                g.append('rect').attr('x', width * (0.15 + offset)).attr('y', height * (0.08 + offset * 2)).attr('width', width * 0.55).attr('height', height * 0.45).attr('rx', 3).attr('fill', i === 2 ? '#f1c40f' : '#fce79f').attr('stroke', '#d4ac0d').attr('stroke-width', 0.5);
            });
            // Clock
            g.append('circle').attr('cx', width * 0.72).attr('cy', height * 0.7).attr('r', width * 0.15).attr('fill', '#fff').attr('stroke', '#f1c40f').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.72).attr('y1', height * 0.7).attr('x2', width * 0.72).attr('y2', height * 0.58).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.72).attr('y1', height * 0.7).attr('x2', width * 0.8).attr('y2', height * 0.7).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
            // Label
            g.append('text').attr('x', width * 0.3).attr('y', height * 0.88).attr('fill', '#d4ac0d').attr('font-size', 7).text('batch');
        },
    },

    connector: {
        id: 'de-connector',
        name: 'Connector',
        type: 'connector',
        width: 55,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Left plug
            g.append('rect').attr('x', 0).attr('y', height * 0.3).attr('width', width * 0.15).attr('height', height * 0.4).attr('rx', 2).attr('fill', '#e74c3c');
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.35).attr('width', width * 0.08).attr('height', height * 0.1).attr('fill', '#f5b7b1');
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.55).attr('width', width * 0.08).attr('height', height * 0.1).attr('fill', '#f5b7b1');
            // Connection line
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.5).attr('x2', width * 0.85).attr('y2', height * 0.5).attr('stroke', '#e74c3c').attr('stroke-width', 2).attr('stroke-dasharray', '4,2');
            // Right socket
            g.append('rect').attr('x', width * 0.85).attr('y', height * 0.3).attr('width', width * 0.15).attr('height', height * 0.4).attr('rx', 2).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.87).attr('y', height * 0.35).attr('width', width * 0.08).attr('height', height * 0.1).attr('fill', '#d6eaf8');
            g.append('rect').attr('x', width * 0.87).attr('y', height * 0.55).attr('width', width * 0.08).attr('height', height * 0.1).attr('fill', '#d6eaf8');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 6).text('Connector');
        },
    },

    warehouse: {
        id: 'de-warehouse',
        name: 'Data Warehouse',
        type: 'warehouse',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Building/warehouse shape
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.25).attr('width', width * 0.84).attr('height', height * 0.65).attr('rx', 2).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Roof
            g.append('polygon')
                .attr('points', `${width * 0.05},${height * 0.25} ${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.25}`)
                .attr('fill', '#34495e').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Stacked data layers (horizontal stripes)
            [0.35, 0.5, 0.65, 0.78].forEach((y, i) => {
                const colors = ['#3498db', '#27ae60', '#f39c12', '#e74c3c'];
                g.append('rect').attr('x', width * 0.15).attr('y', height * y).attr('width', width * 0.7).attr('height', height * 0.1).attr('rx', 1).attr('fill', colors[i]).attr('opacity', 0.6);
            });
            // Door
            g.append('rect').attr('x', width * 0.4).attr('y', height * 0.68).attr('width', width * 0.2).attr('height', height * 0.22).attr('rx', 2).attr('fill', '#f1c40f');
        },
    },

    sparkjob: {
        id: 'de-spark',
        name: 'Spark Job',
        type: 'sparkjob',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Lightning bolt / spark
            g.append('polygon')
                .attr('points', `${width * 0.45},${height * 0.05} ${width * 0.25},${height * 0.45} ${width * 0.42},${height * 0.45} ${width * 0.35},${height * 0.75} ${width * 0.72},${height * 0.32} ${width * 0.52},${height * 0.32}`)
                .attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
            // Partitions
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.92).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 6).text('Partitions: 8');
        },
    },
};

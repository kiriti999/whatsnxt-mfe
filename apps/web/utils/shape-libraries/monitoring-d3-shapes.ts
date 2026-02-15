/**
 * Monitoring & Observability Shape Library
 * Covers L3 topics: Prometheus, Grafana, ELK, Jaeger, Datadog, Metrics, Logs, Traces, Alerts
 */
import * as d3 from 'd3';

export interface MonitoringShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const monitoringD3Shapes: Record<string, MonitoringShapeDefinition> = {
    dashboard: {
        id: 'mon-dashboard',
        name: 'Dashboard',
        type: 'dashboard',
        width: 70,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Top bar
            g.append('rect').attr('width', width).attr('height', height * 0.12).attr('rx', 4).attr('fill', '#34495e');
            g.append('circle').attr('cx', width * 0.04).attr('cy', height * 0.06).attr('r', 2).attr('fill', '#2ecc71');
            // Chart panels
            // Line chart
            g.append('rect').attr('x', width * 0.04).attr('y', height * 0.18).attr('width', width * 0.44).attr('height', height * 0.36).attr('rx', 2).attr('fill', '#34495e');
            g.append('path')
                .attr('d', `M${width * 0.08},${height * 0.48} L${width * 0.18},${height * 0.32} L${width * 0.28},${height * 0.42} L${width * 0.38},${height * 0.25} L${width * 0.44},${height * 0.35}`)
                .attr('fill', 'none').attr('stroke', '#2ecc71').attr('stroke-width', 1.5);
            // Bar chart
            g.append('rect').attr('x', width * 0.52).attr('y', height * 0.18).attr('width', width * 0.44).attr('height', height * 0.36).attr('rx', 2).attr('fill', '#34495e');
            [0.56, 0.64, 0.72, 0.8, 0.88].forEach((x, i) => {
                const h = [0.2, 0.28, 0.15, 0.32, 0.22][i];
                g.append('rect').attr('x', width * x).attr('y', height * (0.48 - h)).attr('width', width * 0.05).attr('height', height * h).attr('fill', '#3498db');
            });
            // Metric cards
            g.append('rect').attr('x', width * 0.04).attr('y', height * 0.6).attr('width', width * 0.28).attr('height', height * 0.32).attr('rx', 2).attr('fill', '#34495e');
            g.append('text').attr('x', width * 0.18).attr('y', height * 0.78).attr('text-anchor', 'middle').attr('fill', '#2ecc71').attr('font-size', 9).attr('font-weight', 'bold').text('99.9%');
            g.append('rect').attr('x', width * 0.36).attr('y', height * 0.6).attr('width', width * 0.28).attr('height', height * 0.32).attr('rx', 2).attr('fill', '#34495e');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.78).attr('text-anchor', 'middle').attr('fill', '#f39c12').attr('font-size', 9).attr('font-weight', 'bold').text('42ms');
            g.append('rect').attr('x', width * 0.68).attr('y', height * 0.6).attr('width', width * 0.28).attr('height', height * 0.32).attr('rx', 2).attr('fill', '#34495e');
            g.append('text').attr('x', width * 0.82).attr('y', height * 0.78).attr('text-anchor', 'middle').attr('fill', '#e74c3c').attr('font-size', 9).attr('font-weight', 'bold').text('3');
        },
    },

    metric: {
        id: 'mon-metric',
        name: 'Metric',
        type: 'metric',
        width: 50,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Gauge
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.65} A${width * 0.35},${height * 0.35} 0 0 1 ${width * 0.85},${height * 0.65}`)
                .attr('fill', 'none').attr('stroke', '#ecf0f1').attr('stroke-width', 4);
            g.append('path')
                .attr('d', `M${width * 0.15},${height * 0.65} A${width * 0.35},${height * 0.35} 0 0 1 ${width * 0.7},${height * 0.32}`)
                .attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 4).attr('stroke-linecap', 'round');
            // Needle
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.65).attr('x2', width * 0.65).attr('y2', height * 0.38).attr('stroke', '#2c3e50').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.65).attr('r', 3).attr('fill', '#2c3e50');
            // Value
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 8).attr('font-weight', 'bold').text('78%');
        },
    },

    logstream: {
        id: 'mon-log',
        name: 'Log Stream',
        type: 'logstream',
        width: 65,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Log lines
            const logs = [
                { level: 'INFO', color: '#2ecc71', msg: 'Server started' },
                { level: 'WARN', color: '#f39c12', msg: 'High memory' },
                { level: 'ERR', color: '#e74c3c', msg: 'Timeout 500' },
                { level: 'INFO', color: '#2ecc71', msg: 'Request OK' },
                { level: 'DBG', color: '#3498db', msg: 'Query took 3ms' },
            ];
            logs.forEach(({ level, color, msg }, i) => {
                const y = 0.1 + i * 0.17;
                g.append('text').attr('x', width * 0.04).attr('y', height * (y + 0.06)).attr('fill', '#7f8c8d').attr('font-size', 5).text('12:34');
                g.append('text').attr('x', width * 0.24).attr('y', height * (y + 0.06)).attr('fill', color).attr('font-size', 5).attr('font-weight', 'bold').text(level);
                g.append('text').attr('x', width * 0.45).attr('y', height * (y + 0.06)).attr('fill', '#bdc3c7').attr('font-size', 5).text(msg);
            });
        },
    },

    trace: {
        id: 'mon-trace',
        name: 'Trace / Span',
        type: 'trace',
        width: 70,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Waterfall trace spans
            const spans = [
                { x: 0.05, w: 0.9, y: 0.12, color: '#3498db', label: 'HTTP Request' },
                { x: 0.1, w: 0.7, y: 0.3, color: '#27ae60', label: 'Auth Check' },
                { x: 0.15, w: 0.5, y: 0.48, color: '#f39c12', label: 'DB Query' },
                { x: 0.2, w: 0.3, y: 0.66, color: '#e74c3c', label: 'Cache Read' },
            ];
            spans.forEach(({ x, w, y, color, label }) => {
                g.append('rect').attr('x', width * x).attr('y', height * y).attr('width', width * w).attr('height', height * 0.14).attr('rx', 2).attr('fill', color).attr('opacity', 0.8);
                g.append('text').attr('x', width * (x + 0.02)).attr('y', height * (y + 0.1)).attr('fill', '#fff').attr('font-size', 5).text(label);
            });
            // Time axis
            g.append('line').attr('x1', width * 0.05).attr('y1', height * 0.88).attr('x2', width * 0.95).attr('y2', height * 0.88).attr('stroke', '#bdc3c7').attr('stroke-width', 0.5);
            g.append('text').attr('x', width * 0.05).attr('y', height * 0.96).attr('fill', '#95a5a6').attr('font-size', 4).text('0ms');
            g.append('text').attr('x', width * 0.85).attr('y', height * 0.96).attr('fill', '#95a5a6').attr('font-size', 4).text('120ms');
        },
    },

    alert: {
        id: 'mon-alert',
        name: 'Alert',
        type: 'alert',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            // Triangle alert
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.75} ${width * 0.05},${height * 0.75}`)
                .attr('fill', '#f39c12').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Exclamation mark
            g.append('rect').attr('x', width * 0.46).attr('y', height * 0.25).attr('width', width * 0.08).attr('height', height * 0.28).attr('rx', 2).attr('fill', '#fff');
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.62).attr('r', 3).attr('fill', '#fff');
            // Bell
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.85} Q${width * 0.3},${height * 0.78} ${width * 0.5},${height * 0.78} Q${width * 0.7},${height * 0.78} ${width * 0.7},${height * 0.85}`)
                .attr('fill', 'none').attr('stroke', '#e67e22').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.92).attr('r', 3).attr('fill', '#e67e22');
        },
    },

    healthcheck: {
        id: 'mon-health',
        name: 'Health Check',
        type: 'healthcheck',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Heartbeat line
            g.append('path')
                .attr('d', `M${width * 0.05},${height * 0.5} L${width * 0.2},${height * 0.5} L${width * 0.28},${height * 0.2} L${width * 0.36},${height * 0.7} L${width * 0.44},${height * 0.3} L${width * 0.52},${height * 0.65} L${width * 0.58},${height * 0.5} L${width * 0.95},${height * 0.5}`)
                .attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Heart icon
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.9} L${width * 0.3},${height * 0.76} Q${width * 0.2},${height * 0.7} ${width * 0.3},${height * 0.68} L${width * 0.5},${height * 0.78} L${width * 0.7},${height * 0.68} Q${width * 0.8},${height * 0.7} ${width * 0.7},${height * 0.76} Z`)
                .attr('fill', '#e74c3c');
        },
    },

    slo: {
        id: 'mon-slo',
        name: 'SLO / SLA',
        type: 'slo',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Target line
            g.append('line').attr('x1', width * 0.08).attr('y1', height * 0.28).attr('x2', width * 0.92).attr('y2', height * 0.28).attr('stroke', '#e74c3c').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');
            g.append('text').attr('x', width * 0.92).attr('y', height * 0.24).attr('text-anchor', 'end').attr('fill', '#e74c3c').attr('font-size', 5).text('99.9%');
            // Actual performance line
            g.append('path')
                .attr('d', `M${width * 0.08},${height * 0.22} L${width * 0.25},${height * 0.24} L${width * 0.42},${height * 0.2} L${width * 0.58},${height * 0.32} L${width * 0.75},${height * 0.26} L${width * 0.92},${height * 0.18}`)
                .attr('fill', 'none').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Error budget bar
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.55).attr('width', width * 0.84).attr('height', height * 0.15).attr('rx', 3).attr('fill', '#ecf0f1');
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.55).attr('width', width * 0.56).attr('height', height * 0.15).attr('rx', 3).attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.65).attr('text-anchor', 'middle').attr('fill', '#2c3e50').attr('font-size', 5).text('Error Budget');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#2e86c1').attr('font-size', 7).attr('font-weight', 'bold').text('SLO');
        },
    },

    collector: {
        id: 'mon-collector',
        name: 'Collector',
        type: 'collector',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Funnel shape
            g.append('polygon')
                .attr('points', `${width * 0.1},${height * 0.1} ${width * 0.9},${height * 0.1} ${width * 0.62},${height * 0.55} ${width * 0.38},${height * 0.55}`)
                .attr('fill', '#d7bde2').attr('stroke', '#8e44ad').attr('stroke-width', 1);
            // Data streams in
            [0.2, 0.4, 0.6, 0.8].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', 0).attr('x2', width * x).attr('y2', height * 0.1).attr('stroke', '#8e44ad').attr('stroke-width', 1.5);
                g.append('circle').attr('cx', width * x).attr('cy', height * 0.04).attr('r', 2).attr('fill', '#8e44ad');
            });
            // Pipe out
            g.append('rect').attr('x', width * 0.42).attr('y', height * 0.55).attr('width', width * 0.16).attr('height', height * 0.35).attr('fill', '#d7bde2').attr('stroke', '#8e44ad').attr('stroke-width', 1);
            // Output
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.92).attr('r', 4).attr('fill', '#8e44ad');
        },
    },
};

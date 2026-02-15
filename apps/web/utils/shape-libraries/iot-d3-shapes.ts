/**
 * IoT (Internet of Things) Shape Library
 * Covers L3 topics: Sensors, Actuators, Gateways, MQTT, Edge Computing, Embedded, Smart Home
 */
import * as d3 from 'd3';

export interface IoTShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const iotD3Shapes: Record<string, IoTShapeDefinition> = {
    sensor: {
        id: 'iot-sensor',
        name: 'Sensor',
        type: 'sensor',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Sensor chip
            g.append('rect').attr('x', width * 0.2).attr('y', height * 0.2).attr('width', width * 0.6).attr('height', height * 0.45).attr('rx', 4).attr('fill', '#2c3e50');
            // Pins
            [0.3, 0.5, 0.7].forEach((x) => {
                g.append('line').attr('x1', width * x).attr('y1', height * 0.65).attr('x2', width * x).attr('y2', height * 0.78).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
                g.append('line').attr('x1', width * x).attr('y1', height * 0.2).attr('x2', width * x).attr('y2', height * 0.1).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
            });
            // Signal indicator LED
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.42).attr('r', 5).attr('fill', '#2ecc71');
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.92).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 7).text('Temp');
        },
    },

    actuator: {
        id: 'iot-actuator',
        name: 'Actuator',
        type: 'actuator',
        width: 50,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Motor/actuator body
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.42).attr('r', width * 0.28).attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1.5);
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.42).attr('r', width * 0.12).attr('fill', '#fdf2e9');
            // Shaft
            g.append('rect').attr('x', width * 0.47).attr('y', height * 0.08).attr('width', width * 0.06).attr('height', height * 0.2).attr('fill', '#7f8c8d');
            // Arrow (rotation)
            g.append('path')
                .attr('d', `M${width * 0.7},${height * 0.3} A${width * 0.18},${height * 0.18} 0 0 1 ${width * 0.35},${height * 0.55}`)
                .attr('fill', 'none').attr('stroke', '#d35400').attr('stroke-width', 1.5);
            // Label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 6).text('Motor');
        },
    },

    gateway: {
        id: 'iot-gateway',
        name: 'IoT Gateway',
        type: 'gateway',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Antenna
            g.append('line').attr('x1', width * 0.5).attr('y1', 0).attr('x2', width * 0.5).attr('y2', height * 0.15).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
            g.append('circle').attr('cx', width * 0.5).attr('cy', 0).attr('r', 3).attr('fill', '#e74c3c');
            // WiFi arcs
            [0.08, 0.15, 0.22].forEach((r) => {
                g.append('path')
                    .attr('d', `M${width * (0.5 - r)},${height * 0.15} A${width * r},${height * r} 0 0 1 ${width * (0.5 + r)},${height * 0.15}`)
                    .attr('fill', 'none').attr('stroke', '#3498db').attr('stroke-width', 1).attr('opacity', 0.6);
            });
            // Status LEDs
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.35).attr('width', width * 0.84).attr('height', height * 0.25).attr('rx', 2).attr('fill', '#34495e');
            [0.15, 0.3, 0.45, 0.6, 0.75].forEach((x, i) => {
                const color = i < 3 ? '#2ecc71' : (i === 3 ? '#f39c12' : '#e74c3c');
                g.append('circle').attr('cx', width * x).attr('cy', height * 0.475).attr('r', 3).attr('fill', color);
            });
            // Ports
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.68).attr('width', width * 0.84).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#34495e');
            [0.15, 0.35, 0.55, 0.75].forEach((x) => {
                g.append('rect').attr('x', width * x).attr('y', height * 0.72).attr('width', width * 0.1).attr('height', height * 0.12).attr('fill', '#2c3e50');
            });
        },
    },

    mqttbroker: {
        id: 'iot-mqtt',
        name: 'MQTT Broker',
        type: 'mqttbroker',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#d6eaf8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Topic tree
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.22).attr('r', 8).attr('fill', '#2e86c1');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.25).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('M');
            // Pub/Sub branches
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.3).attr('x2', width * 0.2).attr('y2', height * 0.55).attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.3).attr('x2', width * 0.5).attr('y2', height * 0.55).attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.3).attr('x2', width * 0.8).attr('y2', height * 0.55).attr('stroke', '#2e86c1').attr('stroke-width', 1.5);
            // Subscribers
            [[0.2, 0.55], [0.5, 0.55], [0.8, 0.55]].forEach(([x, y], i) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * y).attr('r', 6).attr('fill', i === 1 ? '#27ae60' : '#f39c12');
                g.append('text').attr('x', width * x).attr('y', height * y + 3).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text(i === 1 ? 'P' : 'S');
            });
            // Topic path
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#2e86c1').attr('font-size', 6).text('home/temp');
        },
    },

    edgedevice: {
        id: 'iot-edge',
        name: 'Edge Device',
        type: 'edgedevice',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Mini computer board
            g.append('rect').attr('x', width * 0.1).attr('y', height * 0.12).attr('width', width * 0.8).attr('height', height * 0.58).attr('rx', 3).attr('fill', '#27ae60');
            // CPU chip on board
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.25).attr('width', width * 0.3).attr('height', height * 0.25).attr('fill', '#2c3e50');
            g.append('text').attr('x', width * 0.45).attr('y', height * 0.4).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 5).text('CPU');
            // Traces
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.55).attr('x2', width * 0.85).attr('y2', height * 0.55).attr('stroke', '#1e8449').attr('stroke-width', 0.5);
            g.append('line').attr('x1', width * 0.15).attr('y1', height * 0.62).attr('x2', width * 0.85).attr('y2', height * 0.62).attr('stroke', '#1e8449').attr('stroke-width', 0.5);
            // GPIO circles
            [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85].forEach((x) => {
                g.append('circle').attr('cx', width * x).attr('cy', height * 0.18).attr('r', 1.5).attr('fill', '#f1c40f');
            });
            // Edge label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.88).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 7).text('Edge');
        },
    },

    smartdevice: {
        id: 'iot-smart',
        name: 'Smart Device',
        type: 'smartdevice',
        width: 45,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#fdedec').attr('stroke', '#e74c3c').attr('stroke-width', 2);
            // Smart home light bulb
            g.append('path')
                .attr('d', `M${width * 0.3},${height * 0.5} Q${width * 0.3},${height * 0.15} ${width * 0.5},${height * 0.1} Q${width * 0.7},${height * 0.15} ${width * 0.7},${height * 0.5}`)
                .attr('fill', '#f1c40f').attr('stroke', '#d4ac0d').attr('stroke-width', 1);
            // Bulb glow
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.3).attr('r', width * 0.12).attr('fill', '#f9e79f').attr('opacity', 0.5);
            // Screw base
            [0.52, 0.58, 0.64].forEach((y) => {
                g.append('line').attr('x1', width * 0.32).attr('y1', height * y).attr('x2', width * 0.68).attr('y2', height * y).attr('stroke', '#7f8c8d').attr('stroke-width', 2);
            });
            // WiFi badge
            g.append('circle').attr('cx', width * 0.75).attr('cy', height * 0.8).attr('r', 6).attr('fill', '#3498db');
            g.append('text').attr('x', width * 0.75).attr('y', height * 0.83).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('📶');
        },
    },

    protocol: {
        id: 'iot-protocol',
        name: 'Protocol',
        type: 'protocol',
        width: 55,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // OSI layers simplified
            const layers = [
                { label: 'CoAP', color: '#3498db' },
                { label: 'UDP', color: '#27ae60' },
                { label: 'IP', color: '#f39c12' },
                { label: 'PHY', color: '#e74c3c' },
            ];
            layers.forEach(({ label, color }, i) => {
                const y = 0.08 + i * 0.22;
                g.append('rect').attr('x', width * 0.1).attr('y', height * y).attr('width', width * 0.8).attr('height', height * 0.18).attr('rx', 2).attr('fill', color).attr('opacity', 0.7);
                g.append('text').attr('x', width * 0.5).attr('y', height * (y + 0.13)).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text(label);
            });
        },
    },

    telemetry: {
        id: 'iot-telemetry',
        name: 'Telemetry',
        type: 'telemetry',
        width: 55,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Time-series chart
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.85).attr('x2', width * 0.9).attr('y2', height * 0.85).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.1).attr('x2', width * 0.1).attr('y2', height * 0.85).attr('stroke', '#bdc3c7').attr('stroke-width', 1);
            // Temperature line
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.5} L${width * 0.25},${height * 0.4} L${width * 0.38},${height * 0.55} L${width * 0.5},${height * 0.35} L${width * 0.65},${height * 0.45} L${width * 0.78},${height * 0.3} L${width * 0.9},${height * 0.42}`)
                .attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            // Humidity line
            g.append('path')
                .attr('d', `M${width * 0.1},${height * 0.65} L${width * 0.25},${height * 0.7} L${width * 0.38},${height * 0.6} L${width * 0.5},${height * 0.72} L${width * 0.65},${height * 0.62} L${width * 0.78},${height * 0.68} L${width * 0.9},${height * 0.58}`)
                .attr('fill', 'none').attr('stroke', '#3498db').attr('stroke-width', 1.5);
            // Legend
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.15).attr('x2', width * 0.3).attr('y2', height * 0.15).attr('stroke', '#e74c3c').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.33).attr('y', height * 0.18).attr('fill', '#e74c3c').attr('font-size', 5).text('°C');
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.15).attr('x2', width * 0.6).attr('y2', height * 0.15).attr('stroke', '#3498db').attr('stroke-width', 1.5);
            g.append('text').attr('x', width * 0.63).attr('y', height * 0.18).attr('fill', '#3498db').attr('font-size', 5).text('%H');
        },
    },
};

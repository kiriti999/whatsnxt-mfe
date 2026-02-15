/**
 * Game Development Shape Library
 * Covers L3 topics: Unity, Unreal, Godot, Game Loop, Sprites, Physics, Tilemap, Particles, Audio
 */
import * as d3 from 'd3';

export interface GameDevShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const gamedevD3Shapes: Record<string, GameDevShapeDefinition> = {
    gameloop: {
        id: 'gd-loop',
        name: 'Game Loop',
        type: 'gameloop',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#f4ecf7').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Circular arrow
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.15} A${width * 0.28},${height * 0.28} 0 1 1 ${width * 0.22},${height * 0.5}`)
                .attr('fill', 'none').attr('stroke', '#8e44ad').attr('stroke-width', 2.5);
            // Arrow head
            g.append('polygon')
                .attr('points', `${width * 0.22},${height * 0.5} ${width * 0.18},${height * 0.4} ${width * 0.3},${height * 0.44}`)
                .attr('fill', '#8e44ad');
            // Phase labels
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.3).attr('text-anchor', 'middle').attr('fill', '#3498db').attr('font-size', 6).text('Input');
            g.append('text').attr('x', width * 0.72).attr('y', height * 0.52).attr('text-anchor', 'middle').attr('fill', '#f39c12').attr('font-size', 6).text('Update');
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.72).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 6).text('Render');
            // FPS
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.92).attr('text-anchor', 'middle').attr('fill', '#8e44ad').attr('font-size', 7).attr('font-weight', 'bold').text('60 FPS');
        },
    },

    sprite: {
        id: 'gd-sprite',
        name: 'Sprite',
        type: 'sprite',
        width: 50,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Character sprite (simplified pixel art)
            const pixelSize = width * 0.08;
            const grid = [
                [0, 0, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 0],
                [0, 1, 0, 1, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 0],
                [1, 0, 1, 1, 1, 0, 1],
                [0, 0, 1, 0, 1, 0, 0],
            ];
            grid.forEach((row, ry) => {
                row.forEach((cell, cx) => {
                    if (cell) {
                        g.append('rect')
                            .attr('x', width * 0.14 + cx * pixelSize)
                            .attr('y', height * 0.1 + ry * pixelSize)
                            .attr('width', pixelSize)
                            .attr('height', pixelSize)
                            .attr('fill', ry < 2 ? '#3498db' : (ry < 4 ? '#f39c12' : '#2c3e50'));
                    }
                });
            });
            // Animation frames indicator
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.78).attr('width', width * 0.9).attr('height', height * 0.15).attr('rx', 2).attr('fill', '#34495e');
            [1, 2, 3, 4].forEach((f, i) => {
                g.append('rect').attr('x', width * (0.1 + i * 0.21)).attr('y', height * 0.8).attr('width', width * 0.15).attr('height', height * 0.1).attr('fill', i === 1 ? '#2e86c1' : '#2c3e50');
            });
        },
    },

    physicsbody: {
        id: 'gd-physics',
        name: 'Physics Body',
        type: 'physicsbody',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Collision box
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.15).attr('width', width * 0.35).attr('height', height * 0.35).attr('fill', '#3498db').attr('stroke', '#27ae60').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
            // Velocity arrow
            g.append('line').attr('x1', width * 0.32).attr('y1', height * 0.32).attr('x2', width * 0.72).attr('y2', height * 0.52).attr('stroke', '#e74c3c').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.72},${height * 0.52} ${width * 0.65},${height * 0.45} ${width * 0.67},${height * 0.55}`)
                .attr('fill', '#e74c3c');
            g.append('text').attr('x', width * 0.55).attr('y', height * 0.38).attr('fill', '#e74c3c').attr('font-size', 6).text('v⃗');
            // Gravity arrow
            g.append('line').attr('x1', width * 0.82).attr('y1', height * 0.2).attr('x2', width * 0.82).attr('y2', height * 0.55).attr('stroke', '#f39c12').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.82},${height * 0.55} ${width * 0.76},${height * 0.48} ${width * 0.88},${height * 0.48}`)
                .attr('fill', '#f39c12');
            g.append('text').attr('x', width * 0.82).attr('y', height * 0.14).attr('text-anchor', 'middle').attr('fill', '#f39c12').attr('font-size', 6).text('g⃗');
            // Mass label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#27ae60').attr('font-size', 7).text('m=2.5');
            // Bounce factor
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.94).attr('text-anchor', 'middle').attr('fill', '#95a5a6').attr('font-size', 5).text('bounce: 0.8');
        },
    },

    tilemap: {
        id: 'gd-tilemap',
        name: 'Tilemap',
        type: 'tilemap',
        width: 60,
        height: 60,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Grid of tiles
            const cols = 5;
            const rows = 5;
            const tileW = width * 0.16;
            const tileH = height * 0.16;
            const tileColors = [
                ['#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71'],
                ['#2ecc71', '#2ecc71', '#5dade2', '#5dade2', '#2ecc71'],
                ['#8d6e63', '#2ecc71', '#5dade2', '#2ecc71', '#2ecc71'],
                ['#8d6e63', '#8d6e63', '#2ecc71', '#2ecc71', '#8d6e63'],
                ['#8d6e63', '#8d6e63', '#8d6e63', '#8d6e63', '#8d6e63'],
            ];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    g.append('rect')
                        .attr('x', width * 0.08 + c * tileW)
                        .attr('y', height * 0.08 + r * tileH)
                        .attr('width', tileW)
                        .attr('height', tileH)
                        .attr('fill', tileColors[r][c])
                        .attr('stroke', '#f1c40f')
                        .attr('stroke-width', 0.5);
                }
            }
        },
    },

    particles: {
        id: 'gd-particles',
        name: 'Particle System',
        type: 'particles',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 8).attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 2);
            // Emitter point
            g.append('circle').attr('cx', width * 0.5).attr('cy', height * 0.75).attr('r', 4).attr('fill', '#f39c12');
            // Particles spreading upward
            const particles = [
                [0.3, 0.55, 3, '#e74c3c', 0.9],
                [0.45, 0.45, 4, '#f39c12', 0.8],
                [0.55, 0.4, 3, '#f1c40f', 0.7],
                [0.65, 0.48, 2.5, '#e67e22', 0.6],
                [0.38, 0.35, 2, '#f39c12', 0.5],
                [0.58, 0.28, 2, '#f1c40f', 0.4],
                [0.48, 0.2, 1.5, '#e74c3c', 0.3],
                [0.42, 0.58, 3.5, '#e67e22', 0.85],
                [0.52, 0.32, 2, '#f9e79f', 0.35],
                [0.35, 0.22, 1, '#f9e79f', 0.2],
                [0.62, 0.18, 1, '#f9e79f', 0.15],
            ];
            particles.forEach(([x, y, r, color, opacity]) => {
                g.append('circle')
                    .attr('cx', width * (x as number))
                    .attr('cy', height * (y as number))
                    .attr('r', r as number)
                    .attr('fill', color as string)
                    .attr('opacity', opacity as number);
            });
        },
    },

    scene: {
        id: 'gd-scene',
        name: 'Scene / Level',
        type: 'scene',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#87ceeb').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Sky gradient
            g.append('rect').attr('x', 0).attr('y', 0).attr('width', width).attr('height', height * 0.55).attr('rx', 4).attr('fill', '#87ceeb');
            // Sun
            g.append('circle').attr('cx', width * 0.8).attr('cy', height * 0.2).attr('r', 8).attr('fill', '#f1c40f');
            // Mountains
            g.append('polygon')
                .attr('points', `0,${height * 0.55} ${width * 0.3},${height * 0.2} ${width * 0.5},${height * 0.55}`)
                .attr('fill', '#27ae60');
            g.append('polygon')
                .attr('points', `${width * 0.3},${height * 0.55} ${width * 0.6},${height * 0.25} ${width * 0.85},${height * 0.55}`)
                .attr('fill', '#2ecc71');
            // Ground
            g.append('rect').attr('x', 0).attr('y', height * 0.55).attr('width', width).attr('height', height * 0.45).attr('fill', '#8d6e63');
            // Platform
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.7).attr('width', width * 0.3).attr('height', height * 0.08).attr('fill', '#d35400');
            g.append('rect').attr('x', width * 0.6).attr('y', height * 0.6).attr('width', width * 0.25).attr('height', height * 0.08).attr('fill', '#d35400');
            // Level label
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.95).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 6).text('Level 1-1');
        },
    },

    controller: {
        id: 'gd-controller',
        name: 'Controller Input',
        type: 'controller',
        width: 65,
        height: 45,
        render: (g, width, height) => {
            // Gamepad shape
            g.append('path')
                .attr('d', `M${width * 0.2},${height * 0.2} Q${width * 0.2},${height * 0.12} ${width * 0.35},${height * 0.12} L${width * 0.65},${height * 0.12} Q${width * 0.8},${height * 0.12} ${width * 0.8},${height * 0.2} L${width * 0.88},${height * 0.65} Q${width * 0.88},${height * 0.88} ${width * 0.72},${height * 0.88} Q${width * 0.6},${height * 0.72} ${width * 0.5},${height * 0.72} Q${width * 0.4},${height * 0.72} ${width * 0.28},${height * 0.88} Q${width * 0.12},${height * 0.88} ${width * 0.12},${height * 0.65} Z`)
                .attr('fill', '#2c3e50').attr('stroke', '#1a252f').attr('stroke-width', 1.5);
            // D-pad
            g.append('rect').attr('x', width * 0.22).attr('y', height * 0.3).attr('width', width * 0.05).attr('height', height * 0.3).attr('rx', 1).attr('fill', '#34495e');
            g.append('rect').attr('x', width * 0.17).attr('y', height * 0.38).attr('width', width * 0.15).attr('height', height * 0.12).attr('rx', 1).attr('fill', '#34495e');
            // Buttons
            g.append('circle').attr('cx', width * 0.68).attr('cy', height * 0.35).attr('r', 4).attr('fill', '#e74c3c');
            g.append('circle').attr('cx', width * 0.76).attr('cy', height * 0.45).attr('r', 4).attr('fill', '#3498db');
            g.append('circle').attr('cx', width * 0.6).attr('cy', height * 0.45).attr('r', 4).attr('fill', '#f1c40f');
            g.append('circle').attr('cx', width * 0.68).attr('cy', height * 0.55).attr('r', 4).attr('fill', '#27ae60');
            // Analog sticks
            g.append('circle').attr('cx', width * 0.35).attr('cy', height * 0.6).attr('r', 5).attr('fill', '#5d6d7e');
            g.append('circle').attr('cx', width * 0.55).attr('cy', height * 0.6).attr('r', 5).attr('fill', '#5d6d7e');
        },
    },

    audiosystem: {
        id: 'gd-audio',
        name: 'Audio System',
        type: 'audiosystem',
        width: 55,
        height: 45,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Speaker icon
            g.append('polygon')
                .attr('points', `${width * 0.12},${height * 0.35} ${width * 0.25},${height * 0.35} ${width * 0.38},${height * 0.15} ${width * 0.38},${height * 0.85} ${width * 0.25},${height * 0.65} ${width * 0.12},${height * 0.65}`)
                .attr('fill', '#e67e22');
            // Sound waves
            [0.1, 0.18, 0.26].forEach((r, i) => {
                g.append('path')
                    .attr('d', `M${width * (0.45 + r)},${height * (0.25 + i * 0.03)} A${width * r},${height * r} 0 0 1 ${width * (0.45 + r)},${height * (0.75 - i * 0.03)}`)
                    .attr('fill', 'none').attr('stroke', '#e67e22').attr('stroke-width', 1.5).attr('opacity', 1 - i * 0.25);
            });
        },
    },
};

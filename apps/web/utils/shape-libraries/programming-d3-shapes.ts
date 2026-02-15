/**
 * Programming Languages & Paradigms Shape Library
 * Covers: Programming Paradigms, Programming Languages, Language Concepts
 */
import * as d3 from 'd3';

export interface ProgrammingShapeDefinition {
    id: string;
    name: string;
    type: string;
    width: number;
    height: number;
    render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const programmingD3Shapes: Record<string, ProgrammingShapeDefinition> = {
    functionblock: {
        id: 'prog-function',
        name: 'Function',
        type: 'functionblock',
        width: 60,
        height: 50,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#eaf2f8').attr('stroke', '#2e86c1').attr('stroke-width', 2);
            // Function brackets
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.55).attr('fill', '#2e86c1').attr('font-size', 18).attr('font-weight', 'bold').text('f');
            g.append('text').attr('x', width * 0.32).attr('y', height * 0.58).attr('fill', '#2e86c1').attr('font-size', 14).text('(');
            g.append('text').attr('x', width * 0.58).attr('y', height * 0.58).attr('fill', '#2e86c1').attr('font-size', 14).text(')');
            // Arrow to return
            g.append('line').attr('x1', width * 0.7).attr('y1', height * 0.5).attr('x2', width * 0.88).attr('y2', height * 0.5).attr('stroke', '#2e86c1').attr('stroke-width', 2);
            g.append('polygon')
                .attr('points', `${width * 0.88},${height * 0.5} ${width * 0.82},${height * 0.38} ${width * 0.82},${height * 0.62}`)
                .attr('fill', '#2e86c1');
            // Params dot
            g.append('circle').attr('cx', width * 0.45).attr('cy', height * 0.5).attr('r', 3).attr('fill', '#e74c3c');
        },
    },

    classblock: {
        id: 'prog-class',
        name: 'Class',
        type: 'classblock',
        width: 55,
        height: 60,
        render: (g, width, height) => {
            // Class box with sections
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 3).attr('fill', '#fff').attr('stroke', '#8e44ad').attr('stroke-width', 2);
            // Header
            g.append('rect').attr('width', width).attr('height', height * 0.25).attr('rx', 3).attr('fill', '#8e44ad');
            g.append('text').attr('x', width / 2).attr('y', height * 0.17).attr('text-anchor', 'middle').attr('fill', '#fff').attr('font-size', 8).attr('font-weight', 'bold').text('Class');
            // Divider
            g.append('line').attr('x1', 0).attr('y1', height * 0.55).attr('x2', width).attr('y2', height * 0.55).attr('stroke', '#8e44ad').attr('stroke-width', 1);
            // Properties
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.42).attr('fill', '#8e44ad').attr('font-size', 7).text('+ prop: T');
            // Methods
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.72).attr('fill', '#8e44ad').attr('font-size', 7).text('+ method()');
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.87).attr('fill', '#8e44ad').attr('font-size', 7).text('- private()');
        },
    },

    moduleblock: {
        id: 'prog-module',
        name: 'Module',
        type: 'moduleblock',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Package/module
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#d5f5e3').attr('stroke', '#27ae60').attr('stroke-width', 2);
            // Tab
            g.append('rect').attr('x', width * 0.05).attr('y', height * 0.0).attr('width', width * 0.35).attr('height', height * 0.15).attr('rx', 3).attr('fill', '#27ae60');
            // Inner boundary
            g.append('rect').attr('x', width * 0.08).attr('y', height * 0.18).attr('width', width * 0.84).attr('height', height * 0.72).attr('rx', 3).attr('fill', 'none').attr('stroke', '#27ae60').attr('stroke-width', 1).attr('stroke-dasharray', '4,2');
            // Elements inside
            g.append('rect').attr('x', width * 0.15).attr('y', height * 0.28).attr('width', width * 0.3).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#a9dfbf');
            g.append('rect').attr('x', width * 0.55).attr('y', height * 0.28).attr('width', width * 0.3).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#a9dfbf');
            g.append('rect').attr('x', width * 0.25).attr('y', height * 0.58).attr('width', width * 0.5).attr('height', height * 0.2).attr('rx', 2).attr('fill', '#a9dfbf');
        },
    },

    variable: {
        id: 'prog-variable',
        name: 'Variable',
        type: 'variable',
        width: 55,
        height: 40,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fef9e7').attr('stroke', '#f1c40f').attr('stroke-width', 2);
            // Variable name
            g.append('text').attr('x', width * 0.12).attr('y', height * 0.45).attr('fill', '#3498db').attr('font-size', 10).attr('font-weight', 'bold').text('let');
            g.append('text').attr('x', width * 0.48).attr('y', height * 0.45).attr('fill', '#2c3e50').attr('font-size', 10).text('x');
            // Equals
            g.append('text').attr('x', width * 0.62).attr('y', height * 0.45).attr('fill', '#7f8c8d').attr('font-size', 10).text('=');
            // Value box
            g.append('rect').attr('x', width * 0.72).attr('y', height * 0.2).attr('width', width * 0.22).attr('height', height * 0.6).attr('rx', 2).attr('fill', '#f1c40f').attr('opacity', 0.4);
        },
    },

    loopblock: {
        id: 'prog-loop',
        name: 'Loop',
        type: 'loopblock',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#fdebd0').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Circular arrow
            g.append('path')
                .attr('d', `M${width * 0.5},${height * 0.18} A${width * 0.25},${height * 0.25} 0 1 1 ${width * 0.25},${height * 0.5}`)
                .attr('fill', 'none').attr('stroke', '#e67e22').attr('stroke-width', 2.5);
            // Arrow head
            g.append('polygon')
                .attr('points', `${width * 0.25},${height * 0.5} ${width * 0.2},${height * 0.38} ${width * 0.33},${height * 0.42}`)
                .attr('fill', '#e67e22');
            // Counter
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 9).attr('font-weight', 'bold').text('i++');
            // Loop text
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#e67e22').attr('font-size', 7).text('for / while');
        },
    },

    conditional: {
        id: 'prog-conditional',
        name: 'Conditional',
        type: 'conditional',
        width: 60,
        height: 55,
        render: (g, width, height) => {
            // Diamond shape
            g.append('polygon')
                .attr('points', `${width * 0.5},${height * 0.05} ${width * 0.95},${height * 0.5} ${width * 0.5},${height * 0.95} ${width * 0.05},${height * 0.5}`)
                .attr('fill', '#fef5e7').attr('stroke', '#f39c12').attr('stroke-width', 2);
            // Question mark
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.55).attr('text-anchor', 'middle').attr('fill', '#f39c12').attr('font-size', 14).attr('font-weight', 'bold').text('?');
            // True/False labels
            g.append('text').attr('x', width * 0.82).attr('y', height * 0.42).attr('fill', '#27ae60').attr('font-size', 6).text('T');
            g.append('text').attr('x', width * 0.12).attr('y', height * 0.42).attr('fill', '#e74c3c').attr('font-size', 6).text('F');
        },
    },

    interfaceblock: {
        id: 'prog-interface',
        name: 'Interface',
        type: 'interfaceblock',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Dashed boundary = contract/interface
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#eaf2f8').attr('stroke', '#3498db').attr('stroke-width', 2).attr('stroke-dasharray', '5,3');
            // Label
            g.append('text').attr('x', width / 2).attr('y', height * 0.22).attr('text-anchor', 'middle').attr('fill', '#3498db').attr('font-size', 7).attr('font-style', 'italic').text('interface');
            // Method signatures
            g.append('line').attr('x1', width * 0.1).attr('y1', height * 0.32).attr('x2', width * 0.9).attr('y2', height * 0.32).attr('stroke', '#3498db').attr('stroke-width', 1);
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.48).attr('fill', '#2c3e50').attr('font-size', 7).text('get(): T');
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.64).attr('fill', '#2c3e50').attr('font-size', 7).text('set(v)');
            g.append('text').attr('x', width * 0.15).attr('y', height * 0.8).attr('fill', '#2c3e50').attr('font-size', 7).text('del()');
        },
    },

    packageblock: {
        id: 'prog-package',
        name: 'Package',
        type: 'packageblock',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            // Box / package
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 4).attr('fill', '#fdf2e9').attr('stroke', '#e67e22').attr('stroke-width', 2);
            // Box flaps (open)
            g.append('polygon')
                .attr('points', `0,${height * 0.3} ${width * 0.5},${height * 0.1} ${width},${height * 0.3} ${width * 0.5},${height * 0.45}`)
                .attr('fill', '#e67e22').attr('stroke', '#d35400').attr('stroke-width', 1);
            // Front face pattern
            g.append('line').attr('x1', width * 0.5).attr('y1', height * 0.45).attr('x2', width * 0.5).attr('y2', height * 0.95).attr('stroke', '#d35400').attr('stroke-width', 1);
            g.append('line').attr('x1', width * 0.2).attr('y1', height * 0.6).attr('x2', width * 0.8).attr('y2', height * 0.6).attr('stroke', '#d35400').attr('stroke-width', 1);
            // Version
            g.append('text').attr('x', width * 0.5).attr('y', height * 0.82).attr('text-anchor', 'middle').attr('fill', '#d35400').attr('font-size', 7).text('v1.0');
        },
    },

    codebrace: {
        id: 'prog-code',
        name: 'Code Block',
        type: 'codebrace',
        width: 55,
        height: 55,
        render: (g, width, height) => {
            g.append('rect').attr('width', width).attr('height', height).attr('rx', 6).attr('fill', '#1a1a2e').attr('stroke', '#34495e').attr('stroke-width', 2);
            // Braces
            g.append('text').attr('x', width * 0.1).attr('y', height * 0.55).attr('fill', '#f1c40f').attr('font-size', 20).text('{');
            g.append('text').attr('x', width * 0.72).attr('y', height * 0.55).attr('fill', '#f1c40f').attr('font-size', 20).text('}');
            // Code lines
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.25).attr('width', width * 0.35).attr('height', 3).attr('fill', '#3498db');
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.4).attr('width', width * 0.25).attr('height', 3).attr('fill', '#27ae60');
            g.append('rect').attr('x', width * 0.3).attr('y', height * 0.55).attr('width', width * 0.3).attr('height', 3).attr('fill', '#e74c3c');
            g.append('rect').attr('x', width * 0.35).attr('y', height * 0.7).attr('width', width * 0.2).attr('height', 3).attr('fill', '#8e44ad');
        },
    },
};

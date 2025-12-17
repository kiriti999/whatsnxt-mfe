/**
 * Azure Architecture D3 Shape Library
 * Professional D3.js implementations of Azure service shapes
 * Based on Microsoft Azure official icon guidelines
 */

import * as d3 from 'd3';

export interface AzureShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const azureD3Shapes: Record<string, AzureShapeDefinition> = {
  /**
   * Azure Virtual Machine - Compute instance
   */
  virtualmachine: {
    id: 'azure-vm',
    name: 'Virtual Machine',
    type: 'virtualmachine',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // VM icon - monitor/screen representation
      g.append('rect')
        .attr('x', width * 0.25)
        .attr('y', height * 0.25)
        .attr('width', width * 0.5)
        .attr('height', width * 0.35)
        .attr('fill', white)
        .attr('rx', 2);
      
      // Stand
      g.append('rect')
        .attr('x', width * 0.45)
        .attr('y', height * 0.6)
        .attr('width', width * 0.1)
        .attr('height', height * 0.1)
        .attr('fill', white);
      
      // Base
      g.append('rect')
        .attr('x', width * 0.35)
        .attr('y', height * 0.7)
        .attr('width', width * 0.3)
        .attr('height', height * 0.05)
        .attr('fill', white)
        .attr('rx', 1);
    }
  },

  /**
   * Azure App Service - Web hosting
   */
  appservice: {
    id: 'azure-appservice',
    name: 'App Service',
    type: 'appservice',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Lightning bolt (fast deployment)
      const boltPath = `
        M ${cx + width * 0.05} ${cy - height * 0.25}
        L ${cx - width * 0.05} ${cy}
        L ${cx + width * 0.1} ${cy}
        L ${cx - width * 0.05} ${cy + height * 0.25}
        L ${cx + width * 0.15} ${cy - height * 0.05}
        L ${cx + width * 0.05} ${cy - height * 0.05}
        Z
      `;
      
      g.append('path')
        .attr('d', boltPath)
        .attr('fill', white);
    }
  },

  /**
   * Azure Functions - Serverless compute
   */
  functions: {
    id: 'azure-functions',
    name: 'Functions',
    type: 'functions',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Function symbol f(x)
      g.append('text')
        .attr('x', cx)
        .attr('y', cy + 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', width * 0.35)
        .attr('font-weight', 'bold')
        .attr('font-style', 'italic')
        .attr('fill', white)
        .text('f');
      
      g.append('text')
        .attr('x', cx + width * 0.15)
        .attr('y', cy + 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', width * 0.2)
        .attr('fill', white)
        .text('(x)');
    }
  },

  /**
   * Azure Storage Account - Blob/file storage
   */
  storageaccount: {
    id: 'azure-storage',
    name: 'Storage Account',
    type: 'storageaccount',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Storage cylinders (stacked)
      for (let i = 0; i < 3; i++) {
        const y = height * (0.25 + i * 0.15);
        
        g.append('ellipse')
          .attr('cx', width / 2)
          .attr('cy', y)
          .attr('rx', width * 0.3)
          .attr('ry', height * 0.08)
          .attr('fill', white)
          .attr('opacity', 0.9);
      }
    }
  },

  /**
   * Azure SQL Database - Managed SQL
   */
  sqldatabase: {
    id: 'azure-sql',
    name: 'SQL Database',
    type: 'sqldatabase',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const topY = height * 0.2;
      const bottomY = height * 0.75;
      const rx = width * 0.35;
      const ry = height * 0.1;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Database cylinder body
      g.append('rect')
        .attr('x', cx - rx)
        .attr('y', topY)
        .attr('width', rx * 2)
        .attr('height', bottomY - topY)
        .attr('fill', white)
        .attr('opacity', 0.9);
      
      // Top ellipse
      g.append('ellipse')
        .attr('cx', cx)
        .attr('cy', topY)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', white)
        .attr('opacity', 0.9);
      
      // Bottom ellipse
      g.append('ellipse')
        .attr('cx', cx)
        .attr('cy', bottomY)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', white)
        .attr('opacity', 0.9);
    }
  },

  /**
   * Azure Cosmos DB - NoSQL database
   */
  cosmosdb: {
    id: 'azure-cosmosdb',
    name: 'Cosmos DB',
    type: 'cosmosdb',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const purple = '#7719AA';
      const darkPurple = '#5A0F7F';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', purple)
        .attr('stroke', darkPurple)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Globe/world representation (distributed database)
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', width * 0.3)
        .attr('fill', 'none')
        .attr('stroke', white)
        .attr('stroke-width', 2);
      
      // Latitude lines
      [-0.15, 0, 0.15].forEach(offset => {
        g.append('ellipse')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('rx', width * 0.3)
          .attr('ry', width * 0.1)
          .attr('transform', `translate(0, ${offset * width})`)
          .attr('fill', 'none')
          .attr('stroke', white)
          .attr('stroke-width', 1.5);
      });
      
      // Longitude line
      g.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', width * 0.1)
        .attr('ry', width * 0.3)
        .attr('fill', 'none')
        .attr('stroke', white)
        .attr('stroke-width', 1.5);
    }
  },

  /**
   * Azure Virtual Network - VNet
   */
  virtualnetwork: {
    id: 'azure-vnet',
    name: 'Virtual Network',
    type: 'virtualnetwork',
    width: 500,
    height: 400,
    render: (g, width = 500, height = 400) => {
      const blue = '#0078D4';
      
      // VNet border
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('stroke', blue)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '10,5')
        .attr('rx', 8);
      
      // VNet label background
      g.append('rect')
        .attr('x', 10)
        .attr('y', -18)
        .attr('width', 140)
        .attr('height', 36)
        .attr('fill', 'white')
        .attr('stroke', blue)
        .attr('stroke-width', 2)
        .attr('rx', 4);
      
      // Network icon
      const nodePositions = [
        { x: 30, y: 5 },
        { x: 50, y: 5 },
        { x: 40, y: -10 }
      ];
      
      // Connection lines
      g.append('line')
        .attr('x1', 30)
        .attr('y1', 5)
        .attr('x2', 50)
        .attr('y2', 5)
        .attr('stroke', blue)
        .attr('stroke-width', 2);
      
      g.append('line')
        .attr('x1', 30)
        .attr('y1', 5)
        .attr('x2', 40)
        .attr('y2', -10)
        .attr('stroke', blue)
        .attr('stroke-width', 2);
      
      g.append('line')
        .attr('x1', 50)
        .attr('y1', 5)
        .attr('x2', 40)
        .attr('y2', -10)
        .attr('stroke', blue)
        .attr('stroke-width', 2);
      
      // Nodes
      nodePositions.forEach(pos => {
        g.append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('r', 4)
          .attr('fill', blue);
      });
      
      g.append('text')
        .attr('x', 70)
        .attr('y', 8)
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', blue)
        .text('Virtual Network');
    }
  },

  /**
   * Azure Load Balancer - Traffic distribution
   */
  loadbalancer: {
    id: 'azure-lb',
    name: 'Load Balancer',
    type: 'loadbalancer',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Balance scale representation
      // Center pivot
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy - height * 0.05)
        .attr('r', width * 0.08)
        .attr('fill', white);
      
      // Beam
      g.append('rect')
        .attr('x', cx - width * 0.3)
        .attr('y', cy - height * 0.08)
        .attr('width', width * 0.6)
        .attr('height', height * 0.06)
        .attr('fill', white)
        .attr('rx', 2);
      
      // Left pan
      g.append('rect')
        .attr('x', cx - width * 0.35)
        .attr('y', cy + height * 0.1)
        .attr('width', width * 0.2)
        .attr('height', height * 0.15)
        .attr('fill', white)
        .attr('opacity', 0.8)
        .attr('rx', 2);
      
      // Right pan
      g.append('rect')
        .attr('x', cx + width * 0.15)
        .attr('y', cy + height * 0.1)
        .attr('width', width * 0.2)
        .attr('height', height * 0.15)
        .attr('fill', white)
        .attr('opacity', 0.8)
        .attr('rx', 2);
      
      // Connecting lines
      g.append('line')
        .attr('x1', cx - width * 0.25)
        .attr('y1', cy - height * 0.05)
        .attr('x2', cx - width * 0.25)
        .attr('y2', cy + height * 0.1)
        .attr('stroke', white)
        .attr('stroke-width', 2);
      
      g.append('line')
        .attr('x1', cx + width * 0.25)
        .attr('y1', cy - height * 0.05)
        .attr('x2', cx + width * 0.25)
        .attr('y2', cy + height * 0.1)
        .attr('stroke', white)
        .attr('stroke-width', 2);
    }
  },

  /**
   * Azure Application Gateway - Web traffic manager
   */
  applicationgateway: {
    id: 'azure-appgw',
    name: 'Application Gateway',
    type: 'applicationgateway',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Gateway arch
      const archPath = `
        M ${cx - width * 0.25} ${cy + height * 0.2}
        L ${cx - width * 0.25} ${cy - height * 0.1}
        Q ${cx} ${cy - height * 0.3} ${cx + width * 0.25} ${cy - height * 0.1}
        L ${cx + width * 0.25} ${cy + height * 0.2}
      `;
      
      g.append('path')
        .attr('d', archPath)
        .attr('fill', 'none')
        .attr('stroke', white)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
      
      // Traffic arrows
      const arrowPath = `
        M ${cx - width * 0.1} ${cy}
        L ${cx + width * 0.1} ${cy}
        M ${cx + width * 0.05} ${cy - height * 0.05}
        L ${cx + width * 0.1} ${cy}
        L ${cx + width * 0.05} ${cy + height * 0.05}
      `;
      
      g.append('path')
        .attr('d', arrowPath)
        .attr('stroke', white)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }
  },

  /**
   * Azure API Management - API gateway
   */
  apimanagement: {
    id: 'azure-apim',
    name: 'API Management',
    type: 'apimanagement',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const orange = '#F25022';
      const darkOrange = '#C73E1D';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', orange)
        .attr('stroke', darkOrange)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // API symbol - curly braces
      const leftBrace = `
        M ${width * 0.3} ${cy - height * 0.25}
        Q ${width * 0.25} ${cy - height * 0.25} ${width * 0.25} ${cy - height * 0.15}
        L ${width * 0.25} ${cy - height * 0.05}
        Q ${width * 0.25} ${cy} ${width * 0.2} ${cy}
        Q ${width * 0.25} ${cy} ${width * 0.25} ${cy + height * 0.05}
        L ${width * 0.25} ${cy + height * 0.15}
        Q ${width * 0.25} ${cy + height * 0.25} ${width * 0.3} ${cy + height * 0.25}
      `;
      
      const rightBrace = `
        M ${width * 0.7} ${cy - height * 0.25}
        Q ${width * 0.75} ${cy - height * 0.25} ${width * 0.75} ${cy - height * 0.15}
        L ${width * 0.75} ${cy - height * 0.05}
        Q ${width * 0.75} ${cy} ${width * 0.8} ${cy}
        Q ${width * 0.75} ${cy} ${width * 0.75} ${cy + height * 0.05}
        L ${width * 0.75} ${cy + height * 0.15}
        Q ${width * 0.75} ${cy + height * 0.25} ${width * 0.7} ${cy + height * 0.25}
      `;
      
      g.append('path')
        .attr('d', leftBrace)
        .attr('stroke', white)
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');
      
      g.append('path')
        .attr('d', rightBrace)
        .attr('stroke', white)
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');
      
      // API text
      g.append('text')
        .attr('x', cx)
        .attr('y', cy + 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', white)
        .text('API');
    }
  },

  /**
   * Azure Service Bus - Message broker
   */
  servicebus: {
    id: 'azure-servicebus',
    name: 'Service Bus',
    type: 'servicebus',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const green = '#59B4D9';
      const darkGreen = '#3A8FB8';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', green)
        .attr('stroke', darkGreen)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Bus/queue representation
      // Message boxes
      for (let i = 0; i < 3; i++) {
        const x = width * (0.22 + i * 0.18);
        
        g.append('rect')
          .attr('x', x)
          .attr('y', cy - height * 0.15)
          .attr('width', width * 0.15)
          .attr('height', height * 0.3)
          .attr('fill', white)
          .attr('opacity', 0.9)
          .attr('rx', 2);
      }
      
      // Arrow showing message flow
      g.append('path')
        .attr('d', `
          M ${width * 0.2} ${cy + height * 0.25}
          L ${width * 0.75} ${cy + height * 0.25}
          M ${width * 0.7} ${cy + height * 0.2}
          L ${width * 0.75} ${cy + height * 0.25}
          L ${width * 0.7} ${cy + height * 0.3}
        `)
        .attr('stroke', white)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }
  },

  /**
   * Azure Key Vault - Secrets management
   */
  keyvault: {
    id: 'azure-keyvault',
    name: 'Key Vault',
    type: 'keyvault',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const yellow = '#FFB900';
      const darkYellow = '#CC9400';
      const darkGray = '#333333';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', yellow)
        .attr('stroke', darkYellow)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Key icon
      // Key head (circular)
      g.append('circle')
        .attr('cx', cx - width * 0.15)
        .attr('cy', cy - height * 0.1)
        .attr('r', width * 0.12)
        .attr('fill', 'none')
        .attr('stroke', darkGray)
        .attr('stroke-width', 3);
      
      // Key shaft
      g.append('line')
        .attr('x1', cx - width * 0.03)
        .attr('y1', cy - height * 0.1)
        .attr('x2', cx + width * 0.25)
        .attr('y2', cy - height * 0.1)
        .attr('stroke', darkGray)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
      
      // Key teeth
      g.append('line')
        .attr('x1', cx + width * 0.15)
        .attr('y1', cy - height * 0.1)
        .attr('x2', cx + width * 0.15)
        .attr('y2', cy)
        .attr('stroke', darkGray)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
      
      g.append('line')
        .attr('x1', cx + width * 0.22)
        .attr('y1', cy - height * 0.1)
        .attr('x2', cx + width * 0.22)
        .attr('y2', cy + height * 0.05)
        .attr('stroke', darkGray)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
    }
  },

  /**
   * Azure Monitor - Monitoring and diagnostics
   */
  monitor: {
    id: 'azure-monitor',
    name: 'Monitor',
    type: 'monitor',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Heart rate / monitoring line
      const monitorLine = `
        M ${width * 0.2} ${cy}
        L ${width * 0.32} ${cy}
        L ${width * 0.37} ${cy - height * 0.2}
        L ${width * 0.42} ${cy + height * 0.15}
        L ${width * 0.47} ${cy - height * 0.1}
        L ${width * 0.52} ${cy}
        L ${width * 0.8} ${cy}
      `;
      
      g.append('path')
        .attr('d', monitorLine)
        .attr('stroke', white)
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
      
      // Dot indicators
      [0.3, 0.5, 0.7].forEach(xPos => {
        g.append('circle')
          .attr('cx', width * xPos)
          .attr('cy', height * 0.7)
          .attr('r', 2)
          .attr('fill', white);
      });
    }
  },

  /**
   * Azure Container Instances - Serverless containers
   */
  containerinstances: {
    id: 'azure-aci',
    name: 'Container Instances',
    type: 'containerinstances',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Container boxes (Docker-style)
      const containerPositions = [
        { x: 0.22, y: 0.3, w: 0.25, h: 0.2 },
        { x: 0.53, y: 0.3, w: 0.25, h: 0.2 },
        { x: 0.375, y: 0.55, w: 0.25, h: 0.2 }
      ];
      
      containerPositions.forEach(pos => {
        g.append('rect')
          .attr('x', width * pos.x)
          .attr('y', height * pos.y)
          .attr('width', width * pos.w)
          .attr('height', height * pos.h)
          .attr('fill', white)
          .attr('opacity', 0.9)
          .attr('rx', 2);
        
        // Container lines
        g.append('line')
          .attr('x1', width * pos.x)
          .attr('y1', height * (pos.y + pos.h * 0.33))
          .attr('x2', width * (pos.x + pos.w))
          .attr('y2', height * (pos.y + pos.h * 0.33))
          .attr('stroke', blue)
          .attr('stroke-width', 1);
      });
    }
  },

  /**
   * Azure Kubernetes Service - AKS
   */
  aks: {
    id: 'azure-aks',
    name: 'AKS',
    type: 'aks',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#0078D4';
      const darkBlue = '#005A9E';
      const white = '#FFFFFF';
      const k8sBlue = '#326CE5';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square (Azure)
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Kubernetes wheel (simplified)
      const spokeCount = 6;
      const innerRadius = width * 0.12;
      const outerRadius = width * 0.28;
      
      for (let i = 0; i < spokeCount; i++) {
        const angle = (i * 360) / spokeCount;
        const rad = (angle * Math.PI) / 180;
        
        const x1 = cx + Math.cos(rad) * innerRadius;
        const y1 = cy + Math.sin(rad) * innerRadius;
        const x2 = cx + Math.cos(rad) * outerRadius;
        const y2 = cy + Math.sin(rad) * outerRadius;
        
        g.append('line')
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)
          .attr('stroke', white)
          .attr('stroke-width', 2.5);
      }
      
      // Center circle
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', innerRadius)
        .attr('fill', k8sBlue)
        .attr('stroke', white)
        .attr('stroke-width', 2);
    }
  },
};

export default azureD3Shapes;

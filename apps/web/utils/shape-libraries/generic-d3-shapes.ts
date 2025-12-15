/**
 * Generic Architecture D3 Shape Library
 * Professional D3.js implementations of common architecture diagram shapes
 * Based on draw.io standard shapes with accurate SVG paths
 */

import * as d3 from 'd3';

export interface ShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const genericD3Shapes: Record<string, ShapeDefinition> = {
  /**
   * Client Shape (Laptop/Computer)
   * Based on draw.io client icon with screen and keyboard base
   */
  client: {
    id: 'common-client',
    name: 'Client',
    type: 'client',
    width: 60,
    height: 60,
    render: (g, width, height) => {
      // Simple laptop icon
      const bodyHeight = height * 0.65;
      const baseHeight = height * 0.25;
      
      // Screen
      g.append('rect')
        .attr('x', width * 0.15)
        .attr('y', 0)
        .attr('width', width * 0.7)
        .attr('height', bodyHeight)
        .attr('rx', width * 0.05)
        .attr('fill', '#34495e')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 2);
      
      // Display
      g.append('rect')
        .attr('x', width * 0.2)
        .attr('y', height * 0.05)
        .attr('width', width * 0.6)
        .attr('height', bodyHeight * 0.85)
        .attr('fill', '#3498db')
        .attr('stroke', 'none');
      
      // Keyboard base
      g.append('rect')
        .attr('x', width * 0.05)
        .attr('y', bodyHeight + height * 0.02)
        .attr('width', width * 0.9)
        .attr('height', baseHeight)
        .attr('rx', width * 0.03)
        .attr('fill', '#34495e')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Server Shape (Rack server with multiple units)
   */
  server: {
    id: 'common-server',
    name: 'Server',
    type: 'server',
    width: 60,
    height: 80,
    render: (g, width, height) => {
      // Server rack with 3 units
      const unitHeight = height / 3.5;
      const gap = height * 0.04;
      
      [0, 1, 2].forEach((i) => {
        const y = i * (unitHeight + gap) + gap;
        
        // Unit background
        g.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', width)
          .attr('height', unitHeight)
          .attr('rx', 2)
          .attr('fill', '#2c3e50')
          .attr('stroke', '#34495e')
          .attr('stroke-width', 1);
        
        // LED indicator
        g.append('circle')
          .attr('cx', width * 0.15)
          .attr('cy', y + unitHeight / 2)
          .attr('r', width * 0.06)
          .attr('fill', i === 0 ? '#2ecc71' : '#e67e22');
      });
    }
  },

  /**
   * Mobile Device Shape (Smartphone)
   */
  mobile: {
    id: 'common-mobile',
    name: 'Mobile',
    type: 'mobile',
    width: 50,
    height: 70,
    render: (g, width, height) => {
      // Smartphone outline
      g.append('rect')
        .attr('x', width * 0.2)
        .attr('y', 0)
        .attr('width', width * 0.6)
        .attr('height', height)
        .attr('rx', width * 0.1)
        .attr('fill', '#2c3e50')
        .attr('stroke', '#34495e')
        .attr('stroke-width', 2);
      
      // Screen
      g.append('rect')
        .attr('x', width * 0.25)
        .attr('y', height * 0.08)
        .attr('width', width * 0.5)
        .attr('height', height * 0.75)
        .attr('rx', width * 0.02)
        .attr('fill', '#3498db')
        .attr('stroke', 'none');
      
      // Home button
      g.append('circle')
        .attr('cx', width * 0.5)
        .attr('cy', height * 0.9)
        .attr('r', width * 0.06)
        .attr('fill', 'none')
        .attr('stroke', '#95a5a6')
        .attr('stroke-width', 1.5);
    }
  },

  /**
   * Router Shape (Network router with antennas)
   */
  router: {
    id: 'common-router',
    name: 'Router',
    type: 'router',
    width: 70,
    height: 60,
    render: (g, width, height) => {
      const bodyHeight = height * 0.5;
      const bodyY = height * 0.4;
      
      // Router body
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', bodyY)
        .attr('width', width * 0.8)
        .attr('height', bodyHeight)
        .attr('rx', 3)
        .attr('fill', '#2c3e50')
        .attr('stroke', '#34495e')
        .attr('stroke-width', 2);
      
      // LEDs
      [0.25, 0.45, 0.65, 0.85].forEach((pos, idx) => {
        g.append('circle')
          .attr('cx', width * pos)
          .attr('cy', bodyY + bodyHeight * 0.5)
          .attr('r', width * 0.03)
          .attr('fill', idx < 2 ? '#2ecc71' : '#e67e22');
      });
      
      // Antennas
      [0.3, 0.7].forEach((pos) => {
        g.append('line')
          .attr('x1', width * pos)
          .attr('y1', bodyY)
          .attr('x2', width * pos)
          .attr('y2', height * 0.05)
          .attr('stroke', '#34495e')
          .attr('stroke-width', 3);
        
        g.append('circle')
          .attr('cx', width * pos)
          .attr('cy', height * 0.05)
          .attr('r', width * 0.04)
          .attr('fill', '#34495e');
      });
    }
  },

  /**
   * Firewall Shape (Shield with protection symbol)
   */
  firewall: {
    id: 'common-firewall',
    name: 'Firewall',
    type: 'firewall',
    width: 60,
    height: 70,
    render: (g, width, height) => {
      // Shield shape
      const shieldPath = `
        M ${width/2} ${height*0.05}
        L ${width*0.15} ${height*0.25}
        L ${width*0.15} ${height*0.6}
        Q ${width*0.15} ${height*0.85} ${width/2} ${height*0.95}
        Q ${width*0.85} ${height*0.85} ${width*0.85} ${height*0.6}
        L ${width*0.85} ${height*0.25}
        Z
      `;
      
      g.append('path')
        .attr('d', shieldPath)
        .attr('fill', '#e74c3c')
        .attr('stroke', '#c0392b')
        .attr('stroke-width', 2);
      
      // Inner shield
      const innerPath = `
        M ${width/2} ${height*0.15}
        L ${width*0.25} ${height*0.3}
        L ${width*0.25} ${height*0.55}
        Q ${width*0.25} ${height*0.75} ${width/2} ${height*0.85}
        Q ${width*0.75} ${height*0.75} ${width*0.75} ${height*0.55}
        L ${width*0.75} ${height*0.3}
        Z
      `;
      
      g.append('path')
        .attr('d', innerPath)
        .attr('fill', 'none')
        .attr('stroke', '#ecf0f1')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Database Shape (Traditional cylinder)
   */
  database: {
    id: 'common-database',
    name: 'Database',
    type: 'database',
    width: 60,
    height: 70,
    render: (g, width, height) => {
      const rx = width / 2;
      const ry = height * 0.15;
      const topY = ry;
      const bodyHeight = height - ry * 2;
      
      // Bottom ellipse
      g.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', height - ry)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', '#2980b9')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 2);
      
      // Body
      g.append('rect')
        .attr('x', 0)
        .attr('y', topY)
        .attr('width', width)
        .attr('height', bodyHeight)
        .attr('fill', '#3498db')
        .attr('stroke', 'none');
      
      // Middle ring
      g.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', 'none')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 1.5);
      
      // Top ellipse
      g.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', topY)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', '#5dade2')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Cache Shape (Database with lightning bolt)
   */
  cache: {
    id: 'common-cache',
    name: 'Cache',
    type: 'cache',
    width: 60,
    height: 65,
    render: (g, width, height) => {
      const rx = width / 2;
      const ry = height * 0.15;
      const topY = ry;
      const bodyHeight = height - ry * 2;
      
      // Bottom ellipse
      g.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', height - ry)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', '#e67e22')
        .attr('stroke', '#d35400')
        .attr('stroke-width', 2);
      
      // Body
      g.append('rect')
        .attr('x', 0)
        .attr('y', topY)
        .attr('width', width)
        .attr('height', bodyHeight)
        .attr('fill', '#f39c12')
        .attr('stroke', 'none');
      
      // Top ellipse
      g.append('ellipse')
        .attr('cx', width / 2)
        .attr('cy', topY)
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('fill', '#f1c40f')
        .attr('stroke', '#d35400')
        .attr('stroke-width', 2);
      
      // Lightning bolt
      const boltPath = `
        M ${width*0.55} ${height*0.35}
        L ${width*0.4} ${height*0.55}
        L ${width*0.5} ${height*0.55}
        L ${width*0.35} ${height*0.75}
        L ${width*0.6} ${height*0.5}
        L ${width*0.5} ${height*0.5}
        Z
      `;
      
      g.append('path')
        .attr('d', boltPath)
        .attr('fill', '#fff')
        .attr('stroke', 'none');
    }
  },

  /**
   * Load Balancer Shape (Diamond with distribution arrows)
   */
  loadbalancer: {
    id: 'common-loadbalancer',
    name: 'Load Balancer',
    type: 'loadbalancer',
    width: 65,
    height: 65,
    render: (g, width, height) => {
      // Diamond
      const diamond = `
        M ${width/2} ${height*0.1}
        L ${width*0.9} ${height/2}
        L ${width/2} ${height*0.9}
        L ${width*0.1} ${height/2}
        Z
      `;
      
      g.append('path')
        .attr('d', diamond)
        .attr('fill', '#9b59b6')
        .attr('stroke', '#8e44ad')
        .attr('stroke-width', 2);
      
      // Distribution arrows
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Top arrow
      g.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', centerX)
        .attr('y2', height * 0.2)
        .attr('stroke', '#ecf0f1')
        .attr('stroke-width', 2);
      
      // Bottom-left arrow  
      g.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', width * 0.25)
        .attr('y2', height * 0.75)
        .attr('stroke', '#ecf0f1')
        .attr('stroke-width', 2);
      
      // Bottom-right arrow
      g.append('line')
        .attr('x1', centerX)
        .attr('y1', centerY)
        .attr('x2', width * 0.75)
        .attr('y2', height * 0.75)
        .attr('stroke', '#ecf0f1')
        .attr('stroke-width', 2);
    }
  },

  /**
   * API Shape (Interface connector)
   */
  api: {
    id: 'common-api',
    name: 'API',
    type: 'api',
    width: 65,
    height: 50,
    render: (g, width, height) => {
      const boxWidth = width * 0.6;
      const boxHeight = height * 0.6;
      const boxX = width * 0.2;
      const boxY = height * 0.2;
      
      // Main box
      g.append('rect')
        .attr('x', boxX)
        .attr('y', boxY)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 4)
        .attr('fill', '#16a085')
        .attr('stroke', '#138d75')
        .attr('stroke-width', 2);
      
      // Left connectors
      [0.3, 0.5, 0.7].forEach((yPos) => {
        g.append('circle')
          .attr('cx', 0)
          .attr('cy', height * yPos)
          .attr('r', width * 0.04)
          .attr('fill', '#1abc9c')
          .attr('stroke', '#138d75')
          .attr('stroke-width', 1.5);
        
        g.append('line')
          .attr('x1', width * 0.04)
          .attr('y1', height * yPos)
          .attr('x2', boxX)
          .attr('y2', height * yPos)
          .attr('stroke', '#138d75')
          .attr('stroke-width', 2);
      });
      
      // Right connectors
      [0.3, 0.5, 0.7].forEach((yPos) => {
        g.append('circle')
          .attr('cx', width)
          .attr('cy', height * yPos)
          .attr('r', width * 0.04)
          .attr('fill', '#1abc9c')
          .attr('stroke', '#138d75')
          .attr('stroke-width', 1.5);
        
        g.append('line')
          .attr('x1', boxX + boxWidth)
          .attr('y1', height * yPos)
          .attr('x2', width * 0.96)
          .attr('y2', height * yPos)
          .attr('stroke', '#138d75')
          .attr('stroke-width', 2);
      });
      
      // API text
      g.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(width, height) * 0.25)
        .attr('font-weight', 'bold')
        .attr('fill', '#ecf0f1')
        .text('API');
    }
  },

  /**
   * Rectangle Shape (Generic box)
   */
  rect: {
    id: 'common-rect',
    name: 'Rectangle',
    type: 'rect',
    width: 120,
    height: 80,
    render: (g, width, height) => {
      g.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#3498db')
        .attr('stroke', '#2980b9')
        .attr('stroke-width', 2)
        .attr('rx', 4);
    }
  },

  /**
   * Circle Shape
   */
  circle: {
    id: 'common-circle',
    name: 'Circle',
    type: 'circle',
    width: 80,
    height: 80,
    render: (g, width, height) => {
      g.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', Math.min(width, height) / 2)
        .attr('fill', '#9b59b6')
        .attr('stroke', '#8e44ad')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Diamond Shape (Rhombus)
   */
  diamond: {
    id: 'common-diamond',
    name: 'Diamond',
    type: 'diamond',
    width: 100,
    height: 100,
    render: (g, width, height) => {
      const path = `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`;
      g.append('path')
        .attr('d', path)
        .attr('fill', '#e74c3c')
        .attr('stroke', '#c0392b')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Star Shape (5-pointed)
   */
  star: {
    id: 'common-star',
    name: 'Star',
    type: 'star',
    width: 80,
    height: 80,
    render: (g, width, height) => {
      const cx = width / 2;
      const cy = height / 2;
      const outerRadius = Math.min(width, height) / 2;
      const innerRadius = outerRadius / 2.5;
      
      let dPath = "";
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        dPath += (i === 0 ? "M" : "L") + ` ${x} ${y} `;
      }
      dPath += "Z";
      
      g.append('path')
        .attr('d', dPath)
        .attr('fill', '#f1c40f')
        .attr('stroke', '#f39c12')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Cloud Shape
   */
  cloud: {
    id: 'common-cloud',
    name: 'Cloud',
    type: 'cloud',
    width: 100,
    height: 70,
    render: (g, width, height) => {
      const w = width;
      const h = height;
      
      const path = `M ${w * 0.2} ${h * 0.6} 
                    Q ${w * 0.1} ${h * 0.4} ${w * 0.3} ${h * 0.3} 
                    Q ${w * 0.4} ${h * 0.1} ${w * 0.6} ${h * 0.3} 
                    Q ${w * 0.8} ${h * 0.1} ${w * 0.9} ${h * 0.4} 
                    Q ${w} ${h * 0.6} ${w * 0.8} ${h * 0.8} 
                    Q ${w * 0.5} ${h} ${w * 0.2} ${h * 0.8} 
                    Q ${w * 0.1} ${h * 0.9} ${w * 0.2} ${h * 0.6} Z`;
      
      g.append('path')
        .attr('d', path)
        .attr('fill', '#ecf0f1')
        .attr('stroke', '#95a5a6')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Heart Shape
   */
  heart: {
    id: 'common-heart',
    name: 'Heart',
    type: 'heart',
    width: 80,
    height: 80,
    render: (g, width, height) => {
      const w = width;
      const h = height;
      
      const dPath = `
        M ${w / 2} ${h * 0.3}
        C ${w / 2} ${h * 0.05}, ${0} ${h * 0.05}, ${0} ${h * 0.4}
        C ${0} ${h * 0.65}, ${w * 0.3} ${h * 0.8}, ${w / 2} ${h}
        C ${w * 0.7} ${h * 0.8}, ${w} ${h * 0.65}, ${w} ${h * 0.4}
        C ${w} ${h * 0.05}, ${w / 2} ${h * 0.05}, ${w / 2} ${h * 0.3}
        Z
      `;
      
      g.append('path')
        .attr('d', dPath)
        .attr('fill', '#e74c3c')
        .attr('stroke', '#c0392b')
        .attr('stroke-width', 2);
    }
  },

  /**
   * Container Shape (Invisible bounding box)
   */
  container: {
    id: 'common-container',
    name: 'Container',
    type: 'container',
    width: 200,
    height: 150,
    render: (g, width, height) => {
      g.append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', width + 10)
        .attr('height', height + 10)
        .attr('fill', 'none')
        .attr('stroke', '#95a5a6')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);
    }
  },

  /**
   * Group Shape (Dashed container)
   */
  group: {
    id: 'common-group',
    name: 'Group',
    type: 'group',
    width: 200,
    height: 150,
    render: (g, width, height) => {
      g.append('rect')
        .attr('x', 2)
        .attr('y', 2)
        .attr('width', width - 4)
        .attr('height', height - 4)
        .attr('rx', 4)
        .attr('fill', 'rgba(52, 152, 219, 0.05)')
        .attr('stroke', '#3498db')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    }
  },

  /**
   * Zone Shape (Colored boundary)
   */
  zone: {
    id: 'common-zone',
    name: 'Zone',
    type: 'zone',
    width: 250,
    height: 180,
    render: (g, width, height) => {
      g.append('rect')
        .attr('x', 1)
        .attr('y', 1)
        .attr('width', width - 2)
        .attr('height', height - 2)
        .attr('rx', 6)
        .attr('fill', 'rgba(155, 89, 182, 0.05)')
        .attr('stroke', '#9b59b6')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4');
    }
  },

  /**
   * Pool Shape (Resource pool/swimlane)
   */
  pool: {
    id: 'common-pool',
    name: 'Pool',
    type: 'pool',
    width: 300,
    height: 150,
    render: (g, width, height) => {
      g.append('rect')
        .attr('x', 2)
        .attr('y', 2)
        .attr('width', width - 4)
        .attr('height', height - 4)
        .attr('rx', 8)
        .attr('fill', 'rgba(46, 204, 113, 0.05)')
        .attr('stroke', '#2ecc71')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '10,5');
    }
  }
};

/**
 * Kubernetes D3 Shape Library
 * Professional D3.js implementations of Kubernetes resource shapes
 * Based on Kubernetes official icon guidelines
 */

import * as d3 from 'd3';

export interface KubernetesShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const kubernetesD3Shapes: Record<string, KubernetesShapeDefinition> = {

/**
 * Kubernetes Pod - Hexagon with inner elements
 */
  pod: {
    id: 'k8s-pod',
    name: 'Pod',
    type: 'pod',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#326CE5';
  const white = '#FFFFFF';
  const cx = width / 2;
  const cy = height / 2;
  
  // Hexagon path
  const hexPath = `
    M ${cx} ${cy - height * 0.45}
    L ${cx + width * 0.4} ${cy - height * 0.23}
    L ${cx + width * 0.4} ${cy + height * 0.23}
    L ${cx} ${cy + height * 0.45}
    L ${cx - width * 0.4} ${cy + height * 0.23}
    L ${cx - width * 0.4} ${cy - height * 0.23}
    Z
  `;
  
  g.append('path')
    .attr('d', hexPath)
    .attr('fill', color)
    .attr('stroke', white)
    .attr('stroke-width', 2);
  
  // Inner container boxes
  const boxSize = width * 0.15;
  g.append('rect')
    .attr('x', cx - boxSize / 2)
    .attr('y', cy - boxSize / 2)
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('fill', white)
    .attr('stroke', color)
    .attr('stroke-width', 1);
    }
  },

  /**
 * Kubernetes Deployment - Multiple pods
 */
  deployment: {
    id: 'k8s-deployment',
    name: 'Deployment',
    type: 'deployment',
    width: 90,
    height: 90,
    render: (g, width = 90, height = 90) => {
  const color = '#326CE5';
  const white = '#FFFFFF';
  
  // Background hexagon (larger)
  const bgHex = `
    M ${width * 0.5} ${height * 0.05}
    L ${width * 0.9} ${height * 0.27}
    L ${width * 0.9} ${height * 0.73}
    L ${width * 0.5} ${height * 0.95}
    L ${width * 0.1} ${height * 0.73}
    L ${width * 0.1} ${height * 0.27}
    Z
  `;
  
  g.append('path')
    .attr('d', bgHex)
    .attr('fill', color)
    .attr('stroke', white)
    .attr('stroke-width', 2);
  
  // Three small pods inside
  const podPositions = [
    { x: width * 0.3, y: height * 0.35 },
    { x: width * 0.7, y: height * 0.35 },
    { x: width * 0.5, y: height * 0.65 },
  ];
  
  podPositions.forEach(pos => {
    g.append('circle')
      .attr('cx', pos.x)
      .attr('cy', pos.y)
      .attr('r', width * 0.08)
      .attr('fill', white)
      .attr('stroke', color)
      .attr('stroke-width', 1.5);
  });
    }
  },

  /**
 * Kubernetes Service - Circle with endpoints
 */
  service: {
    id: 'k8s-service',
    name: 'Service',
    type: 'service',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#326CE5';
  const white = '#FFFFFF';
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.35;
  
  // Main circle
  g.append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('fill', color)
    .attr('stroke', white)
    .attr('stroke-width', 2);
  
  // Service endpoints (4 small circles around)
  const angles = [0, 90, 180, 270];
  angles.forEach(angle => {
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad) * (r + 12);
    const y = cy + Math.sin(rad) * (r + 12);
    
    g.append('circle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 5)
      .attr('fill', white)
      .attr('stroke', color)
      .attr('stroke-width', 2);
    
    // Connection line
    g.append('line')
      .attr('x1', cx + Math.cos(rad) * r)
      .attr('y1', cy + Math.sin(rad) * r)
      .attr('x2', x)
      .attr('y2', y)
      .attr('stroke', white)
      .attr('stroke-width', 1.5);
  });
    }
  },

  /**
 * Kubernetes Ingress - Entry gateway
 */
  ingress: {
    id: 'k8s-ingress',
    name: 'Ingress',
    type: 'ingress',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#FF6B6B';
  const white = '#FFFFFF';
  const cx = width / 2;
  const cy = height / 2;
  
  // Diamond/Gateway shape
  const diamondPath = `
    M ${cx} ${cy - height * 0.4}
    L ${cx + width * 0.4} ${cy}
    L ${cx} ${cy + height * 0.4}
    L ${cx - width * 0.4} ${cy}
    Z
  `;
  
  g.append('path')
    .attr('d', diamondPath)
    .attr('fill', color)
    .attr('stroke', white)
    .attr('stroke-width', 2);
  
  // Arrow pointing down (traffic flow)
  const arrowPath = `
    M ${cx} ${cy - height * 0.15}
    L ${cx} ${cy + height * 0.15}
    M ${cx - width * 0.1} ${cy + height * 0.05}
    L ${cx} ${cy + height * 0.15}
    L ${cx + width * 0.1} ${cy + height * 0.05}
  `;
  
  g.append('path')
    .attr('d', arrowPath)
    .attr('fill', 'none')
    .attr('stroke', white)
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');
    }
  },

  /**
 * Kubernetes PersistentVolume - Storage disk
 */
  persistentvolume: {
    id: 'k8s-persistentvolume',
    name: 'PersistentVolume',
    type: 'persistentvolume',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#95E1D3';
  const dark = '#079992';
  const cx = width / 2;
  
  // Cylinder (storage)
  const topY = height * 0.2;
  const bottomY = height * 0.8;
  const rx = width * 0.35;
  const ry = height * 0.1;
  
  // Cylinder body
  g.append('rect')
    .attr('x', cx - rx)
    .attr('y', topY)
    .attr('width', rx * 2)
    .attr('height', bottomY - topY)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Top ellipse
  g.append('ellipse')
    .attr('cx', cx)
    .attr('cy', topY)
    .attr('rx', rx)
    .attr('ry', ry)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Bottom ellipse
  g.append('ellipse')
    .attr('cx', cx)
    .attr('cy', bottomY)
    .attr('rx', rx)
    .attr('ry', ry)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // PV label
  g.append('text')
    .attr('x', cx)
    .attr('y', height * 0.5 + 5)
    .attr('text-anchor', 'middle')
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('fill', dark)
    .text('PV');
    }
  },

  /**
 * Kubernetes ConfigMap - Configuration document
 */
  configmap: {
    id: 'k8s-configmap',
    name: 'ConfigMap',
    type: 'configmap',
    width: 80,
    height: 60,
    render: (g, width = 80, height = 60) => {
  const color = '#F8B500';
  const dark = '#F39C12';
  
  // Document/file shape
  g.append('rect')
    .attr('x', width * 0.2)
    .attr('y', height * 0.1)
    .attr('width', width * 0.6)
    .attr('height', height * 0.7)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2)
    .attr('rx', 4);
  
  // Folded corner
  const cornerSize = width * 0.15;
  g.append('path')
    .attr('d', `
      M ${width * 0.8 - cornerSize} ${height * 0.1}
      L ${width * 0.8} ${height * 0.1 + cornerSize}
      L ${width * 0.8} ${height * 0.1}
      Z
    `)
    .attr('fill', dark);
  
  // Config lines
  for (let i = 0; i < 3; i++) {
    g.append('line')
      .attr('x1', width * 0.25)
      .attr('y1', height * (0.3 + i * 0.15))
      .attr('x2', width * 0.75)
      .attr('y2', height * (0.3 + i * 0.15))
      .attr('stroke', dark)
      .attr('stroke-width', 2);
  }
    }
  },

  /**
 * Kubernetes Secret - Locked document
 */
  secret: {
    id: 'k8s-secret',
    name: 'Secret',
    type: 'secret',
    width: 80,
    height: 60,
    render: (g, width = 80, height = 60) => {
  const color = '#E84545';
  const dark = '#C0392B';
  
  // Document background
  g.append('rect')
    .attr('x', width * 0.2)
    .attr('y', height * 0.1)
    .attr('width', width * 0.6)
    .attr('height', height * 0.7)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2)
    .attr('rx', 4);
  
  // Lock icon
  const cx = width / 2;
  const lockY = height * 0.35;
  
  // Lock shackle
  g.append('path')
    .attr('d', `
      M ${cx - width * 0.12} ${lockY}
      Q ${cx - width * 0.12} ${lockY - height * 0.12} ${cx} ${lockY - height * 0.12}
      Q ${cx + width * 0.12} ${lockY - height * 0.12} ${cx + width * 0.12} ${lockY}
    `)
    .attr('fill', 'none')
    .attr('stroke', dark)
    .attr('stroke-width', 3)
    .attr('stroke-linecap', 'round');
  
  // Lock body
  g.append('rect')
    .attr('x', cx - width * 0.15)
    .attr('y', lockY)
    .attr('width', width * 0.3)
    .attr('height', height * 0.25)
    .attr('fill', dark)
    .attr('rx', 4);
  
  // Keyhole
  g.append('circle')
    .attr('cx', cx)
    .attr('cy', lockY + height * 0.1)
    .attr('r', 4)
    .attr('fill', color);
    }
  },

  /**
 * Kubernetes Namespace - Container boundary
 */
  namespace: {
    id: 'k8s-namespace',
    name: 'Namespace',
    type: 'namespace',
    width: 500,
    height: 400,
    render: (g, width = 500, height = 400) => {
  const color = '#326CE5';
  
  // Namespace border (dashed)
  g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .attr('stroke', color)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '15,5')
    .attr('rx', 8);
  
  // Namespace label
  g.append('rect')
    .attr('x', 10)
    .attr('y', -18)
    .attr('width', 120)
    .attr('height', 36)
    .attr('fill', 'white')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('rx', 4);
  
  // K8s logo (simplified)
  const logoSize = 20;
  g.append('path')
    .attr('d', `
      M ${20 + logoSize / 2} ${-18 + 8}
      L ${20 + logoSize - 2} ${-18 + 13}
      L ${20 + logoSize - 2} ${-18 + 23}
      L ${20 + logoSize / 2} ${-18 + 28}
      L ${20 + 2} ${-18 + 23}
      L ${20 + 2} ${-18 + 13}
      Z
    `)
    .attr('fill', color);
  
  g.append('text')
    .attr('x', 50)
    .attr('y', 2)
    .attr('font-size', 14)
    .attr('font-weight', 'bold')
    .attr('fill', color)
    .text('Namespace');
    }
  },

  /**
 * Kubernetes Node - Physical/Virtual machine
 */
  node: {
    id: 'k8s-node',
    name: 'Node',
    type: 'node',
    width: 300,
    height: 250,
    render: (g, width = 300, height = 250) => {
  const color = '#326CE5';
  const light = '#E8F5E9';
  
  // Node box
  g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', light)
    .attr('stroke', color)
    .attr('stroke-width', 3)
    .attr('rx', 8);
  
  // Node label
  g.append('text')
    .attr('x', 10)
    .attr('y', 25)
    .attr('font-size', 16)
    .attr('font-weight', 'bold')
    .attr('fill', color)
    .text('Node');
  
  // CPU/Memory indicators
  const indicators = [
    { label: 'CPU', y: 50, value: 0.6 },
    { label: 'MEM', y: 80, value: 0.75 },
  ];
  
  indicators.forEach(ind => {
    g.append('text')
      .attr('x', 10)
      .attr('y', ind.y)
      .attr('font-size', 12)
      .attr('fill', color)
      .text(ind.label);
    
    // Progress bar
    g.append('rect')
      .attr('x', 60)
      .attr('y', ind.y - 12)
      .attr('width', 100)
      .attr('height', 15)
      .attr('fill', 'white')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('rx', 2);
    
    g.append('rect')
      .attr('x', 60)
      .attr('y', ind.y - 12)
      .attr('width', 100 * ind.value)
      .attr('height', 15)
      .attr('fill', color)
      .attr('rx', 2);
  });
    }
  }
};

export default kubernetesD3Shapes;

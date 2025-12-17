/**
 * GCP (Google Cloud Platform) D3 Shape Library
 * Professional D3.js implementations of GCP service shapes
 * Based on Google Cloud official icon guidelines
 */

import * as d3 from 'd3';

export interface GCPShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const gcpD3Shapes: Record<string, GCPShapeDefinition> = {
  /**
   * Compute Engine - Virtual machines
   */
  computeengine: {
    id: 'gcp-compute',
    name: 'Compute Engine',
    type: 'computeengine',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const red = '#EA4335';
      const darkRed = '#C5221F';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square (GCP style)
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', red)
        .attr('stroke', darkRed)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Server/compute icon - three horizontal lines
      for (let i = 0; i < 3; i++) {
        const y = cy - height * 0.2 + (i * height * 0.2);
        
        g.append('rect')
          .attr('x', width * 0.25)
          .attr('y', y)
          .attr('width', width * 0.5)
          .attr('height', height * 0.12)
          .attr('fill', white)
          .attr('rx', 2);
        
        // LED indicators
        g.append('circle')
          .attr('cx', width * 0.35)
          .attr('cy', y + height * 0.06)
          .attr('r', 2)
          .attr('fill', '#4CAF50');
      }
    }
  },

  /**
   * Cloud Functions - Serverless compute
   */
  cloudfunctions: {
    id: 'gcp-functions',
    name: 'Cloud Functions',
    type: 'cloudfunctions',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const yellow = '#FBBC04';
      const darkYellow = '#F9AB00';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', yellow)
        .attr('stroke', darkYellow)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Lightning bolt (serverless icon)
      const boltPath = `
        M ${cx + width * 0.08} ${cy - height * 0.3}
        L ${cx - width * 0.08} ${cy - height * 0.05}
        L ${cx + width * 0.12} ${cy - height * 0.05}
        L ${cx - width * 0.08} ${cy + height * 0.3}
        L ${cx + width * 0.08} ${cy + height * 0.05}
        L ${cx - width * 0.12} ${cy + height * 0.05}
        Z
      `;
      
      g.append('path')
        .attr('d', boltPath)
        .attr('fill', white);
    }
  },

  /**
   * Cloud Run - Containerized apps
   */
  cloudrun: {
    id: 'gcp-run',
    name: 'Cloud Run',
    type: 'cloudrun',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Play/run button icon
      const playPath = `
        M ${cx - width * 0.1} ${cy - height * 0.25}
        L ${cx + width * 0.25} ${cy}
        L ${cx - width * 0.1} ${cy + height * 0.25}
        Z
      `;
      
      g.append('path')
        .attr('d', playPath)
        .attr('fill', white);
    }
  },

  /**
   * Cloud Storage - Object storage
   */
  cloudstorage: {
    id: 'gcp-storage',
    name: 'Cloud Storage',
    type: 'cloudstorage',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Storage buckets - three folders
      const folderYPositions = [0.25, 0.43, 0.61];
      
      folderYPositions.forEach((yPos, idx) => {
        // Folder tab
        g.append('path')
          .attr('d', `
            M ${width * 0.22} ${height * yPos}
            L ${width * 0.35} ${height * yPos}
            L ${width * 0.38} ${height * (yPos - 0.05)}
            L ${width * 0.78} ${height * (yPos - 0.05)}
            L ${width * 0.78} ${height * (yPos + 0.1)}
            L ${width * 0.22} ${height * (yPos + 0.1)}
            Z
          `)
          .attr('fill', white)
          .attr('opacity', 0.9 - idx * 0.1);
      });
    }
  },

  /**
   * Cloud SQL - Managed database
   */
  cloudsql: {
    id: 'gcp-sql',
    name: 'Cloud SQL',
    type: 'cloudsql',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      const cx = width / 2;
      const topY = height * 0.2;
      const bottomY = height * 0.75;
      const rx = width * 0.32;
      const ry = height * 0.09;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Database cylinder
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
      
      // Data lines
      [0.35, 0.5, 0.65].forEach(yRatio => {
        g.append('line')
          .attr('x1', width * 0.25)
          .attr('y1', height * yRatio)
          .attr('x2', width * 0.75)
          .attr('y2', height * yRatio)
          .attr('stroke', blue)
          .attr('stroke-width', 1.5);
      });
    }
  },

  /**
   * BigQuery - Data warehouse
   */
  bigquery: {
    id: 'gcp-bigquery',
    name: 'BigQuery',
    type: 'bigquery',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Lightning bolt for speed
      const boltPath = `
        M ${cx + width * 0.05} ${cy - height * 0.25}
        L ${cx - width * 0.1} ${cy}
        L ${cx + width * 0.08} ${cy}
        L ${cx - width * 0.05} ${cy + height * 0.25}
        L ${cx + width * 0.1} ${cy}
        L ${cx - width * 0.08} ${cy}
        Z
      `;
      
      g.append('path')
        .attr('d', boltPath)
        .attr('fill', white);
      
      // Chart bars (analytics)
      const barWidths = [0.15, 0.25, 0.2, 0.3];
      barWidths.forEach((barWidth, idx) => {
        const x = width * (0.25 + idx * 0.12);
        g.append('rect')
          .attr('x', x)
          .attr('y', cy + height * (0.35 - barWidth))
          .attr('width', width * 0.08)
          .attr('height', height * barWidth)
          .attr('fill', white)
          .attr('opacity', 0.7);
      });
    }
  },

  /**
   * Firestore - NoSQL document database
   */
  firestore: {
    id: 'gcp-firestore',
    name: 'Firestore',
    type: 'firestore',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const yellow = '#FBBC04';
      const darkYellow = '#F9AB00';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', yellow)
        .attr('stroke', darkYellow)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Document stack
      const docCount = 3;
      for (let i = 0; i < docCount; i++) {
        const offset = i * 6;
        
        g.append('rect')
          .attr('x', width * 0.25 + offset)
          .attr('y', height * 0.25 + offset)
          .attr('width', width * 0.4)
          .attr('height', height * 0.45)
          .attr('fill', white)
          .attr('opacity', 0.9 - i * 0.15)
          .attr('rx', 2);
        
        // Document lines (only on top document)
        if (i === docCount - 1) {
          [0.35, 0.45, 0.55].forEach(yRatio => {
            g.append('line')
              .attr('x1', width * 0.3 + offset)
              .attr('y1', height * yRatio + offset)
              .attr('x2', width * 0.6 + offset)
              .attr('y2', height * yRatio + offset)
              .attr('stroke', yellow)
              .attr('stroke-width', 2);
          });
        }
      }
    }
  },

  /**
   * VPC Network - Virtual private cloud
   */
  vpc: {
    id: 'gcp-vpc',
    name: 'VPC Network',
    type: 'vpc',
    width: 500,
    height: 400,
    render: (g, width = 500, height = 400) => {
      const blue = '#4285F4';
      
      // VPC border
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .attr('stroke', blue)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '12,6')
        .attr('rx', 8);
      
      // VPC label background
      g.append('rect')
        .attr('x', 10)
        .attr('y', -20)
        .attr('width', 120)
        .attr('height', 40)
        .attr('fill', 'white')
        .attr('stroke', blue)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Network icon (interconnected nodes)
      const nodes = [
        { x: 30, y: 5 },
        { x: 60, y: 5 },
        { x: 45, y: -10 },
        { x: 75, y: -10 }
      ];
      
      // Connection lines
      [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]].forEach(([i, j]) => {
        g.append('line')
          .attr('x1', nodes[i].x)
          .attr('y1', nodes[i].y)
          .attr('x2', nodes[j].x)
          .attr('y2', nodes[j].y)
          .attr('stroke', blue)
          .attr('stroke-width', 2);
      });
      
      // Nodes
      nodes.forEach(node => {
        g.append('circle')
          .attr('cx', node.x)
          .attr('cy', node.y)
          .attr('r', 4)
          .attr('fill', blue);
      });
      
      g.append('text')
        .attr('x', 95)
        .attr('y', 8)
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', blue)
        .text('VPC');
    }
  },

  /**
   * Cloud Load Balancing - Traffic distribution
   */
  loadbalancing: {
    id: 'gcp-lb',
    name: 'Load Balancing',
    type: 'loadbalancing',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const green = '#34A853';
      const darkGreen = '#0F9D58';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', green)
        .attr('stroke', darkGreen)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Load balancer icon - one input, three outputs
      // Input node
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy - height * 0.25)
        .attr('r', width * 0.08)
        .attr('fill', white);
      
      // Center hub
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', width * 0.12)
        .attr('fill', white);
      
      // Input line
      g.append('line')
        .attr('x1', cx)
        .attr('y1', cy - height * 0.17)
        .attr('x2', cx)
        .attr('y2', cy - height * 0.12)
        .attr('stroke', white)
        .attr('stroke-width', 3);
      
      // Output nodes and lines
      [-0.25, 0, 0.25].forEach(xOffset => {
        const x = cx + width * xOffset;
        const y = cy + height * 0.25;
        
        g.append('line')
          .attr('x1', cx)
          .attr('y1', cy + height * 0.12)
          .attr('x2', x)
          .attr('y2', y - height * 0.08)
          .attr('stroke', white)
          .attr('stroke-width', 2.5);
        
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', width * 0.08)
          .attr('fill', white);
      });
    }
  },

  /**
   * Cloud CDN - Content delivery network
   */
  cloudcdn: {
    id: 'gcp-cdn',
    name: 'Cloud CDN',
    type: 'cloudcdn',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const green = '#34A853';
      const darkGreen = '#0F9D58';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', green)
        .attr('stroke', darkGreen)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Globe representation
      const r = width * 0.28;
      
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', white)
        .attr('stroke-width', 2.5);
      
      // Latitude lines
      [-0.15, 0, 0.15].forEach(offset => {
        g.append('ellipse')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('rx', r)
          .attr('ry', r * 0.3)
          .attr('transform', `translate(0, ${offset * r})`)
          .attr('fill', 'none')
          .attr('stroke', white)
          .attr('stroke-width', 1.5);
      });
      
      // Longitude line
      g.append('ellipse')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('rx', r * 0.3)
        .attr('ry', r)
        .attr('fill', 'none')
        .attr('stroke', white)
        .attr('stroke-width', 1.5);
    }
  },

  /**
   * Cloud Pub/Sub - Messaging service
   */
  pubsub: {
    id: 'gcp-pubsub',
    name: 'Pub/Sub',
    type: 'pubsub',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const green = '#34A853';
      const darkGreen = '#0F9D58';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', green)
        .attr('stroke', darkGreen)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Pub/Sub icon - message flow
      // Publisher
      g.append('circle')
        .attr('cx', cx - width * 0.25)
        .attr('cy', cy)
        .attr('r', width * 0.1)
        .attr('fill', white);
      
      // Message queue (center)
      g.append('rect')
        .attr('x', cx - width * 0.08)
        .attr('y', cy - height * 0.15)
        .attr('width', width * 0.16)
        .attr('height', height * 0.3)
        .attr('fill', white)
        .attr('rx', 2);
      
      // Subscribers
      [cy - height * 0.18, cy + height * 0.18].forEach(y => {
        g.append('circle')
          .attr('cx', cx + width * 0.25)
          .attr('cy', y)
          .attr('r', width * 0.08)
          .attr('fill', white);
        
        // Connection lines
        g.append('line')
          .attr('x1', cx + width * 0.08)
          .attr('y1', cy)
          .attr('x2', cx + width * 0.17)
          .attr('y2', y)
          .attr('stroke', white)
          .attr('stroke-width', 2);
      });
      
      // Arrow to queue
      g.append('line')
        .attr('x1', cx - width * 0.15)
        .attr('y1', cy)
        .attr('x2', cx - width * 0.08)
        .attr('y2', cy)
        .attr('stroke', white)
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow-white)');
    }
  },

  /**
   * API Gateway - API management
   */
  apigateway: {
    id: 'gcp-apigateway',
    name: 'API Gateway',
    type: 'apigateway',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // API Gateway icon - puzzle piece connection
      // Left connector
      g.append('rect')
        .attr('x', width * 0.2)
        .attr('y', cy - height * 0.15)
        .attr('width', width * 0.2)
        .attr('height', height * 0.3)
        .attr('fill', white)
        .attr('rx', 3);
      
      // Center piece
      g.append('rect')
        .attr('x', width * 0.4)
        .attr('y', cy - height * 0.2)
        .attr('width', width * 0.2)
        .attr('height', height * 0.4)
        .attr('fill', white)
        .attr('rx', 3);
      
      // Right connector
      g.append('rect')
        .attr('x', width * 0.6)
        .attr('y', cy - height * 0.15)
        .attr('width', width * 0.2)
        .attr('height', height * 0.3)
        .attr('fill', white)
        .attr('rx', 3);
      
      // API text
      g.append('text')
        .attr('x', cx)
        .attr('y', cy + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', 'bold')
        .attr('fill', blue)
        .text('API');
    }
  },

  /**
   * GKE - Google Kubernetes Engine
   */
  gke: {
    id: 'gcp-gke',
    name: 'GKE',
    type: 'gke',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const blue = '#4285F4';
      const darkBlue = '#1967D2';
      const white = '#FFFFFF';
      const k8sBlue = '#326CE5';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square (GCP style)
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', blue)
        .attr('stroke', darkBlue)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Kubernetes wheel
      const spokeCount = 7;
      const innerRadius = width * 0.13;
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

  /**
   * Cloud Monitoring - Operations monitoring
   */
  monitoring: {
    id: 'gcp-monitoring',
    name: 'Monitoring',
    type: 'monitoring',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const yellow = '#FBBC04';
      const darkYellow = '#F9AB00';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', yellow)
        .attr('stroke', darkYellow)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Monitoring graph line
      const points = [
        { x: 0.2, y: 0.6 },
        { x: 0.3, y: 0.45 },
        { x: 0.4, y: 0.55 },
        { x: 0.5, y: 0.35 },
        { x: 0.6, y: 0.5 },
        { x: 0.7, y: 0.4 },
        { x: 0.8, y: 0.65 }
      ];
      
      let pathData = `M ${width * points[0].x} ${height * points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${width * points[i].x} ${height * points[i].y}`;
      }
      
      g.append('path')
        .attr('d', pathData)
        .attr('stroke', white)
        .attr('stroke-width', 2.5)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
      
      // Baseline
      g.append('line')
        .attr('x1', width * 0.2)
        .attr('y1', height * 0.7)
        .attr('x2', width * 0.8)
        .attr('y2', height * 0.7)
        .attr('stroke', white)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6);
    }
  },

  /**
   * Cloud Armor - DDoS protection and WAF
   */
  cloudarmor: {
    id: 'gcp-armor',
    name: 'Cloud Armor',
    type: 'cloudarmor',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const red = '#EA4335';
      const darkRed = '#C5221F';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer rounded square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', red)
        .attr('stroke', darkRed)
        .attr('stroke-width', 2)
        .attr('rx', 8);
      
      // Shield shape
      const shieldPath = `
        M ${cx} ${height * 0.2}
        L ${width * 0.75} ${height * 0.32}
        L ${width * 0.75} ${height * 0.55}
        Q ${cx} ${height * 0.8} ${width * 0.25} ${height * 0.55}
        L ${width * 0.25} ${height * 0.32}
        Z
      `;
      
      g.append('path')
        .attr('d', shieldPath)
        .attr('fill', white)
        .attr('opacity', 0.9);
      
      // Checkmark inside shield
      const checkPath = `
        M ${width * 0.38} ${cy}
        L ${cx - width * 0.05} ${cy + height * 0.12}
        L ${width * 0.62} ${cy - height * 0.1}
      `;
      
      g.append('path')
        .attr('d', checkPath)
        .attr('stroke', red)
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }
  },
};

export default gcpD3Shapes;

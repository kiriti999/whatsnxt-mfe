/**
 * AWS Architecture D3 Shape Library
 * Professional D3.js implementations of AWS service shapes
 * Based on AWS official icon guidelines
 */

import * as d3 from 'd3';

export interface AWSShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const awsD3Shapes: Record<string, AWSShapeDefinition> = {
  /**
   * AWS EC2 Instance - Server icon with AWS orange
   */
  ec2: {
    id: 'aws-ec2',
    name: 'EC2',
    type: 'ec2',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#FF9900';
  const dark = '#232F3E';
  
  // Main server body
  g.append('rect')
    .attr('x', width * 0.2)
    .attr('y', height * 0.1)
    .attr('width', width * 0.6)
    .attr('height', height * 0.8)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2)
    .attr('rx', 4);
  
  // Server details (horizontal lines)
  for (let i = 0; i < 3; i++) {
    g.append('line')
      .attr('x1', width * 0.25)
      .attr('y1', height * (0.25 + i * 0.2))
      .attr('x2', width * 0.75)
      .attr('y2', height * (0.25 + i * 0.2))
      .attr('stroke', dark)
      .attr('stroke-width', 2);
  }
  
  // LED indicators
  g.append('circle')
    .attr('cx', width * 0.3)
    .attr('cy', height * 0.85)
    .attr('r', 3)
    .attr('fill', '#00FF00');
    }
  },

  /**
   * AWS Lambda - Hexagon with lambda symbol
   */
  lambda: {
    id: 'aws-lambda',
    name: 'Lambda',
    type: 'lambda',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#FF9900';
  const dark = '#232F3E';
  const cx = width / 2;
  const cy = height / 2;
  
  // Hexagon path
  const hexPath = `
    M ${cx - width * 0.4} ${cy}
    L ${cx - width * 0.2} ${cy - height * 0.35}
    L ${cx + width * 0.2} ${cy - height * 0.35}
    L ${cx + width * 0.4} ${cy}
    L ${cx + width * 0.2} ${cy + height * 0.35}
    L ${cx - width * 0.2} ${cy + height * 0.35}
    Z
  `;
  
  g.append('path')
    .attr('d', hexPath)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Lambda symbol (λ)
  g.append('text')
    .attr('x', cx)
    .attr('y', cy + 8)
    .attr('text-anchor', 'middle')
    .attr('font-size', width * 0.5)
    .attr('font-weight', 'bold')
    .attr('fill', dark)
    .text('λ');
    }
  },

/**
 * AWS S3 - Bucket icon
 */
  s3: {
    id: 'aws-s3',
    name: 'S3',
    type: 's3',
    width: 80,
    height: 70,
    render: (g, width = 80, height = 70) => {
  const color = '#569A31';
  const dark = '#232F3E';
  
  // Top ellipse
  g.append('ellipse')
    .attr('cx', width / 2)
    .attr('cy', height * 0.2)
    .attr('rx', width * 0.35)
    .attr('ry', height * 0.12)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Bucket body
  const bucketPath = `
    M ${width * 0.15} ${height * 0.2}
    L ${width * 0.2} ${height * 0.8}
    Q ${width * 0.5} ${height * 0.9} ${width * 0.8} ${height * 0.8}
    L ${width * 0.85} ${height * 0.2}
  `;
  
  g.append('path')
    .attr('d', bucketPath)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Bottom curve
  g.append('path')
    .attr('d', `M ${width * 0.2} ${height * 0.8} Q ${width * 0.5} ${height * 0.9} ${width * 0.8} ${height * 0.8}`)
    .attr('fill', 'none')
    .attr('stroke', dark)
    .attr('stroke-width', 2);
    }
  },

  /**
 * AWS RDS - Database cylinder
 */
  rds: {
    id: 'aws-rds',
    name: 'RDS',
    type: 'rds',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#3B48CC';
  const dark = '#232F3E';
  const cx = width / 2;
  const topY = height * 0.15;
  const bottomY = height * 0.85;
  const rx = width * 0.4;
  const ry = height * 0.12;
  
  // Cylinder body
  g.append('path')
    .attr('d', `
      M ${cx - rx} ${topY}
      L ${cx - rx} ${bottomY}
      Q ${cx} ${bottomY + ry * 2} ${cx + rx} ${bottomY}
      L ${cx + rx} ${topY}
    `)
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
  
  // Top ellipse highlight
  g.append('path')
    .attr('d', `M ${cx - rx} ${topY} Q ${cx} ${topY + ry * 2} ${cx + rx} ${topY}`)
    .attr('fill', 'none')
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Data lines
  for (let i = 1; i <= 2; i++) {
    g.append('line')
      .attr('x1', width * 0.25)
      .attr('y1', height * (0.3 + i * 0.15))
      .attr('x2', width * 0.75)
      .attr('y2', height * (0.3 + i * 0.15))
      .attr('stroke', dark)
      .attr('stroke-width', 1.5);
  }
    }
  },

  /**
 * AWS VPC - Cloud container
 */
  vpc: {
    id: 'aws-vpc',
    name: 'VPC',
    type: 'vpc',
    width: 500,
    height: 400,
    render: (g, width = 500, height = 400) => {
  const color = '#147EBA';
  
  // Main VPC border
  g.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .attr('stroke', color)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '10,5')
    .attr('rx', 8);
  
  // VPC label background
  g.append('rect')
    .attr('x', 10)
    .attr('y', -15)
    .attr('width', 80)
    .attr('height', 30)
    .attr('fill', 'white')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('rx', 4);
  
  // VPC icon (cloud)
  const cloudPath = `
    M ${25} ${5}
    Q ${20} ${0} ${30} ${0}
    Q ${35} ${-2} ${40} ${2}
    Q ${45} ${0} ${48} ${5}
    Q ${50} ${8} ${45} ${10}
    L ${25} ${10}
    Q ${20} ${8} ${25} ${5}
  `;
  
  g.append('path')
    .attr('d', cloudPath)
    .attr('fill', color)
    .attr('stroke', color)
    .attr('stroke-width', 1);
  
  g.append('text')
    .attr('x', 55)
    .attr('y', 8)
    .attr('font-size', 12)
    .attr('font-weight', 'bold')
    .attr('fill', color)
    .text('VPC');
    }
  },

/**
 * AWS ELB - Load Balancer (Traffic distribution)
 */
  elb: {
    id: 'aws-elb',
    name: 'ELB',
    type: 'elb',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#8C4FFF';
  const dark = '#232F3E';
  const cx = width / 2;
  const cy = height / 2;
  
  // Diamond shape
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
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Arrows inside (traffic flow)
  const arrowSize = width * 0.15;
  // Down arrow
  g.append('path')
    .attr('d', `M ${cx} ${cy - arrowSize} L ${cx - arrowSize * 0.5} ${cy} L ${cx + arrowSize * 0.5} ${cy} Z`)
    .attr('fill', dark);
  
  // Up arrow
  g.append('path')
    .attr('d', `M ${cx} ${cy + arrowSize} L ${cx - arrowSize * 0.5} ${cy} L ${cx + arrowSize * 0.5} ${cy} Z`)
    .attr('fill', dark);
    }
  },

  /**
 * AWS DynamoDB - NoSQL database
 */
  dynamodb: {
    id: 'aws-dynamodb',
    name: 'DynamoDB',
    type: 'dynamodb',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#3B48CC';
  const dark = '#232F3E';
  
  // Three stacked disks
  for (let i = 0; i < 3; i++) {
    const y = height * (0.2 + i * 0.25);
    
    // Disk body
    g.append('ellipse')
      .attr('cx', width / 2)
      .attr('cy', y)
      .attr('rx', width * 0.4)
      .attr('ry', height * 0.1)
      .attr('fill', color)
      .attr('stroke', dark)
      .attr('stroke-width', 2);
    
    // Highlight on top
    g.append('path')
      .attr('d', `M ${width * 0.1} ${y} Q ${width * 0.5} ${y - height * 0.05} ${width * 0.9} ${y}`)
      .attr('fill', 'none')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);
  }
    }
  },

  /**
 * AWS CloudFront - CDN (Globe with arrows)
 */
  cloudfront: {
    id: 'aws-cloudfront',
    name: 'CloudFront',
    type: 'cloudfront',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const color = '#8C4FFF';
  const dark = '#232F3E';
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.35;
  
  // Globe circle
  g.append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', r)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // Latitude lines
  for (let i = -1; i <= 1; i++) {
    g.append('ellipse')
      .attr('cx', cx)
      .attr('cy', cy)
      .attr('rx', r)
      .attr('ry', r * 0.3)
      .attr('transform', `translate(0, ${i * r * 0.5})`)
      .attr('fill', 'none')
      .attr('stroke', dark)
      .attr('stroke-width', 1);
  }
  
  // Longitude line
  g.append('ellipse')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('rx', r * 0.3)
    .attr('ry', r)
    .attr('fill', 'none')
    .attr('stroke', dark)
    .attr('stroke-width', 1);
  
  // Distribution arrows
  const arrowPoints = [
    { angle: 45, distance: r * 1.3 },
    { angle: 135, distance: r * 1.3 },
    { angle: 225, distance: r * 1.3 },
    { angle: 315, distance: r * 1.3 },
  ];
  
  arrowPoints.forEach(({ angle, distance }) => {
    const rad = (angle * Math.PI) / 180;
    const x = cx + Math.cos(rad) * distance;
    const y = cy + Math.sin(rad) * distance;
    
    g.append('path')
      .attr('d', `M ${cx + Math.cos(rad) * r} ${cy + Math.sin(rad) * r} L ${x} ${y}`)
      .attr('stroke', dark)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow-cf)');
  });
    }
  },

  /**
 * AWS IAM - Identity shield
 */
  iam: {
    id: 'aws-iam',
    name: 'IAM',
    type: 'iam',
    width: 80,
    height: 60,
    render: (g, width = 80, height = 60) => {
  const color = '#DD344C';
  const dark = '#232F3E';
  const cx = width / 2;
  
  // Shield shape
  const shieldPath = `
    M ${cx} ${height * 0.1}
    L ${width * 0.8} ${height * 0.25}
    L ${width * 0.8} ${height * 0.6}
    Q ${cx} ${height * 0.9} ${width * 0.2} ${height * 0.6}
    L ${width * 0.2} ${height * 0.25}
    Z
  `;
  
  g.append('path')
    .attr('d', shieldPath)
    .attr('fill', color)
    .attr('stroke', dark)
    .attr('stroke-width', 2);
  
  // User icon
  g.append('circle')
    .attr('cx', cx)
    .attr('cy', height * 0.35)
    .attr('r', width * 0.12)
    .attr('fill', dark);
  
  g.append('path')
    .attr('d', `M ${width * 0.35} ${height * 0.55} Q ${cx} ${height * 0.65} ${width * 0.65} ${height * 0.55}`)
    .attr('fill', dark);
    }
  },

  /**
 * Export all AWS shape renderers
 */
};

export default awsD3Shapes;

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
   * AWS EC2 Instance - Compute cube with AWS orange
   * Based on official AWS Architecture Icons
   */
  ec2: {
    id: 'aws-ec2',
    name: 'EC2',
    type: 'ec2',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const orange = '#FF9900';
  const darkOrange = '#CC7A00';
  const white = '#FFFFFF';
  const cx = width / 2;
  const cy = height / 2;
  
  // Outer square with rounded corners
  g.append('rect')
    .attr('x', width * 0.1)
    .attr('y', height * 0.1)
    .attr('width', width * 0.8)
    .attr('height', height * 0.8)
    .attr('fill', orange)
    .attr('stroke', darkOrange)
    .attr('stroke-width', 2)
    .attr('rx', 6);
  
  // 3D cube representation (isometric view)
  // Front face
  g.append('rect')
    .attr('x', width * 0.25)
    .attr('y', height * 0.35)
    .attr('width', width * 0.3)
    .attr('height', width * 0.3)
    .attr('fill', white)
    .attr('opacity', 0.9);
  
  // Top face (parallelogram)
  const topPath = `
    M ${width * 0.25} ${height * 0.35}
    L ${width * 0.35} ${height * 0.25}
    L ${width * 0.65} ${height * 0.25}
    L ${width * 0.55} ${height * 0.35}
    Z
  `;
  g.append('path')
    .attr('d', topPath)
    .attr('fill', white)
    .attr('opacity', 0.7);
  
  // Right face (parallelogram)
  const rightPath = `
    M ${width * 0.55} ${height * 0.35}
    L ${width * 0.65} ${height * 0.25}
    L ${width * 0.65} ${height * 0.55}
    L ${width * 0.55} ${height * 0.65}
    Z
  `;
  g.append('path')
    .attr('d', rightPath)
    .attr('fill', white)
    .attr('opacity', 0.5);
  
  // EC2 icon detail - server lines
  for (let i = 0; i < 2; i++) {
    g.append('line')
      .attr('x1', width * 0.28)
      .attr('y1', height * (0.42 + i * 0.1))
      .attr('x2', width * 0.52)
      .attr('y2', height * (0.42 + i * 0.1))
      .attr('stroke', orange)
      .attr('stroke-width', 2);
  }
    }
  },

  /**
   * AWS Lambda - Function icon with orange background
   * Lambda symbol in a squared border
   */
  lambda: {
    id: 'aws-lambda',
    name: 'Lambda',
    type: 'lambda',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
  const orange = '#FF9900';
  const darkOrange = '#CC7A00';
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
  
  // Inner white rounded square for icon
  g.append('rect')
    .attr('x', width * 0.2)
    .attr('y', height * 0.2)
    .attr('width', width * 0.6)
    .attr('height', height * 0.6)
    .attr('fill', white)
    .attr('rx', 4);
  
  // Lambda symbol (λ) - custom drawn
  const lambdaPath = `
    M ${width * 0.35} ${height * 0.3}
    L ${width * 0.45} ${height * 0.3}
    L ${width * 0.55} ${height * 0.55}
    L ${width * 0.65} ${height * 0.7}
    L ${width * 0.57} ${height * 0.7}
    L ${width * 0.5} ${height * 0.6}
    L ${width * 0.43} ${height * 0.7}
    L ${width * 0.35} ${height * 0.7}
    Z
  `;
  
  g.append('path')
    .attr('d', lambdaPath)
    .attr('fill', orange)
    .attr('stroke', orange)
    .attr('stroke-width', 1);
    }
  },

/**
 * AWS S3 - Storage bucket with gradient
 * Based on AWS official S3 icon
 */
  s3: {
    id: 'aws-s3',
    name: 'S3',
    type: 's3',
    width: 80,
    height: 70,
    render: (g, width = 80, height = 70) => {
  const green = '#569A31';
  const darkGreen = '#3D6E24';
  const white = '#FFFFFF';
  
  // Outer square
  g.append('rect')
    .attr('x', width * 0.1)
    .attr('y', height * 0.05)
    .attr('width', width * 0.8)
    .attr('height', height * 0.9)
    .attr('fill', green)
    .attr('stroke', darkGreen)
    .attr('stroke-width', 2)
    .attr('rx', 6);
  
  // S3 bucket icon - three horizontal sections
  const sectionHeight = height * 0.15;
  const startY = height * 0.25;
  
  for (let i = 0; i < 3; i++) {
    const y = startY + (i * sectionHeight);
    
    // Section rectangle
    g.append('rect')
      .attr('x', width * 0.2)
      .attr('y', y)
      .attr('width', width * 0.6)
      .attr('height', sectionHeight * 0.8)
      .attr('fill', white)
      .attr('opacity', 0.9)
      .attr('rx', 2);
    
    // Small circles (bucket representation)
    g.append('circle')
      .attr('cx', width * 0.3)
      .attr('cy', y + sectionHeight * 0.4)
      .attr('r', 3)
      .attr('fill', green);
    
    g.append('circle')
      .attr('cx', width * 0.5)
      .attr('cy', y + sectionHeight * 0.4)
      .attr('r', 3)
      .attr('fill', green);
    
    g.append('circle')
      .attr('cx', width * 0.7)
      .attr('cy', y + sectionHeight * 0.4)
      .attr('r', 3)
      .attr('fill', green);
  }
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
 * AWS IAM - Identity shield with user icon
 */
  iam: {
    id: 'aws-iam',
    name: 'IAM',
    type: 'iam',
    width: 80,
    height: 60,
    render: (g, width = 80, height = 60) => {
  const red = '#DD344C';
  const darkRed = '#A91B2E';
  const white = '#FFFFFF';
  const cx = width / 2;
  
  // Outer square
  g.append('rect')
    .attr('x', width * 0.1)
    .attr('y', height * 0.05)
    .attr('width', width * 0.8)
    .attr('height', height * 0.9)
    .attr('fill', red)
    .attr('stroke', darkRed)
    .attr('stroke-width', 2)
    .attr('rx', 6);
  
  // Shield shape inside
  const shieldPath = `
    M ${cx} ${height * 0.2}
    L ${width * 0.75} ${height * 0.3}
    L ${width * 0.75} ${height * 0.6}
    Q ${cx} ${height * 0.8} ${width * 0.25} ${height * 0.6}
    L ${width * 0.25} ${height * 0.3}
    Z
  `;
  
  g.append('path')
    .attr('d', shieldPath)
    .attr('fill', white)
    .attr('opacity', 0.9);
  
  // User icon inside shield
  g.append('circle')
    .attr('cx', cx)
    .attr('cy', height * 0.42)
    .attr('r', width * 0.08)
    .attr('fill', red);
  
  g.append('path')
    .attr('d', `M ${width * 0.38} ${height * 0.6} Q ${cx} ${height * 0.67} ${width * 0.62} ${height * 0.6}`)
    .attr('fill', red)
    .attr('stroke', red)
    .attr('stroke-width', 2);
    }
  },

  /**
   * AWS EKS - Elastic Kubernetes Service
   * Kubernetes wheel inside AWS square
   */
  eks: {
    id: 'aws-eks',
    name: 'EKS',
    type: 'eks',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const orange = '#FF9900';
      const darkOrange = '#CC7A00';
      const white = '#FFFFFF';
      const blue = '#326CE5';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer AWS square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', orange)
        .attr('stroke', darkOrange)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Kubernetes wheel (simplified)
      const spokeCount = 7;
      const innerRadius = width * 0.15;
      const outerRadius = width * 0.3;
      
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
          .attr('stroke-width', 3);
      }
      
      // Center circle
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', innerRadius)
        .attr('fill', blue)
        .attr('stroke', white)
        .attr('stroke-width', 2);
    }
  },

  /**
   * AWS API Gateway - API management
   */
  apigateway: {
    id: 'aws-apigateway',
    name: 'API Gateway',
    type: 'apigateway',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const purple = '#8C4FFF';
      const darkPurple = '#6B3CC5';
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
      
      // API symbol - gateway representation
      // Left bracket
      g.append('path')
        .attr('d', `
          M ${width * 0.25} ${height * 0.3}
          L ${width * 0.3} ${height * 0.3}
          L ${width * 0.3} ${height * 0.7}
          L ${width * 0.25} ${height * 0.7}
        `)
        .attr('stroke', white)
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');
      
      // Right bracket
      g.append('path')
        .attr('d', `
          M ${width * 0.75} ${height * 0.3}
          L ${width * 0.7} ${height * 0.3}
          L ${width * 0.7} ${height * 0.7}
          L ${width * 0.75} ${height * 0.7}
        `)
        .attr('stroke', white)
        .attr('stroke-width', 3)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');
      
      // Center diamond
      const diamondSize = width * 0.12;
      const diamondPath = `
        M ${cx} ${cy - diamondSize}
        L ${cx + diamondSize} ${cy}
        L ${cx} ${cy + diamondSize}
        L ${cx - diamondSize} ${cy}
        Z
      `;
      
      g.append('path')
        .attr('d', diamondPath)
        .attr('fill', white)
        .attr('opacity', 0.9);
    }
  },

  /**
   * AWS SNS - Simple Notification Service
   */
  sns: {
    id: 'aws-sns',
    name: 'SNS',
    type: 'sns',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const pink = '#E7157B';
      const darkPink = '#B4115F';
      const white = '#FFFFFF';
      const cx = width / 2;
      const cy = height / 2;
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', pink)
        .attr('stroke', darkPink)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Notification bell
      const bellPath = `
        M ${cx - width * 0.15} ${cy}
        Q ${cx - width * 0.15} ${cy - height * 0.2} ${cx} ${cy - height * 0.2}
        Q ${cx + width * 0.15} ${cy - height * 0.2} ${cx + width * 0.15} ${cy}
        L ${cx + width * 0.18} ${cy + height * 0.05}
        L ${cx - width * 0.18} ${cy + height * 0.05}
        Z
      `;
      
      g.append('path')
        .attr('d', bellPath)
        .attr('fill', white)
        .attr('opacity', 0.9);
      
      // Bell clapper
      g.append('circle')
        .attr('cx', cx)
        .attr('cy', cy + height * 0.08)
        .attr('r', width * 0.05)
        .attr('fill', white);
      
      // Notification waves
      for (let i = 1; i <= 2; i++) {
        g.append('path')
          .attr('d', `
            M ${cx - width * 0.08 * i} ${cy - height * 0.25}
            Q ${cx - width * 0.15 * i} ${cy - height * 0.3} ${cx - width * 0.2 * i} ${cy - height * 0.25}
          `)
          .attr('stroke', white)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round');
        
        g.append('path')
          .attr('d', `
            M ${cx + width * 0.08 * i} ${cy - height * 0.25}
            Q ${cx + width * 0.15 * i} ${cy - height * 0.3} ${cx + width * 0.2 * i} ${cy - height * 0.25}
          `)
          .attr('stroke', white)
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round');
      }
    }
  },

  /**
   * AWS SQS - Simple Queue Service
   */
  sqs: {
    id: 'aws-sqs',
    name: 'SQS',
    type: 'sqs',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      const pink = '#E7157B';
      const darkPink = '#B4115F';
      const white = '#FFFFFF';
      
      // Outer square
      g.append('rect')
        .attr('x', width * 0.1)
        .attr('y', height * 0.1)
        .attr('width', width * 0.8)
        .attr('height', height * 0.8)
        .attr('fill', pink)
        .attr('stroke', darkPink)
        .attr('stroke-width', 2)
        .attr('rx', 6);
      
      // Queue representation - 3 message boxes
      const boxWidth = width * 0.18;
      const boxHeight = height * 0.15;
      const spacing = width * 0.05;
      const startX = width * 0.2;
      const startY = height * 0.35;
      
      for (let i = 0; i < 3; i++) {
        const x = startX + i * (boxWidth + spacing);
        
        g.append('rect')
          .attr('x', x)
          .attr('y', startY)
          .attr('width', boxWidth)
          .attr('height', boxHeight)
          .attr('fill', white)
          .attr('opacity', 0.9)
          .attr('rx', 2);
        
        // Message lines
        g.append('line')
          .attr('x1', x + boxWidth * 0.2)
          .attr('y1', startY + boxHeight * 0.4)
          .attr('x2', x + boxWidth * 0.8)
          .attr('y2', startY + boxHeight * 0.4)
          .attr('stroke', pink)
          .attr('stroke-width', 1.5);
        
        g.append('line')
          .attr('x1', x + boxWidth * 0.2)
          .attr('y1', startY + boxHeight * 0.7)
          .attr('x2', x + boxWidth * 0.8)
          .attr('y2', startY + boxHeight * 0.7)
          .attr('stroke', pink)
          .attr('stroke-width', 1.5);
      }
      
      // Arrow showing queue flow
      g.append('path')
        .attr('d', `
          M ${width * 0.25} ${height * 0.6}
          L ${width * 0.75} ${height * 0.6}
          M ${width * 0.7} ${height * 0.55}
          L ${width * 0.75} ${height * 0.6}
          L ${width * 0.7} ${height * 0.65}
        `)
        .attr('stroke', white)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round');
    }
  },

  /**
 * Export all AWS shape renderers
 */
};

export default awsD3Shapes;

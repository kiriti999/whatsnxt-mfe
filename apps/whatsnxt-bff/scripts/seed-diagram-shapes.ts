#!/usr/bin/env ts-node

/**
 * Seed Diagram Shapes Script
 *
 * Seeds the database with diagram shapes for AWS, Azure, GCP, and Common architecture types.
 * Shapes are used in the interactive diagram editor for lab tests.
 *
 * Usage:
 *   ts-node scripts/seed-diagram-shapes.ts
 *
 * Or add to package.json:
 *   "seed:shapes": "ts-node scripts/seed-diagram-shapes.ts"
 */

import mongoose from "mongoose";
import DiagramShapeModel from "../app/models/lab/DiagramShape";

// Database connection
// Use whatsnxt-local for local development to match the backend server
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsnxt-local";

/**
 * Simple SVG generator for shapes
 * In production, replace with actual cloud provider icons
 */
const generateSimpleSVG = (color: string, label: string): string => {
  return `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" fill="${color}" rx="4"/>
  <text x="40" y="45" font-family="Arial" font-size="10" fill="white" text-anchor="middle">${label}</text>
</svg>`;
};

/**
 * Common shapes available across all architectures
 */
const commonShapes = [
  {
    name: "User",
    type: "common",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#6B7280", "User"),
    width: 60,
    height: 60,
    description: "User or end-user representation",
    metadata: { color: "#6B7280", icon: "user" },
  },
  {
    name: "Database",
    type: "database",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#059669", "DB"),
    width: 80,
    height: 80,
    description: "Generic database",
    metadata: { color: "#059669", icon: "database" },
  },
  {
    name: "Server",
    type: "compute",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#1F2937", "Server"),
    width: 80,
    height: 80,
    description: "Generic server",
    metadata: { color: "#1F2937", icon: "server" },
  },
  {
    name: "Load Balancer",
    type: "network",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#7C3AED", "LB"),
    width: 80,
    height: 80,
    description: "Load balancer",
    metadata: { color: "#7C3AED", icon: "load-balancer" },
  },
  {
    name: "Cache",
    type: "storage",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#DC2626", "Cache"),
    width: 70,
    height: 70,
    description: "Caching layer",
    metadata: { color: "#DC2626", icon: "cache" },
  },
  {
    name: "Queue",
    type: "messaging",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#EA580C", "Queue"),
    width: 80,
    height: 50,
    description: "Message queue",
    metadata: { color: "#EA580C", icon: "queue" },
  },
  {
    name: "Storage",
    type: "storage",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#0891B2", "Storage"),
    width: 80,
    height: 80,
    description: "Generic storage",
    metadata: { color: "#0891B2", icon: "storage" },
  },
  {
    name: "Gateway",
    type: "network",
    architectureType: "Common",
    isCommon: true,
    svgContent: generateSimpleSVG("#4B5563", "Gateway"),
    width: 70,
    height: 70,
    description: "API or network gateway",
    metadata: { color: "#4B5563", icon: "gateway" },
  },
];

/**
 * AWS-specific shapes
 */
const awsShapes = [
  // Compute
  {
    name: "EC2",
    type: "compute",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF9900", "EC2"),
    width: 80,
    height: 80,
    description: "Amazon Elastic Compute Cloud - Virtual servers",
    metadata: { color: "#FF9900", service: "ec2", category: "Compute" },
  },
  {
    name: "Lambda",
    type: "compute",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF9900", "Lambda"),
    width: 80,
    height: 80,
    description: "AWS Lambda - Serverless compute",
    metadata: { color: "#FF9900", service: "lambda", category: "Compute" },
  },
  {
    name: "ECS",
    type: "compute",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF9900", "ECS"),
    width: 80,
    height: 80,
    description: "Amazon Elastic Container Service",
    metadata: { color: "#FF9900", service: "ecs", category: "Compute" },
  },
  {
    name: "EKS",
    type: "compute",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF9900", "EKS"),
    width: 80,
    height: 80,
    description: "Amazon Elastic Kubernetes Service",
    metadata: { color: "#FF9900", service: "eks", category: "Compute" },
  },

  // Storage
  {
    name: "S3",
    type: "storage",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#569A31", "S3"),
    width: 80,
    height: 80,
    description: "Amazon Simple Storage Service - Object storage",
    metadata: { color: "#569A31", service: "s3", category: "Storage" },
  },
  {
    name: "EBS",
    type: "storage",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#569A31", "EBS"),
    width: 70,
    height: 70,
    description: "Amazon Elastic Block Store",
    metadata: { color: "#569A31", service: "ebs", category: "Storage" },
  },
  {
    name: "EFS",
    type: "storage",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#569A31", "EFS"),
    width: 80,
    height: 80,
    description: "Amazon Elastic File System",
    metadata: { color: "#569A31", service: "efs", category: "Storage" },
  },
  {
    name: "Glacier",
    type: "storage",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#569A31", "Glacier"),
    width: 80,
    height: 80,
    description: "Amazon S3 Glacier - Archive storage",
    metadata: { color: "#569A31", service: "glacier", category: "Storage" },
  },

  // Database
  {
    name: "RDS",
    type: "database",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#3B48CC", "RDS"),
    width: 80,
    height: 80,
    description: "Amazon Relational Database Service",
    metadata: { color: "#3B48CC", service: "rds", category: "Database" },
  },
  {
    name: "DynamoDB",
    type: "database",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#3B48CC", "DynamoDB"),
    width: 80,
    height: 80,
    description: "Amazon DynamoDB - NoSQL database",
    metadata: { color: "#3B48CC", service: "dynamodb", category: "Database" },
  },
  {
    name: "Aurora",
    type: "database",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#3B48CC", "Aurora"),
    width: 80,
    height: 80,
    description: "Amazon Aurora - MySQL and PostgreSQL compatible",
    metadata: { color: "#3B48CC", service: "aurora", category: "Database" },
  },
  {
    name: "ElastiCache",
    type: "database",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#3B48CC", "ElastiCache"),
    width: 80,
    height: 80,
    description: "Amazon ElastiCache - In-memory cache",
    metadata: {
      color: "#3B48CC",
      service: "elasticache",
      category: "Database",
    },
  },

  // Networking
  {
    name: "VPC",
    type: "network",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#8C4FFF", "VPC"),
    width: 100,
    height: 80,
    description: "Amazon Virtual Private Cloud",
    metadata: { color: "#8C4FFF", service: "vpc", category: "Networking" },
  },
  {
    name: "Route 53",
    type: "network",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#8C4FFF", "Route53"),
    width: 80,
    height: 80,
    description: "Amazon Route 53 - DNS service",
    metadata: { color: "#8C4FFF", service: "route53", category: "Networking" },
  },
  {
    name: "CloudFront",
    type: "network",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#8C4FFF", "CloudFront"),
    width: 80,
    height: 80,
    description: "Amazon CloudFront - CDN",
    metadata: {
      color: "#8C4FFF",
      service: "cloudfront",
      category: "Networking",
    },
  },
  {
    name: "API Gateway",
    type: "network",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#8C4FFF", "API GW"),
    width: 80,
    height: 80,
    description: "Amazon API Gateway",
    metadata: {
      color: "#8C4FFF",
      service: "apigateway",
      category: "Networking",
    },
  },
  {
    name: "ELB",
    type: "network",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#8C4FFF", "ELB"),
    width: 80,
    height: 80,
    description: "Elastic Load Balancer",
    metadata: { color: "#8C4FFF", service: "elb", category: "Networking" },
  },

  // Security
  {
    name: "IAM",
    type: "security",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#DD344C", "IAM"),
    width: 80,
    height: 80,
    description: "AWS Identity and Access Management",
    metadata: { color: "#DD344C", service: "iam", category: "Security" },
  },
  {
    name: "Cognito",
    type: "security",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#DD344C", "Cognito"),
    width: 80,
    height: 80,
    description: "Amazon Cognito - User authentication",
    metadata: { color: "#DD344C", service: "cognito", category: "Security" },
  },
  {
    name: "KMS",
    type: "security",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#DD344C", "KMS"),
    width: 80,
    height: 80,
    description: "AWS Key Management Service",
    metadata: { color: "#DD344C", service: "kms", category: "Security" },
  },

  // Messaging
  {
    name: "SQS",
    type: "messaging",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF4F8B", "SQS"),
    width: 80,
    height: 60,
    description: "Amazon Simple Queue Service",
    metadata: { color: "#FF4F8B", service: "sqs", category: "Messaging" },
  },
  {
    name: "SNS",
    type: "messaging",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF4F8B", "SNS"),
    width: 80,
    height: 60,
    description: "Amazon Simple Notification Service",
    metadata: { color: "#FF4F8B", service: "sns", category: "Messaging" },
  },
  {
    name: "Kinesis",
    type: "analytics",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#01A88D", "Kinesis"),
    width: 80,
    height: 80,
    description: "Amazon Kinesis - Real-time data streaming",
    metadata: { color: "#01A88D", service: "kinesis", category: "Analytics" },
  },

  // Monitoring
  {
    name: "CloudWatch",
    type: "monitoring",
    architectureType: "AWS",
    isCommon: false,
    svgContent: generateSimpleSVG("#FF4F8B", "CloudWatch"),
    width: 80,
    height: 80,
    description: "Amazon CloudWatch - Monitoring and logging",
    metadata: {
      color: "#FF4F8B",
      service: "cloudwatch",
      category: "Monitoring",
    },
  },
];

/**
 * Azure-specific shapes
 */
const azureShapes = [
  // Compute
  {
    name: "Virtual Machine",
    type: "compute",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "VM"),
    width: 80,
    height: 80,
    description: "Azure Virtual Machines",
    metadata: { color: "#0078D4", service: "vm", category: "Compute" },
  },
  {
    name: "Functions",
    type: "compute",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "Functions"),
    width: 80,
    height: 80,
    description: "Azure Functions - Serverless compute",
    metadata: { color: "#0078D4", service: "functions", category: "Compute" },
  },
  {
    name: "AKS",
    type: "compute",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "AKS"),
    width: 80,
    height: 80,
    description: "Azure Kubernetes Service",
    metadata: { color: "#0078D4", service: "aks", category: "Compute" },
  },
  {
    name: "App Service",
    type: "compute",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "App Svc"),
    width: 80,
    height: 80,
    description: "Azure App Service",
    metadata: { color: "#0078D4", service: "appservice", category: "Compute" },
  },

  // Storage
  {
    name: "Blob Storage",
    type: "storage",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0089D6", "Blob"),
    width: 80,
    height: 80,
    description: "Azure Blob Storage - Object storage",
    metadata: { color: "#0089D6", service: "blob", category: "Storage" },
  },
  {
    name: "Disk Storage",
    type: "storage",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0089D6", "Disk"),
    width: 70,
    height: 70,
    description: "Azure Managed Disks",
    metadata: { color: "#0089D6", service: "disk", category: "Storage" },
  },
  {
    name: "File Storage",
    type: "storage",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0089D6", "Files"),
    width: 80,
    height: 80,
    description: "Azure Files - File shares",
    metadata: { color: "#0089D6", service: "files", category: "Storage" },
  },

  // Database
  {
    name: "SQL Database",
    type: "database",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "SQL DB"),
    width: 80,
    height: 80,
    description: "Azure SQL Database",
    metadata: { color: "#0078D4", service: "sqldb", category: "Database" },
  },
  {
    name: "Cosmos DB",
    type: "database",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "Cosmos"),
    width: 80,
    height: 80,
    description: "Azure Cosmos DB - NoSQL database",
    metadata: { color: "#0078D4", service: "cosmosdb", category: "Database" },
  },
  {
    name: "MySQL",
    type: "database",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "MySQL"),
    width: 80,
    height: 80,
    description: "Azure Database for MySQL",
    metadata: { color: "#0078D4", service: "mysql", category: "Database" },
  },
  {
    name: "Cache for Redis",
    type: "database",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "Redis"),
    width: 80,
    height: 80,
    description: "Azure Cache for Redis",
    metadata: { color: "#0078D4", service: "redis", category: "Database" },
  },

  // Networking
  {
    name: "Virtual Network",
    type: "network",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#50E6FF", "VNet"),
    width: 100,
    height: 80,
    description: "Azure Virtual Network",
    metadata: { color: "#50E6FF", service: "vnet", category: "Networking" },
  },
  {
    name: "Traffic Manager",
    type: "network",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#50E6FF", "Traffic"),
    width: 80,
    height: 80,
    description: "Azure Traffic Manager - DNS load balancer",
    metadata: {
      color: "#50E6FF",
      service: "trafficmanager",
      category: "Networking",
    },
  },
  {
    name: "CDN",
    type: "network",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#50E6FF", "CDN"),
    width: 80,
    height: 80,
    description: "Azure Content Delivery Network",
    metadata: { color: "#50E6FF", service: "cdn", category: "Networking" },
  },
  {
    name: "Firewall",
    type: "network",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#50E6FF", "Firewall"),
    width: 80,
    height: 80,
    description: "Azure Firewall",
    metadata: { color: "#50E6FF", service: "firewall", category: "Networking" },
  },
  {
    name: "Load Balancer",
    type: "network",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#50E6FF", "LB"),
    width: 80,
    height: 80,
    description: "Azure Load Balancer",
    metadata: {
      color: "#50E6FF",
      service: "loadbalancer",
      category: "Networking",
    },
  },

  // Security
  {
    name: "Active Directory",
    type: "security",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "AD"),
    width: 80,
    height: 80,
    description: "Azure Active Directory",
    metadata: { color: "#0078D4", service: "ad", category: "Security" },
  },
  {
    name: "Key Vault",
    type: "security",
    architectureType: "Azure",
    isCommon: false,
    svgContent: generateSimpleSVG("#0078D4", "KeyVault"),
    width: 80,
    height: 80,
    description: "Azure Key Vault - Secrets management",
    metadata: { color: "#0078D4", service: "keyvault", category: "Security" },
  },
];

/**
 * GCP-specific shapes
 */
const gcpShapes = [
  // Compute
  {
    name: "Compute Engine",
    type: "compute",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "CE"),
    width: 80,
    height: 80,
    description: "Google Compute Engine - Virtual machines",
    metadata: { color: "#4285F4", service: "compute", category: "Compute" },
  },
  {
    name: "Cloud Functions",
    type: "compute",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "Functions"),
    width: 80,
    height: 80,
    description: "Google Cloud Functions - Serverless",
    metadata: { color: "#4285F4", service: "functions", category: "Compute" },
  },
  {
    name: "GKE",
    type: "compute",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "GKE"),
    width: 80,
    height: 80,
    description: "Google Kubernetes Engine",
    metadata: { color: "#4285F4", service: "gke", category: "Compute" },
  },
  {
    name: "App Engine",
    type: "compute",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "App Eng"),
    width: 80,
    height: 80,
    description: "Google App Engine",
    metadata: { color: "#4285F4", service: "appengine", category: "Compute" },
  },

  // Storage
  {
    name: "Cloud Storage",
    type: "storage",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#34A853", "Storage"),
    width: 80,
    height: 80,
    description: "Google Cloud Storage - Object storage",
    metadata: { color: "#34A853", service: "storage", category: "Storage" },
  },
  {
    name: "Persistent Disk",
    type: "storage",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#34A853", "Disk"),
    width: 70,
    height: 70,
    description: "Google Persistent Disk",
    metadata: { color: "#34A853", service: "disk", category: "Storage" },
  },
  {
    name: "Filestore",
    type: "storage",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#34A853", "Filestore"),
    width: 80,
    height: 80,
    description: "Google Cloud Filestore",
    metadata: { color: "#34A853", service: "filestore", category: "Storage" },
  },

  // Database
  {
    name: "Cloud SQL",
    type: "database",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "SQL"),
    width: 80,
    height: 80,
    description: "Google Cloud SQL",
    metadata: { color: "#4285F4", service: "cloudsql", category: "Database" },
  },
  {
    name: "Firestore",
    type: "database",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "Firestore"),
    width: 80,
    height: 80,
    description: "Google Cloud Firestore - NoSQL database",
    metadata: { color: "#4285F4", service: "firestore", category: "Database" },
  },
  {
    name: "Bigtable",
    type: "database",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "Bigtable"),
    width: 80,
    height: 80,
    description: "Google Cloud Bigtable",
    metadata: { color: "#4285F4", service: "bigtable", category: "Database" },
  },
  {
    name: "Spanner",
    type: "database",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "Spanner"),
    width: 80,
    height: 80,
    description: "Google Cloud Spanner - Distributed SQL",
    metadata: { color: "#4285F4", service: "spanner", category: "Database" },
  },
  {
    name: "Memorystore",
    type: "database",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#4285F4", "Memory"),
    width: 80,
    height: 80,
    description: "Google Cloud Memorystore - Redis",
    metadata: {
      color: "#4285F4",
      service: "memorystore",
      category: "Database",
    },
  },

  // Networking
  {
    name: "VPC",
    type: "network",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#5BB974", "VPC"),
    width: 100,
    height: 80,
    description: "Google Virtual Private Cloud",
    metadata: { color: "#5BB974", service: "vpc", category: "Networking" },
  },
  {
    name: "Cloud Load Balancing",
    type: "network",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#5BB974", "LB"),
    width: 80,
    height: 80,
    description: "Google Cloud Load Balancing",
    metadata: {
      color: "#5BB974",
      service: "loadbalancing",
      category: "Networking",
    },
  },
  {
    name: "Cloud CDN",
    type: "network",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#5BB974", "CDN"),
    width: 80,
    height: 80,
    description: "Google Cloud CDN",
    metadata: { color: "#5BB974", service: "cdn", category: "Networking" },
  },
  {
    name: "Cloud NAT",
    type: "network",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#5BB974", "NAT"),
    width: 80,
    height: 80,
    description: "Google Cloud NAT",
    metadata: { color: "#5BB974", service: "nat", category: "Networking" },
  },

  // Security
  {
    name: "IAM",
    type: "security",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#EA4335", "IAM"),
    width: 80,
    height: 80,
    description: "Google Cloud IAM",
    metadata: { color: "#EA4335", service: "iam", category: "Security" },
  },
  {
    name: "Cloud KMS",
    type: "security",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#EA4335", "KMS"),
    width: 80,
    height: 80,
    description: "Google Cloud Key Management Service",
    metadata: { color: "#EA4335", service: "kms", category: "Security" },
  },
  {
    name: "Secret Manager",
    type: "security",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#EA4335", "Secrets"),
    width: 80,
    height: 80,
    description: "Google Secret Manager",
    metadata: {
      color: "#EA4335",
      service: "secretmanager",
      category: "Security",
    },
  },

  // Analytics
  {
    name: "BigQuery",
    type: "analytics",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#669DF6", "BigQuery"),
    width: 80,
    height: 80,
    description: "Google BigQuery - Data warehouse",
    metadata: { color: "#669DF6", service: "bigquery", category: "Analytics" },
  },
  {
    name: "Pub/Sub",
    type: "messaging",
    architectureType: "GCP",
    isCommon: false,
    svgContent: generateSimpleSVG("#FBBC04", "Pub/Sub"),
    width: 80,
    height: 60,
    description: "Google Cloud Pub/Sub - Messaging",
    metadata: { color: "#FBBC04", service: "pubsub", category: "Messaging" },
  },
];

/**
 * Main seeding function
 */
async function seedShapes() {
  try {
    console.log("🌱 Starting diagram shape seeding...");
    console.log(`📡 Connecting to MongoDB at ${MONGODB_URI}...`);

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Combine all shapes
    const allShapes = [
      ...commonShapes,
      ...awsShapes,
      ...azureShapes,
      ...gcpShapes,
    ];

    console.log(`\n📦 Preparing to seed ${allShapes.length} shapes:`);
    console.log(`   - Common: ${commonShapes.length}`);
    console.log(`   - AWS: ${awsShapes.length}`);
    console.log(`   - Azure: ${azureShapes.length}`);
    console.log(`   - GCP: ${gcpShapes.length}`);

    // Clear existing shapes (optional - comment out to keep existing)
    const deleteResult = await DiagramShapeModel.deleteMany({});
    console.log(`\n🗑️  Cleared ${deleteResult.deletedCount} existing shapes`);

    // Insert shapes
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const shape of allShapes) {
      try {
        // Check if shape already exists
        const existing = await DiagramShapeModel.findOne({
          name: shape.name,
          architectureType: shape.architectureType,
        });

        if (existing) {
          console.log(
            `⏭️  Skipping ${shape.name} (${shape.architectureType}) - already exists`,
          );
          skipCount++;
          continue;
        }

        // Insert shape
        await DiagramShapeModel.create(shape);
        successCount++;
        console.log(`✅ Created ${shape.name} (${shape.architectureType})`);
      } catch (error: any) {
        errorCount++;
        console.error(
          `❌ Failed to create ${shape.name} (${shape.architectureType}):`,
          error.message,
        );
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ⏭️  Skipped (duplicates): ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📦 Total processed: ${allShapes.length}`);

    // Verify by querying
    const totalCount = await DiagramShapeModel.countDocuments();
    const awsCount = await DiagramShapeModel.countDocuments({
      architectureType: "AWS",
    });
    const azureCount = await DiagramShapeModel.countDocuments({
      architectureType: "Azure",
    });
    const gcpCount = await DiagramShapeModel.countDocuments({
      architectureType: "GCP",
    });
    const commonCount = await DiagramShapeModel.countDocuments({
      isCommon: true,
    });

    console.log("\n📈 Database Statistics:");
    console.log(`   Total shapes in DB: ${totalCount}`);
    console.log(`   AWS shapes: ${awsCount}`);
    console.log(`   Azure shapes: ${azureCount}`);
    console.log(`   GCP shapes: ${gcpCount}`);
    console.log(`   Common shapes: ${commonCount}`);

    console.log("\n✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedShapes();

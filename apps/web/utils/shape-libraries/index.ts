/**
 * Shape Libraries Registry
 * Central configuration for all architecture-specific D3 shape libraries
 * 
 * To add a new architecture:
 * 1. Create a new file: [architecture]-d3-shapes.ts
 * 2. Export shape definitions following the ShapeDefinition interface
 * 3. Add the library to ARCHITECTURE_LIBRARIES below
 */

import { awsD3Shapes, AWSShapeDefinition } from './aws-d3-shapes';
import { azureD3Shapes, AzureShapeDefinition } from './azure-d3-shapes';
import { gcpD3Shapes, GCPShapeDefinition } from './gcp-d3-shapes';
import { kubernetesD3Shapes, KubernetesShapeDefinition } from './kubernetes-d3-shapes';
import { genericD3Shapes, ShapeDefinition } from './generic-d3-shapes';
import { techStackD3Shapes, TechStackShapeDefinition } from './tech-stack-d3-shapes';
import { databaseD3Shapes, DatabaseShapeDefinition } from './database-d3-shapes';
import { dataScienceD3Shapes, DataScienceShapeDefinition } from './datascience-d3-shapes';
import { aimlD3Shapes, AIMLShapeDefinition } from './aiml-d3-shapes';
import { devopsD3Shapes, DevOpsShapeDefinition } from './devops-d3-shapes';
import { securityD3Shapes, SecurityShapeDefinition } from './security-d3-shapes';
import { networkingD3Shapes, NetworkingShapeDefinition } from './networking-d3-shapes';
import { mobileD3Shapes, MobileShapeDefinition } from './mobile-d3-shapes';
import { testingD3Shapes, TestingShapeDefinition } from './testing-d3-shapes';
import { systemDesignD3Shapes, SystemDesignShapeDefinition } from './systemdesign-d3-shapes';
import { dsaD3Shapes, DSAShapeDefinition } from './dsa-d3-shapes';
import { emergingD3Shapes, EmergingShapeDefinition } from './emerging-d3-shapes';
import { specializedD3Shapes, SpecializedShapeDefinition } from './specialized-d3-shapes';
import { lowCodeD3Shapes, LowCodeShapeDefinition } from './lowcode-d3-shapes';
import { programmingD3Shapes, ProgrammingShapeDefinition } from './programming-d3-shapes';
import { blockchainD3Shapes, BlockchainShapeDefinition } from './blockchain-d3-shapes';
import { frontendD3Shapes, FrontendShapeDefinition } from './frontend-d3-shapes';
import { backendD3Shapes, BackendShapeDefinition } from './backend-d3-shapes';
import { cicdD3Shapes, CICDShapeDefinition } from './cicd-d3-shapes';
import { monitoringD3Shapes, MonitoringShapeDefinition } from './monitoring-d3-shapes';
import { llmD3Shapes, LLMShapeDefinition } from './llm-d3-shapes';
import { dataengD3Shapes, DataEngShapeDefinition } from './dataeng-d3-shapes';
import { iotD3Shapes, IoTShapeDefinition } from './iot-d3-shapes';
import { gamedevD3Shapes, GameDevShapeDefinition } from './gamedev-d3-shapes';
import { authD3Shapes, AuthShapeDefinition } from './auth-d3-shapes';

/**
 * Union type for all shape definitions across architectures
 */
export type ArchitectureShapeDefinition =
  | ShapeDefinition
  | AWSShapeDefinition
  | AzureShapeDefinition
  | GCPShapeDefinition
  | KubernetesShapeDefinition
  | TechStackShapeDefinition
  | DatabaseShapeDefinition
  | DataScienceShapeDefinition
  | AIMLShapeDefinition
  | DevOpsShapeDefinition
  | SecurityShapeDefinition
  | NetworkingShapeDefinition
  | MobileShapeDefinition
  | TestingShapeDefinition
  | SystemDesignShapeDefinition
  | DSAShapeDefinition
  | EmergingShapeDefinition
  | SpecializedShapeDefinition
  | LowCodeShapeDefinition
  | ProgrammingShapeDefinition
  | BlockchainShapeDefinition
  | FrontendShapeDefinition
  | BackendShapeDefinition
  | CICDShapeDefinition
  | MonitoringShapeDefinition
  | LLMShapeDefinition
  | DataEngShapeDefinition
  | IoTShapeDefinition
  | GameDevShapeDefinition
  | AuthShapeDefinition;

/**
 * Supported architecture types
 */
export type ArchitectureType =
  | 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack'
  | 'Database' | 'DataScience' | 'AIML' | 'DevOps' | 'Security'
  | 'Networking' | 'Mobile' | 'Testing' | 'SystemDesign' | 'DSA'
  | 'Emerging' | 'Specialized' | 'LowCode' | 'Programming'
  | 'Blockchain' | 'Frontend' | 'Backend' | 'CICD' | 'Monitoring'
  | 'LLM' | 'DataEngineering' | 'IoT' | 'GameDev' | 'Auth';

/**
 * Architecture Libraries Registry
 * Maps architecture types to their D3 shape libraries
 * 
 * This is the single source of truth for all architecture shape libraries.
 * No switch cases needed - just add new architectures here.
 * 
 * @example
 * const awsShapes = ARCHITECTURE_LIBRARIES['AWS'];
 * const shapes = Object.values(awsShapes);
 */
export const ARCHITECTURE_LIBRARIES: Record<string, Record<string, ArchitectureShapeDefinition>> = {
  AWS: awsD3Shapes,
  Azure: azureD3Shapes,
  GCP: gcpD3Shapes,
  Kubernetes: kubernetesD3Shapes,
  Generic: genericD3Shapes,
  TechStack: techStackD3Shapes,
  Database: databaseD3Shapes,
  DataScience: dataScienceD3Shapes,
  AIML: aimlD3Shapes,
  DevOps: devopsD3Shapes,
  Security: securityD3Shapes,
  Networking: networkingD3Shapes,
  Mobile: mobileD3Shapes,
  Testing: testingD3Shapes,
  SystemDesign: systemDesignD3Shapes,
  DSA: dsaD3Shapes,
  Emerging: emergingD3Shapes,
  Specialized: specializedD3Shapes,
  LowCode: lowCodeD3Shapes,
  Programming: programmingD3Shapes,
  Blockchain: blockchainD3Shapes,
  Frontend: frontendD3Shapes,
  Backend: backendD3Shapes,
  CICD: cicdD3Shapes,
  Monitoring: monitoringD3Shapes,
  LLM: llmD3Shapes,
  DataEngineering: dataengD3Shapes,
  IoT: iotD3Shapes,
  GameDev: gamedevD3Shapes,
  Auth: authD3Shapes,
};

/**
 * L2 (Sub Category) architecture types — the original 20 libraries
 * mapped from the lab's subCategory field.
 */
export const L2_ARCHITECTURE_TYPES = [
  'AWS', 'Azure', 'GCP', 'Kubernetes', 'Generic', 'TechStack',
  'Database', 'DataScience', 'AIML', 'DevOps', 'Security',
  'Networking', 'Mobile', 'Testing', 'SystemDesign', 'DSA',
  'Emerging', 'Specialized', 'LowCode', 'Programming',
] as const;

/**
 * L3 (Nested Sub Category / Topic) architecture types — the 10 nested libraries
 * mapped from the lab's nestedSubCategory field.
 */
export const L3_ARCHITECTURE_TYPES = [
  'Blockchain', 'Frontend', 'Backend', 'CICD', 'Monitoring',
  'LLM', 'DataEngineering', 'IoT', 'GameDev', 'Auth',
] as const;

/** Maximum number of additional architecture types selectable per level */
export const MAX_ADDITIONAL_SELECTIONS = 5;

/**
 * Get shapes for a specific architecture
 * @param architectureType - The architecture type (AWS, Azure, GCP, Kubernetes, etc.)
 * @returns Array of shape definitions for the architecture, or empty array if not found
 */
export const getArchitectureShapes = (
  architectureType?: string
): ArchitectureShapeDefinition[] => {
  if (!architectureType) return [];

  const library = ARCHITECTURE_LIBRARIES[architectureType];
  return library ? Object.values(library) : [];
};

/**
 * Get a specific shape from an architecture library
 * @param architectureType - The architecture type
 * @param shapeKey - The shape key (e.g., 'ec2', 'pod', 'virtualmachine', 'computeengine')
 * @returns The shape definition or undefined if not found
 */
export const getShape = (
  architectureType: string,
  shapeKey: string
): ArchitectureShapeDefinition | undefined => {
  const library = ARCHITECTURE_LIBRARIES[architectureType];
  if (!library) return undefined;

  return library[shapeKey.toLowerCase()];
};

/**
 * Check if a shape exists in an architecture library
 * @param architectureType - The architecture type
 * @param shapeKey - The shape key to check
 * @returns True if the shape exists, false otherwise
 */
export const hasShape = (
  architectureType: string,
  shapeKey: string
): boolean => {
  return !!getShape(architectureType, shapeKey);
};

/**
 * Get all available architecture types
 * @returns Array of architecture type names
 */
export const getAvailableArchitectures = (): string[] => {
  return Object.keys(ARCHITECTURE_LIBRARIES);
};

/**
 * Get shape count for an architecture
 * @param architectureType - The architecture type
 * @returns Number of shapes available for the architecture
 */
export const getShapeCount = (architectureType: string): number => {
  const library = ARCHITECTURE_LIBRARIES[architectureType];
  return library ? Object.keys(library).length : 0;
};

/**
 * Build Mantine-compatible select options for a list of architecture types.
 * Each option shows the human-readable name and shape count.
 *
 * @param types - Array of architecture type keys (e.g., L2_ARCHITECTURE_TYPES)
 * @param exclude - Optional architecture type(s) to exclude (e.g., the primary selection)
 * @returns Array of { value, label } suitable for Mantine MultiSelect
 */
export const getArchitectureSelectOptions = (
  types: readonly string[],
  exclude?: string | string[]
): Array<{ value: string; label: string }> => {
  const excluded = new Set(Array.isArray(exclude) ? exclude : exclude ? [exclude] : []);
  return types
    .filter((t) => !excluded.has(t))
    .map((t) => {
      const meta = getArchitectureMetadata(t);
      const count = getShapeCount(t);
      return { value: t, label: `${meta.name} (${count} shapes)` };
    });
};

/**
 * Get architecture metadata
 * @param architectureType - The architecture type
 * @returns Metadata about the architecture
 */
export const getArchitectureMetadata = (architectureType: string) => {
  const metadata: Record<string, { name: string; color: string; description: string }> = {
    AWS: {
      name: 'Amazon Web Services',
      color: '#FF9900',
      description: 'AWS cloud infrastructure shapes',
    },
    Azure: {
      name: 'Microsoft Azure',
      color: '#0078D4',
      description: 'Azure cloud infrastructure shapes',
    },
    GCP: {
      name: 'Google Cloud Platform',
      color: '#4285F4',
      description: 'GCP cloud infrastructure shapes',
    },
    Kubernetes: {
      name: 'Kubernetes',
      color: '#326CE5',
      description: 'Kubernetes cluster and workload shapes',
    },
    Generic: {
      name: 'Generic Architecture',
      color: '#666666',
      description: 'Generic architecture diagram shapes',
    },
    TechStack: {
      name: 'Tech Stack',
      color: '#5C7CFA',
      description: 'Modern web development technology shapes',
    },
    Database: {
      name: 'Database',
      color: '#1ABC9C',
      description: 'Database and data storage shapes',
    },
    DataScience: {
      name: 'Data Science',
      color: '#9B59B6',
      description: 'Data science, analytics and visualization shapes',
    },
    AIML: {
      name: 'AI / Machine Learning',
      color: '#E74C3C',
      description: 'Artificial intelligence and machine learning shapes',
    },
    DevOps: {
      name: 'DevOps',
      color: '#27AE60',
      description: 'DevOps, CI/CD and automation shapes',
    },
    Security: {
      name: 'Cybersecurity',
      color: '#E74C3C',
      description: 'Security, compliance and threat defense shapes',
    },
    Networking: {
      name: 'Networking',
      color: '#2E86C1',
      description: 'Network infrastructure and protocol shapes',
    },
    Mobile: {
      name: 'Mobile Development',
      color: '#3498DB',
      description: 'Mobile app development shapes',
    },
    Testing: {
      name: 'Software Testing',
      color: '#F39C12',
      description: 'Testing, QA and quality assurance shapes',
    },
    SystemDesign: {
      name: 'System Design',
      color: '#27AE60',
      description: 'System architecture and design pattern shapes',
    },
    DSA: {
      name: 'Data Structures & Algorithms',
      color: '#8E44AD',
      description: 'Data structure and algorithm visualization shapes',
    },
    Emerging: {
      name: 'Emerging Technologies',
      color: '#624DE8',
      description: 'Blockchain, quantum, IoT, XR and other emerging tech shapes',
    },
    Specialized: {
      name: 'Specialized Domains',
      color: '#2C3E50',
      description: 'Game dev, embedded, GIS, FinTech, healthcare shapes',
    },
    LowCode: {
      name: 'Low-Code / No-Code',
      color: '#8E44AD',
      description: 'Visual development and automation platform shapes',
    },
    Programming: {
      name: 'Programming',
      color: '#1A1A2E',
      description: 'Programming language concepts and paradigm shapes',
    },
    Blockchain: {
      name: 'Blockchain & Web3',
      color: '#F7931A',
      description: 'Blockchain, DeFi, smart contract and Web3 shapes',
    },
    Frontend: {
      name: 'Frontend Development',
      color: '#61DAFB',
      description: 'Frontend component, state, router and UI shapes',
    },
    Backend: {
      name: 'Backend Development',
      color: '#68A063',
      description: 'Server, middleware, controller and API shapes',
    },
    CICD: {
      name: 'CI/CD Pipelines',
      color: '#FC6D26',
      description: 'Pipeline, build, test and deploy workflow shapes',
    },
    Monitoring: {
      name: 'Monitoring & Observability',
      color: '#E6522C',
      description: 'Metrics, dashboards, traces and alert shapes',
    },
    LLM: {
      name: 'Large Language Models',
      color: '#10A37F',
      description: 'LLM, prompt, RAG, embedding and agent shapes',
    },
    DataEngineering: {
      name: 'Data Engineering',
      color: '#FF6F00',
      description: 'ETL, data pipeline, streaming and warehouse shapes',
    },
    IoT: {
      name: 'Internet of Things',
      color: '#00979D',
      description: 'Sensor, gateway, protocol and edge device shapes',
    },
    GameDev: {
      name: 'Game Development',
      color: '#23272A',
      description: 'Game loop, sprite, physics and scene shapes',
    },
    Auth: {
      name: 'Authentication & Authorization',
      color: '#EB5424',
      description: 'OAuth, JWT, SSO, MFA and RBAC shapes',
    },
  };

  return metadata[architectureType] || {
    name: architectureType,
    color: '#666666',
    description: 'Architecture shapes',
  };
};

// Export individual libraries for direct access if needed
export {
  awsD3Shapes, azureD3Shapes, gcpD3Shapes, kubernetesD3Shapes, genericD3Shapes, techStackD3Shapes,
  databaseD3Shapes, dataScienceD3Shapes, aimlD3Shapes, devopsD3Shapes, securityD3Shapes,
  networkingD3Shapes, mobileD3Shapes, testingD3Shapes, systemDesignD3Shapes, dsaD3Shapes,
  emergingD3Shapes, specializedD3Shapes, lowCodeD3Shapes, programmingD3Shapes,
  blockchainD3Shapes, frontendD3Shapes, backendD3Shapes, cicdD3Shapes, monitoringD3Shapes,
  llmD3Shapes, dataengD3Shapes, iotD3Shapes, gamedevD3Shapes, authD3Shapes,
};
export type {
  AWSShapeDefinition, AzureShapeDefinition, GCPShapeDefinition, KubernetesShapeDefinition,
  ShapeDefinition, TechStackShapeDefinition, DatabaseShapeDefinition, DataScienceShapeDefinition,
  AIMLShapeDefinition, DevOpsShapeDefinition, SecurityShapeDefinition, NetworkingShapeDefinition,
  MobileShapeDefinition, TestingShapeDefinition, SystemDesignShapeDefinition, DSAShapeDefinition,
  EmergingShapeDefinition, SpecializedShapeDefinition, LowCodeShapeDefinition, ProgrammingShapeDefinition,
  BlockchainShapeDefinition, FrontendShapeDefinition, BackendShapeDefinition, CICDShapeDefinition,
  MonitoringShapeDefinition, LLMShapeDefinition, DataEngShapeDefinition, IoTShapeDefinition,
  GameDevShapeDefinition, AuthShapeDefinition,
};

/**
 * Map a lab nested sub-category (L3 topic) to a specific architecture type.
 * Provides granular shape matching for nested categories like
 * "Blockchain Development", "React Ecosystem", "CI/CD Pipelines", etc.
 * Returns 'Generic' when no specific nested match is found, allowing
 * the caller to fall back to the parent sub-category mapping.
 *
 * @param nestedSubCategory - The lab's nested sub-category / topic name
 * @returns The matching architecture type string, or 'Generic' if no match
 */
const mapNestedSubCategoryToArchitecture = (nestedSubCategory: string): string => {
  const lower = nestedSubCategory.toLowerCase();

  const NESTED_ARCHITECTURE_MAP: Array<{ keywords: string[]; architecture: string }> = [
    // Blockchain & Web3
    {
      keywords: [
        'blockchain', 'web3', 'smart contract', 'solidity', 'ethereum', 'defi',
        'nft', 'dao', 'dapp', 'token', 'consensus', 'hyperledger', 'polkadot',
        'solana', 'polygon', 'cosmos', 'substrate', 'hardhat', 'truffle', 'ipfs',
        'decentralized', 'layer 2', 'rollup', 'bridge', 'wallet', 'staking',
        'yield', 'liquidity', 'amm', 'metaverse', 'gamefi', 'socialfi',
      ],
      architecture: 'Blockchain',
    },
    // Frontend Development
    {
      keywords: [
        'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
        'remix', 'astro', 'qwik', 'solid', 'preact', 'html', 'css', 'sass',
        'tailwind', 'bootstrap', 'material ui', 'mantine', 'chakra', 'styled',
        'emotion', 'state management', 'redux', 'zustand', 'pinia', 'mobx',
        'dom', 'virtual dom', 'component', 'jsx', 'tsx', 'webpack', 'vite',
        'esbuild', 'turbopack', 'module bundler', 'browser api', 'web worker',
        'service worker', 'progressive web', 'pwa', 'spa', 'ssr', 'ssg',
        'hydration', 'server component', 'client component', 'accessibility',
        'a11y', 'responsive', 'animation', 'framer motion', 'gsap',
      ],
      architecture: 'Frontend',
    },
    // Backend Development
    {
      keywords: [
        'express', 'fastify', 'nestjs', 'koa', 'hapi', 'django', 'flask',
        'fastapi', 'spring boot', 'spring', 'rails', 'ruby on rails', 'laravel',
        'asp.net', 'gin', 'echo', 'fiber', 'actix', 'axum', 'rocket',
        'middleware', 'controller', 'orm', 'prisma', 'sequelize', 'typeorm',
        'drizzle', 'sqlalchemy', 'hibernate', 'mongoose', 'rest api', 'api design',
        'authentication', 'session', 'websocket', 'socket.io', 'server-side',
        'backend framework', 'api gateway', 'microservice', 'monolith',
        'serverless function', 'lambda', 'edge function', 'bff',
      ],
      architecture: 'Backend',
    },
    // CI/CD Pipelines
    {
      keywords: [
        'ci/cd', 'continuous integration', 'continuous delivery', 'continuous deployment',
        'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis', 'bitbucket pipeline',
        'azure devops', 'aws codepipeline', 'codebuild', 'argocd', 'flux', 'spinnaker',
        'tekton', 'drone', 'buildkite', 'pipeline', 'build automation', 'deployment pipeline',
        'release management', 'blue-green', 'canary', 'rolling update', 'feature flag',
        'artifact', 'registry', 'container registry', 'ecr', 'gcr', 'acr',
      ],
      architecture: 'CICD',
    },
    // Monitoring & Observability
    {
      keywords: [
        'monitoring', 'observability', 'prometheus', 'grafana', 'datadog', 'new relic',
        'splunk', 'elastic', 'kibana', 'jaeger', 'zipkin', 'opentelemetry', 'otel',
        'metrics', 'traces', 'tracing', 'logging', 'log aggregation', 'alerting',
        'dashboard', 'apm', 'application performance', 'slo', 'sli', 'sla',
        'incident management', 'pagerduty', 'opsgenie', 'uptime', 'health check',
        'distributed tracing', 'fluentd', 'logstash', 'loki', 'tempo', 'mimir',
      ],
      architecture: 'Monitoring',
    },
    // Large Language Models & GenAI
    {
      keywords: [
        'llm', 'large language model', 'gpt', 'chatgpt', 'openai', 'claude',
        'anthropic', 'gemini', 'llama', 'mistral', 'hugging face', 'langchain',
        'llamaindex', 'prompt', 'prompt engineering', 'prompt tuning', 'rag',
        'retrieval augmented', 'vector store', 'embedding', 'fine-tuning', 'lora',
        'qlora', 'peft', 'rlhf', 'instruction tuning', 'tokenizer', 'context window',
        'agent', 'ai agent', 'function calling', 'tool use', 'chain of thought',
        'multimodal', 'text generation', 'code generation', 'copilot',
        'semantic search', 'knowledge graph', 'hallucination',
      ],
      architecture: 'LLM',
    },
    // Data Engineering
    {
      keywords: [
        'data engineering', 'etl', 'elt', 'data pipeline', 'apache spark', 'pyspark',
        'apache kafka', 'kafka streams', 'flink', 'apache beam', 'airflow', 'dagster',
        'prefect', 'dbt', 'data warehouse', 'snowflake', 'bigquery', 'redshift',
        'databricks', 'delta lake', 'data lake', 'data lakehouse', 'iceberg',
        'hudi', 'parquet', 'avro', 'data catalog', 'data mesh', 'data quality',
        'great expectations', 'batch processing', 'stream processing',
        'real-time', 'data ingestion', 'data transformation', 'data modeling',
        'dimensional modeling', 'star schema', 'data governance',
      ],
      architecture: 'DataEngineering',
    },
    // IoT
    {
      keywords: [
        'iot', 'internet of things', 'mqtt', 'coap', 'sensor', 'actuator',
        'arduino', 'raspberry pi', 'esp32', 'stm32', 'micropython', 'circuitpython',
        'edge computing', 'edge device', 'gateway', 'zigbee', 'lorawan', 'bluetooth',
        'ble', 'z-wave', 'thread', 'matter', 'home automation', 'smart home',
        'industrial iot', 'iiot', 'scada', 'plc', 'modbus', 'opc-ua',
        'telemetry', 'wearable', 'connected device', 'digital twin',
      ],
      architecture: 'IoT',
    },
    // Game Development
    {
      keywords: [
        'game dev', 'game development', 'game engine', 'unity', 'unreal',
        'godot', 'phaser', 'pixi', 'three.js', 'babylon.js', 'game loop',
        'sprite', 'tilemap', 'physics engine', 'collision', 'particle system',
        'shader', 'glsl', 'hlsl', 'webgl', 'webgpu', 'vulkan', 'opengl',
        'directx', 'game ai', 'pathfinding', 'navmesh', 'procedural generation',
        'level design', 'game state', 'ecs', 'entity component', 'multiplayer',
        'netcode', 'game server', 'matchmaking', 'leaderboard',
      ],
      architecture: 'GameDev',
    },
    // Authentication & Authorization
    {
      keywords: [
        'oauth', 'oauth2', 'openid', 'oidc', 'jwt', 'json web token', 'saml',
        'sso', 'single sign-on', 'mfa', 'multi-factor', '2fa', 'two-factor',
        'rbac', 'role-based', 'abac', 'attribute-based', 'acl', 'access control',
        'identity provider', 'idp', 'auth0', 'okta', 'cognito', 'keycloak',
        'firebase auth', 'passport.js', 'session management', 'cookie',
        'csrf', 'cors', 'api key', 'bearer token', 'refresh token',
        'password hashing', 'bcrypt', 'argon2', 'biometric', 'passkey', 'webauthn',
        'fido2', 'zero trust', 'least privilege',
      ],
      architecture: 'Auth',
    },
  ];

  const match = NESTED_ARCHITECTURE_MAP.find(({ keywords }) =>
    keywords.some((kw) => lower.includes(kw))
  );

  return match?.architecture || 'Generic';
};

/**
 * Map a lab sub-category name to an architecture type for the diagram editor.
 * Uses case-insensitive keyword matching against known architecture platforms.
 * Falls back to 'Generic' when no match is found.
 * When nestedSubCategory is provided, checks it first for more granular matching.
 *
 * @param subCategory - The lab's sub-category name (e.g., 'Amazon Web Services (AWS)')
 * @param nestedSubCategory - Optional nested sub-category (L3 topic) for more specific matching
 * @returns The matching architecture type string
 */
export const mapSubCategoryToArchitecture = (subCategory?: string, nestedSubCategory?: string): string => {
  // Check nested sub-category (L3) first for more specific shape matching
  if (nestedSubCategory) {
    const nestedResult = mapNestedSubCategoryToArchitecture(nestedSubCategory);
    if (nestedResult !== 'Generic') return nestedResult;
  }

  if (!subCategory) return 'Generic';

  const lower = subCategory.toLowerCase();

  const SUBCATEGORY_ARCHITECTURE_MAP: Array<{ keywords: string[]; architecture: string }> = [
    // Cloud providers
    { keywords: ['aws', 'amazon web services'], architecture: 'AWS' },
    { keywords: ['azure', 'microsoft azure'], architecture: 'Azure' },
    { keywords: ['gcp', 'google cloud'], architecture: 'GCP' },
    { keywords: ['kubernetes', 'k8s', 'container orchestration'], architecture: 'Kubernetes' },

    // Database
    { keywords: ['database', 'relational database', 'nosql', 'newsql', 'vector database', 'search engine', 'data storage', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'graph database', 'time series'], architecture: 'Database' },

    // Data Science & Analytics
    { keywords: ['data science', 'data engineering', 'data analytics', 'business intelligence', 'data visualization', 'data governance', 'data lake', 'data warehouse', 'etl', 'data pipeline', 'data quality', 'big data', 'apache spark', 'apache kafka', 'data catalog', 'data mesh'], architecture: 'DataScience' },

    // AI & Machine Learning
    { keywords: ['artificial intelligence', 'machine learning', 'deep learning', 'neural network', 'natural language', 'nlp', 'computer vision', 'generative ai', 'genai', 'large language', 'llm', 'mlops', 'reinforcement learning', 'ai agent', 'rag', 'retrieval augmented', 'embeddings', 'transformer', 'diffusion model', 'prompt engineering', 'fine-tuning'], architecture: 'AIML' },

    // DevOps
    { keywords: ['devops', 'ci/cd', 'continuous integration', 'continuous delivery', 'gitops', 'infrastructure as code', 'iac', 'configuration management', 'site reliability', 'sre', 'monitoring', 'observability', 'service mesh', 'docker', 'containerization', 'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci'], architecture: 'DevOps' },

    // Security
    { keywords: ['cybersecurity', 'security', 'application security', 'appsec', 'network security', 'identity', 'access management', 'iam', 'cryptography', 'encryption', 'siem', 'cloud security', 'devsecops', 'penetration testing', 'ethical hacking', 'compliance', 'zero trust', 'firewall', 'vulnerability', 'threat'], architecture: 'Security' },

    // Networking
    { keywords: ['networking', 'network protocol', 'tcp', 'udp', 'http', 'api paradigm', 'rest', 'graphql', 'grpc', 'websocket', 'network architecture', 'vpn', 'cdn', 'dns', 'load balancing', 'proxy', 'routing', 'switching', 'software-defined', 'sdn', 'sdwan'], architecture: 'Networking' },

    // Mobile Development
    { keywords: ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'cross-platform mobile', 'mobile backend', 'mobile testing', 'pwa', 'progressive web', 'responsive design'], architecture: 'Mobile' },

    // Testing
    { keywords: ['testing', 'test', 'unit test', 'integration test', 'end-to-end', 'e2e', 'performance test', 'qa', 'quality assurance', 'test automation', 'selenium', 'cypress', 'playwright', 'chaos engineer', 'load test', 'stress test', 'accessibility testing', 'security testing', 'regression'], architecture: 'Testing' },

    // System Design & Architecture
    { keywords: ['system design', 'architectural pattern', 'design pattern', 'distributed system', 'scalability', 'microservice', 'monolith', 'event-driven', 'message queue', 'api gateway', 'circuit breaker', 'rate limiting', 'caching', 'load balanc', 'high availability', 'fault tolerance', 'cap theorem', 'saga pattern', 'cqrs', 'event sourcing'], architecture: 'SystemDesign' },

    // DSA
    { keywords: ['data structure', 'algorithm', 'complexity analysis', 'big o', 'sorting', 'searching', 'dynamic programming', 'graph algorithm', 'tree traversal', 'linked list', 'hash table', 'binary search', 'problem solving', 'competitive programming', 'recursion', 'backtracking', 'greedy', 'divide and conquer'], architecture: 'DSA' },

    // Emerging Technologies
    { keywords: ['blockchain', 'web3', 'smart contract', 'solidity', 'ethereum', 'defi', 'nft', 'quantum computing', 'quantum', 'virtual reality', 'vr', 'augmented reality', 'ar', 'mixed reality', 'xr', 'extended reality', 'webassembly', 'wasm', 'iot', 'internet of things', 'robotics', 'rpa', 'robotic process', '3d', 'three.js', 'webgl', 'webgpu', 'metaverse', 'edge computing'], architecture: 'Emerging' },

    // Specialized Domains
    { keywords: ['game dev', 'game engine', 'unity', 'unreal', 'godot', 'embedded system', 'rtos', 'firmware', 'gis', 'geospatial', 'mapping', 'fintech', 'financial', 'payment', 'trading', 'healthcare', 'health tech', 'medical', 'bioinformatics', 'genomics', 'audio', 'video', 'streaming', 'media processing', 'computer graphics', 'image processing', 'signal processing', 'aerospace', 'automotive'], architecture: 'Specialized' },

    // Low-Code / No-Code
    { keywords: ['low-code', 'low code', 'no-code', 'no code', 'citizen developer', 'visual development', 'drag and drop', 'automation platform', 'zapier', 'power automate', 'airtable', 'retool', 'appsheet', 'bubble', 'webflow', 'workflow automation', 'rpa', 'business process'], architecture: 'LowCode' },

    // Programming Languages & Paradigms
    { keywords: ['programming language', 'programming paradigm', 'object-oriented', 'functional programming', 'procedural', 'declarative', 'imperative', 'concurrent programming', 'parallel programming', 'reactive programming', 'metaprogramming', 'compiler', 'interpreter', 'transpiler', 'language design', 'type system', 'type theory', 'programming concept'], architecture: 'Programming' },

    // Tech Stack (general web dev)
    { keywords: ['tech stack', 'full-stack', 'fullstack', 'frontend', 'backend', 'web development', 'web framework', 'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'spring boot', 'ruby on rails', 'asp.net', 'api development', 'serverless', 'jamstack'], architecture: 'TechStack' },
  ];

  const match = SUBCATEGORY_ARCHITECTURE_MAP.find(({ keywords }) =>
    keywords.some((kw) => lower.includes(kw))
  );

  return match?.architecture || 'Generic';
};

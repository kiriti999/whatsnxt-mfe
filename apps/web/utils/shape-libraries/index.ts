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

/**
 * Union type for all shape definitions across architectures
 */
export type ArchitectureShapeDefinition = 
  | ShapeDefinition 
  | AWSShapeDefinition
  | AzureShapeDefinition
  | GCPShapeDefinition
  | KubernetesShapeDefinition
  | TechStackShapeDefinition;

/**
 * Supported architecture types
 */
export type ArchitectureType = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack';

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
};

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
  };
  
  return metadata[architectureType] || {
    name: architectureType,
    color: '#666666',
    description: 'Architecture shapes',
  };
};

// Export individual libraries for direct access if needed
export { awsD3Shapes, azureD3Shapes, gcpD3Shapes, kubernetesD3Shapes, genericD3Shapes, techStackD3Shapes };
export type { AWSShapeDefinition, AzureShapeDefinition, GCPShapeDefinition, KubernetesShapeDefinition, ShapeDefinition, TechStackShapeDefinition };

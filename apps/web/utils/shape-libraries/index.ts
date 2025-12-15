/**
 * Shape Libraries Index
 * Exports all architecture-specific shape libraries
 */

import awsShapes from './aws-shapes';
import kubernetesShapes from './kubernetes-shapes';
import { architecturalShapes } from '../lab-utils';
import { NodeType } from '../lab-utils';

export interface ShapeLibrary {
  name: string;
  shapes: Record<string, Partial<NodeType>>;
  color: string;
  description: string;
}

export const shapeLibraries: Record<string, ShapeLibrary> = {
  AWS: {
    name: 'AWS',
    shapes: awsShapes,
    color: '#FF9900',
    description: 'Amazon Web Services architecture shapes',
  },
  Kubernetes: {
    name: 'Kubernetes',
    shapes: kubernetesShapes,
    color: '#326CE5',
    description: 'Kubernetes cluster and workload shapes',
  },
  Azure: {
    name: 'Azure',
    shapes: {
      // Will be implemented
      VirtualMachine: architecturalShapes.Server,
      StorageAccount: architecturalShapes.Storage,
      CosmosDB: architecturalShapes.Database,
    },
    color: '#0078D4',
    description: 'Microsoft Azure architecture shapes',
  },
  GCP: {
    name: 'GCP',
    shapes: {
      // Will be implemented
      ComputeEngine: architecturalShapes.Server,
      CloudStorage: architecturalShapes.Storage,
      CloudSQL: architecturalShapes.Database,
    },
    color: '#4285F4',
    description: 'Google Cloud Platform architecture shapes',
  },
  Generic: {
    name: 'Generic',
    shapes: architecturalShapes,
    color: '#666666',
    description: 'Generic architecture shapes',
  },
};

/**
 * Get shapes for a specific architecture type
 */
export function getShapesForArchitecture(architectureType: string): Record<string, Partial<NodeType>> {
  const library = shapeLibraries[architectureType];
  return library ? library.shapes : shapeLibraries.Generic.shapes;
}

/**
 * Get all available architecture types
 */
export function getAvailableArchitectureTypes(): string[] {
  return Object.keys(shapeLibraries);
}

/**
 * Common shapes available across all architectures
 */
export const commonShapes = {
  Group: architecturalShapes.Group,
  Zone: architecturalShapes.Zone,
  Pool: architecturalShapes.Pool,
  Heart: architecturalShapes.Heart,
  Star: architecturalShapes.Star,
  Cloud: architecturalShapes.Cloud,
};

export { awsShapes, kubernetesShapes };

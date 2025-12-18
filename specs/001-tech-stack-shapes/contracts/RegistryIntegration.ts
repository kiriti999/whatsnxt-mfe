/**
 * Architecture Registry Integration Contract
 * 
 * Defines the contract for integrating tech stack shapes into the
 * existing ARCHITECTURE_LIBRARIES registry system.
 */

import { TechStackShapeDefinition, TechStackShapesCollection } from './TechStackShapeDefinition';

/**
 * Registry Entry Contract
 * 
 * Specifies how the TechStack architecture type must be registered
 * in the ARCHITECTURE_LIBRARIES object in index.ts
 */
export interface ArchitectureRegistryEntry {
  /**
   * Architecture type key used to access shapes
   * MUST be 'TechStack' (PascalCase to match existing pattern)
   */
  key: 'TechStack';

  /**
   * The collection of shape definitions for this architecture
   * Maps lowercase shape types to their definitions
   */
  value: TechStackShapesCollection;
}

/**
 * Updated ArchitectureShapeDefinition Union Type
 * 
 * The existing union type in index.ts must be updated to include TechStackShapeDefinition
 * 
 * @example
 * ```typescript
 * export type ArchitectureShapeDefinition = 
 *   | ShapeDefinition 
 *   | AWSShapeDefinition
 *   | AzureShapeDefinition
 *   | GCPShapeDefinition
 *   | KubernetesShapeDefinition
 *   | TechStackShapeDefinition; // ADD THIS
 * ```
 */
export type ArchitectureShapeDefinition = TechStackShapeDefinition; // Placeholder for documentation

/**
 * Updated ArchitectureType
 * 
 * The existing ArchitectureType in index.ts must be updated to include 'TechStack'
 * 
 * @example
 * ```typescript
 * export type ArchitectureType = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack'; // ADD TechStack
 * ```
 */
export type ArchitectureType = 'TechStack';

/**
 * Metadata Contract
 * 
 * Defines the metadata entry that must be added to getArchitectureMetadata()
 */
export interface MetadataEntry {
  /**
   * Key in the metadata record
   */
  key: 'TechStack';

  /**
   * Metadata object
   */
  value: {
    name: 'Tech Stack';
    color: '#5C7CFA'; // Mantine blue, distinct from other architectures
    description: 'Modern web development technology shapes';
  };
}

/**
 * Integration Checklist
 * 
 * Steps required to integrate tech stack shapes into the registry:
 * 
 * 1. CREATE FILE: apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
 *    - Export TechStackShapeDefinition interface
 *    - Export techStackD3Shapes: Record<string, TechStackShapeDefinition>
 *    - Implement 7 shape definitions (react, nextjs, nodejs, docker, mongodb, mcpagent, ai)
 * 
 * 2. UPDATE FILE: apps/web/utils/shape-libraries/index.ts
 *    - Import: import { techStackD3Shapes, TechStackShapeDefinition } from './tech-stack-d3-shapes';
 *    - Update ArchitectureShapeDefinition union type to include TechStackShapeDefinition
 *    - Update ArchitectureType to include 'TechStack'
 *    - Add to ARCHITECTURE_LIBRARIES: TechStack: techStackD3Shapes,
 *    - Add metadata entry in getArchitectureMetadata()
 *    - Export TechStackShapeDefinition in type exports
 * 
 * 3. VERIFY:
 *    - TypeScript compilation succeeds with no errors
 *    - getAvailableArchitectures() includes 'TechStack'
 *    - getArchitectureShapes('TechStack') returns 7 shapes
 *    - getShape('TechStack', 'react') returns React shape definition
 * 
 * 4. TEST:
 *    - UI dropdown shows "Tech Stack" option
 *    - Selecting "Tech Stack" loads 7 shapes in shape library panel
 *    - Each shape can be dragged onto canvas
 *    - Shapes render with correct colors and appearance
 *    - Shapes can be resized, moved, and connected
 *    - Diagrams with tech stack shapes save and reload correctly
 */

/**
 * Example Implementation for index.ts
 */
export const EXAMPLE_INTEGRATION = `
// 1. Add import at top of index.ts
import { techStackD3Shapes, TechStackShapeDefinition } from './tech-stack-d3-shapes';

// 2. Update union type
export type ArchitectureShapeDefinition = 
  | ShapeDefinition 
  | AWSShapeDefinition
  | AzureShapeDefinition
  | GCPShapeDefinition
  | KubernetesShapeDefinition
  | TechStackShapeDefinition; // NEW

// 3. Update architecture type
export type ArchitectureType = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack'; // NEW

// 4. Add to registry
export const ARCHITECTURE_LIBRARIES: Record<string, Record<string, ArchitectureShapeDefinition>> = {
  AWS: awsD3Shapes,
  Azure: azureD3Shapes,
  GCP: gcpD3Shapes,
  Kubernetes: kubernetesD3Shapes,
  Generic: genericD3Shapes,
  TechStack: techStackD3Shapes, // NEW
};

// 5. Add metadata
export const getArchitectureMetadata = (architectureType: string) => {
  const metadata: Record<string, { name: string; color: string; description: string }> = {
    AWS: { name: 'Amazon Web Services', color: '#FF9900', description: 'AWS cloud infrastructure shapes' },
    Azure: { name: 'Microsoft Azure', color: '#0078D4', description: 'Azure cloud infrastructure shapes' },
    GCP: { name: 'Google Cloud Platform', color: '#4285F4', description: 'GCP cloud infrastructure shapes' },
    Kubernetes: { name: 'Kubernetes', color: '#326CE5', description: 'Kubernetes cluster and workload shapes' },
    Generic: { name: 'Generic Architecture', color: '#666666', description: 'Generic architecture diagram shapes' },
    TechStack: { name: 'Tech Stack', color: '#5C7CFA', description: 'Modern web development technology shapes' }, // NEW
  };
  
  return metadata[architectureType] || {
    name: architectureType,
    color: '#666666',
    description: 'Architecture shapes',
  };
};

// 6. Add to exports
export { awsD3Shapes, azureD3Shapes, gcpD3Shapes, kubernetesD3Shapes, genericD3Shapes, techStackD3Shapes }; // Add techStackD3Shapes
export type { AWSShapeDefinition, AzureShapeDefinition, GCPShapeDefinition, KubernetesShapeDefinition, ShapeDefinition, TechStackShapeDefinition }; // Add TechStackShapeDefinition
`;

/**
 * Backward Compatibility
 * 
 * This integration maintains backward compatibility:
 * - Existing shapes continue to work unchanged
 * - Existing diagrams with AWS/Azure/GCP/Kubernetes shapes load correctly
 * - No breaking changes to existing APIs or function signatures
 * - TechStack is additive - existing code doesn't need updates
 */
export const BACKWARD_COMPATIBILITY_NOTES = `
Backward Compatibility Guarantee:
- All existing architecture types (AWS, Azure, GCP, Kubernetes, Generic) remain unchanged
- getAvailableArchitectures() returns existing types plus 'TechStack'
- getArchitectureShapes() continues to work for all existing types
- Type system is extended (union type) so existing type guards work
- No changes to render function signature or D3.js usage pattern
- Existing diagrams in database/storage continue to load correctly
- Shape IDs use 'tech-' prefix to guarantee no collisions with existing shapes
`;

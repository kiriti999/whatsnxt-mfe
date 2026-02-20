/**
 * Lab API Contract with Multi-Select Architecture Types
 * 
 * Defines the API contract for lab creation and updates that support
 * the new multi-select architecture types feature.
 */

/**
 * Lab Request Body
 * 
 * Request body for POST /api/lab/create and PUT /api/lab/:id
 */
export interface LabCreateUpdateRequest {
  title: string;
  description: string;
  type: 'programming' | 'architecture' | 'cloud' | 'kubernetes';
  
  /**
   * NEW: Multi-select architecture types
   * Replaces the single architectureConfig.type field
   * Array of selected architecture types from dropdown
   */
  architectureTypes?: string[];
  
  /**
   * DEPRECATED: Single architecture type (maintain for backward compatibility)
   * If architectureTypes is present, this field is ignored
   */
  architectureConfig?: {
    type?: string;
    diagram?: string;
  };
  
  /**
   * Diagram state with shape instances
   * JSON structure containing nodes, edges, positions
   */
  masterGraph?: any;
  
  // Other lab fields
  questions?: Question[];
  status?: 'DRAFT' | 'PUBLISHED';
  difficulty?: string;
  language?: string;
  practiceTest?: PracticeTestConfig;
  kubernetesConfig?: KubernetesConfig;
  cloudConfig?: CloudConfig;
  frameworkConfig?: FrameworkConfig;
}

export interface Question {
  text: string;
  type: 'text' | 'multiple-choice' | 'coding';
  correctAnswer?: string;
  options?: string[];
}

export interface PracticeTestConfig {
  enabled: boolean;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  shuffleQuestions: boolean;
}

export interface KubernetesConfig {
  clusterVersion: string;
  nodes: number;
  tools: string[];
}

export interface CloudConfig {
  platform: string;
  region?: string;
  services?: string[];
}

export interface FrameworkConfig {
  framework: string;
  version?: string;
}

/**
 * Lab Response Body
 * 
 * Response from GET /api/lab/:id
 */
export interface LabResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    description: string;
    type: string;
    
    /**
     * NEW: Array of architecture types
     * If not present, fall back to architectureConfig.type
     */
    architectureTypes?: string[];
    
    /**
     * LEGACY: Single architecture type
     * Present for backward compatibility with old labs
     */
    architectureConfig?: {
      type?: string;
      diagram?: string;
    };
    
    masterGraph?: any;
    questions?: Question[];
    status: 'DRAFT' | 'PUBLISHED';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    
    // Other lab fields
    difficulty?: string;
    language?: string;
    practiceTest?: PracticeTestConfig;
    kubernetesConfig?: KubernetesConfig;
    cloudConfig?: CloudConfig;
    frameworkConfig?: FrameworkConfig;
  };
  message?: string;
}

/**
 * Architecture Types Validation
 * 
 * Valid values for architectureTypes array
 */
export const VALID_ARCHITECTURE_TYPES = [
  'AWS',
  'Azure',
  'GCP',
  'Kubernetes',
  'TechStack',
  'Generic',
] as const;

export type ValidArchitectureType = typeof VALID_ARCHITECTURE_TYPES[number];

/**
 * API Validation Rules
 */
export const LAB_API_VALIDATION = {
  /**
   * Maximum number of architecture types per lab
   */
  MAX_ARCHITECTURE_TYPES: 10,
  
  /**
   * Architecture types must be from valid set
   */
  VALID_TYPES: VALID_ARCHITECTURE_TYPES,
  
  /**
   * Title constraints
   */
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  
  /**
   * Description constraints
   */
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 50000,
};

/**
 * API Endpoints
 */
export const LAB_API_ENDPOINTS = {
  /**
   * Create new lab
   * POST /api/lab/create
   * Body: LabCreateUpdateRequest
   * Response: LabResponse
   */
  CREATE: '/api/lab/create',
  
  /**
   * Update existing lab
   * PUT /api/lab/:id
   * Body: LabCreateUpdateRequest
   * Response: LabResponse
   */
  UPDATE: '/api/lab/:id',
  
  /**
   * Get lab by ID
   * GET /api/lab/:id
   * Response: LabResponse
   */
  GET: '/api/lab/:id',
  
  /**
   * Delete lab
   * DELETE /api/lab/:id
   * Response: { success: boolean, message: string }
   */
  DELETE: '/api/lab/:id',
  
  /**
   * List all labs (with optional filters)
   * GET /api/lab?type=architecture&status=PUBLISHED
   * Response: { success: boolean, data: Lab[], total: number }
   */
  LIST: '/api/lab',
};

/**
 * Example Request (Multi-Select)
 */
export const EXAMPLE_CREATE_REQUEST: LabCreateUpdateRequest = {
  title: 'Full Stack Web Application Architecture',
  description: 'Design a modern full-stack application using React, Node.js, and AWS services',
  type: 'architecture',
  
  // NEW: Multi-select architecture types
  architectureTypes: ['TechStack', 'AWS', 'Kubernetes'],
  
  masterGraph: {
    nodes: [
      {
        id: 'node-1',
        shapeId: 'tech-react',
        architectureType: 'TechStack',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        label: 'Frontend',
      },
      {
        id: 'node-2',
        shapeId: 'tech-nodejs',
        architectureType: 'TechStack',
        x: 300,
        y: 100,
        width: 80,
        height: 80,
        label: 'API Server',
      },
      {
        id: 'node-3',
        shapeId: 'aws-rds',
        architectureType: 'AWS',
        x: 500,
        y: 100,
        width: 80,
        height: 80,
        label: 'Database',
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2', type: 'arrow' },
      { id: 'edge-2', source: 'node-2', target: 'node-3', type: 'arrow' },
    ],
  },
  
  status: 'DRAFT',
  difficulty: 'Medium',
};

/**
 * Example Response
 */
export const EXAMPLE_LAB_RESPONSE: LabResponse = {
  success: true,
  data: {
    _id: '67890abc',
    title: 'Full Stack Web Application Architecture',
    description: 'Design a modern full-stack application',
    type: 'architecture',
    architectureTypes: ['TechStack', 'AWS', 'Kubernetes'],
    masterGraph: { /* ... */ },
    status: 'DRAFT',
    createdBy: 'user-123',
    createdAt: '2025-12-18T06:00:00.000Z',
    updatedAt: '2025-12-18T06:00:00.000Z',
  },
};

/**
 * Backend Validation Logic (Pseudo-code)
 */
export const BACKEND_VALIDATION_PSEUDOCODE = `
// In POST /api/lab/create or PUT /api/lab/:id handler

function validateLabRequest(req: LabCreateUpdateRequest): ValidationResult {
  const errors: string[] = [];
  
  // Validate architectureTypes if present
  if (req.architectureTypes) {
    // Check if array
    if (!Array.isArray(req.architectureTypes)) {
      errors.push('architectureTypes must be an array');
    }
    
    // Check max length
    if (req.architectureTypes.length > LAB_API_VALIDATION.MAX_ARCHITECTURE_TYPES) {
      errors.push(\`Maximum \${LAB_API_VALIDATION.MAX_ARCHITECTURE_TYPES} architecture types allowed\`);
    }
    
    // Validate each type
    for (const type of req.architectureTypes) {
      if (!VALID_ARCHITECTURE_TYPES.includes(type)) {
        errors.push(\`Invalid architecture type: \${type}\`);
      }
    }
    
    // Remove duplicates
    req.architectureTypes = [...new Set(req.architectureTypes)];
  }
  
  // If architectureTypes is empty, fall back to architectureConfig.type
  if (!req.architectureTypes?.length && req.architectureConfig?.type) {
    req.architectureTypes = [req.architectureConfig.type];
  }
  
  // Default to Generic if nothing provided
  if (!req.architectureTypes?.length) {
    req.architectureTypes = ['Generic'];
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: req,
  };
}
`;

/**
 * Frontend Normalization Logic (Pseudo-code)
 */
export const FRONTEND_NORMALIZATION_PSEUDOCODE = `
// In LabForm.tsx or DiagramEditor.tsx

function getArchitectureTypesArray(lab: Lab): string[] {
  // Prefer new architectureTypes field
  if (lab.architectureTypes && lab.architectureTypes.length > 0) {
    return lab.architectureTypes;
  }
  
  // Fall back to legacy architectureConfig.type
  if (lab.architectureConfig?.type) {
    return [lab.architectureConfig.type];
  }
  
  // Default to Generic
  return ['Generic'];
}

// When loading lab for editing:
const architectureTypes = getArchitectureTypesArray(labData);
setSelectedArchitectureTypes(architectureTypes);

// When saving lab:
const payload: LabCreateUpdateRequest = {
  ...formData,
  architectureTypes: selectedArchitectureTypes, // Array from MultiSelect
  // Don't include architectureConfig.type - use new field only
};
`;

/**
 * Database Migration Strategy
 * 
 * No forced migration required. Backend handles both formats:
 * 1. New labs: Save architectureTypes array
 * 2. Old labs: Keep architectureConfig.type, normalize on read
 * 3. Updated old labs: Add architectureTypes array on save
 * 
 * MongoDB schema update (add to Lab model):
 * ```
 * architectureTypes: {
 *   type: [String],
 *   required: false,
 *   validate: {
 *     validator: (arr) => arr.length <= 10,
 *     message: 'Maximum 10 architecture types allowed'
 *   }
 * }
 * ```
 */

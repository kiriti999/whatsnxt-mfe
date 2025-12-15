import http from '@whatsnxt/http-client';

export interface DiagramShape {
  id: string;
  name: string;
  type: string;
  architectureType: string;
  isCommon: boolean;
  svgPath?: string;
  svgContent?: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
  description?: string;
}

/**
 * Diagram Shape API Client
 */
const diagramShapeApi = {
  /**
   * Get all diagram shapes, optionally filtered by architecture type
   * @param architectureType - Optional architecture type filter (AWS, Azure, GCP, etc.)
   * @returns Array of diagram shapes
   */
  getShapes: (architectureType?: string) => {
    const params = architectureType ? { architectureType } : {};
    return http.get<DiagramShape[]>('/diagram-shapes', { params });
  },

  /**
   * Get shapes by type
   * @param type - Shape type (compute, storage, network, etc.)
   * @param architectureType - Optional architecture type filter
   * @returns Array of diagram shapes
   */
  getShapesByType: (type: string, architectureType?: string) => {
    const params: any = { type };
    if (architectureType) {
      params.architectureType = architectureType;
    }
    return http.get<DiagramShape[]>('/diagram-shapes', { params });
  },
};

export default diagramShapeApi;

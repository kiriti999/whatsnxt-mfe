import DiagramShapeModel from "../models/lab/DiagramShape";

/**
 * DiagramShapeService for Lab Diagram Tests Feature
 *
 * Handles retrieval of diagram shapes from the database.
 * Shapes are filtered by architecture type (AWS, Azure, GCP, Common).
 */
export class DiagramShapeService {
  /**
   * Get all diagram shapes, optionally filtered by architecture type
   * @param architectureType - Optional filter by architecture (AWS, Azure, GCP, Common, Hybrid)
   * @returns Array of diagram shapes
   */
  async getAllDiagramShapes(architectureType?: string): Promise<any[]> {
    try {
      let query: any = {};

      if (architectureType) {
        // Include shapes that match the architecture type OR are common shapes
        query = {
          $or: [{ architectureType: architectureType }, { isCommon: true }],
        };
      }

      const shapes = await DiagramShapeModel.find(query)
        .sort({ type: 1, name: 1 }) // Sort by type, then by name
        .lean();

      return shapes;
    } catch (error) {
      console.error("Error fetching diagram shapes:", error);
      throw error;
    }
  }

  /**
   * Get diagram shape by ID
   * @param id - Shape UUID
   * @returns Shape document or null
   */
  async getDiagramShapeById(id: string): Promise<any | null> {
    try {
      const shape = await DiagramShapeModel.findOne({ id }).lean();
      return shape;
    } catch (error) {
      console.error("Error fetching diagram shape by ID:", error);
      throw error;
    }
  }

  /**
   * Get shapes by type (compute, storage, network, database, etc.)
   * @param type - Shape type
   * @param architectureType - Optional architecture filter
   * @returns Array of diagram shapes
   */
  async getShapesByType(
    type: string,
    architectureType?: string,
  ): Promise<any[]> {
    try {
      let query: any = { type };

      if (architectureType) {
        query.$or = [
          { architectureType: architectureType },
          { isCommon: true },
        ];
      }

      const shapes = await DiagramShapeModel.find(query)
        .sort({ name: 1 })
        .lean();

      return shapes;
    } catch (error) {
      console.error("Error fetching shapes by type:", error);
      throw error;
    }
  }

  /**
   * Get all common shapes (available across all architectures)
   * @returns Array of common diagram shapes
   */
  async getCommonShapes(): Promise<any[]> {
    try {
      const shapes = await DiagramShapeModel.find({ isCommon: true })
        .sort({ type: 1, name: 1 })
        .lean();

      return shapes;
    } catch (error) {
      console.error("Error fetching common shapes:", error);
      throw error;
    }
  }
}

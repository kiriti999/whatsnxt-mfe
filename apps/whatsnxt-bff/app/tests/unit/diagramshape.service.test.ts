import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiagramShapeService } from "../../app/services/diagramshape.service";
import { DiagramShape } from "@whatsnxt/core-types";

// Mock the diagramShapes.json import
vi.mock("../../config/diagramShapes.json", () => ({
  default: [
    {
      id: "shape-1",
      name: "EC2",
      type: "compute",
      architectureType: "AWS",
      svgPath: "<svg1>",
      metadata: {},
    },
    {
      id: "shape-2",
      name: "VPC",
      type: "network",
      architectureType: "AWS",
      svgPath: "<svg2>",
      metadata: {},
    },
    {
      id: "shape-3",
      name: "VM",
      type: "compute",
      architectureType: "Azure",
      svgPath: "<svg3>",
      metadata: {},
    },
  ],
}));

describe("DiagramShapeService", () => {
  let diagramShapeService: DiagramShapeService;

  beforeEach(() => {
    diagramShapeService = new DiagramShapeService();
    vi.clearAllMocks();
  });

  it("should return all diagram shapes if no architectureType is provided", async () => {
    const shapes = await diagramShapeService.getAllDiagramShapes();
    expect(shapes).toHaveLength(3);
    expect(shapes[0].id).toBeTypeOf("string"); // Ensure UUID is generated
    expect(shapes[0].name).toEqual("EC2");
  });

  it("should return diagram shapes filtered by architectureType", async () => {
    const awsShapes = await diagramShapeService.getAllDiagramShapes("AWS");
    expect(awsShapes).toHaveLength(2);
    expect(awsShapes[0].name).toEqual("EC2");
    expect(awsShapes[1].name).toEqual("VPC");

    const azureShapes = await diagramShapeService.getAllDiagramShapes("Azure");
    expect(azureShapes).toHaveLength(1);
    expect(azureShapes[0].name).toEqual("VM");

    const gcpShapes = await diagramShapeService.getAllDiagramShapes("GCP");
    expect(gcpShapes).toHaveLength(0);
  });

  it("should return a specific diagram shape by ID", async () => {
    const shape = await diagramShapeService.getDiagramShapeById("shape-1");
    expect(shape).toBeDefined();
    expect(shape?.name).toEqual("EC2");

    const nonExistentShape =
      await diagramShapeService.getDiagramShapeById("non-existent");
    expect(nonExistentShape).toBeNull();
  });
});

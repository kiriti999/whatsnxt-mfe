import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiagramTestService } from "../../app/services/diagramtest.service";
import { DiagramTestModel } from "../../app/models/diagramtest.model";
import { DiagramTest } from "@whatsnxt/core-types";

// Mock the Mongoose model
vi.mock("../../app/models/diagramtest.model", () => ({
  DiagramTestModel: {
    create: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));

describe("DiagramTestService", () => {
  let diagramTestService: DiagramTestService;

  beforeEach(() => {
    diagramTestService = new DiagramTestService();
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it("should create a new diagram test", async () => {
    const diagramTestData: Omit<DiagramTest, "id" | "createdAt" | "updatedAt"> =
      {
        labPageId: "page-1",
        prompt: "Draw an AWS VPC.",
        expectedDiagramState: { nodes: [], edges: [] },
        architectureType: "AWS",
      };
    const mockCreatedDiagramTest: DiagramTest = {
      id: "mock-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...diagramTestData,
    };

    (DiagramTestModel.create as vi.Mock).mockResolvedValue(
      mockCreatedDiagramTest,
    );

    const result = await diagramTestService.createDiagramTest(diagramTestData);

    expect(DiagramTestModel.create).toHaveBeenCalledWith({
      ...diagramTestData,
      id: "mock-uuid",
    });
    expect(result).toEqual(mockCreatedDiagramTest);
  });

  it("should retrieve a diagram test by ID", async () => {
    const mockDiagramTest: DiagramTest = {
      id: "mock-uuid",
      labPageId: "page-1",
      prompt: "Draw an AWS VPC.",
      expectedDiagramState: { nodes: [], edges: [] },
      architectureType: "AWS",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (DiagramTestModel.findOne as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockDiagramTest),
    });

    const result = await diagramTestService.getDiagramTestById("mock-uuid");

    expect(DiagramTestModel.findOne).toHaveBeenCalledWith({ id: "mock-uuid" });
    expect(result).toEqual(mockDiagramTest);
  });

  it("should retrieve diagram tests by lab page ID", async () => {
    const mockDiagramTests: DiagramTest[] = [
      {
        id: "mock-uuid-1",
        labPageId: "page-1",
        prompt: "Draw an Azure network.",
        expectedDiagramState: { nodes: [], edges: [] },
        architectureType: "Azure",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (DiagramTestModel.find as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockDiagramTests),
    });

    const result =
      await diagramTestService.getDiagramTestsByLabPageId("page-1");

    expect(DiagramTestModel.find).toHaveBeenCalledWith({ labPageId: "page-1" });
    expect(result).toEqual(mockDiagramTests);
  });

  it("should update a diagram test", async () => {
    const updatedData = { prompt: "Draw a Google Cloud network." };
    const mockUpdatedDiagramTest: DiagramTest = {
      id: "mock-uuid",
      labPageId: "page-1",
      prompt: "Draw a Google Cloud network.",
      expectedDiagramState: { nodes: [], edges: [] },
      architectureType: "AWS",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (DiagramTestModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUpdatedDiagramTest),
    });

    const result = await diagramTestService.updateDiagramTest(
      "mock-uuid",
      updatedData,
    );

    expect(DiagramTestModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "mock-uuid" },
      updatedData,
      { new: true },
    );
    expect(result).toEqual(mockUpdatedDiagramTest);
  });
});

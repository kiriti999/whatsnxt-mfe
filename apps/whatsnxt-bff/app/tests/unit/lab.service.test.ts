import { describe, it, expect, beforeEach, vi } from "vitest";
import { LabService } from "../../app/services/lab.service";
import { LabModel } from "../../app/models/lab.model";
import { Lab } from "@whatsnxt/core-types";

// Mock the Mongoose model
vi.mock("../../app/models/lab.model", () => ({
  LabModel: {
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));

describe("LabService", () => {
  let labService: LabService;

  beforeEach(() => {
    labService = new LabService();
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it("should create a new lab", async () => {
    const labData = {
      name: "Test Lab",
      description: "A lab for testing",
      instructorId: "instructor-1",
    };
    const mockCreatedLab: Lab = {
      id: "mock-uuid",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...labData,
    };

    (LabModel.create as vi.Mock).mockResolvedValue(mockCreatedLab);

    const result = await labService.createLab(labData);

    expect(LabModel.create).toHaveBeenCalledWith({
      ...labData,
      id: "mock-uuid",
      status: "draft",
    });
    expect(result).toEqual(mockCreatedLab);
  });

  it("should retrieve a lab by ID", async () => {
    const mockLab: Lab = {
      id: "mock-uuid",
      name: "Test Lab",
      description: "A lab for testing",
      instructorId: "instructor-1",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (LabModel.findOne as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockLab),
    });

    const result = await labService.getLabById("mock-uuid");

    expect(LabModel.findOne).toHaveBeenCalledWith({ id: "mock-uuid" });
    expect(result).toEqual(mockLab);
  });

  it("should update a lab", async () => {
    const updatedData = { name: "Updated Lab Name" };
    const mockUpdatedLab: Lab = {
      id: "mock-uuid",
      name: "Updated Lab Name",
      description: "A lab for testing",
      instructorId: "instructor-1",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUpdatedLab),
    });

    const result = await labService.updateLab("mock-uuid", updatedData);

    expect(LabModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "mock-uuid" },
      updatedData,
      { new: true },
    );
    expect(result).toEqual(mockUpdatedLab);
  });

  it("should publish a lab", async () => {
    const mockPublishedLab: Lab = {
      id: "mock-uuid",
      name: "Test Lab",
      description: "A lab for testing",
      instructorId: "instructor-1",
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockPublishedLab),
    });

    const result = await labService.publishLab("mock-uuid");

    expect(LabModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "mock-uuid" },
      { status: "published" },
      { new: true },
    );
    expect(result).toEqual(mockPublishedLab);
  });

  it("should get a list of labs", async () => {
    const mockLabs: Lab[] = [
      {
        id: "mock-uuid-1",
        name: "Lab 1",
        instructorId: "inst-1",
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (LabModel.find as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockLabs),
    });

    const result = await labService.getLabs();

    expect(LabModel.find).toHaveBeenCalledWith({});
    expect(result).toEqual(mockLabs);
  });
});

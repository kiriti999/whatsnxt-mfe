import { describe, it, expect, beforeEach, vi } from "vitest";
import { LabPageService } from "../../app/services/labpage.service";
import { LabPageModel } from "../../app/models/labpage.model";
import { LabPage } from "@whatsnxt/core-types";

// Mock the Mongoose model
vi.mock("../../app/models/labpage.model", () => ({
  LabPageModel: {
    create: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn().mockReturnThis(), // Mock find to allow chaining .sort()
    sort: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "mock-uuid",
}));

describe("LabPageService", () => {
  let labPageService: LabPageService;

  beforeEach(() => {
    labPageService = new LabPageService();
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it("should create a new lab page", async () => {
    const labPageData: Omit<LabPage, "id" | "createdAt" | "updatedAt"> = {
      labId: "lab-1",
      pageNumber: 1,
      hasQuestion: true,
      hasDiagramTest: false,
    };
    const mockCreatedLabPage: LabPage = {
      id: "mock-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...labPageData,
    };

    (LabPageModel.create as vi.Mock).mockResolvedValue(mockCreatedLabPage);

    const result = await labPageService.createLabPage(labPageData);

    expect(LabPageModel.create).toHaveBeenCalledWith({
      ...labPageData,
      id: "mock-uuid",
    });
    expect(result).toEqual(mockCreatedLabPage);
  });

  it("should retrieve a lab page by ID", async () => {
    const mockLabPage: LabPage = {
      id: "mock-uuid",
      labId: "lab-1",
      pageNumber: 1,
      hasQuestion: true,
      hasDiagramTest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (LabPageModel.findOne as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockLabPage),
    });

    const result = await labPageService.getLabPageById("mock-uuid");

    expect(LabPageModel.findOne).toHaveBeenCalledWith({ id: "mock-uuid" });
    expect(result).toEqual(mockLabPage);
  });

  it("should retrieve lab pages by lab ID", async () => {
    const mockLabPages: LabPage[] = [
      {
        id: "mock-uuid-1",
        labId: "lab-1",
        pageNumber: 1,
        hasQuestion: true,
        hasDiagramTest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "mock-uuid-2",
        labId: "lab-1",
        pageNumber: 2,
        hasQuestion: false,
        hasDiagramTest: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (LabPageModel.find as vi.Mock).mockReturnValue({
      sort: vi.fn().mockReturnThis(), // Mock sort to allow chaining
      exec: vi.fn().mockResolvedValue(mockLabPages),
    });
    (LabPageModel.sort as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockLabPages),
    });

    const result = await labPageService.getLabPagesByLabId("lab-1");

    expect(LabPageModel.find).toHaveBeenCalledWith({ labId: "lab-1" });
    expect(LabPageModel.sort).toHaveBeenCalledWith({ pageNumber: 1 });
    expect(result).toEqual(mockLabPages);
  });

  it("should update a lab page", async () => {
    const updatedData = { hasDiagramTest: true };
    const mockUpdatedLabPage: LabPage = {
      id: "mock-uuid",
      labId: "lab-1",
      pageNumber: 1,
      hasQuestion: true,
      hasDiagramTest: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (LabPageModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUpdatedLabPage),
    });

    const result = await labPageService.updateLabPage("mock-uuid", updatedData);

    expect(LabPageModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "mock-uuid" },
      updatedData,
      { new: true },
    );
    expect(result).toEqual(mockUpdatedLabPage);
  });
});

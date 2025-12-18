import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import supertest from "supertest";
import express from "express";
import mongoose from "mongoose";
import labRoutes from "../../app/routes/lab.routes";
import labPageRoutes from "../../app/routes/labpage.routes";
import diagramShapeRoutes from "../../app/routes/diagramshape.routes";
import { LabModel } from "../../app/models/lab.model";
import { LabPageModel } from "../../app/models/labpage.model";
import { getLogger } from "../../config/logger";

// Mock mongoose connect
vi.mock("mongoose", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    connect: vi.fn().mockResolvedValue(true),
    // Mock the findOne and findOneAndUpdate methods directly on the model
    // rather than the prototype, as supertest doesn't use the same instance
    // for every test run
    Model: {
      ...mod.Model,
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
    },
  };
});

// Mock uuid
vi.mock("uuid", () => ({
  v4: vi.fn(() => "mock-uuid"),
}));

// Mock logger to prevent console output during tests
vi.mock("../../config/logger", () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
}));

const app = express();
app.use(express.json());
app.use("/api/v1/labs", labRoutes);
app.use("/api/v1/labs", labPageRoutes);
app.use("/api/v1/diagram-shapes", diagramShapeRoutes);

describe("Lab API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/labs", () => {
    it("should create a new lab", async () => {
      const mockLabData = {
        name: "New Test Lab",
        description: "Description of new test lab",
        instructorId: "test-instructor-id",
      };
      const mockCreatedLab = {
        id: "mock-uuid",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...mockLabData,
      };

      (LabModel.create as vi.Mock).mockResolvedValue(mockCreatedLab);

      const response = await supertest(app)
        .post("/api/v1/labs")
        .send(mockLabData);

      expect(response.status).toBe(201);
      expect(response.body.id).toEqual("mock-uuid");
      expect(response.body.name).toEqual(mockLabData.name);
      expect(response.body.status).toEqual("draft");
      expect(LabModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: mockLabData.name,
          instructorId: mockLabData.instructorId,
          status: "draft",
          id: "mock-uuid",
        }),
      );
    });

    it("should return 400 if required fields are missing for lab creation", async () => {
      const response = await supertest(app)
        .post("/api/v1/labs")
        .send({ name: "Incomplete Lab" }); // Missing instructorId

      expect(response.status).toBe(400);
      expect(response.body.message).toEqual(
        "Name and instructorId are required",
      );
    });
  });

  describe("GET /api/v1/labs", () => {
    it("should return a list of labs", async () => {
      const mockLabs = [
        {
          id: "lab-1",
          name: "Lab One",
          instructorId: "inst-1",
          status: "draft",
        },
        {
          id: "lab-2",
          name: "Lab Two",
          instructorId: "inst-1",
          status: "published",
        },
      ];
      (LabModel.find as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockLabs),
      });

      const response = await supertest(app).get("/api/v1/labs");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLabs);
      expect(LabModel.find).toHaveBeenCalledWith({});
    });

    it("should filter labs by status", async () => {
      const mockLabs = [
        {
          id: "lab-1",
          name: "Lab One",
          instructorId: "inst-1",
          status: "draft",
        },
      ];
      (LabModel.find as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockLabs),
      });

      const response = await supertest(app).get("/api/v1/labs?status=draft");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLabs);
      expect(LabModel.find).toHaveBeenCalledWith({ status: "draft" });
    });
  });

  describe("GET /api/v1/labs/:labId", () => {
    it("should return a specific lab by ID", async () => {
      const mockLab = {
        id: "lab-1",
        name: "Lab One",
        instructorId: "inst-1",
        status: "draft",
      };
      (LabModel.findOne as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockLab),
      });

      const response = await supertest(app).get("/api/v1/labs/lab-1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLab);
      expect(LabModel.findOne).toHaveBeenCalledWith({ id: "lab-1" });
    });

    it("should return 404 if lab not found", async () => {
      (LabModel.findOne as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      const response = await supertest(app).get(
        "/api/v1/labs/non-existent-lab",
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual("Lab not found");
    });
  });

  describe("PUT /api/v1/labs/:labId", () => {
    it("should update a lab", async () => {
      const updateData = { name: "Updated Lab Name" };
      const mockUpdatedLab = {
        id: "lab-1",
        name: "Updated Lab Name",
        instructorId: "inst-1",
        status: "draft",
      };
      (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockUpdatedLab),
      });

      const response = await supertest(app)
        .put("/api/v1/labs/lab-1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toEqual("Updated Lab Name");
      expect(LabModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: "lab-1" },
        updateData,
        { new: true },
      );
    });

    it("should return 404 if lab to update not found", async () => {
      (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      const response = await supertest(app)
        .put("/api/v1/labs/non-existent-lab")
        .send({ name: "New Name" });

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual("Lab not found");
    });
  });

  describe("POST /api/v1/labs/:labId/publish", () => {
    it("should publish a lab", async () => {
      const mockPublishedLab = {
        id: "lab-1",
        name: "Lab One",
        instructorId: "inst-1",
        status: "published",
      };
      (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockPublishedLab),
      });

      const response = await supertest(app).post("/api/v1/labs/lab-1/publish");

      expect(response.status).toBe(200);
      expect(response.body.status).toEqual("published");
      expect(LabModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: "lab-1" },
        { status: "published" },
        { new: true },
      );
    });

    it("should return 404 if lab to publish not found", async () => {
      (LabModel.findOneAndUpdate as vi.Mock).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      const response = await supertest(app).post(
        "/api/v1/labs/non-existent-lab/publish",
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toEqual("Lab not found");
    });
  });
});

describe("LabPage API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new lab page", async () => {
    const labId = "test-lab-id";
    const mockLabPageData = {
      hasQuestion: true,
      hasDiagramTest: false,
    };
    const mockCreatedLabPage = {
      id: "mock-uuid",
      labId,
      pageNumber: 1,
      ...mockLabPageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock LabPageModel.find to return an empty array for pageNumber calculation
    (LabPageModel.find as vi.Mock).mockReturnValue({
      sort: vi.fn().mockReturnThis(), // Mock sort to allow chaining
      exec: vi.fn().mockResolvedValue([]),
    });

    (LabPageModel.create as vi.Mock).mockResolvedValue(mockCreatedLabPage);

    const response = await supertest(app)
      .post(`/api/v1/labs/${labId}/pages`)
      .send(mockLabPageData);

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual("mock-uuid");
    expect(response.body.labId).toEqual(labId);
    expect(response.body.pageNumber).toEqual(1);
    expect(LabPageModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        labId,
        pageNumber: 1,
        hasQuestion: mockLabPageData.hasQuestion,
        hasDiagramTest: mockLabPageData.hasDiagramTest,
        id: "mock-uuid",
      }),
    );
  });

  it("should get a lab page by ID", async () => {
    const labId = "test-lab-id";
    const pageId = "test-page-id";
    const mockLabPage = {
      id: pageId,
      labId,
      pageNumber: 1,
      hasQuestion: true,
      hasDiagramTest: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (LabPageModel.findOne as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockLabPage),
    });

    const response = await supertest(app).get(
      `/api/v1/labs/${labId}/pages/${pageId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockLabPage);
    expect(LabPageModel.findOne).toHaveBeenCalledWith({ id: pageId });
  });

  it("should update a lab page", async () => {
    const labId = "test-lab-id";
    const pageId = "test-page-id";
    const updateData = { hasDiagramTest: true };
    const mockUpdatedLabPage = {
      id: pageId,
      labId,
      pageNumber: 1,
      hasQuestion: true,
      hasDiagramTest: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (LabPageModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUpdatedLabPage),
    });

    const response = await supertest(app)
      .put(`/api/v1/labs/${labId}/pages/${pageId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.hasDiagramTest).toBe(true);
    expect(LabPageModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: pageId },
      updateData,
      { new: true },
    );
  });
});

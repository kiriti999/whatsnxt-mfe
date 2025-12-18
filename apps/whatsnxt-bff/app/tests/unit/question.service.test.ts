import { describe, it, expect, beforeEach, vi } from "vitest";
import { QuestionService } from "../../app/services/question.service";
import { QuestionModel } from "../../app/models/question.model";
import { Question } from "@whatsnxt/core-types";

// Mock the Mongoose model
vi.mock("../../app/models/question.model", () => ({
  QuestionModel: {
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

describe("QuestionService", () => {
  let questionService: QuestionService;

  beforeEach(() => {
    questionService = new QuestionService();
    vi.clearAllMocks(); // Clear mocks before each test
  });

  it("should create a new question", async () => {
    const questionData: Omit<Question, "id" | "createdAt" | "updatedAt"> = {
      labPageId: "page-1",
      type: "Text",
      questionText: "What is the capital of France?",
      correctAnswer: "Paris",
    };
    const mockCreatedQuestion: Question = {
      id: "mock-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
      ...questionData,
    };

    (QuestionModel.create as vi.Mock).mockResolvedValue(mockCreatedQuestion);

    const result = await questionService.createQuestion(questionData);

    expect(QuestionModel.create).toHaveBeenCalledWith({
      ...questionData,
      id: "mock-uuid",
    });
    expect(result).toEqual(mockCreatedQuestion);
  });

  it("should retrieve a question by ID", async () => {
    const mockQuestion: Question = {
      id: "mock-uuid",
      labPageId: "page-1",
      type: "Text",
      questionText: "What is the capital of France?",
      correctAnswer: "Paris",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (QuestionModel.findOne as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockQuestion),
    });

    const result = await questionService.getQuestionById("mock-uuid");

    expect(QuestionModel.findOne).toHaveBeenCalledWith({ id: "mock-uuid" });
    expect(result).toEqual(mockQuestion);
  });

  it("should retrieve questions by lab page ID", async () => {
    const mockQuestions: Question[] = [
      {
        id: "mock-uuid-1",
        labPageId: "page-1",
        type: "Multiple Choice",
        questionText: "Which is bigger?",
        options: ["A", "B"],
        correctAnswer: "A",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (QuestionModel.find as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockQuestions),
    });

    const result = await questionService.getQuestionsByLabPageId("page-1");

    expect(QuestionModel.find).toHaveBeenCalledWith({ labPageId: "page-1" });
    expect(result).toEqual(mockQuestions);
  });

  it("should update a question", async () => {
    const updatedData = { questionText: "New Question Text" };
    const mockUpdatedQuestion: Question = {
      id: "mock-uuid",
      labPageId: "page-1",
      type: "Text",
      questionText: "New Question Text",
      correctAnswer: "Paris",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (QuestionModel.findOneAndUpdate as vi.Mock).mockReturnValue({
      exec: vi.fn().mockResolvedValue(mockUpdatedQuestion),
    });

    const result = await questionService.updateQuestion(
      "mock-uuid",
      updatedData,
    );

    expect(QuestionModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "mock-uuid" },
      updatedData,
      { new: true },
    );
    expect(result).toEqual(mockUpdatedQuestion);
  });
});

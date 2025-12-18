import { StatusCodes } from "http-status-codes";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../../models/interview";
import Course from "../../models/course";
import { OpenAI } from "openai";
import mongoose from "mongoose";
import { applySlug } from "../../utils/course";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure API key is loaded
});

const interviewController = {
  // Get All Question And Answer
  getAllQuestionAnswers: async (req, res) => {
    try {
      const questions = await Interview.find();
      res.status(StatusCodes.OK).json({ questions });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },

  //get All Question And Answer with specific CourseID
  getQuestionAnswersByCourseID: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10, search = "" } = req.query;

      // to identify user role

      if (!req.userId) {
        req.userRole = "guest";
      }

      // Ensure page and limit are integers
      const currentPage = Math.max(parseInt(page, 10) || 1, 1); // Default to 1 if invalid
      const pageSize = Math.max(parseInt(limit, 10) || 10, 1); // Default to 10 if invalid

      // Calculate skip and limit for pagination
      const skip = (currentPage - 1) * pageSize;

      // Create a search query
      const searchQuery: any = search
        ? {
            courseId,
            $or: [
              { question: { $regex: search, $options: "i" } },
              { answer: { $regex: search, $options: "i" } },
            ],
          }
        : { courseId };

      // if accessed by student it should only send active data
      if (req.userRole !== "trainer" && req.userRole !== "admin") {
        searchQuery.status = { $in: ["active"] };
      }

      const questions = await Interview.find(searchQuery)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ updatedAt: -1, _id: -1 })
        .populate("courseId", "courseName")
        .exec();

      const totalQuestions = await Interview.countDocuments(searchQuery);
      const totalPages = Math.ceil(totalQuestions / limit);

      res.status(200).json({
        questions,
        pagination: {
          currentPage: page,
          totalPages,
          totalQuestions,
        },
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },

  getQuestionAnswerBySlug: async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "slug param is required!" });
      }

      const data = await Interview.findOne({ slug })
        .populate("courseInfo")
        .populate("authorInfo")
        .exec();
      res.status(StatusCodes.OK).json(data);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },

  // Add Question and answer
  createQuestionAnswer: async (req, res) => {
    const authorId = new mongoose.Types.ObjectId(req.userId);
    try {
      const { question, answer, courseId } = req.body;

      if (!question || !answer) {
        res.status(400).json({ error: "All fields are required" });
      }

      // course exists or not
      const course = await Course.findById(courseId);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
      }

      const slug = applySlug(question);
      const newQuestion = new Interview({
        question,
        answer,
        slug,
        courseId,
        questionUpdated: question,
        answerUpdated: answer,
        authorId,
      });
      await newQuestion.save();

      res
        .status(StatusCodes.CREATED)
        .json({ message: "Question created successfully", data: newQuestion });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },

  //update Question or Answer by question Id
  updateQuestionAnswer: async (req, res) => {
    try {
      const { questionId } = req.params;
      const { question, answer } = req.body;

      if (!questionId || (!question && !answer)) {
        res.status(400).json({
          error:
            "Question ID and at least one field (question or answer) to update are required.",
        });
      }

      const existingQuestion = await Interview.findById(questionId);
      if (!existingQuestion) {
        res.status(404).json({ message: "The question does not exist." });
      }

      const slug = applySlug(question);

      if (question) existingQuestion.questionUpdated = question;
      if (answer) existingQuestion.answerUpdated = answer;
      existingQuestion.status = "updated";
      existingQuestion.slug = slug;
      const updatedQuestion = await existingQuestion.save();

      res.status(StatusCodes.OK).json({
        message: "The question has been successfully updated!",
        data: updatedQuestion,
      });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },

  //delete Question or Answer by question Id
  removeQuestionAnswer: async (req, res) => {
    try {
      if (!req.params.questionId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Question ID is required." });
      }

      const question = await Interview.findById(req.params.questionId);
      if (!question) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "The question does not exist." });
      }

      await Interview.findByIdAndDelete(req.params.questionId);

      res
        .status(StatusCodes.OK)
        .json({ message: "The question has been successfully removed!" });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  },

  // Get Gemini suggestion
  getSuggestionByGemini: async (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "All fields are required" });
      }

      const prompt = `
            Answer the following interview question in 50 words or less. Focus on clarity, professionalism, and relevance to the role: ${question}. Provide a compelling and concise response suitable for a professional setting.`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      let suggestion = response.text();

      suggestion = suggestion.replace(/\n/g, " ").trim();

      res.status(StatusCodes.OK).json({ success: true, suggestion });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  },

  // Get Chat GPT suggestion
  getSuggestionByChatGpt: async (req, res) => {
    try {
      const { question } = req.body;

      if (!question) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "Message is required" });
      }

      const user = await mongoose.model("users").find({ _id: req.userId });

      if (user && user[0].apiKey) {
        const userAI = new OpenAI({
          apiKey: user[0].apiKey, // Ensure API key is loaded
        });

        const response = await userAI.chat.completions.create({
          model: "gpt-4o", // Use "gpt-4" or "gpt-3.5-turbo"
          messages: [{ role: "user", content: question }],
          temperature: 0.7,
        });

        res.json({ suggestion: response.choices[0].message.content });
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // Use "gpt-4" or "gpt-3.5-turbo"
          messages: [{ role: "user", content: question }],
          temperature: 0.7,
        });

        res.json({ suggestion: response.choices[0].message.content });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(StatusCodes.OK).json({ error: "Something went wrong" });
    }
  },

  // Get Chat GPT suggestion
  saveKey: async (req, res) => {
    try {
      console.log(" saveKey: :: req.body;:", req.body);
      const { apiKey } = req.body;

      if (!apiKey) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: "apiKey is required" });
      }

      const response = await mongoose
        .model("users")
        .findOneAndUpdate({ _id: req.userId, apiKey });

      res.status(StatusCodes.OK).json({ message: "key saved" });
    } catch (error) {
      console.error("Error:", error);
      res.status(StatusCodes.OK).json({ error: "Something went wrong" });
    }
  },
};

export default interviewController;

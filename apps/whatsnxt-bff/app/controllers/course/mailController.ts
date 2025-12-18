import { StatusCodes } from "http-status-codes";
import createWorker from "../../utils/course/worker";
import mongoose from "mongoose";

const createWorkerWithRetry = async (
  type,
  params,
  retries = 6,
  baseDelay = 500,
) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await createWorker(type, params);
    } catch (error) {
      attempt++;
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.warn(`Retry ${attempt} for worker... waiting ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
};

const mailController = {
  sendCoursePurchaseMail: async (req, res) => {
    try {
      const { buyerName, buyerEmail, cartItems, amount, orderId } = req.body;
      const subject = `Purchase Confirmation - Order #${orderId}`;
      const itemName = "courses";
      const params = {
        buyerName,
        buyerEmail,
        cartItems,
        amount,
        orderId,
        subject,
        itemName,
      };

      const result = await createWorkerWithRetry("purchaseMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (error) {
      console.error(
        "sendCoursePurchaseMail:: Error sending purchase mail:",
        error,
      );
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: "failed", error });
    }
  },

  contactUsMail: async (req, res) => {
    try {
      const { name, email, number, subject, text } = req.body;
      const params = { name, email, number, subject, text };

      const result = await createWorkerWithRetry("contactMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (error) {
      console.error("Error sending contact us mail:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: "failed", error });
    }
  },

  sendTrainerContactedMail: async (req, res) => {
    try {
      const { buyerEmail, buyerName, amount, orderId } = req.body;
      if (!buyerEmail || !buyerName || !amount || !orderId) {
        res
          .status(StatusCodes.BAD_REQUEST)
          .send({
            status: "failed",
            message: "buyerEmail, buyerName, amount and orderId are required!",
          });
      }
      const subject = `Purchase Confirmation - Order #${orderId}`;
      const itemName = "trainer contacts";
      const params = {
        buyerEmail,
        buyerName,
        amount,
        orderId,
        subject,
        itemName,
      };

      const result = await createWorkerWithRetry("purchaseMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (error) {
      console.error(
        "sendTrainerContactedMail:: Error sending purchase mail:",
        error,
      );
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ status: "failed", error });
    }
  },

  sendTeacherApplyMail: async (req, res) => {
    const { teacherName } = req.body;
    if (!teacherName) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({ status: "failed", message: "teacherName is required!" });
    }
    try {
      const admins = await mongoose.model("users").find({ role: "admin" });
      const emails = [];
      if (admins.length > 0) {
        admins.forEach((admin) => emails.push(admin.email));
      }
      console.log(admins, "admins");

      const subject = "User applied as trainer";
      const params = { teacherName, subject, emails };

      const result = await createWorkerWithRetry("applyMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (err) {
      console.log(err, "error in sendTeacherApplyMail");
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: "failed",
          err,
          message: "sendTeacherApplyMail failed",
        });
    }
  },

  sendCourseReviewMail: async (req, res) => {
    const { courseName, teacherName } = req.body;
    if (!teacherName || !courseName) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .send({
          status: "failed",
          message: "teacherName and courseName are required!",
        });
    }
    try {
      const admins = await mongoose.model("users").find({ role: "admin" });
      const emails = [process.env.ADMIN_EMAIL]; // Set default admin if admin email is not found in database
      if (admins.length > 0) {
        admins.forEach((admin) => emails.push(admin.email));
      }
      console.log(admins, "admins");

      const subject = "Course pending for review";
      const params = { courseName, teacherName, subject, emails };

      const result = await createWorkerWithRetry("courseReviewMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (err) {
      console.log(err, "error in sendCourseReviewMail");
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: "failed",
          err,
          message: "sendCourseReviewMail failed",
        });
    }
  },

  sendContactDetailsRefundMail: async (req, res) => {
    let { reason, buyerEmail, trainerName, amount } = req.body;
    if (!reason) {
      reason = "NA";
    }
    if (!reason || !buyerEmail || !trainerName || !amount) {
      res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        message:
          "reason, buyerEmail, trainerName and amount fields are required!",
      });
    }

    try {
      const subject = "Refund action has been taken";
      const params = {
        reason,
        email: buyerEmail,
        subject,
        trainerName,
        amount,
      };

      const result = await createWorkerWithRetry("refundMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (err) {
      console.log(err, "error in sendContactDetailsRefundMail");
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: "failed",
          err,
          message: "sendContactDetailsRefundMail failed",
        });
    }
  },

  sendCourseRefundMail: async (req, res) => {
    let {
      reasons = [],
      message,
      buyerEmail,
      courseName,
      refundAmount,
    } = req.body;
    if (reasons.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        message: "reasons array must not be empty!",
      });
    }

    if (!buyerEmail || !courseName || !refundAmount) {
      res.status(StatusCodes.BAD_REQUEST).send({
        status: "failed",
        message: "buyerEmail, courseName and refundAmount fields are required!",
      });
    }

    try {
      const subject = "Refund action has been taken";
      const params = {
        reasons,
        message,
        email: buyerEmail,
        subject,
        courseName,
        refundAmount,
      };

      const result = await createWorkerWithRetry("courseRefundMail", params);
      res.status(StatusCodes.OK).send({ status: "success", result });
    } catch (err) {
      console.log(err, "error in sendContactDetailsRefundMail");
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: "failed",
          err,
          message: "sendCourseRefundMail failed",
        });
    }
  },
};

export default mailController;

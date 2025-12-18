import Razorpay from "razorpay";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { StatusCodes } from "http-status-codes";
import TrainerContactedPayment from "../../models/trainerContactedPayment";
import mongoose from "mongoose";

// Input validation helpers
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

// Create an order
const createContactedPayment = async (req, res) => {
  try {
    const {
      amount = 100,
      currency = "INR",
      notes = {},
      userId,
      trainerId,
      buyerEmail,
    } = req.body;

    // Input validation
    if (!userId || !buyerEmail || !trainerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId, trainerId and buyerEmail are required fields",
      });
    }

    if (!validateObjectId(userId) || !validateObjectId(trainerId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid userId or trainerId format",
      });
    }

    if (!validateEmail(buyerEmail)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (trainerId === userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Trainer and user cannot be the same",
      });
    }

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Amount must be a positive number",
      });
    }

    // Check if user already has a pending/paid order for this trainer
    const existingOrder = await TrainerContactedPayment.findOne({
      userId,
      trainerId,
      status: { $in: ["pending", "paid"] },
    });

    if (existingOrder) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "An order already exists for this trainer",
        existingOrder: {
          orderId: existingOrder.orderId,
          status: existingOrder.status,
        },
      });
    }

    const options = {
      amount: numAmount * 100, // Convert to paisa (smallest currency unit)
      currency,
      receipt: `receipt_${nanoid(10)}`, // More secure than shortid
      payment_capture: 1,
      notes: {
        ...notes,
        userId,
        trainerId,
        buyerEmail,
      },
    };

    // Create the order in Razorpay
    const razorpayOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder.id);

    // Save payment details to the database
    const savedPayment = await TrainerContactedPayment.create({
      orderId: razorpayOrder.id,
      cost: razorpayOrder.amount,
      receipt: options.receipt,
      userId: new mongoose.Types.ObjectId(userId),
      trainerId: new mongoose.Types.ObjectId(trainerId),
      buyerEmail,
      status: "pending",
      createdAt: new Date(),
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      savedPayment: {
        _id: savedPayment._id,
        orderId: savedPayment.orderId,
        status: savedPayment.status,
      },
    });
  } catch (error) {
    console.error("Error creating trainer contacted payment:", error);

    // Handle specific Razorpay errors
    if (error.error && error.error.code) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Razorpay error: " + error.error.description,
      });
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create trainer contacted payment",
    });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "orderId parameter is required",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Update data is required",
      });
    }

    // Prevent updating sensitive fields
    const { orderId: bodyOrderId, userId, trainerId, ...updateData } = req.body;

    const updatedPayment = await TrainerContactedPayment.findOneAndUpdate(
      { orderId },
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!updatedPayment) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update payment",
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "orderId parameter is required",
      });
    }

    const payments = await TrainerContactedPayment.aggregate([
      { $match: { orderId } },
      {
        $lookup: {
          from: "users",
          localField: "trainerId",
          foreignField: "_id",
          as: "trainerInfo",
          pipeline: [
            { $project: { name: 1, email: 1, _id: 1 } }, // Only select needed fields
          ],
        },
      },
      { $unwind: "$trainerInfo" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
          pipeline: [{ $project: { name: 1, email: 1, _id: 1 } }],
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          orderId: 1,
          cost: 1,
          status: 1,
          paymentId: 1,
          createdAt: 1,
          updatedAt: 1,
          trainer: "$trainerInfo.name",
          trainerEmail: "$trainerInfo.email",
          buyer: "$userInfo.name",
          buyerEmail: "$userInfo.email",
        },
      },
    ]);

    if (!payments.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      payment: payments[0],
    });
  } catch (error) {
    console.error(
      `Error retrieving payment with orderId ${req.params.orderId}:`,
      error,
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve payment",
    });
  }
};

const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId parameter is required",
      });
    }

    if (!validateObjectId(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const matchConditions: any = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status) {
      matchConditions.status = status;
    }

    const [results, totalCount] = await Promise.all([
      TrainerContactedPayment.aggregate([
        { $match: matchConditions },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "trainerId",
            foreignField: "_id",
            as: "trainerInfo",
            pipeline: [{ $project: { name: 1, email: 1, _id: 1 } }],
          },
        },
        { $unwind: "$trainerInfo" },
        {
          $project: {
            orderId: 1,
            cost: 1,
            status: 1,
            paymentId: 1,
            createdAt: 1,
            trainer: "$trainerInfo.name",
            trainerId: "$trainerInfo._id",
          },
        },
      ]),
      TrainerContactedPayment.countDocuments(matchConditions),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: results,
      pagination: {
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error(
      `Error retrieving orders for user ID ${req.params.userId}:`,
      error,
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve user payments",
    });
  }
};

const userAlreadyPurchased = async (req, res) => {
  try {
    const { userId, trainerId } = req.params;

    if (!userId || !trainerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId and trainerId parameters are required",
      });
    }

    if (!validateObjectId(userId) || !validateObjectId(trainerId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid userId or trainerId format",
      });
    }

    const data = await TrainerContactedPayment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      trainerId: new mongoose.Types.ObjectId(trainerId),
      status: "paid",
    });

    res.status(StatusCodes.OK).json({
      success: true,
      hasPurchased: Boolean(data),
      purchaseDate: data?.updatedAt || null,
    });
  } catch (error) {
    console.error("Error in userAlreadyPurchased:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to check purchase status",
    });
  }
};

const getUserPayment = async (req, res) => {
  try {
    const { userId, trainerId } = req.params;

    if (!userId || !trainerId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "userId and trainerId parameters are required",
      });
    }

    if (!validateObjectId(userId) || !validateObjectId(trainerId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid userId or trainerId format",
      });
    }

    const data = await TrainerContactedPayment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      trainerId: new mongoose.Types.ObjectId(trainerId),
      status: "paid",
    });

    if (!data) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No paid payment found for this user-trainer combination",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      payment: data,
    });
  } catch (error) {
    console.error("Error in getUserPayment:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve user payment",
    });
  }
};

const verify = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message:
          "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    // Verify orderId matches
    if (orderId !== razorpay_order_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Order ID mismatch",
      });
    }

    const order = await TrainerContactedPayment.findOne({
      orderId: razorpay_order_id,
    });
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if already verified
    if (order.status === "paid") {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Payment already verified",
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentId: order.paymentId,
        },
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Log potential fraud attempt
      console.warn(`Invalid payment signature for order ${razorpay_order_id}`, {
        expected: generatedSignature,
        received: razorpay_signature,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });

      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Update order status
    order.status = "paid";
    order.paymentId = razorpay_payment_id;
    order.updatedAt = new Date();
    await order.save();

    console.log(`Payment verified successfully for order ${razorpay_order_id}`);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment verified successfully",
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentId: order.paymentId,
        amount: order.cost,
        verifiedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      `Error verifying payment for order ${req.params.orderId}:`,
      error,
    );
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    // Basic database connectivity check
    await mongoose.connection.db.admin().ping();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Payment service is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      message: "Service unhealthy",
      error: error.message,
    });
  }
};

export {
  createContactedPayment,
  updatePayment,
  getPaymentById,
  getUserPayment,
  getUserPayments,
  verify,
  userAlreadyPurchased,
  healthCheck,
};

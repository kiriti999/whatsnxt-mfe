import Razorpay from "razorpay";
import crypto from "crypto";
import shortid from "shortid";
import { StatusCodes } from "http-status-codes";
import Order from "../../models/order";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY, // Securely store this in .env
  key_secret: process.env.RAZOR_PAY_SECRET, // Securely store this in .env
});

// Create an order
export const createOrder = async (req, res) => {
  try {
    const {
      amount,
      gstAmount,
      currency = "INR",
      notes = {},
      userId,
      courseInfo = [],
      buyerEmail,
    } = req.body;

    const options = {
      amount: Number(amount), // Razorpay requires amount in paisa
      currency,
      receipt: `receipt_${shortid.generate()}`,
      payment_capture: 1,
      notes: {
        ...notes,
        gstAmount: gstAmount || "0", // Include GST amount in notes
      },
    };

    // Create the order in Razorpay
    const razorpayOrder = await razorpay.orders.create(options);

    // Save order details to the database
    const savedOrder = await Order.create({
      orderId: razorpayOrder.id,
      cost: razorpayOrder.amount,
      amount: razorpayOrder.amount,
      gstAmount: gstAmount ? Number(gstAmount) : 0, // Store GST amount
      currency: razorpayOrder.currency,
      receipt: options.receipt,
      userId,
      courseInfo,
      buyerEmail,
      status: "created",
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      order: razorpayOrder,
      savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Retrieve an order by its ID
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({ orderId })
      .populate("userId")
      .populate("courseInfo.courseId"); // Populate user and course info if necessary

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
    }

    // Calculate subtotal if gstAmount is present
    let subtotal = order.cost;
    if (order.gstAmount) {
      // If cost is total (including GST), then subtract GST to get subtotal
      subtotal = order.cost - order.gstAmount;
    }

    const response = {
      id: order.orderId,
      amount: order.cost,
      subtotal: subtotal, // Add subtotal for invoice
      gstAmount: order.gstAmount || 0, // Add GST amount
      gstRate: order.gstRate || "0%", // Add GST rate
      entity: "orders",
      amount_paid: order.amount_paid || 0,
      currency: order.currency,
      receipt: order.orderId,
      status: order.status,
      attempts: order.attempts || 0,
      notes: order.notes || {},
      buyer: (order.userId as any)?.name || "",
      quantity: order.quantity,
      courseInfo: order.courseInfo,
      createdAt: Math.floor(new Date(order.createdAt).getTime() / 1000),
    };

    res.status(StatusCodes.OK).json(response);
  } catch (error) {
    console.error(`Error retrieving order with ID ${orderId}:`, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

// Verify an order
export const verifyOrder = async (req, res) => {
  const { orderId } = req.params;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  try {
    const order = await Order.findOne({ orderId: razorpay_order_id });

    if (!order) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Order not found" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      order.status = "paid";
      order.paymentId = razorpay_payment_id;
      await order.save();

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error(`Error verifying order with ID ${orderId}:`, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

// Get orders for a specific user
export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "userId is not provided" });
    }
    const totalCount = await Order.countDocuments({ userId });
    const orders = await Order.find({ userId }).populate("courseInfo.courseId"); // Populate course info if necessary

    res.status(StatusCodes.OK).json({ data: orders, totalCount });
  } catch (error) {
    console.error(`Error retrieving orders for user ID ${userId}:`, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error in getOrdersByUserId handler" });
  }
};

// Get user paid order for specific course
export const getPaidOrderByCourseId = async (req, res) => {
  const { userId, courseId } = req.params;
  if (!userId || !courseId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "userId and courseId fields are required!" });
  }

  try {
    const order = await Order.findOne({
      userId,
      status: {
        $in: ["paid", "partial_refunded"],
      },
      courseInfo: {
        $elemMatch: { courseId },
      },
    }).populate({
      path: "courseInfo.courseId",
      model: "coursesPublished", // Specify the model name explicitly
    });

    res.status(StatusCodes.OK).json(order);
  } catch (error) {
    console.error(`Error in getPaidOrderByCourseId, ${courseId}:`, error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error in getPaidOrderByCourseId handler" });
  }
};

export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const {
    status,
    refund_status,
    refund_message,
    refund_reasons = [],
    amount_paid,
    amount_refunded,
    courseId,
  } = req.body;

  if (!orderId) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "error: orderId is not provided" });
  }

  if (!status || !refund_status || !amount_refunded || !courseId) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message:
        "error: status, refund_status, amount_refunded and courseId must be provided",
    });
  }

  if (refund_reasons.length === 0) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "error: refund_reasons array must not be empty!" });
  }

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      {
        orderId,
      },
      {
        $set: {
          "courseInfo.$[elem]": { courseId, status: "refunded" },
          status,
          refund_status,
          refund_message,
          refund_reasons,
          amount_paid,
          amount_refunded,
        },
      },
      {
        arrayFilters: [{ "elem.courseId": courseId }],
        new: true, // Return the updated document
      },
    );
    console.log(updatedOrder, "updatedOrder");
    res.status(StatusCodes.OK).json({ message: "order successfully updated" });
  } catch (err) {
    console.log(err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Error in updateOrder handler" });
  }
};

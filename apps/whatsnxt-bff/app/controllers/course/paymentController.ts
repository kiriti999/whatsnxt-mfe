import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
const {
  updateBulkEnrolledCoursesCache,
} = require("../../utils/course/courseEnrolledCacheUtil");

const paymentController = {
  save: async (req, res) => {
    try {
      const {
        buyerEmail,
        amount,
        gstAmount, // Extract GST amount from request
        gstRate = "0%", // Extract GST rate with default
        cartItems,
        paymentId,
        orderId,
        userId,
        method,
        bank,
        wallet,
        cardNetwork,
        cardLast4,
      } = req.body;

      // Build payload for the order with GST info
      const payload = buildOrderPayload({
        buyerEmail,
        amount,
        gstAmount, // Pass GST amount
        gstRate, // Pass GST rate
        cartItems,
        paymentId,
        orderId,
        userId,
      });

      // Get unique cart items
      const uniqueCartItems = await getUniqueCartItems(cartItems);

      // Prepare bulk operations
      const coursesToEnroll = await buildCoursesToEnroll(
        buyerEmail,
        amount,
        userId,
        uniqueCartItems,
      );
      const coursesToUpdate = await buildCoursesToUpdate(uniqueCartItems);

      // Upsert the order with payment and GST details
      await upsertOrder({
        ...payload,
        method,
        bank,
        wallet,
        cardNetwork,
        cardLast4,
      });

      await mongoose.model("cart").deleteMany({});

      // Enroll courses
      const enrolled = await mongoose
        .model("enrolledCourses")
        .bulkWrite(coursesToEnroll, { ordered: false });

      // Update course purchase counts
      await updateCoursePurchaseCounts(coursesToUpdate);

      // Get the actual enrollment documents for cache update
      const newEnrollments = await retrieveNewEnrollments(
        userId,
        uniqueCartItems,
      );

      // Update the cache for these enrollments
      await updateBulkEnrolledCoursesCache(userId, newEnrollments);

      // Respond with success
      res.status(StatusCodes.OK).send({ enrolled });
    } catch (error) {
      console.error("paymentController:: savePayment:: error:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ error: "Failed to save payment" });
    }
  },
};

/**
 * Retrieve the newly created enrollment documents
 */
async function retrieveNewEnrollments(userId, uniqueCartItems) {
  const courseIds = uniqueCartItems.map((item) => item.id);
  return await mongoose.model("enrolledCourses").find({
    user: userId,
    course: { $in: courseIds },
  });
}

export default paymentController;

// #region Helper functions region

/**
 * Build the order payload.
 */
function buildOrderPayload({
  buyerEmail,
  amount,
  gstAmount,
  gstRate,
  cartItems,
  paymentId,
  orderId,
  userId,
}) {
  // Create notes with GST information
  const notes = new Map();
  if (gstAmount) {
    notes.set("gstAmount", gstAmount.toString());
    notes.set("gstRate", gstRate || "0%");
  }

  return {
    buyerEmail,
    cost: amount,
    amount_paid: amount,
    // Add GST fields if provided
    ...(gstAmount && {
      gstAmount: Number(gstAmount),
      gstRate: gstRate || "0%",
    }),
    courseInfo: cartItems.map((item) => ({
      courseName: item.courseName,
      price: item.total_cost,
      total_cost: item.total_cost + item.total_cost * 0.18,
      courseId: item._id,
    })),
    userId,
    paymentId,
    quantity: cartItems.reduce((acc, val) => acc + val.quantity, 0),
    orderId,
    notes: notes.size > 0 ? notes : undefined,
  };
}

/**
 * Get unique cart items by splitting IDs and avoiding duplicates.
 */
function getUniqueCartItems(cartItems) {
  return cartItems.filter(function (v) {
    return this[v.id] ? !Object.assign(this[v.id], v) : (this[v.id] = v);
  }, {});
}

/**
 * Build bulk operations for course enrollment.
 */
const getLessons = async (courseId) => {
  const sectionModel = mongoose.model("sections");
  const sections = await sectionModel.find({ courseId });
  const lessons = sections.flatMap((section) =>
    section.videos.map((video) => {
      return {
        lesson_id: video._id,
        is_completed: false,
        section_id: section._id,
      };
    }),
  );

  return lessons;
};

async function buildCoursesToEnroll(email, amount, userId, uniqueCartItems) {
  return await Promise.all(
    uniqueCartItems.map(async (item) => {
      const lessons = await getLessons(item.id);
      return {
        insertOne: {
          document: {
            buyerEmail: email,
            cost: amount,
            course: item.id,
            user: userId,
            lessons,
          },
        },
      };
    }),
  );
}

/**
 * Build bulk operations for course updates.
 */
function buildCoursesToUpdate(uniqueCartItems) {
  return uniqueCartItems.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $inc: { purchaseCount: 1 } },
    },
  }));
}

/**
 * Upsert the order (find by orderId and update or insert if not exists).
 */
async function upsertOrder(payload) {
  console.log(" upsertOrder :: payload:", payload);
  return mongoose.model("orders").findOneAndUpdate(
    { orderId: payload.orderId }, // Filter by orderId
    { $set: payload }, // Update with payload
    { upsert: true, new: true }, // Create if not exists, return the updated document
  );
}
/**
 * Update course purchase counts in bulk.
 */
async function updateCoursePurchaseCounts(coursesToUpdate) {
  await mongoose
    .model("coursesPublished")
    .bulkWrite(coursesToUpdate, { ordered: false });
}
// #endregion

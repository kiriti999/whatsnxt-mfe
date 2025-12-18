import express from "express";
const router = express.Router();
import * as ordersController from "../../../../controllers/course/ordersController";

// Route to create an order
router.post("/", ordersController.createOrder);

// Route to retrieve an order by its ID
router.get("/:orderId", ordersController.getOrderById);

// Route to verify an order
router.post("/:orderId/verify", ordersController.verifyOrder);

// Route to get orders associated with a specific user
router.get("/user/:userId", ordersController.getOrdersByUserId);

// get paid order for specific course
router.get("/:userId/:courseId", ordersController.getPaidOrderByCourseId);

// update order
router.patch("/:orderId", ordersController.updateOrder);

export default router;

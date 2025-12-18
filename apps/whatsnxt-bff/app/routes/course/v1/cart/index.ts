import express from "express";
const router = express.Router();
import cartController from "../../../../../app/controllers/course/cartController"; // Adjust the path as needed
import authMiddleware from "../../../../common/middlewares/auth-middleware";

// Routes for cart operations
router.post("/", authMiddleware, cartController.createOrUpdateCart); // Create or update a cart
router.get("/", authMiddleware, cartController.getCart); // Fetch the cart
router.delete("/", authMiddleware, cartController.deleteCart); // Delete the cart

export default router;

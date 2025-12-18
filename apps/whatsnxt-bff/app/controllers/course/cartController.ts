import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";

// Helper function to create an empty cart
async function createEmptyCart(userId) {
  const response = await mongoose.model("cart").create({
    cartItems: [],
    discount: 0,
    userId,
  });
  return response.id;
}

const cartController = {
  // Create or update a cart
  createOrUpdateCart: async (req, res) => {
    try {
      // Validate required data
      if (!req.userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: "User ID is required",
        });
      }

      const userOid = new mongoose.Types.ObjectId(req.userId);
      const cart = await mongoose
        .model("cart")
        .findOne({ userId: userOid })
        .exec();
      const cartID = cart ? cart.id : await createEmptyCart(req.userId);

      if (
        req.body &&
        (req.body.cartItems !== undefined || req.body.discount !== undefined)
      ) {
        const cartId = new mongoose.Types.ObjectId(cartID);
        const { cartItems = [], discount = 0 } = req.body;

        // Validate cartItems structure
        if (!Array.isArray(cartItems)) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            error: "cartItems must be an array",
          });
        }

        const newCart = { cartItems, discount };

        const updateResult = await mongoose
          .model("cart")
          .updateOne({ _id: cartId }, newCart);

        if (updateResult.matchedCount === 0) {
          return res.status(StatusCodes.NOT_FOUND).json({
            error: "Cart not found",
          });
        }
      }

      // Return success with proper status
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Cart updated successfully",
        cartId: cartID,
      });
    } catch (error) {
      console.error("Cart update error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to update cart",
        message: error.message,
      });
    }
  },

  // Fetch a user's cart
  getCart: async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: "User ID is required",
        });
      }

      const userOid = new mongoose.Types.ObjectId(req.userId);
      const cart = await mongoose
        .model("cart")
        .findOne({ userId: userOid })
        .exec();

      res.status(StatusCodes.OK).json({
        cart: cart || { cartItems: [], discount: 0 },
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Failed to fetch cart",
        message: error.message,
      });
    }
  },

  // Delete a user's cart
  deleteCart: async (req, res) => {
    try {
      const { cartItemId } = req.params;

      if (!cartItemId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Cart item ID is required",
        });
      }

      if (!req.userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: "User ID is required",
        });
      }

      const result = await mongoose
        .model("cart")
        .updateOne(
          { userId: req.userId, "cartItems.id": cartItemId },
          { $pull: { cartItems: { id: cartItemId } } },
        );

      if (result.modifiedCount > 0) {
        res.status(StatusCodes.OK).json({
          success: true,
          message: "Cart item deleted successfully",
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          error: "Cart item not found or already removed",
        });
      }
    } catch (error) {
      console.error("Error deleting cart item:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Error deleting cart item",
        message: error.message,
      });
    }
  },
};

export default cartController;

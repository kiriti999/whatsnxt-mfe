"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Cart schema
 */

const CartSchema = new Schema(
  {
    cartItems: [
      {
        id: String,
        duration: String,
        image: String,
        lessons: String,
        live_training_price: Number,
        purchaseType: String,
        quantity: Number,
        selected: String,
        title: String,
        total_cost: Number,
      },
    ],
    discount: Number,
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true, collection: "cart" },
);

CartSchema.set("toObject", { virtuals: true });
CartSchema.set("toJSON", { virtuals: true });

/**
 * Methods
 */

CartSchema.method({});

/**
 * Statics
 */

CartSchema.static({});

/**
 * Register
 */

const Cart = mongoose.model("cart", CartSchema);
export default Cart;

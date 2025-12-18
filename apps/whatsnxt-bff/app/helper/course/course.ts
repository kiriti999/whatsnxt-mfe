import CartModel from "../../models/cart";

const deleteCourseFromCart = async function (courseId) {
  try {
    const course_price_id = `price_${courseId}`;

    await CartModel.updateMany(
      { "cartItems.id": course_price_id },
      {
        $pull: {
          cartItems: {
            id: course_price_id,
          },
        },
      },
    );
  } catch (error) {
    console.log("Error deleting product from cart", error.message);
  }
};

export { deleteCourseFromCart };

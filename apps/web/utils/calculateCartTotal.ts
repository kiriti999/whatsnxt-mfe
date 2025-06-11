export const calculateCartTotal = (courses: any[]) => {
  const total = courses.reduce((acc: number, el: { total_cost: number; quantity: number; }) => {
    acc += el.total_cost * el.quantity;
    return acc;
  }, 0);

  const cartTotal: number = Math.round(total * 100) / 100; // Convert to number
  const stripeTotal: number = Math.round(total * 100); // Stripe expects total in cents

  return { cartTotal, stripeTotal };
};



const calculateCartTotalMinus = (courses: any[]) => {
  const total = courses.reduce((acc: number, el: { regular_price: number; quantity: number; }) => {
    acc += el.regular_price * el.quantity;
    return acc;
  }, 0);

  const cartTotalMinus = ((total * 100) / 100).toFixed(2);

  return { cartTotalMinus };
};

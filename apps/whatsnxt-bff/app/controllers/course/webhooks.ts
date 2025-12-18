import crypto from "crypto";
import { StatusCodes } from "http-status-codes";

const auth = Buffer.from(
  `${process.env.RAZOR_PAY_KEY}:${process.env.RAZOR_PAY_SECRET}`,
).toString("base64");

async function handler(req, res) {
  console.log("webhook handler called");
  const { payment } = req.body.payload;
  if (req.method !== "POST") {
    res
      .status(StatusCodes.METHOD_NOT_ALLOWED)
      .json({ error: "Method Not Allowed" });
  }

  const secret = process.env.RAZOR_PAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  // Verify webhook signature
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "payment.authorized") {
    const paymentId = payment.entity.id;
    const amount = payment.entity.amount;
    console.log(payment, "payment");

    // Check for conditions to refund
    if (payment.entity.error_code || payment.entity.error_description) {
      try {
        // Refund api call
        const response = await fetch(
          `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount }),
          },
        );

        if (!response.ok) {
          throw new Error(`${await response.text()}`);
        }

        const refundData = await response.json();
        res.status(StatusCodes.OK).json(refundData);
      } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false });
      }
    }
  }
  res.status(StatusCodes.BAD_REQUEST).json({ message: "Event not handled" });
}

export default handler;

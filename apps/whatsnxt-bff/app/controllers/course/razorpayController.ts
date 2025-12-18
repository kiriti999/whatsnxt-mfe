import { StatusCodes } from "http-status-codes";

const auth = Buffer.from(
  `${process.env.RAZOR_PAY_KEY}:${process.env.RAZOR_PAY_SECRET}`,
).toString("base64");

const razorpayController = {
  getPaymentDetailsById: async (req, res) => {
    const { paymentId } = req.params;

    if (req.method !== "GET") {
      res
        .status(StatusCodes.METHOD_NOT_ALLOWED)
        .json({ error: "Method not allowed" });
    }

    try {
      // Fetch payment details from Razorpay
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`${await response.text()}`);
      }

      const paymentDetails = await response.json();
      res.status(StatusCodes.OK).json(paymentDetails);
    } catch (error) {
      console.error("Error fetching payment details:", error.message);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to fetch payment details" });
    }
  },

  capturePayment: async (req, res) => {
    const { paymentId } = req.params;

    if (!paymentId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "paymentId must be provided!" });
    }
    try {
      // Fetch payment details from Razorpay
      const resp = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );
      if (!resp.ok) {
        throw new Error(`${await resp.text()}`);
      }
      const paymentDetails = await resp.json();
      console.log(paymentDetails.status, "paymentDetails status");

      // Call capture api if status is not captured
      if (paymentDetails.status !== "captured") {
        const response = await fetch(
          `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
          },
        );

        if (!response.ok) {
          throw new Error(`${await response.text()}`);
        }

        const capturedData = await response.json();
        res.status(StatusCodes.OK).json({ data: capturedData, success: true });
      }
    } catch (err) {
      console.log("Error:2 while making capture request:", err);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to make capture request" });
    }
  },

  refundPayment: async (req, res) => {
    const { paymentId } = req.params;

    if (!paymentId) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "paymentId must be provided!" });
    }

    if (Object.keys(req.body).length === 0) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "req.body must not be empty!" });
    }

    try {
      // Fetch payment details from Razorpay
      const resp = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );
      if (!resp.ok) {
        throw new Error(`${await resp.text()}`);
      }
      const paymentDetails = await resp.json();
      console.log(paymentDetails.status, "status");

      // Make capture request if status === 'authorized'
      if (paymentDetails.status === "authorized") {
        const response = await fetch(
          `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
          },
        );

        if (!response.ok) {
          throw new Error(`${await response.text()}`);
        }
      }

      const remainingAmount =
        paymentDetails.amount - paymentDetails.amount_refunded;
      if (req.body.amount > remainingAmount) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: `Refund amount exceeds the remaining refundable amount of ₹${remainingAmount / 100}`,
        });
      }

      if (paymentDetails.status === "failed") {
        res.status(StatusCodes.BAD_REQUEST).json({
          message:
            "No manual refund is required. The amount will be reversed by the bank automatically.",
        });
      }

      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req.body),
        },
      );

      if (!response.ok) {
        throw new Error(`${await response.text()}`);
      }

      const refundData = await response.json();
      res.status(StatusCodes.OK).json(refundData);
    } catch (error) {
      console.log("Error: while making refund request:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to make refund request" });
    }
  },
};

export default razorpayController;

import express from "express";
const googleRouter = express.Router();

import google from "./auth";

googleRouter.use("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Google API",
    timestamp: new Date().toISOString(),
  });
});

googleRouter.use("/", google);

export default googleRouter;

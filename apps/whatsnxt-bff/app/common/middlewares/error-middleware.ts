import express from "express";
import { getLogger } from "../../../config/logger";
import { StatusCodes } from "http-status-codes";

const logger = getLogger("error-middleware");
const app = express();

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Something broke!");
});

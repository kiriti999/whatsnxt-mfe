import express from "express";
const router = express.Router();
import handler from "../../../../controllers/course/webhooks";

router.post("/", handler);

export default router;

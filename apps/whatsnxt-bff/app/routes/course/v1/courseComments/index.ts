import express from "express";
import { CommentController } from "../../../../controllers/course/commentController";

const router = express.Router();
const commentController = new CommentController();

router.post("/", (req, res) => commentController.create(req, res));
router.get("/", (req, res) => commentController.getComments(req, res));
router.patch("/:id/flag", (req, res) =>
  commentController.flagComment(req, res),
);
router.patch("/:id/edit", (req, res) =>
  commentController.editComment(req, res),
);
router.delete("/:id", (req, res) => commentController.deleteComment(req, res));
router.post("/:id/toggleLike", (req, res) =>
  commentController.toggleLike(req, res),
);
router.post("/:id/toggleDislike", (req, res) =>
  commentController.toggleDislike(req, res),
);

export default router;

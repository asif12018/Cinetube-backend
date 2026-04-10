import { Router } from "express";
import { CommentController } from "./comment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";
import { CommentValidation } from "./comment.validation";
import { validateRequest } from "../../middlewares/validateRequest";



const router = Router();


router.post("/:id", checkAuth(Role.USER), validateRequest(CommentValidation),CommentController.createComment);
router.get("/:id", CommentController.getAllCommentByReviewId);




export const CommentRoutes = router
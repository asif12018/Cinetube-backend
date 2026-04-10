import { Router } from "express";
import { ReviewLikeController } from "./reviewLike.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";



const router = Router();


router.post("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),ReviewLikeController.toggleReviewLike);
router.get("/:id", ReviewLikeController.getAllReviewLikeByReviewId);
router.get("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),ReviewLikeController.getReviewByUserIdAndReviewId);


export const ReviewLikeRoutes = router;
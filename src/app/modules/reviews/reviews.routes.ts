import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { ReviewController } from "./reviews.controller";
import { CreateReviewValidation, UpdateReviewValidation } from "./reviews.validation";
import { validateRequest } from "../../middlewares/validateRequest";






const router = Router();




router.post("/:id", checkAuth(Role.USER), validateRequest(CreateReviewValidation),ReviewController.createReview);
router.patch("/:id", checkAuth(Role.USER), validateRequest(UpdateReviewValidation),ReviewController.updateReview);
router.get("/:id", ReviewController.getReviewByMedia);
router.patch("/status/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.updateReviewStatus);
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getUnPublishedReview);
router.get("/checkUserReview/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), ReviewController.isUserHasReview);


export const ReviewRoutes = router
import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { ReviewController } from "./reviews.controller";
import { CreateReviewValidation, UpdateReviewValidation } from "./reviews.validation";
import { validateRequest } from "../../middlewares/validateRequest";






const router = Router();




// router.post("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(CreateReviewValidation),ReviewController.createReview);
// router.patch("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(UpdateReviewValidation),ReviewController.updateReview);
// router.get("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),  ReviewController.getReviewByMedia);
// router.patch("/status/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.updateReviewStatus);
// router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getUnPublishedReview);
// router.get("/checkUserReview/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), ReviewController.isUserHasReview);
// router.get("/published", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getPublishedReview);
// router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), ReviewController.deleteReview);

// ✅ 1. ALL SPECIFIC ROUTES GO HERE AT THE TOP
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getUnPublishedReview);
router.get("/published", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.getPublishedReview);
router.get("/checkUserReview/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), ReviewController.isUserHasReview);

// ✅ 2. ALL DYNAMIC (/:id) ROUTES GO AT THE BOTTOM
router.post("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(CreateReviewValidation),ReviewController.createReview);
router.patch("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), validateRequest(UpdateReviewValidation),ReviewController.updateReview);
router.get("/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN),  ReviewController.getReviewByMedia);
router.patch("/status/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ReviewController.updateReviewStatus);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), ReviewController.deleteReview);




export const ReviewRoutes = router
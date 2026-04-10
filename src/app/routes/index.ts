import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { GenreRoutes } from "../modules/genre/genre.routes";
import { ActorRoutes } from "../modules/actor/actor.routes";
import { MediaRoutes } from "../modules/media/media.routes";
import { TagRoutes } from "../modules/tags/tags.routes";
import { ReviewRoutes } from "../modules/reviews/reviews.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { CommentRoutes } from "../modules/comment/comment.routes";
import { ReviewLikeRoutes } from "../modules/reviewLike/reviewLike.routes";
import { WatchListRoutes } from "../modules/watchList/watchList.routes";
import { PaymentRoutes } from "../modules/purchase/payment.routes";


const router = Router();










router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/genre", GenreRoutes);
router.use("/actor", ActorRoutes);
router.use("/media", MediaRoutes);
router.use("/tags", TagRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/notification", NotificationRoutes);
router.use("/comment", CommentRoutes);
router.use("/like", ReviewLikeRoutes);
router.use("/watchList", WatchListRoutes);




export const IndexRoutes = router;
import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { GenreRoutes } from "../modules/genre/genre.routes";
import { ActorRoutes } from "../modules/actor/actor.routes";
import { MediaRoutes } from "../modules/media/media.routes";
import { TagRoutes } from "../modules/tags/tags.routes";


const router = Router();










router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/genre", GenreRoutes);
router.use("/actor", ActorRoutes);
router.use("/media", MediaRoutes);
router.use("/tags", TagRoutes);



export const IndexRoutes = router;
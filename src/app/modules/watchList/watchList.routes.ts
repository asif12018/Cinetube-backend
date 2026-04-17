import { Router } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { Role } from "@prisma/client";
import { checkAuth } from "../../middlewares/checkAuth";
import { WatchListController } from "./watchList.controller";



const router = Router();


router.post("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WatchListController.toggleWatchList);

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WatchListController.getUserWatchList);

router.get("/checkWatchList", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), WatchListController.isMovieOnTheWatchList);


export const WatchListRoutes = router;
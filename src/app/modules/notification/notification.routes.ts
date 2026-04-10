import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";









const router = Router();


router.post("/", checkAuth(Role.USER),NotificationController.readNotification);
router.get("/",checkAuth(Role.USER),NotificationController.getAllUserNotification);

export const NotificationRoutes = router;
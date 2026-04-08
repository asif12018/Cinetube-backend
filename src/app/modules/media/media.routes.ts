import { Router } from "express";
import { MediaController } from "./media.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";
import { multerUpload } from "../../utils/muler.config";






const router = Router();

router.post(
  "/create-media",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "poster", maxCount: 1 },   // Expect 1 file named "poster"
    { name: "backdrop", maxCount: 1 }  // Expect 1 file named "backdrop"
  ]),
  MediaController.createMedia
);
router.get("/get-all-media", MediaController.getAllMedia);
router.get("/get-media-by-id/:id", MediaController.getMediaById);
router.patch(
  "/update-media/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.fields([
    { name: "poster", maxCount: 1 },
    { name: "backdrop", maxCount: 1 }
  ]),
  MediaController.updateMedia
);
router.delete("/delete-media/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN), MediaController.deleteMedia);

export const MediaRoutes = router;
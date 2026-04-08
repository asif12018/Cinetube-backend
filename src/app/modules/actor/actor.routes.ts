import { Router } from "express";
import { multerUpload } from "../../utils/muler.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { ActorValidation } from "./actor.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";
import { ActorController } from "./actor.controller";








const router = Router();



router.post("/create-actor",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),multerUpload.single("photoUrl"), validateRequest(ActorValidation.createActorValidation),ActorController.createActor);

router.patch("/update-actor/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),multerUpload.single("photoUrl"), validateRequest(ActorValidation.updateActorValidation),ActorController.updateActor);

router.delete("/delete-actor/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),ActorController.deleteActor);

router.get("/get-all-actor",ActorController.getAllActor);

router.get("/get-actor-by-id/:id",ActorController.getActorById);

export const ActorRoutes = router;
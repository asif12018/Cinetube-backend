import { Router } from "express";
import { AuthController } from "./auth.controller";





import { multerUpload } from "../../utils/muler.config";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validations";

const router = Router();

router.post("/register", multerUpload.single('image'), AuthController.registerUser);
// router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.logInUser);
router.post("/verify-email-otp", AuthController.verifyEmailOtp);
router.patch("/update-user/:id", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), multerUpload.single('image'),AuthController.updateUser);
router.get("/get-me", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewRefreshToken);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.post("/logout", checkAuth(Role.USER, Role.ADMIN, Role.SUPER_ADMIN), AuthController.logOutUser);
router.post("/resend-otp", AuthController.resendOTP);
router.get("/authUser", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), AuthController.getMeAuth);


export const AuthRoutes = router;
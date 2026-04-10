import express from "express";
import { PaymentController } from "./purchase.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../../../../generated/prisma";


const router = express.Router();

// 🚨 THIS IS THE MOST IMPORTANT PART:
// You must use express.raw() here so req.body stays a Buffer!
router.post(
    "/stripe/webhook", 
    express.raw({ type: "application/json" }), 
    PaymentController.handleStripeWebhookEvent
);

router.post(
    "/create-checkout", 
    express.json(), // Parse normal JSON
    checkAuth(Role.USER), // Ensure they are logged in
    PaymentController.createCheckout
);

router.post(
    "/cancel-subscription", 
    express.json(), 
    checkAuth(Role.USER), 
    PaymentController.cancelSubscription
);


export const PaymentRoutes = router;
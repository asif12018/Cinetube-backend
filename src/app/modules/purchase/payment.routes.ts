import express from "express";
import { PaymentController } from "./purchase.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "@prisma/client";


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

// Add this below your other routes (but make sure it uses express.json!)
router.post(
    "/customer-portal", 
    express.json(), 
    checkAuth(Role.USER), 
    PaymentController.createCustomerPortal
);


router.get("/getPurchase/:id", checkAuth(Role.ADMIN,Role.SUPER_ADMIN, Role.USER), PaymentController.getPurchaseInfo);
router.get("/getSubscription", checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER), PaymentController.getSubscriptionInfo);


export const PaymentRoutes = router;
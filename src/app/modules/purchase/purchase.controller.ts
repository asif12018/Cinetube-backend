import { Request, Response } from "express";
import Stripe from "stripe";
import { PaymentService } from "./purchase.service";
import { catchAsync } from "../../shared/catchAsync";
import config from "../../config";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { stripe } from "../../config/stripe.config";


// Initialize Stripe (Make sure you add STRIPE_SECRET_KEY to your .env file)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//     apiVersion: "2023-10-16", // Use your current Stripe API version
// });

// const handleStripeWebhookEvent = async (req: Request, res: Response) => {
//     const signature = req.headers["stripe-signature"] as string;
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string; // Get this from your Stripe Dashboard

//     let event: Stripe.Event;

//     try {
//         // 1. Verify the signature using the RAW body
//         // Note: req.body MUST be a Buffer here, not a JSON object!
//         event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
//     } catch (err: any) {
//         console.error("⚠️ Webhook signature verification failed.", err.message);
//         // If verification fails, return a 400 error immediately
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // 2. If verified, pass the event to the Service we just wrote
//     try {
//         const result = await PaymentService.handleStripeWebhookEvent(event);
        
//         // 3. Always return a 200 OK quickly so Stripe knows you received it
//         res.status(200).json(result);
//     } catch (error) {
//         console.error("❌ Error processing webhook:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const handleStripeWebhookEvent = catchAsync(async (req : Request, res : Response) => {
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = config.STRIPE_WEBHOOK_SECRET;

    if(!signature || !webhookSecret){
        console.error("Missing Stripe signature or webhook secret");
        return res.status(status.BAD_REQUEST).json({message : "Missing Stripe signature or webhook secret"})
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error : any) {
        console.error("Error processing Stripe webhook:", error);
        return res.status(status.BAD_REQUEST).json({message : "Error processing Stripe webhook"})
    }

    try {
        const result = await PaymentService.handleStripeWebhookEvent(event);

        sendResponse(res, {
            httpStatusCode : status.OK,
            success : true,
            message : "Stripe webhook event processed successfully",
            data : result
        })
    } catch (error) {
        console.error("Error handling Stripe webhook event:", error);
        sendResponse(res, {
            httpStatusCode : status.INTERNAL_SERVER_ERROR,
            success : false,
            message : "Error handling Stripe webhook event"
        })
    }
})



const createCheckout = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.userId;
    const { mediaId, type } = req.body; // e.g., { "mediaId": "123...", "type": "RENTAL" }

    const result = await PaymentService.createCheckoutSession(userId, mediaId, type);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result
    });
});

const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(status.UNAUTHORIZED).json({ message: "Not authenticated" });
    }

    const result = await PaymentService.cancelSubscription(userId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription successfully set to cancel at the end of the billing period.",
        data: result
    });
});


export const PaymentController = {
    handleStripeWebhookEvent,
    createCheckout,
    cancelSubscription
};
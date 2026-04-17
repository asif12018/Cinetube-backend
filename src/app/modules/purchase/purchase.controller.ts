import { Request, Response } from "express";
import Stripe from "stripe";
import { PaymentService } from "./purchase.service";
import { catchAsync } from "../../shared/catchAsync";
import config from "../../config";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { stripe } from "../../config/stripe.config";




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


const createCustomerPortal = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(status.UNAUTHORIZED).json({ message: "Not authenticated" });
    }

    const result = await PaymentService.createCustomerPortal(userId);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Customer portal session created successfully",
        data: result
    });
});



const getPurchaseInfo = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const mediaId = req.params.id;
    const result = await PaymentService.getPurchaseInfo(user.userId, mediaId as string);

    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Purchase data retrieved successful",
        success: true,
        data: result
    })
})


const getSubscriptionInfo = catchAsync(async(req:Request, res:Response)=>{
    const user = req.user;
    const result = await PaymentService.getSubscriptionInfo(user.userId);

    sendResponse(res,{
        httpStatusCode: status.OK,
        message:"Subscription data retrieved successful",
        success: true,
        data: result
    })
})



export const PaymentController = {
    handleStripeWebhookEvent,
    createCheckout,
    cancelSubscription,
    createCustomerPortal,
    getPurchaseInfo,
    getSubscriptionInfo
};
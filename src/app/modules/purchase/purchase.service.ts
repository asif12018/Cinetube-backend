import Stripe from "stripe";
import { prisma } from "../../lib/prisma"; 
// ✅ FIX 3: Imported all the necessary Enums from your Prisma client
import { PaymentStatus, SubscriptionStatus, PurchaseType } from "../../../../generated/prisma"; 
import { stripe } from "../../config/stripe.config";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        // case "checkout.session.completed": {
        //     const session = event.data.object as Stripe.Checkout.Session;
            
        //     const transactionType = session.metadata?.transactionType; 
        //     const dbId = session.metadata?.dbId; 

        //     if (!transactionType || !dbId) {
        //         console.error("⚠️ Missing metadata in webhook event");
        //         return { message: "Missing metadata" };
        //     }

        //     if (session.payment_status === "paid") {
        //         await prisma.$transaction(async (tx) => {
        //             // FLOW A: RENTALS & PURCHASES
        //             if (transactionType === "PURCHASE") {
        //                 const purchase = await tx.purchase.findUnique({ where: { id: dbId } });
                        
        //                 if (!purchase) {
        //                     console.error(`⚠️ Purchase ${dbId} not found.`);
        //                     return;
        //                 }

        //                 let accessExpiresAt = null;
        //                 // ✅ FIX 4: Use the strict Enum for PurchaseType
        //                 if (purchase.type === PurchaseType.RENTAL) {
        //                     accessExpiresAt = new Date();
        //                     accessExpiresAt.setHours(accessExpiresAt.getHours() + 48);
        //                 }

        //                 await tx.purchase.update({
        //                     where: { id: dbId },
        //                     data: {
        //                         // ✅ FIX 1: Changed "PAID" to PaymentStatus.COMPLETED
        //                         paymentStatus: PaymentStatus.COMPLETED, 
        //                         providerTxnId: session.payment_intent as string,
        //                         accessExpiresAt: accessExpiresAt,
        //                         providerPayload: JSON.parse(JSON.stringify(session)),
        //                     }
        //                 });

        //                 console.log(`✅ Movie ${purchase.type} payment processed for ID: ${dbId}`);
        //             } 
                    
        //             // FLOW B: INITIAL SUBSCRIPTION CREATION
        //             else if (transactionType === "SUBSCRIPTION") {
        //                 const stripeSubId = session.subscription as string;

        //                 await tx.subscription.update({
        //                     where: { id: dbId },
        //                     data: {
        //                         // ✅ FIX 5: Use the strict Enum for ACTIVE
        //                         status: SubscriptionStatus.ACTIVE, 
        //                         providerSubId: stripeSubId,
        //                     }
        //                 });

        //                 console.log(`✅ Subscription created for ID: ${dbId}`);
        //             }
        //         });
        //     }
        //     break;
        // }

        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionType = session.metadata?.transactionType; 
            const dbId = session.metadata?.dbId; 

            if (!transactionType || !dbId) return { message: "Missing metadata" };

            if (session.payment_status === "paid") {
                // 🚨 FIX: Removed the prisma.$transaction wrapper entirely
                
                if (transactionType === "PURCHASE") {
                    // Use normal prisma instead of tx
                    const purchase = await prisma.purchase.findUnique({ where: { id: dbId } });
                    if (!purchase) return { message: "Purchase not found" };

                    let accessExpiresAt = null;
                    if (purchase.type === PurchaseType.RENTAL) {
                        accessExpiresAt = new Date();
                        accessExpiresAt.setHours(accessExpiresAt.getHours() + 48);
                    }

                    await prisma.purchase.update({
                        where: { id: dbId },
                        data: {
                            paymentStatus: PaymentStatus.COMPLETED, 
                            providerTxnId: session.payment_intent as string,
                            accessExpiresAt: accessExpiresAt,
                            providerPayload: JSON.parse(JSON.stringify(session)),
                        }
                    });
                } 
                else if (transactionType === "SUBSCRIPTION") {
                    // Use normal prisma instead of tx
                    await prisma.subscription.update({
                        where: { id: dbId },
                        data: {
                            status: SubscriptionStatus.ACTIVE, 
                            providerSubId: session.subscription as string,
                        }
                    });
                }
            }
            break;
        }

        case "invoice.payment_succeeded": {
            const invoice = event.data.object as any;
            
            if (invoice.subscription) {
                const stripeSubId = invoice.subscription as string;

                const periodStart = new Date(invoice.lines.data[0].period.start * 1000);
                const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);

                await prisma.subscription.updateMany({
                    where: { providerSubId: stripeSubId },
                    data: {
                        // ✅ FIX 5: Use the strict Enum for ACTIVE
                        status: SubscriptionStatus.ACTIVE, 
                        currentPeriodStart: periodStart,
                        currentPeriodEnd: periodEnd,
                        cancelAtPeriodEnd: false, 
                    }
                });

                console.log(`✅ Subscription ${stripeSubId} renewed until ${periodEnd.toDateString()}`);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const stripeSubId = subscription.id;

            await prisma.subscription.updateMany({
                where: { providerSubId: stripeSubId },
                data: {
                    // ✅ FIX 2: Fixed the spelling to match your CANCELLED enum
                    status: SubscriptionStatus.CANCELLED, 
                    cancelAtPeriodEnd: false
                }
            });

            console.log(`❌ Subscription ${stripeSubId} has been canceled.`);
            break;
        }

        case "checkout.session.expired":
        case "payment_intent.payment_failed": {
            // ✅ FIX 6: Cast to 'any' so TypeScript allows us to read the ID
            const failedSession = event.data.object as any;
            console.log(`⚠️ Payment failed/expired: ${failedSession.id}`);
            break;
        }

        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return { message: `Webhook Event ${event.id} processed successfully` };
};

const createCheckoutSession = async (userId: string, mediaId: string, type: "RENTAL" | "SUBSCRIPTION") => {
    // 1. Get the movie/subscription details from your DB
    // (I am hardcoding prices here for the example, but you would pull this from your DB)
    let price = 0;
    let name = "";
    let mode: "payment" | "subscription" = "payment";
    let dbRecordId = "";

    if (type === "RENTAL") {
        const movie = await prisma.media.findUniqueOrThrow({ where: { id: mediaId } });
        price = 300; // Stripe uses cents! 300 = $3.00
        name = `Rent: ${movie.title}`;
        mode = "payment"; // One-time payment
        
        // Create the pending purchase in YOUR database first
        const purchase = await prisma.purchase.create({
            data: { userId, mediaId, type: "RENTAL", amount: 3.00 }
        });
        dbRecordId = purchase.id;

    } else if (type === "SUBSCRIPTION") {
        price = 1500; // 1500 = $15.00/month
        name = "Premium Monthly Subscription";
        mode = "subscription"; // Recurring payment
        
        // Create the pending subscription in YOUR database
        const sub = await prisma.subscription.create({
            data: { userId, currentPeriodStart: new Date(), currentPeriodEnd: new Date() }
        });
        dbRecordId = sub.id;
    }

    // 2. Ask Stripe to generate the checkout page
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: mode,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: name },
                    // For subscriptions, you need recurring details
                    ...(mode === "subscription" && { recurring: { interval: "month" } }),
                    unit_amount: price,
                },
                quantity: 1,
            },
        ],
        // 🚨 CRITICAL: This is how your Webhook knows what to update later!
        metadata: {
            transactionType: type === "RENTAL" ? "PURCHASE" : "SUBSCRIPTION",
            dbId: dbRecordId,
        },
        // Where Stripe sends the user after they pay (Update these for your frontend!)
        success_url: "http://localhost:3000/payment-success",
        cancel_url: "http://localhost:3000/payment-cancelled",
    });

    // 3. Return the URL to the controller
    return { checkoutUrl: session.url };
};

// payment.service.ts

const cancelSubscription = async (userId: string) => {
    // 1. Find the active subscription in your database
    const subscription = await prisma.subscription.findUnique({
        where: { userId: userId }
    });

    if (!subscription) {
        throw new Error("No subscription found for this user.");
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE || !subscription.providerSubId) {
        throw new Error("Subscription is not active or cannot be canceled.");
    }

    // 2. Tell Stripe to cancel it AT THE END OF THE BILLING PERIOD
    const updatedStripeSub = await stripe.subscriptions.update(
        subscription.providerSubId,
        { cancel_at_period_end: true }
    );

    // 3. Update your database so the frontend knows they canceled
    const updatedDbSub = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            cancelAtPeriodEnd: true
        }
    });

    return updatedDbSub;
};

// Make sure to export it at the bottom!


export const PaymentService = {
    handleStripeWebhookEvent,
    createCheckoutSession,
    cancelSubscription
};
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../config/stripe.config";
import config from "../../config";
import {
  PaymentStatus,
  SubscriptionStatus,
  PurchaseType,
} from "@prisma/client";
import AppError from "../../../errorHelpers/AppError";
import status from "http-status";

// const handleStripeWebhookEvent = async (event: Stripe.Event) => {
//   switch (event.type) {
//     case "checkout.session.completed": {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const transactionType = session.metadata?.transactionType;
//       const dbId = session.metadata?.dbId;

//       if (!transactionType || !dbId) {
//         console.error("⚠️ Missing metadata in webhook event");
//         return { message: "Missing metadata" };
//       }

//       if (session.payment_status === "paid") {
//         if (transactionType === "PURCHASE") {
//           const purchase = await prisma.purchase.findUnique({
//             where: { id: dbId },
//           });
//           if (!purchase) return { message: "Purchase not found" };
//           let accessTimeStartedAt = null;
//           let accessExpiresAt = null;
//           if (purchase.type === PurchaseType.RENTAL) {
//             accessTimeStartedAt = new Date(); // 🟢 Set start time to NOW
//             accessExpiresAt = new Date();
//             accessExpiresAt.setHours(accessExpiresAt.getHours() + 48);
//           }

//           await prisma.purchase.update({
//             where: { id: dbId },
//             data: {
//               paymentStatus: PaymentStatus.COMPLETED,
//               providerTxnId: session.payment_intent as string,
//               accessExpiresAt: accessExpiresAt,
//               accessTimeStartedAt: accessTimeStartedAt,
//               providerPayload: JSON.parse(JSON.stringify(session)),
//             },
//           });
//           console.log(`✅ Movie ${purchase.type} payment processed for ID: ${dbId}`);
          
//         } else if (transactionType === "SUBSCRIPTION") {
//           await prisma.subscription.update({
//             where: { id: dbId },
//             data: {
//               status: SubscriptionStatus.ACTIVE,
//               providerSubId: session.subscription as string,
//               stripeCustomerId: session.customer as string,
//             },
//           });
//           console.log(`✅ Subscription created for ID: ${dbId}`);
//         }
//       }
//       break;
//     }

//     case "invoice.payment_succeeded": {
//       const invoice = event.data.object as any;

//       if (invoice.subscription) {
//         const stripeSubId = invoice.subscription as string;
//         const periodStart = new Date(invoice.lines.data[0].period.start * 1000);
//         const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);

//         await prisma.subscription.updateMany({
//           where: { providerSubId: stripeSubId },
//           data: {
//             status: SubscriptionStatus.ACTIVE,
//             currentPeriodStart: periodStart,
//             currentPeriodEnd: periodEnd,
//             cancelAtPeriodEnd: false,
//           },
//         });

//         console.log(`✅ Subscription ${stripeSubId} renewed until ${periodEnd.toDateString()}`);
//       }
//       break;
//     }

//     // 🚨 THIS IS THE CASE THAT FIXES YOUR 'FALSE' DATABASE ISSUE!
//     // case "customer.subscription.updated": {
//     //   const subscription = event.data.object as Stripe.Subscription;
      
//     //   await prisma.subscription.updateMany({
//     //     where: { providerSubId: subscription.id },
//     //     data: {
//     //       cancelAtPeriodEnd: subscription.cancel_at_period_end,
//     //     },
//     //   });
//     //   console.log(`ℹ️ Subscription ${subscription.id} updated. Cancel at end: ${subscription.cancel_at_period_end}`);
//     //   break;
//     // }
//     case "customer.subscription.updated": {
//       const subscription = event.data.object as Stripe.Subscription;
      
//       const result = await prisma.subscription.updateMany({
//         where: { providerSubId: subscription.id },
//         data: {
//           cancelAtPeriodEnd: subscription.cancel_at_period_end,
//         },
//       });

//       // 🔍 NEW DEBUGGING LOGS:
//       console.log(`ℹ️ Stripe sent Cancel Status: ${subscription.cancel_at_period_end}`);
//       console.log(`🔍 Database rows updated: ${result.count}`);
      
//       if (result.count === 0) {
//           console.log(`⚠️ URGENT WARNING: We received the webhook, but could not find a row in the database with providerSubId: ${subscription.id}`);
//       }
//       break;
//     }

//     case "customer.subscription.deleted": {
//       const subscription = event.data.object as Stripe.Subscription;
//       const stripeSubId = subscription.id;

//       await prisma.subscription.updateMany({
//         where: { providerSubId: stripeSubId },
//         data: {
//           status: SubscriptionStatus.CANCELLED,
//           cancelAtPeriodEnd: false,
//         },
//       });

//       console.log(`❌ Subscription ${stripeSubId} has been permanently canceled.`);
//       break;
//     }

//     case "checkout.session.expired":
//     case "payment_intent.payment_failed": {
//       const failedSession = event.data.object as any;
//       console.log(`⚠️ Payment failed/expired: ${failedSession.id}`);
//       break;
//     }

//     default:
//       // You can comment this log out if you don't want to see the 
//       // safe 'unhandled' messages in your terminal!
//       console.log(`ℹ️ Unhandled event type: ${event.type}`);
//   }

//   return { message: `Webhook Event ${event.id} processed successfully` };
// };

// const createCheckoutSession = async (userId: string, mediaId: string, type: "RENTAL" | "SUBSCRIPTION" | "ONE_TIME_BUY") => {
//   let price = 0;
//   let name = "";
//   let mode: "payment" | "subscription" = "payment";
//   let dbRecordId = "";

//   if (type === "RENTAL") {
//     const movie = await prisma.media.findUniqueOrThrow({
//       where: { id: mediaId },
//     });
//     price = 300; // $3.00
//     name = `Rent: ${movie.title}`;
//     mode = "payment";

//     const purchase = await prisma.purchase.create({
//       data: { userId, mediaId, type: PurchaseType.RENTAL, amount: 3.0 },
//     });
//     dbRecordId = purchase.id;
    
//   } else if (type === "SUBSCRIPTION") {
//     price = 1500; // $15.00/month
//     name = "Premium Monthly Subscription";
//     mode = "subscription";

//     const sub = await prisma.subscription.create({
//       data: {
//         userId,
//         currentPeriodStart: new Date(),
//         currentPeriodEnd: new Date(),
//       },
//     });
//     dbRecordId = sub.id;
//   }

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     mode: mode,
//     line_items: [
//       {
//         price_data: {
//           currency: "usd",
//           product_data: { name: name },
//           ...(mode === "subscription" && { recurring: { interval: "month" } }),
//           unit_amount: price,
//         },
//         quantity: 1,
//       },
//     ],
//     metadata: {
//       transactionType: type === "RENTAL" ? "PURCHASE" : "SUBSCRIPTION",
//       dbId: dbRecordId,
//     },
//     success_url: `${config.FRONTEND_URL}/payment-success`,
//     cancel_url: `${config.FRONTEND_URL}/payment-cancelled`,
//   });

//   return { checkoutUrl: session.url };
// };

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const transactionType = session.metadata?.transactionType;
      const dbId = session.metadata?.dbId;

      if (!transactionType || !dbId) return { message: "Missing metadata" };

      if (session.payment_status === "paid") {
        if (transactionType === "PURCHASE") {
          const purchase = await prisma.purchase.findUnique({ where: { id: dbId } });
          if (!purchase) return { message: "Purchase not found" };

          let accessTimeStartedAt = null;
          let accessExpiresAt = null;

          // 🟢 Dynamic Access Logic
          if (purchase.type === PurchaseType.RENTAL) {
            accessTimeStartedAt = new Date();
            accessExpiresAt = new Date();
            accessExpiresAt.setHours(accessExpiresAt.getHours() + 48);
          } else if (purchase.type === PurchaseType.ONE_TIME_BUY) {
            accessTimeStartedAt = new Date();
            accessExpiresAt = null; // Permanent access
          }

          await prisma.purchase.update({
            where: { id: dbId },
            data: {
              paymentStatus: PaymentStatus.COMPLETED,
              providerTxnId: session.payment_intent as string,
              accessTimeStartedAt,
              accessExpiresAt,
              providerPayload: JSON.parse(JSON.stringify(session)),
            },
          });
        } else if (transactionType === "SUBSCRIPTION") {
          await prisma.subscription.update({
            where: { id: dbId },
            data: {
              status: SubscriptionStatus.ACTIVE,
              providerSubId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { providerSubId: subscription.id },
        data: { cancelAtPeriodEnd: subscription.cancel_at_period_end },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { providerSubId: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED, cancelAtPeriodEnd: false },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;

      if (invoice.subscription) {
        const stripeSubId = invoice.subscription as string;

        // 🟢 Convert Stripe's Unix timestamps (seconds) to JS Dates (milliseconds)
        const periodStart = new Date(invoice.lines.data[0].period.start * 1000);
        const periodEnd = new Date(invoice.lines.data[0].period.end * 1000);

        await prisma.subscription.updateMany({
          where: { providerSubId: stripeSubId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: periodStart, // 🟢 Now this will be Today
            currentPeriodEnd: periodEnd,     // 🟢 Now this will be 1 month from Today
            cancelAtPeriodEnd: false,
          },
        });

        console.log(`✅ Subscription ${stripeSubId} updated with correct dates.`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
  return { message: "Success" };
};

const createCheckoutSession = async (
  userId: string, 
  mediaId: string, 
  type: "RENTAL" | "SUBSCRIPTION" | "ONE_TIME_BUY"
) => {
  let unitAmount = 0;
  let name = "";
  let mode: "payment" | "subscription" = "payment";
  let dbRecordId = "";

  // 🟢 DYNAMIC PRICE FETCHING
  if (type === "RENTAL" || type === "ONE_TIME_BUY") {
    const movie = await prisma.media.findUniqueOrThrow({ where: { id: mediaId } });
    
    // logic: If movie has 'rentalPrice' and 'buyPrice' columns, use them. 
    // Otherwise, use a default field like 'price'.
    // @ts-ignore (Adjust field names based on your actual Media model)
    const rawPrice = type === "RENTAL" ? (movie.rentalPrice || 3) : (movie.buyPrice || 15);
    
    unitAmount = Math.round(rawPrice * 100); // Stripe needs cents
    name = `${type === "RENTAL" ? "Rent" : "Buy"}: ${movie.title}`;
    mode = "payment";

    const purchase = await prisma.purchase.create({
      data: { 
        userId, 
        mediaId, 
        type: type === "RENTAL" ? PurchaseType.RENTAL : PurchaseType.ONE_TIME_BUY, 
        amount: rawPrice 
      },
    });
    dbRecordId = purchase.id;

  } else if (type === "SUBSCRIPTION") {
    unitAmount = 7500; // $75.00 fixed
    name = "Premium Monthly Subscription";
    mode = "subscription";

    const sub = await prisma.subscription.upsert({
      where: { userId },
      update: { status: SubscriptionStatus.PENDING },
      create: { userId, currentPeriodStart: new Date(), currentPeriodEnd: new Date() },
    });
    dbRecordId = sub.id;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: mode,
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { name },
        ...(mode === "subscription" && { recurring: { interval: "month" } }),
        unit_amount: unitAmount,
      },
      quantity: 1,
    }],
    metadata: {
      transactionType: type === "SUBSCRIPTION" ? "SUBSCRIPTION" : "PURCHASE",
      dbId: dbRecordId,
    },
    success_url: `${config.FRONTEND_URL}/payment-success`,
    cancel_url: `${config.FRONTEND_URL}/payment-cancelled`,
  });

  return { checkoutUrl: session.url };
};
const cancelSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId: userId },
  });

  if (!subscription) {
    throw new Error("No subscription found for this user.");
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE || !subscription.providerSubId) {
    throw new Error("Subscription is not active or cannot be canceled.");
  }

  await stripe.subscriptions.update(
    subscription.providerSubId,
    { cancel_at_period_end: true },
  );

  const updatedDbSub = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
    },
  });

  return updatedDbSub;
};

const createCustomerPortal = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({ 
    where: { userId } 
  });
  
  if (!subscription || !subscription.stripeCustomerId) {
    throw new Error("No active Stripe customer found for this user.");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${config.FRONTEND_URL}/settings`, 
  });

  return { portalUrl: portalSession.url };
};

//get purchase by id

const getPurchaseInfo = async (userId: string, mediaId: string) => {
  // Check if a completed purchase exists for this user and media
  const purchase = await prisma.purchase.findFirst({
    where: {
      userId: userId,
      mediaId: mediaId,
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });

  if (!purchase) {
    throw new AppError(status.NOT_FOUND, "No valid completed purchase found for this media.");
  }

  // If the purchase is a rental, we must check the expiration date
  if (purchase.type === PurchaseType.RENTAL) {
    const now = new Date();
    
    // If access hasn't been started/set, or if the current date is past the expiration date
    if (!purchase.accessExpiresAt || purchase.accessExpiresAt < now) {
      throw new AppError(status.FORBIDDEN, "Your rental period for this media has expired.");
    }
  }

  // If it's a ONE_TIME_BUY, or a valid RENTAL, they have access
  return true; // Or return the 'purchase' object if you need its data later
};


const getSubscriptionInfo = async (userId: string) => {
  // Since userId is @unique in the Subscription model, use findUnique for better performance
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!subscription) {
    throw new AppError(status.NOT_FOUND, "User is not subscribed.");
  }

  const now = new Date();

  // Check if the subscription status is ACTIVE
  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new AppError(status.FORBIDDEN, `Subscription is not active. Current status: ${subscription.status}`);
  }

  // Ensure the user's billing period hasn't ended. 
  // This honors the `cancelAtPeriodEnd` logic: if they canceled but the period end is in the future, they still get access.
  if (subscription.currentPeriodEnd < now) {
    throw new AppError(status.FORBIDDEN, "Subscription access period has expired.");
  }

  return true; // Or return the 'subscription' object
};

export const PaymentService = {
  handleStripeWebhookEvent,
  createCheckoutSession,
  cancelSubscription,
  createCustomerPortal,
  getSubscriptionInfo,
  getPurchaseInfo
};
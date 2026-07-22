import { Webhook } from "svix";
import User from "../models/user.js";
import Stripe from "stripe";
import Purchase from "../models/purchase.js";
import Course from "../models/course.js";

// API controller fn to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    console.log("Webhook received");
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        await whook.verify(JSON.stringify(req.body), {
            'svix-id': req.headers['svix-id'],
            'svix-timestamp': req.headers['svix-timestamp'],
            'svix-signature': req.headers['svix-signature']
        });

        const { data, type } = req.body;
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url || '',
                    imageURL: data.image_url || '',
                };
                await User.create(userData);
                res.json({});
                break;
            }
            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url || '',
                    imageURL: data.image_url || ''
                };
                await User.findByIdAndUpdate(data.id, userData);
                res.json({});
                break;
            }
            case 'user.deleted':
                await User.findByIdAndDelete(data.id);
                res.json({});
                break;
            default:
                break;
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Stripe Webhooks controller function to manage payment status
export const stripeWebhooks = async (req, res) => {
    console.log("========== STRIPE WEBHOOK HIT ==========");
    console.log("DEPLOY:", process.env.VERCEL_DEPLOYMENT_ID);
    console.log("STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);
    console.log("Project:", process.env.VERCEL_PROJECT_NAME);
    console.log("Deployment:", process.env.VERCEL_DEPLOYMENT_ID);
    console.log("Environment:", process.env.VERCEL_ENV);

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Stripe Webhook Verification Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("Event:", event.type);

    // Helper to process completed purchase safely
    const processCompletedPurchase = async (purchaseId) => {
        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
            const actualUserId = purchaseData.userId || purchaseData.userID;
            const actualCourseId = purchaseData.courseId || purchaseData.courseID;

            await Course.findByIdAndUpdate(actualCourseId, {
                $addToSet: { enrolledStudents: actualUserId }
            });

            await User.findByIdAndUpdate(actualUserId, {
                $addToSet: { enrolledCourses: actualCourseId }
            });

            purchaseData.status = 'completed';
            await purchaseData.save();
            console.log(`Purchase ${purchaseId} successfully completed!`);
        }
    };

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const { purchaseId } = session.metadata || {};
            if (purchaseId) {
                await processCompletedPurchase(purchaseId);
            }
            break;
        }

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });

            if (session && session.data.length > 0) {
                const { purchaseId } = session.data[0].metadata || {};
                if (purchaseId) {
                    await processCompletedPurchase(purchaseId);
                }
            }

            break;
        }

        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });

            if (session && session.data.length > 0) {
                const { purchaseId } = session.data[0].metadata || {};
                if (purchaseId) {
                    await Purchase.findByIdAndUpdate(purchaseId, { status: 'failed' });
                }
            }

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

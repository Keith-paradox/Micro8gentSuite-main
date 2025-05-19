import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { 
  createPaymentIntent, 
  createCheckoutSession,
  createSubscriptionCheckout,
  createCustomer,
  createSubscription,
  retrievePaymentIntent,
  retrieveSubscription,
  cancelSubscription
} from "../services/stripe";

// Schema for creating a payment intent
const paymentIntentSchema = z.object({
  amount: z.number().min(1), // amount in cents
  currency: z.string().default("usd"),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

// Schema for creating a checkout session
const checkoutSessionSchema = z.object({
  amount: z.number().min(1), // amount in cents
  currency: z.string().default("usd"),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()).optional(),
});

// Schema for creating a subscription checkout
const subscriptionCheckoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string()).optional(),
});

/**
 * Create a payment intent
 * @route POST /api/payments/create-intent
 */
export const createIntent = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate request body
    const validationResult = paymentIntentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validationResult.error.errors 
      });
    }

    const { amount, currency, description, metadata } = validationResult.data;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      description || `Payment for user ${req.user.id}`,
      {
        userId: req.user.id.toString(),
        ...metadata,
      }
    );

    // Return client secret
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ 
      message: "Error creating payment intent", 
      error: error.message 
    });
  }
};

/**
 * Create a checkout session for a one-time payment
 * @route POST /api/payments/create-checkout
 */
export const createCheckout = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate request body
    const validationResult = checkoutSessionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validationResult.error.errors 
      });
    }

    const { amount, currency, successUrl, cancelUrl, metadata } = validationResult.data;

    // Create checkout session
    const session = await createCheckoutSession(
      amount,
      currency,
      successUrl,
      cancelUrl,
      {
        userId: req.user.id.toString(),
        ...metadata,
      }
    );

    // Return session ID and URL
    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ 
      message: "Error creating checkout session", 
      error: error.message 
    });
  }
};

/**
 * Create a checkout session for a subscription
 * @route POST /api/payments/create-subscription-checkout
 */
export const createSubscriptionCheckoutSession = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate request body
    const validationResult = subscriptionCheckoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: validationResult.error.errors 
      });
    }

    const { priceId, successUrl, cancelUrl, metadata } = validationResult.data;

    // Create subscription checkout session
    const session = await createSubscriptionCheckout(
      priceId,
      successUrl,
      cancelUrl,
      {
        userId: req.user.id.toString(),
        ...metadata,
      }
    );

    // Return session ID and URL
    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating subscription checkout session:", error);
    res.status(500).json({ 
      message: "Error creating subscription checkout session", 
      error: error.message 
    });
  }
};

/**
 * Handle webhook events from Stripe
 * @route POST /api/payments/webhook
 */
export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ message: "Stripe webhook secret not configured" });
    }

    // Verify webhook signature
    let event;
    try {
      const stripeModule = await import('stripe');
      const Stripe = stripeModule.default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent was successful: ${paymentIntent.id}`);
        
        // Update user's subscription status if applicable
        if (paymentIntent.metadata.userId && paymentIntent.metadata.subscriptionId) {
          const userId = parseInt(paymentIntent.metadata.userId);
          const subscriptionId = paymentIntent.metadata.subscriptionId;
          
          try {
            const subscription = await retrieveSubscription(subscriptionId);
            
            // Get existing subscription from database
            const existingSubscription = await storage.getSubscriptionByUserId(userId);
            
            if (existingSubscription) {
              // Update existing subscription
              await storage.updateSubscription(existingSubscription.id, {
                status: subscription.cancel_at_period_end ? 'active-canceling' : 'active',
                stripeSubscriptionId: subscriptionId,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              });
            } else {
              // Create new subscription in database
              await storage.createSubscription({
                userId,
                plan: subscription.items.data[0].price.nickname || 'default',
                status: subscription.cancel_at_period_end ? 'active-canceling' : 'active',
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: subscription.customer as string,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              });
            }
          } catch (error) {
            console.error(`Error updating subscription for user ${userId}:`, error);
          }
        }
        break;
        
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        console.log(`Payment failed: ${failedPaymentIntent.id}`);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log(`Subscription ${event.type}: ${subscription.id}`);
        
        // Update subscription in database if userId is in metadata
        if (subscription.metadata.userId) {
          const userId = parseInt(subscription.metadata.userId);
          
          try {
            // Get existing subscription from database
            const existingSubscription = await storage.getSubscriptionByUserId(userId);
            
            if (existingSubscription) {
              // Update existing subscription
              await storage.updateSubscription(existingSubscription.id, {
                // Combine status with cancellation information
                status: subscription.cancel_at_period_end ? `${subscription.status}-canceling` : subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              });
            } else if (subscription.status === 'active') {
              // Create new subscription in database
              await storage.createSubscription({
                userId,
                plan: 'basic', // Use a safe default here
                status: subscription.cancel_at_period_end ? `${subscription.status}-canceling` : subscription.status,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              });
            }
          } catch (error) {
            console.error(`Error updating subscription for user ${subscription.metadata.userId}:`, error);
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log(`Subscription deleted: ${deletedSubscription.id}`);
        
        // Update subscription status to 'canceled' in database
        try {
          // Find subscription by Stripe subscription ID
          const existingSubscription = await storage.getSubscriptionByStripeId(deletedSubscription.id);
          
          if (existingSubscription) {
            // Update existing subscription
            await storage.updateSubscription(existingSubscription.id, {
              status: 'canceled',
            });
          }
        } catch (error) {
          console.error(`Error updating deleted subscription ${deletedSubscription.id}:`, error);
        }
        break;
        
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);
        
        // Handle subscription checkout completion
        if (session.mode === 'subscription' && session.subscription) {
          try {
            // Get the subscription details
            const subscription = await retrieveSubscription(session.subscription as string);
            
            // Check if userId is in metadata
            if (session.metadata?.userId) {
              const userId = parseInt(session.metadata.userId);
              
              // Get existing subscription from database
              const existingSubscription = await storage.getSubscriptionByUserId(userId);
              
              if (existingSubscription) {
                // Update existing subscription
                await storage.updateSubscription(existingSubscription.id, {
                  status: subscription.cancel_at_period_end ? 'active-canceling' : 'active',
                  stripeSubscriptionId: subscription.id,
                  stripeCustomerId: subscription.customer as string,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                });
              } else {
                // Create new subscription in database
                await storage.createSubscription({
                  userId,
                  plan: subscription.items.data[0].price.nickname || 'default',
                  status: 'active',
                  stripeSubscriptionId: subscription.id,
                  stripeCustomerId: subscription.customer as string,
                  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                });
              }
            }
          } catch (error) {
            console.error(`Error processing subscription checkout ${session.id}:`, error);
          }
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error: any) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ 
      message: "Error handling webhook", 
      error: error.message 
    });
  }
};

/**
 * Get the user's current subscription
 * @route GET /api/payments/subscription
 */
export const getUserSubscription = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get subscription from database
    const subscription = await storage.getSubscriptionByUserId(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    // Return subscription details
    res.status(200).json(subscription);
  } catch (error: any) {
    console.error("Error getting user subscription:", error);
    res.status(500).json({ 
      message: "Error getting user subscription", 
      error: error.message 
    });
  }
};

/**
 * Cancel the user's subscription
 * @route POST /api/payments/cancel-subscription
 */
export const cancelUserSubscription = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get subscription from database
    const subscription = await storage.getSubscriptionByUserId(req.user.id);
    
    if (!subscription) {
      return res.status(404).json({ message: "No subscription found" });
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({ message: "No Stripe subscription ID found" });
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await cancelSubscription(subscription.stripeSubscriptionId);

    // Update subscription in database
    await storage.updateSubscription(subscription.id, {
      status: 'canceled',
      cancelAtPeriodEnd: false,
    });

    // Return success message
    res.status(200).json({ 
      message: "Subscription canceled successfully",
      subscription: canceledSubscription,
    });
  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ 
      message: "Error canceling subscription", 
      error: error.message 
    });
  }
};
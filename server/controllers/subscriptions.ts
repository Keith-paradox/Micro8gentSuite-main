import { Request, Response } from 'express';
import { storage } from '../storage';
import * as stripeService from '../services/stripe';
import { insertSubscriptionSchema } from '@shared/schema';

// Using imported stripe service directly

// Get the current user's subscription
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const subscription = await storage.getSubscriptionByUserId(req.user.id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      // Add the cancelAtPeriodEnd property for client compatibility
      // Use status to infer cancellation state
      const enhancedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: subscription.status === 'active-canceling'
      };
      
      return res.json(enhancedSubscription);
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      
      // For now, return a default "free" plan if there's an error
      return res.status(404).json({ 
        message: 'No subscription found',
        subscription: null
      });
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new subscription
export const createSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Validate the request body
    const parseResult = insertSubscriptionSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: parseResult.error.format() });
    }
    
    const subscriptionData = parseResult.data;
    
    // Check if the user already has a subscription
    const existingSubscription = await storage.getSubscriptionByUserId(req.user.id);
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has a subscription' });
    }
    
    // Create the subscription in the database
    const subscription = await storage.createSubscription({
      ...subscriptionData,
      userId: req.user.id
    });
    
    return res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an existing subscription
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const subscriptionId = parseInt(id);
    
    if (isNaN(subscriptionId)) {
      return res.status(400).json({ message: 'Invalid subscription ID' });
    }
    
    // Get the current subscription
    const existingSubscription = await storage.getSubscriptionByUserId(req.user.id);
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if the subscription belongs to the user
    if (existingSubscription.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Update the subscription in the database
    const updatedSubscription = await storage.updateSubscription(subscriptionId, req.body);
    
    return res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a checkout session for subscription payment
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { plan, billingCycle } = req.body as {
      plan?: string;
      billingCycle?: string;
    };
    
    if (!plan || !billingCycle) {
      return res.status(400).json({ message: 'Missing required fields: plan, billingCycle' });
    }
    
    // Validate the plan
    if (!['basic', 'premium', 'enterprise'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan. Must be one of: basic, premium, enterprise' });
    }
    
    // Validate the billing cycle
    if (!['monthly', 'annually'].includes(billingCycle)) {
      return res.status(400).json({ message: 'Invalid billing cycle. Must be one of: monthly, annually' });
    }
    
    // Define plan and billing cycle as specific types
    const validatedPlan = plan as 'basic' | 'premium' | 'enterprise';
    const validatedBillingCycle = billingCycle as 'monthly' | 'annually';
    
    // Map plan and billing cycle to a price ID
    const priceMappings: Record<string, Record<string, string | undefined>> = {
      basic: {
        monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
        annually: process.env.STRIPE_BASIC_ANNUAL_PRICE_ID,
      },
      premium: {
        monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        annually: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
        annually: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
      },
    };
    
    // Get the price ID based on the plan and billing cycle
    const priceId = priceMappings[validatedPlan]?.[validatedBillingCycle];
    
    // If the price ID is not defined, use a test price ID
    const finalPriceId = priceId || 'price_1234567890'; // This will be replaced with actual price IDs in production
    
    // Success and cancel URLs
    const successUrl = `${req.headers.origin}/subscription?success=true&plan=${validatedPlan}&billing=${validatedBillingCycle}`;
    const cancelUrl = `${req.headers.origin}/subscription?canceled=true`;
    
    // Get or create a Stripe customer for the user
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get the user's subscription to check if they have a Stripe customer ID
    const subscription = await storage.getSubscriptionByUserId(req.user.id);
    let customerId = subscription?.stripeCustomerId;
    
    // If the user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      const customer = await stripeService.createCustomer(user.email, user.username);
      customerId = customer.id;
      
      // If the user has a subscription, update it with the Stripe customer ID
      if (subscription) {
        await storage.updateSubscription(subscription.id, {
          stripeCustomerId: customerId
        });
      }
    }
    
    // Create a checkout session
    const session = await stripeService.createSubscriptionCheckout(
      finalPriceId,
      successUrl,
      cancelUrl
    );
    
    return res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a billing portal session
export const createBillingPortalSession = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Use the request origin as the return URL
    const returnUrl = `${req.headers.origin}/subscription`;
    
    if (!returnUrl) {
      return res.status(400).json({ message: 'Could not determine return URL from request origin' });
    }
    
    // Get the user's subscription to check if they have a Stripe customer ID
    const subscription = await storage.getSubscriptionByUserId(req.user.id);
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(404).json({ message: 'No subscription or Stripe customer found' });
    }
    
    // Create a real Stripe Billing Portal session if Stripe is available
    try {
      const session = await stripeService.createBillingPortal(
        subscription.stripeCustomerId, 
        returnUrl
      );
      return res.json({ url: session.url });
    } catch (stripeError) {
      console.error("Error creating Stripe Billing Portal:", stripeError);
      
      // For development environment, provide a more informative response
      // In production, implement a settings-based fallback
      return res.json({ 
        url: returnUrl,
        message: "Stripe Billing Portal is not configured. In a production environment, you would need to set this up in your Stripe dashboard."
      });
    }
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    // Provide a fallback to the subscription page with a message
    if (req.headers.origin) {
      return res.json({
        url: `${req.headers.origin}/subscription`,
        message: "Could not process your request. Redirecting to subscription page."
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Handle Stripe webhook events
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).json({ message: 'Missing Stripe signature' });
  }
  
  try {
    // Process the event based on its type
    const event = req.body;
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(400).json({ message: 'Webhook error' });
  }
};

// Helper functions for webhook handlers
async function handleCheckoutSessionCompleted(session: any) {
  try {
    const { subscription, customer } = session;
    
    if (!subscription || !customer) {
      console.log('Checkout session completed without subscription or customer');
      return;
    }
    
    // Get subscription details from Stripe
    const stripeSubscription = await stripeService.retrieveSubscription(subscription);
    
    // Find the user by Stripe customer ID
    // This would require a way to query users by Stripe customer ID
    // For now, we'll just log the details
    console.log('Checkout session completed:', {
      customer,
      subscription,
      status: stripeSubscription.status,
      plan: stripeSubscription.items.data[0].price.product
    });
    
    // In a real implementation, you would update the user's subscription in the database
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const { id, customer, status, items } = subscription;
    
    if (!id || !customer) {
      console.log('Subscription updated without ID or customer');
      return;
    }
    
    // Find the subscription by Stripe subscription ID
    // This would require a way to query subscriptions by Stripe subscription ID
    console.log('Subscription updated:', {
      id,
      customer,
      status,
      plan: items?.data[0]?.price?.product
    });
    
    // In a real implementation, you would update the subscription in the database
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const { id, customer } = subscription;
    
    if (!id || !customer) {
      console.log('Subscription deleted without ID or customer');
      return;
    }
    
    // Find the subscription by Stripe subscription ID
    // This would require a way to query subscriptions by Stripe subscription ID
    console.log('Subscription deleted:', {
      id,
      customer
    });
    
    // In a real implementation, you would update the subscription in the database
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}
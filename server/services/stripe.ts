import Stripe from 'stripe';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a one-time payment intent for a specified amount
 * @param amount Amount in cents (e.g., 1000 for $10.00)
 * @param currency Currency code (default: 'usd')
 * @param description Description of the payment
 * @param metadata Any additional metadata to store with the payment
 * @returns Promise<Stripe.PaymentIntent>
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  description: string = '',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    description,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

/**
 * Creates a new customer in Stripe
 * @param email Customer's email
 * @param name Customer's name
 * @param metadata Any additional metadata
 * @returns Promise<Stripe.Customer>
 */
export const createCustomer = async (
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
};

/**
 * Creates a subscription for a customer
 * @param customerId Stripe customer ID
 * @param priceId Stripe price ID for the subscription
 * @param metadata Any additional metadata
 * @returns Promise<Stripe.Subscription>
 */
export const createSubscription = async (
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
  });
};

/**
 * Creates a checkout session for a one-time payment
 * @param amount Amount in cents
 * @param currency Currency code (default: 'usd')
 * @param successUrl URL to redirect after successful payment
 * @param cancelUrl URL to redirect if payment is cancelled
 * @param metadata Any additional metadata
 * @returns Promise<Stripe.Checkout.Session>
 */
export const createCheckoutSession = async (
  amount: number,
  currency: string = 'usd',
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Checkout.Session> => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: 'Micro8gents Service',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

/**
 * Creates a checkout session for a subscription
 * @param priceId Stripe price ID
 * @param successUrl URL to redirect after successful subscription
 * @param cancelUrl URL to redirect if subscription is cancelled
 * @param metadata Any additional metadata
 * @returns Promise<Stripe.Checkout.Session>
 */
export const createSubscriptionCheckout = async (
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.Checkout.Session> => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

/**
 * Retrieves a payment intent by ID
 * @param paymentIntentId Payment intent ID
 * @returns Promise<Stripe.PaymentIntent>
 */
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Retrieves a subscription by ID
 * @param subscriptionId Subscription ID
 * @returns Promise<Stripe.Subscription>
 */
export const retrieveSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Cancels a subscription
 * @param subscriptionId Subscription ID
 * @returns Promise<Stripe.Subscription>
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<Stripe.Subscription> => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

/**
 * Creates a billing portal session for a customer
 * @param customerId Stripe customer ID
 * @param returnUrl URL to redirect after customer exits the portal
 * @returns Promise<Stripe.BillingPortal.Session>
 */
export const createBillingPortal = async (
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

export default stripe;
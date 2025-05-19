import { Request, Response } from "express";
import { storage } from "../storage";
import { insertIntegrationSchema } from "@shared/schema";
import { z } from "zod";
import { TwilioService } from "../services/twilio";
import { ElevenLabsService } from "../services/eleven-labs";
import { N8nService } from "../services/n8n";
import stripe from "../services/stripe";

// Initialize services
const twilioService = new TwilioService();
const elevenLabsService = new ElevenLabsService();
const n8nService = new N8nService();
// Using stripe directly instead of a class

// Get all integrations for a business
export const getIntegrations = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get integrations
    const integrations = await storage.getIntegrationsByBusinessId(business.id);
    
    // If no integrations, return default list
    if (integrations.length === 0) {
      // Create default integrations for demo purposes
      const defaultIntegrations = [
        {
          id: 1,
          name: "Twilio",
          description: "Voice call handling",
          iconColor: "bg-blue-100",
          status: "active",
          type: "twilio"
        },
        {
          id: 2,
          name: "11 Labs",
          description: "AI voice responses",
          iconColor: "bg-purple-100",
          status: "active",
          type: "eleven_labs"
        },
        {
          id: 3,
          name: "n8n",
          description: "Workflow automation",
          iconColor: "bg-orange-100",
          status: "active",
          type: "n8n"
        },
        {
          id: 4,
          name: "Stripe",
          description: "Payment processing",
          iconColor: "bg-green-100",
          status: "active",
          type: "stripe"
        },
        {
          id: 5,
          name: "Email",
          description: "Notifications & reports",
          iconColor: "bg-blue-100",
          status: "active",
          type: "email"
        }
      ];
      
      return res.status(200).json(defaultIntegrations);
    }
    
    // Format response
    const formattedIntegrations = integrations.map(integration => {
      let iconColor = "bg-gray-100";
      let name = integration.type;
      let description = "Integration";
      
      // Set appropriate icon color and description based on type
      switch (integration.type) {
        case "twilio":
          iconColor = "bg-blue-100";
          name = "Twilio";
          description = "Voice call handling";
          break;
        case "eleven_labs":
          iconColor = "bg-purple-100";
          name = "11 Labs";
          description = "AI voice responses";
          break;
        case "n8n":
          iconColor = "bg-orange-100";
          name = "n8n";
          description = "Workflow automation";
          break;
        case "stripe":
          iconColor = "bg-green-100";
          name = "Stripe";
          description = "Payment processing";
          break;
        case "email":
          iconColor = "bg-blue-100";
          name = "Email";
          description = "Notifications & reports";
          break;
      }
      
      return {
        id: integration.id,
        name,
        description,
        iconColor,
        status: integration.status,
        type: integration.type,
        config: integration.config
      };
    });
    
    res.status(200).json(formattedIntegrations);
  } catch (error) {
    console.error("Get integrations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new integration
export const createIntegration = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertIntegrationSchema.parse(req.body);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Check if integration of this type already exists
    const existingIntegrations = await storage.getIntegrationsByBusinessId(business.id);
    const existingIntegration = existingIntegrations.find(i => i.type === validatedData.type);
    
    if (existingIntegration) {
      return res.status(400).json({ message: "Integration of this type already exists" });
    }
    
    // Validate integration config based on type
    let isConfigValid = false;
    
    switch (validatedData.type) {
      case "twilio":
        isConfigValid = twilioService.validateConfig(validatedData.config);
        break;
      case "eleven_labs":
        isConfigValid = elevenLabsService.validateConfig(validatedData.config);
        break;
      case "n8n":
        isConfigValid = n8nService.validateConfig(validatedData.config);
        break;
      case "stripe":
        // Basic validation for Stripe API key
        isConfigValid = typeof validatedData.config === "object" && 
                       typeof validatedData.config.apiKey === "string";
        break;
      case "email":
        // Simple email validation
        isConfigValid = typeof validatedData.config === "object" && 
                        validatedData.config !== null &&
                        typeof validatedData.config.email === "string" && 
                        validatedData.config.email.includes("@");
        break;
      default:
        return res.status(400).json({ message: "Invalid integration type" });
    }
    
    if (!isConfigValid) {
      return res.status(400).json({ message: "Invalid integration configuration" });
    }
    
    // Create integration
    const integration = await storage.createIntegration({
      ...validatedData,
      businessId: business.id,
    });
    
    // Format response
    let iconColor = "bg-gray-100";
    let name = integration.type;
    let description = "Integration";
    
    // Set appropriate icon color and description based on type
    switch (integration.type) {
      case "twilio":
        iconColor = "bg-blue-100";
        name = "Twilio";
        description = "Voice call handling";
        break;
      case "eleven_labs":
        iconColor = "bg-purple-100";
        name = "11 Labs";
        description = "AI voice responses";
        break;
      case "n8n":
        iconColor = "bg-orange-100";
        name = "n8n";
        description = "Workflow automation";
        break;
      case "stripe":
        iconColor = "bg-green-100";
        name = "Stripe";
        description = "Payment processing";
        break;
      case "email":
        iconColor = "bg-blue-100";
        name = "Email";
        description = "Notifications & reports";
        break;
    }
    
    const formattedIntegration = {
      id: integration.id,
      name,
      description,
      iconColor,
      status: integration.status,
      type: integration.type,
      config: integration.config
    };
    
    res.status(201).json(formattedIntegration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Create integration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an integration
export const updateIntegration = async (req: Request, res: Response) => {
  try {
    const integrationId = parseInt(req.params.id);
    
    // Validate request body
    const validatedData = insertIntegrationSchema.partial().parse(req.body);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get integration
    const integration = await storage.getIntegrationById(integrationId);
    
    // Check if integration exists and belongs to the business
    if (!integration || integration.businessId !== business.id) {
      return res.status(404).json({ message: "Integration not found" });
    }
    
    // If config is being updated, validate it
    if (validatedData.config) {
      let isConfigValid = false;
      
      switch (integration.type) {
        case "twilio":
          isConfigValid = twilioService.validateConfig(validatedData.config);
          break;
        case "eleven_labs":
          isConfigValid = elevenLabsService.validateConfig(validatedData.config);
          break;
        case "n8n":
          isConfigValid = n8nService.validateConfig(validatedData.config);
          break;
        case "stripe":
          // Basic validation for Stripe API key
          isConfigValid = typeof validatedData.config === "object" && 
                         typeof validatedData.config.apiKey === "string";
          break;
        case "email":
          // Simple email validation
          isConfigValid = typeof validatedData.config === "object" && 
                          validatedData.config !== null &&
                          typeof validatedData.config.email === "string" && 
                          validatedData.config.email.includes("@");
          break;
        default:
          return res.status(400).json({ message: "Invalid integration type" });
      }
      
      if (!isConfigValid) {
        return res.status(400).json({ message: "Invalid integration configuration" });
      }
    }
    
    // Update integration
    const updatedIntegration = await storage.updateIntegration(integrationId, validatedData);
    
    // Format response
    let iconColor = "bg-gray-100";
    let name = updatedIntegration.type;
    let description = "Integration";
    
    // Set appropriate icon color and description based on type
    switch (updatedIntegration.type) {
      case "twilio":
        iconColor = "bg-blue-100";
        name = "Twilio";
        description = "Voice call handling";
        break;
      case "eleven_labs":
        iconColor = "bg-purple-100";
        name = "11 Labs";
        description = "AI voice responses";
        break;
      case "n8n":
        iconColor = "bg-orange-100";
        name = "n8n";
        description = "Workflow automation";
        break;
      case "stripe":
        iconColor = "bg-green-100";
        name = "Stripe";
        description = "Payment processing";
        break;
      case "email":
        iconColor = "bg-blue-100";
        name = "Email";
        description = "Notifications & reports";
        break;
    }
    
    const formattedIntegration = {
      id: updatedIntegration.id,
      name,
      description,
      iconColor,
      status: updatedIntegration.status,
      type: updatedIntegration.type,
      config: updatedIntegration.config
    };
    
    res.status(200).json(formattedIntegration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update integration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an integration
export const deleteIntegration = async (req: Request, res: Response) => {
  try {
    const integrationId = parseInt(req.params.id);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get integration
    const integration = await storage.getIntegrationById(integrationId);
    
    // Check if integration exists and belongs to the business
    if (!integration || integration.businessId !== business.id) {
      return res.status(404).json({ message: "Integration not found" });
    }
    
    // Delete integration
    await storage.deleteIntegration(integrationId);
    
    res.status(200).json({ message: "Integration deleted successfully" });
  } catch (error) {
    console.error("Delete integration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Stripe webhook for subscription events
export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    
    // Verify the webhook signature in a real application
    // const sig = req.headers['stripe-signature'];
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        
        // Find the user by Stripe customer ID
        // In a real app, you would look up the user in the database
        // For now, just respond with success
        break;
        
      case 'customer.subscription.deleted':
        // Handle subscription deletion
        break;
        
      case 'invoice.payment_succeeded':
        // Handle successful payment
        break;
        
      case 'invoice.payment_failed':
        // Handle failed payment
        break;
        
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

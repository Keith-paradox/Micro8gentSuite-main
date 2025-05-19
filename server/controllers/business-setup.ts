import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { businessTypeEnum } from "@shared/schema";
import { SessionData } from "express-session";

// Extend the Express Request type to include userId in the session
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// Schema for business setup data
const businessSetupSchema = z.object({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters."
  }),
  businessType: z.enum(businessTypeEnum.enumValues),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters."
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

type BusinessSetupData = z.infer<typeof businessSetupSchema>;

// Schema for hours of operation data
const hoursSchema = z.object({
  monday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  tuesday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  wednesday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  thursday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  friday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  saturday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
  sunday: z.object({
    open: z.string(),
    close: z.string(),
    isOpen: z.boolean(),
  }),
});

type HoursData = z.infer<typeof hoursSchema>;

// Handle the initial business setup process
export const setupBusiness = async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    
    // Validate the business setup data
    const validationResult = businessSetupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid business data", 
        errors: validationResult.error.errors 
      });
    }
    
    const businessData = validationResult.data;
    
    // Check if business already exists for this user
    const existingBusiness = await storage.getBusinessByUserId(userId);
    
    if (existingBusiness) {
      // Update existing business
      const updatedBusiness = await storage.updateBusiness(existingBusiness.id, {
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        description: businessData.description,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        zip: businessData.zip,
        country: businessData.country,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
      });
      
      return res.status(200).json(updatedBusiness);
    } else {
      // Create new business
      const newBusiness = await storage.createBusiness({
        userId,
        businessName: businessData.businessName,
        businessType: businessData.businessType,
        description: businessData.description,
        address: businessData.address,
        city: businessData.city,
        state: businessData.state,
        zip: businessData.zip,
        country: businessData.country,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
      });
      
      return res.status(201).json(newBusiness);
    }
  } catch (error) {
    console.error("Error in business setup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Handle hours of operation updates
export const updateHours = async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    
    // Validate the hours data
    const validationResult = hoursSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid hours data", 
        errors: validationResult.error.errors 
      });
    }
    
    const hoursData = validationResult.data;
    
    // Get the business for this user
    const business = await storage.getBusinessByUserId(userId);
    if (!business) {
      return res.status(404).json({ message: "Business not found. Please set up your business information first." });
    }
    
    // Delete existing hours
    await storage.deleteHoursByBusinessId(business.id);
    
    // Create new hours for each day
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const createdHours = [];
    
    for (const day of days) {
      const dayData = hoursData[day as keyof HoursData];
      
      // Create the hours object and log it
      const hourDataToSave = {
        businessId: business.id,
        dayOfWeek: day.toLowerCase(), // Store day name in lowercase for consistency
        openTime: dayData.isOpen ? dayData.open : null,
        closeTime: dayData.isOpen ? dayData.close : null,
        isOpen: dayData.isOpen,
      };
      
      console.log(`Creating hours for ${day}:`, hourDataToSave);
      const hours = await storage.createHours(hourDataToSave);
      
      createdHours.push(hours);
    }
    
    return res.status(200).json(createdHours);
  } catch (error) {
    console.error("Error updating hours:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Check if business has completed the setup process
export const checkBusinessSetupStatus = async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    
    // Get business data
    const business = await storage.getBusinessByUserId(userId);
    if (!business) {
      return res.status(200).json({ 
        isSetupComplete: false,
        message: "Business setup not started"
      });
    }
    
    // Get hours data
    const hours = await storage.getHoursByBusinessId(business.id);
    
    // Check if business and hours are set up
    const isSetupComplete = business && 
                           business.businessName && 
                           business.businessType && 
                           business.description && 
                           hours && 
                           hours.length >= 7;
    
    return res.status(200).json({
      isSetupComplete: !!isSetupComplete,
      business: business || null,
      hours: hours || []
    });
  } catch (error) {
    console.error("Error checking business setup status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
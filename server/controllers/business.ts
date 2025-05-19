import { Request, Response } from "express";
import { storage } from "../storage";
import { insertBusinessSchema } from "@shared/schema";
import { z } from "zod";

// Business info update schema
const businessInfoSchema = insertBusinessSchema.omit({ userId: true });

// Hours of operation schema
const hoursOfOperationSchema = z.object({
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

// FAQs schema
const faqsSchema = z.object({
  faqs: z.array(z.object({
    question: z.string().min(5, {
      message: "Question must be at least 5 characters.",
    }),
    answer: z.string().min(5, {
      message: "Answer must be at least 5 characters.",
    }),
  })),
});

// Get business info
export const getBusinessInfo = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return empty object
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.status(200).json(business);
  } catch (error) {
    console.error("Get business info error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update business info
export const updateBusinessInfo = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = businessInfoSchema.parse(req.body);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, create new business
    if (!business) {
      const newBusiness = await storage.createBusiness({
        ...validatedData,
        userId: req.user.id,
      });
      
      return res.status(201).json(newBusiness);
    }
    
    // Update existing business
    const updatedBusiness = await storage.updateBusiness(business.id, validatedData);
    
    res.status(200).json(updatedBusiness);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update business info error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get hours of operation
export const getHoursOfOperation = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get hours of operation
    const hours = await storage.getHoursByBusinessId(business.id);
    console.log("Retrieved hours from database:", hours);
    
    // Format response
    const formattedHours: any = {
      monday: { open: "09:00", close: "17:00", isOpen: true },
      tuesday: { open: "09:00", close: "17:00", isOpen: true },
      wednesday: { open: "09:00", close: "17:00", isOpen: true },
      thursday: { open: "09:00", close: "17:00", isOpen: true },
      friday: { open: "09:00", close: "17:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: false },
      sunday: { open: "10:00", close: "15:00", isOpen: false },
    };
    
    // Override defaults with actual hours if they exist
    hours.forEach((hour) => {
      formattedHours[hour.dayOfWeek.toLowerCase()] = {
        open: hour.openTime || (hour.isOpen ? "09:00" : "10:00"),
        close: hour.closeTime || (hour.isOpen ? "17:00" : "15:00"),
        isOpen: hour.isOpen !== null ? hour.isOpen : false,
      };
    });
    
    res.status(200).json(formattedHours);
  } catch (error) {
    console.error("Get hours of operation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update hours of operation
export const updateHoursOfOperation = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = hoursOfOperationSchema.parse(req.body);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Delete existing hours
    await storage.deleteHoursByBusinessId(business.id);
    
    // Create new hours for each day
    const days = Object.keys(validatedData) as Array<keyof typeof validatedData>;
    
    await Promise.all(days.map(async (day) => {
      const dayData = validatedData[day];
      
      const hourObj = {
        businessId: business.id,
        dayOfWeek: day.toLowerCase(), // Important: store in lowercase
        openTime: dayData.open,
        closeTime: dayData.close,
        isOpen: dayData.isOpen,
      };
      console.log(`Creating hour in business.ts for ${day}:`, hourObj);
      await storage.createHours(hourObj);
    }));
    
    // Get updated hours
    const updatedHours = await storage.getHoursByBusinessId(business.id);
    
    // Format response
    const formattedHours: any = {
      monday: { open: "09:00", close: "17:00", isOpen: true },
      tuesday: { open: "09:00", close: "17:00", isOpen: true },
      wednesday: { open: "09:00", close: "17:00", isOpen: true },
      thursday: { open: "09:00", close: "17:00", isOpen: true },
      friday: { open: "09:00", close: "17:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: false },
      sunday: { open: "10:00", close: "15:00", isOpen: false },
    };
    
    // Override defaults with actual hours
    updatedHours.forEach((hour) => {
      formattedHours[hour.dayOfWeek.toLowerCase()] = {
        open: hour.openTime || (hour.isOpen ? "09:00" : "10:00"),
        close: hour.closeTime || (hour.isOpen ? "17:00" : "15:00"),
        isOpen: hour.isOpen !== null ? hour.isOpen : false,
      };
    });
    
    res.status(200).json(formattedHours);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update hours of operation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get FAQs
export const getFaqs = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get FAQs
    const faqs = await storage.getFaqsByBusinessId(business.id);
    console.log("Retrieved FAQs:", JSON.stringify(faqs));
    
    // Return the array directly, not wrapped in an object
    res.status(200).json(faqs);
  } catch (error) {
    console.error("Get FAQs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update FAQs
export const updateFaqs = async (req: Request, res: Response) => {
  try {
    console.log("Received FAQs update request:", JSON.stringify(req.body));
    
    // Validate request body
    const validatedData = faqsSchema.parse(req.body);
    console.log("Validated FAQs data:", JSON.stringify(validatedData));
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Delete existing FAQs
    await storage.deleteFaqsByBusinessId(business.id);
    console.log("Deleted existing FAQs for business:", business.id);
    
    // Create new FAQs
    const newFaqs = await Promise.all(
      validatedData.faqs.map(async (faq) => {
        const newFaq = await storage.createFaq({
          businessId: business.id,
          question: faq.question,
          answer: faq.answer,
        });
        console.log("Created new FAQ:", JSON.stringify(newFaq));
        return newFaq;
      })
    );
    
    console.log("All new FAQs created:", JSON.stringify(newFaqs));
    // Return the array directly, not wrapped in an object
    res.status(200).json(newFaqs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update FAQs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

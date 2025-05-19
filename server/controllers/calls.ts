import { Request, Response } from "express";
import { storage } from "../storage";
import { insertCallSchema } from "@shared/schema";
import { z } from "zod";
import { TwilioService } from "../services/twilio";
import { ElevenLabsService } from "../services/eleven-labs";
import { N8nService } from "../services/n8n";
import { format, subDays } from "date-fns";

// Initialize services
const twilioService = new TwilioService();
const elevenLabsService = new ElevenLabsService();
const n8nService = new N8nService();

// Get all calls for a business
export const getCalls = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get calls
    const calls = await storage.getCallsByBusinessId(business.id);
    
    res.status(200).json(calls);
  } catch (error) {
    console.error("Get calls error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific call by ID
export const getCallById = async (req: Request, res: Response) => {
  try {
    const callId = parseInt(req.params.id);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get call
    const call = await storage.getCallById(callId);
    
    // Check if call exists and belongs to the business
    if (!call || call.businessId !== business.id) {
      return res.status(404).json({ message: "Call not found" });
    }
    
    res.status(200).json(call);
  } catch (error) {
    console.error("Get call by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new call
export const createCall = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertCallSchema.parse(req.body);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Create call
    const call = await storage.createCall({
      ...validatedData,
      businessId: business.id,
    });
    
    res.status(201).json(call);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Create call error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Twilio webhook for incoming calls
export const twilioWebhook = async (req: Request, res: Response) => {
  try {
    const { From: phone, CallSid, To: businessPhone } = req.body;
    
    // Get business by phone number
    // In a real app, you would look up the business by the "To" phone number
    // For demo purposes, we'll get the first business
    const businesses = Array.from((storage as any).businesses.values());
    const business = businesses[0];
    
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Create call record
    const call = await storage.createCall({
      businessId: business.id,
      caller: "Unknown Caller",
      phone,
      type: "Unknown",
      startTime: new Date(),
      status: "in-progress",
      recording: null,
      transcript: null,
    });
    
    // Generate TwiML response
    const twiml = twilioService.generateGreetingResponse(business.businessName);
    
    // Trigger n8n workflow to handle the call
    n8nService.triggerCallWorkflow({
      callId: call.id,
      businessId: business.id,
      callSid: CallSid,
      phone,
    });
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error("Twilio webhook error:", error);
    
    // Return a TwiML response even in case of error
    const errorTwiml = twilioService.generateErrorResponse();
    res.type('text/xml');
    res.send(errorTwiml);
  }
};

// n8n webhook for workflow automation
export const n8nWebhook = async (req: Request, res: Response) => {
  try {
    const { callId, action, data } = req.body;
    
    // Get call
    const call = await storage.getCallById(parseInt(callId));
    
    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }
    
    switch (action) {
      case "update_call_type":
        // Update call type
        await storage.updateCall(call.id, { type: data.type });
        break;
        
      case "end_call":
        // End call
        const endTime = new Date();
        const durationMs = endTime.getTime() - call.startTime.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        await storage.updateCall(call.id, {
          endTime,
          duration: durationStr,
          status: "completed",
          transcript: data.transcript,
          recording: data.recording
        });
        break;
        
      default:
        return res.status(400).json({ message: "Invalid action" });
    }
    
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("n8n webhook error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get calls
    const calls = await storage.getCallsByBusinessId(business.id);
    
    // Get bookings
    const bookings = await storage.getBookingsByBusinessId(business.id);
    
    // Calculate total calls
    const totalCalls = calls.length;
    
    // Calculate monthly bookings
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthlyBookings = bookings.filter(booking => new Date(booking.date) >= firstDayOfMonth).length;
    
    // Calculate monthly revenue (in a real app, this would come from actual payment data)
    const monthlyRevenue = "$" + (monthlyBookings * 150).toString();
    
    res.status(200).json({
      totalCalls,
      monthlyBookings,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

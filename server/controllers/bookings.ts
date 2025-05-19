import { Request, Response } from "express";
import { storage } from "../storage";
import { insertBookingSchema } from "@shared/schema";
import { z } from "zod";

// Get all bookings for a business
export const getBookings = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get bookings
    const bookings = await storage.getBookingsByBusinessId(business.id);
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a specific booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get booking
    const booking = await storage.getBookingById(bookingId);
    
    // Check if booking exists and belongs to the business
    if (!booking || booking.businessId !== business.id) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error("Get booking by ID error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Convert date string to Date object if it's a string
    const dateValue = req.body.date ? 
      (typeof req.body.date === 'string' ? new Date(req.body.date) : req.body.date) : 
      undefined;
      
    // Add businessId to request body and convert date to proper format
    const bookingData = {
      ...req.body,
      date: dateValue,
      businessId: business.id,
    };

    console.log("Server received booking data:", bookingData);
    
    // Validate request body with updated data
    const validatedData = insertBookingSchema.parse(bookingData);
    
    // Create booking
    const booking = await storage.createBooking(validatedData);
    
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", error.errors);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get booking
    const booking = await storage.getBookingById(bookingId);
    
    // Check if booking exists and belongs to the business
    if (!booking || booking.businessId !== business.id) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Convert date string to Date object if it's a string
    const dateValue = req.body.date ? 
      (typeof req.body.date === 'string' ? new Date(req.body.date) : req.body.date) : 
      undefined;
    
    // Add businessId to request body to ensure it's not changed
    const bookingData = {
      ...req.body,
      date: dateValue,
      businessId: business.id, // Ensure businessId remains the same
    };

    console.log("Server received update data:", bookingData);
    
    // Validate request body with partial schema
    const validatedData = insertBookingSchema.partial().parse(bookingData);
    
    // Update booking
    const updatedBooking = await storage.updateBooking(bookingId, validatedData);
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error details:", error.errors);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    // Get business by user ID
    const business = await storage.getBusinessByUserId(req.user.id);
    
    // If no business found, return error
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get booking
    const booking = await storage.getBookingById(bookingId);
    
    // Check if booking exists and belongs to the business
    if (!booking || booking.businessId !== business.id) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Delete booking
    await storage.deleteBooking(bookingId);
    
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

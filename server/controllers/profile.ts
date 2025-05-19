import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Profile update schema
const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    
    // Validate request body
    const validationResult = profileUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid profile data", 
        errors: validationResult.error.errors 
      });
    }

    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    const updatedUser = await storage.updateUser(userId, validationResult.data);
    
    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...safeUser } = updatedUser;
    
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive information
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    
    return res.status(200).json(safeUser);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
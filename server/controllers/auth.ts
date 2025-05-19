import { Request, Response } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { hash, compare } from "bcrypt";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";

// Register schema with additional fields for business registration
const registerSchema = insertUserSchema.extend({
  businessName: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if username is taken
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);
    
    // Create user
    const user = await storage.createUser({
      username: validatedData.username,
      password: hashedPassword,
      email: validatedData.email,
      businessName: validatedData.businessName,
    });
    
    // Create business for user
    await storage.createBusiness({
      userId: user.id,
      businessName: validatedData.businessName,
      description: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone: "",
      email: validatedData.email,
      website: "",
    });
    
    // Create default subscription for user
    await storage.createSubscription({
      userId: user.id,
      plan: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by username
    const user = await storage.getUserByUsername(validatedData.username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Verify password
    const passwordValid = await compare(validatedData.password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Set user ID in session
    if (req.session) {
      req.session.userId = user.id;
    }
    
    console.log("User login successful:", { 
      id: user.id, 
      username: user.username,
      role: user.role 
    });
    
    // Return user data (without password)
    const { password, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Return user data (without password)
    const { password, ...userData } = req.user;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Reset password schema
const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  token: z.string().min(1, {
    message: "Reset token is required.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.status(200).json({ 
        message: "If that email address is in our database, we will send you a password reset link." 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    // Update user with reset token and expiry
    await storage.updateUserResetToken(user.id, resetToken, resetTokenExpiry);
    
    // Get app URL for reset link (use req.headers.host in production)
    const appUrl = `http://${req.headers.host}`;
    
    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, appUrl);
    
    res.status(200).json({ 
      message: "If that email address is in our database, we will send you a password reset link." 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);
    
    // Find user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Check if reset token exists and is valid
    if (!user.resetToken || user.resetToken !== validatedData.token) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Check if token is expired
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    
    // Hash new password
    const hashedPassword = await hash(validatedData.password, 10);
    
    // Update user with new password and clear reset token
    await storage.updateUserPassword(user.id, hashedPassword);
    
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

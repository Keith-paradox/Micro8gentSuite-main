import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { User } from "@shared/schema";

// Define admin role in schema
// Get all users for admin
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    
    const users = await storage.getAllUsers();
    
    // Add business info to each user
    const usersWithBusiness = await Promise.all(users.map(async (user: User) => {
      const business = await storage.getBusinessByUserId(user.id);
      const subscription = await storage.getSubscriptionByUserId(user.id);
      
      return {
        ...user,
        business,
        subscription,
        password: undefined // Remove password from response
      };
    }));
    
    res.status(200).json(usersWithBusiness);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user details including associated business and subscription
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get associated business and subscription
    const business = await storage.getBusinessByUserId(userId);
    const subscription = await storage.getSubscriptionByUserId(userId);
    
    // Get hours, faqs, calls, bookings if business exists
    let additionalData = {};
    if (business) {
      const hours = await storage.getHoursByBusinessId(business.id);
      const faqs = await storage.getFaqsByBusinessId(business.id);
      const calls = await storage.getCallsByBusinessId(business.id);
      const bookings = await storage.getBookingsByBusinessId(business.id);
      
      additionalData = {
        hours,
        faqs,
        calls,
        bookings
      };
    }
    
    // Remove sensitive data
    const userDetails = {
      ...user,
      password: undefined, // Remove password
      resetToken: undefined, // Remove reset token
      business,
      subscription,
      ...additionalData
    };
    
    res.status(200).json(userDetails);
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user role (admin/user)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Validate request body
    const roleSchema = z.object({
      role: z.enum(['admin', 'user'])
    });
    
    const { role } = roleSchema.parse(req.body);
    
    // Update user role
    const updatedUser = await storage.updateUser(userId, { role });
    
    res.status(200).json({
      ...updatedUser,
      password: undefined
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get dashboard statistics for admin
export const getAdminDashboardStats = async (req: Request, res: Response) => {
  try {
    
    // Get all users
    const users = await storage.getAllUsers();
    
    // Get all businesses
    const businesses = [];
    for (const user of users) {
      const business = await storage.getBusinessByUserId(user.id);
      if (business) {
        businesses.push(business);
      }
    }
    
    // Get all subscriptions
    const subscriptions = [];
    for (const user of users) {
      const subscription = await storage.getSubscriptionByUserId(user.id);
      if (subscription) {
        subscriptions.push(subscription);
      }
    }
    
    // Calculate statistics
    const totalUsers = users.length;
    const totalBusinesses = businesses.length;
    const totalSubscriptions = subscriptions.length;
    
    // Calculate subscription by plan type
    const subscriptionsByPlan = {
      free: 0,
      basic: 0,
      premium: 0,
      enterprise: 0
    };
    
    for (const subscription of subscriptions) {
      if (subscription.plan && subscriptionsByPlan.hasOwnProperty(subscription.plan)) {
        subscriptionsByPlan[subscription.plan as keyof typeof subscriptionsByPlan]++;
      }
    }
    
    // Calculate businesses by type
    const businessesByType: Record<string, number> = {};
    
    for (const business of businesses) {
      if (business.businessType) {
        if (!businessesByType[business.businessType]) {
          businessesByType[business.businessType] = 0;
        }
        businessesByType[business.businessType]++;
      }
    }
    
    // Calculate recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = users.filter((user: User) => 
      new Date(user.createdAt) >= thirtyDaysAgo
    ).length;
    
    const stats = {
      totalUsers,
      totalBusinesses,
      totalSubscriptions,
      subscriptionsByPlan,
      businessesByType,
      recentSignups
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
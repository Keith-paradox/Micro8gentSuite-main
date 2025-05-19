import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Auth middleware - session:", req.session);
    
    // In a real application, you would verify a JWT token
    // For now, we'll check if there's a user ID in the session
    if (!req.session || !req.session.userId) {
      console.log("Auth middleware - no userId in session");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user from storage
    const user = await storage.getUser(req.session.userId);
    console.log("Auth middleware - user from storage:", user);
    
    if (!user) {
      console.log("Auth middleware - user not found in storage");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request for later use
    req.user = user;
    console.log("Auth middleware - attached user to request:", { 
      id: user.id, 
      username: user.username,
      role: user.role
    });
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

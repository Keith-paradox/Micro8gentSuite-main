import { Request, Response, NextFunction } from "express";

// Admin middleware to check if user has admin role
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  
  // Continue to the next middleware/route handler
  next();
};
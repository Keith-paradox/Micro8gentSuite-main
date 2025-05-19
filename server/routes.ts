import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware } from "./middleware/auth";
import { adminMiddleware } from "./middleware/admin";

// Import controllers
import * as authController from "./controllers/auth";
import * as businessController from "./controllers/business";
import * as businessSetupController from "./controllers/business-setup";
import * as callsController from "./controllers/calls";
import * as bookingsController from "./controllers/bookings";
import * as integrationsController from "./controllers/integrations";
import * as subscriptionsController from "./controllers/subscriptions";
import * as profileController from "./controllers/profile";
import * as adminController from "./controllers/admin";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/me", authMiddleware, authController.getCurrentUser);
  app.post("/api/auth/forgot-password", authController.forgotPassword);
  app.post("/api/auth/reset-password", authController.resetPassword);
  
  // Debug admin auto-login endpoint
  app.get("/api/debug/admin-login", async (req, res) => {
    try {
      // Get admin user
      const admin = await storage.getUserByUsername("admin");
      
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      // Set userId in session
      if (req.session) {
        req.session.userId = admin.id;
        console.log("Debug admin login - set session userId:", admin.id);
      }
      
      res.status(200).json({ 
        message: "Admin user logged in", 
        user: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email,
          role: admin.role
        } 
      });
    } catch (error) {
      console.error("Debug admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Business routes
  app.get("/api/business/info", authMiddleware, businessController.getBusinessInfo);
  app.put("/api/business/info", authMiddleware, businessController.updateBusinessInfo);
  app.get("/api/business/hours", authMiddleware, businessController.getHoursOfOperation);
  app.put("/api/business/hours", authMiddleware, businessController.updateHoursOfOperation);
  app.get("/api/business/faqs", authMiddleware, businessController.getFaqs);
  app.put("/api/business/faqs", authMiddleware, businessController.updateFaqs);
  
  // Business onboarding routes
  app.post("/api/business/setup", authMiddleware, businessSetupController.setupBusiness);
  app.put("/api/business/hours/setup", authMiddleware, businessSetupController.updateHours);
  app.get("/api/business/setup/status", authMiddleware, businessSetupController.checkBusinessSetupStatus);

  // Call logs routes
  app.get("/api/calls", authMiddleware, callsController.getCalls);
  app.get("/api/calls/:id", authMiddleware, callsController.getCallById);
  app.post("/api/calls", authMiddleware, callsController.createCall);
  app.get("/api/dashboard/stats", authMiddleware, callsController.getDashboardStats);

  // Bookings routes
  app.get("/api/bookings", authMiddleware, bookingsController.getBookings);
  app.get("/api/bookings/:id", authMiddleware, bookingsController.getBookingById);
  app.post("/api/bookings", authMiddleware, bookingsController.createBooking);
  app.put("/api/bookings/:id", authMiddleware, bookingsController.updateBooking);
  app.delete("/api/bookings/:id", authMiddleware, bookingsController.deleteBooking);

  // Integrations routes
  app.get("/api/integrations", authMiddleware, integrationsController.getIntegrations);
  app.post("/api/integrations", authMiddleware, integrationsController.createIntegration);
  app.put("/api/integrations/:id", authMiddleware, integrationsController.updateIntegration);
  app.delete("/api/integrations/:id", authMiddleware, integrationsController.deleteIntegration);

  // Subscription routes
  app.get("/api/subscriptions/current", authMiddleware, subscriptionsController.getCurrentSubscription);
  app.post("/api/subscriptions", authMiddleware, subscriptionsController.createSubscription);
  app.put("/api/subscriptions/:id", authMiddleware, subscriptionsController.updateSubscription);
  app.post("/api/subscriptions/checkout", authMiddleware, subscriptionsController.createCheckoutSession);
  app.post("/api/subscriptions/billing-portal", authMiddleware, subscriptionsController.createBillingPortalSession);

  // Twilio webhook for incoming calls
  app.post("/api/webhooks/twilio", callsController.twilioWebhook);

  // n8n webhook for workflow automation
  app.post("/api/webhooks/n8n", callsController.n8nWebhook);

  // Stripe webhook for subscription events
  app.post("/api/webhooks/stripe", subscriptionsController.handleWebhook);
  
  // Profile routes
  app.get("/api/profile", authMiddleware, profileController.getProfile);
  app.put("/api/profile", authMiddleware, profileController.updateProfile);
  
  // Admin routes
  app.get("/api/admin/users", authMiddleware, adminMiddleware, adminController.getAllUsers);
  app.get("/api/admin/users/:id", authMiddleware, adminMiddleware, adminController.getUserDetails);
  app.put("/api/admin/users/:id/role", authMiddleware, adminMiddleware, adminController.updateUserRole);
  app.get("/api/admin/dashboard/stats", authMiddleware, adminMiddleware, adminController.getAdminDashboardStats);

  const httpServer = createServer(app);

  return httpServer;
}

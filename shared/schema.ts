import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, date, time, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', [
  'user',
  'admin'
]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  businessName: text("business_name"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  role: userRoleEnum("role").default('user').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true });

// Business types enum
export const businessTypeEnum = pgEnum('business_type', [
  'restaurant',
  'lawyer_office',
  'dental_clinic',
  'hair_salon',
  'retail_store',
  'medical_clinic',
  'fitness_center',
  'spa',
  'auto_repair',
  'real_estate',
  'other'
]);

// Business details
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  businessType: businessTypeEnum("business_type").default('other'),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businesses)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Hours of operation for each business
export const hoursOfOperation = pgTable("hours_of_operation", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  dayOfWeek: text("day_of_week").notNull(), // "monday", "tuesday", etc.
  openTime: time("open_time"),
  closeTime: time("close_time"),
  isOpen: boolean("is_open").default(true),
});

export const insertHoursSchema = createInsertSchema(hoursOfOperation)
  .omit({ id: true });

// FAQ entries for each business
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});

export const insertFaqSchema = createInsertSchema(faqs)
  .omit({ id: true });

// Call statuses enum
export const callStatusEnum = pgEnum('call_status', [
  'completed', 
  'in-progress', 
  'missed', 
  'transferred'
]);

// Call logs
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  caller: text("caller"),
  phone: text("phone"),
  type: text("type"),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  status: callStatusEnum("status").notNull(),
  duration: text("duration"),
  recording: text("recording"),
  transcript: text("transcript"),
});

export const insertCallSchema = createInsertSchema(calls)
  .omit({ id: true, endTime: true, duration: true });

// Booking statuses enum
export const bookingStatusEnum = pgEnum('booking_status', [
  'upcoming', 
  'completed', 
  'canceled'
]);

// Bookings/appointments
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  customer: text("customer").notNull(),
  phone: text("phone"),
  email: text("email"),
  service: text("service").notNull(),
  date: timestamp("date").notNull(),
  status: bookingStatusEnum("status").default('upcoming').notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true });

// Integration configurations
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  type: text("type").notNull(), // "twilio", "eleven_labs", "n8n", "stripe", etc.
  config: jsonb("config").notNull(),
  status: text("status").default('inactive').notNull(), // "active", "inactive", "error"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIntegrationSchema = createInsertSchema(integrations)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Subscriptions
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free', 
  'basic', 
  'premium', 
  'enterprise'
]);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plan: subscriptionPlanEnum("plan").default('free').notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default('active').notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type HoursOfOperation = typeof hoursOfOperation.$inferSelect;
export type InsertHours = z.infer<typeof insertHoursSchema>;

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;

export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

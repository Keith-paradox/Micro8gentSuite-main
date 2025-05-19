import {
  users, type User, type InsertUser,
  businesses, type Business, type InsertBusiness,
  hoursOfOperation, type HoursOfOperation, type InsertHours,
  faqs, type FAQ, type InsertFAQ,
  calls, type Call, type InsertCall,
  bookings, type Booking, type InsertBooking,
  integrations, type Integration, type InsertIntegration,
  subscriptions, type Subscription, type InsertSubscription
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  updateUserResetToken(id: number, resetToken: string, resetTokenExpiry: Date): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Business methods
  getBusinessByUserId(userId: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<Business>): Promise<Business>;

  // Hours of operation methods
  getHoursByBusinessId(businessId: number): Promise<HoursOfOperation[]>;
  createHours(hours: InsertHours): Promise<HoursOfOperation>;
  updateHours(id: number, hours: Partial<HoursOfOperation>): Promise<HoursOfOperation>;
  deleteHoursByBusinessId(businessId: number): Promise<void>;

  // FAQ methods
  getFaqsByBusinessId(businessId: number): Promise<FAQ[]>;
  createFaq(faq: InsertFAQ): Promise<FAQ>;
  updateFaq(id: number, faq: Partial<FAQ>): Promise<FAQ>;
  deleteFaqsByBusinessId(businessId: number): Promise<void>;

  // Call methods
  getCallsByBusinessId(businessId: number): Promise<Call[]>;
  getCallById(id: number): Promise<Call | undefined>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<Call>): Promise<Call>;

  // Booking methods
  getBookingsByBusinessId(businessId: number): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;

  // Integration methods
  getIntegrationsByBusinessId(businessId: number): Promise<Integration[]>;
  getIntegrationById(id: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration>;
  deleteIntegration(id: number): Promise<void>;

  // Subscription methods
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private businesses: Map<number, Business>;
  private hoursOfOperation: Map<number, HoursOfOperation>;
  private faqs: Map<number, FAQ>;
  private calls: Map<number, Call>;
  private bookings: Map<number, Booking>;
  private integrations: Map<number, Integration>;
  private subscriptions: Map<number, Subscription>;
  
  private userId: number;
  private businessId: number;
  private hoursId: number;
  private faqId: number;
  private callId: number;
  private bookingId: number;
  private integrationId: number;
  private subscriptionId: number;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.hoursOfOperation = new Map();
    this.faqs = new Map();
    this.calls = new Map();
    this.bookings = new Map();
    this.integrations = new Map();
    this.subscriptions = new Map();
    
    this.userId = 1;
    this.businessId = 1;
    this.hoursId = 1;
    this.faqId = 1;
    this.callId = 1;
    this.bookingId = 1;
    this.integrationId = 1;
    this.subscriptionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      resetToken: null,
      resetTokenExpiry: null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserResetToken(id: number, resetToken: string, resetTokenExpiry: Date): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      resetToken, 
      resetTokenExpiry 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      password,
      resetToken: null,
      resetTokenExpiry: null 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      ...userUpdate
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Business methods
  async getBusinessByUserId(userId: number): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find(
      (business) => business.userId === userId,
    );
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const id = this.businessId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    // Make sure businessType has a default value
    const businessWithType = {
      ...insertBusiness,
      businessType: insertBusiness.businessType || 'other'
    };
    const business: Business = { ...businessWithType, id, createdAt, updatedAt };
    this.businesses.set(id, business);
    return business;
  }

  async updateBusiness(id: number, businessUpdate: Partial<Business>): Promise<Business> {
    const business = this.businesses.get(id);
    if (!business) {
      throw new Error(`Business with ID ${id} not found`);
    }
    
    const updatedBusiness = { 
      ...business, 
      ...businessUpdate, 
      updatedAt: new Date() 
    };
    
    this.businesses.set(id, updatedBusiness);
    return updatedBusiness;
  }

  // Hours of operation methods
  async getHoursByBusinessId(businessId: number): Promise<HoursOfOperation[]> {
    return Array.from(this.hoursOfOperation.values()).filter(
      (hours) => hours.businessId === businessId,
    );
  }

  async createHours(insertHours: InsertHours): Promise<HoursOfOperation> {
    const id = this.hoursId++;
    const hours: HoursOfOperation = { ...insertHours, id };
    this.hoursOfOperation.set(id, hours);
    return hours;
  }

  async updateHours(id: number, hoursUpdate: Partial<HoursOfOperation>): Promise<HoursOfOperation> {
    const hours = this.hoursOfOperation.get(id);
    if (!hours) {
      throw new Error(`Hours with ID ${id} not found`);
    }
    
    const updatedHours = { ...hours, ...hoursUpdate };
    this.hoursOfOperation.set(id, updatedHours);
    return updatedHours;
  }

  async deleteHoursByBusinessId(businessId: number): Promise<void> {
    for (const [key, hours] of this.hoursOfOperation.entries()) {
      if (hours.businessId === businessId) {
        this.hoursOfOperation.delete(key);
      }
    }
  }

  // FAQ methods
  async getFaqsByBusinessId(businessId: number): Promise<FAQ[]> {
    return Array.from(this.faqs.values()).filter(
      (faq) => faq.businessId === businessId,
    );
  }

  async createFaq(insertFaq: InsertFAQ): Promise<FAQ> {
    const id = this.faqId++;
    const faq: FAQ = { ...insertFaq, id };
    this.faqs.set(id, faq);
    return faq;
  }

  async updateFaq(id: number, faqUpdate: Partial<FAQ>): Promise<FAQ> {
    const faq = this.faqs.get(id);
    if (!faq) {
      throw new Error(`FAQ with ID ${id} not found`);
    }
    
    const updatedFaq = { ...faq, ...faqUpdate };
    this.faqs.set(id, updatedFaq);
    return updatedFaq;
  }

  async deleteFaqsByBusinessId(businessId: number): Promise<void> {
    for (const [key, faq] of this.faqs.entries()) {
      if (faq.businessId === businessId) {
        this.faqs.delete(key);
      }
    }
  }

  // Call methods
  async getCallsByBusinessId(businessId: number): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(
      (call) => call.businessId === businessId,
    );
  }

  async getCallById(id: number): Promise<Call | undefined> {
    return this.calls.get(id);
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.callId++;
    const call: Call = { 
      ...insertCall, 
      id, 
      endTime: null, 
      duration: "0:00" 
    };
    this.calls.set(id, call);
    return call;
  }

  async updateCall(id: number, callUpdate: Partial<Call>): Promise<Call> {
    const call = this.calls.get(id);
    if (!call) {
      throw new Error(`Call with ID ${id} not found`);
    }
    
    const updatedCall = { ...call, ...callUpdate };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }

  // Booking methods
  async getBookingsByBusinessId(businessId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.businessId === businessId,
    );
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.bookingId++;
    const createdAt = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<Booking>): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    const updatedBooking = { ...booking, ...bookingUpdate };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<void> {
    if (!this.bookings.has(id)) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    
    this.bookings.delete(id);
  }

  // Integration methods
  async getIntegrationsByBusinessId(businessId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.businessId === businessId,
    );
  }

  async getIntegrationById(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.integrationId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const integration: Integration = { 
      ...insertIntegration, 
      id, 
      createdAt, 
      updatedAt 
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: number, integrationUpdate: Partial<Integration>): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration with ID ${id} not found`);
    }
    
    const updatedIntegration = { 
      ...integration, 
      ...integrationUpdate, 
      updatedAt: new Date() 
    };
    
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: number): Promise<void> {
    if (!this.integrations.has(id)) {
      throw new Error(`Integration with ID ${id} not found`);
    }
    
    this.integrations.delete(id);
  }

  // Subscription methods
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.userId === userId,
    );
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.stripeSubscriptionId === stripeSubscriptionId,
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const subscription: Subscription = { 
      ...insertSubscription, 
      id, 
      createdAt, 
      updatedAt 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    const updatedSubscription = { 
      ...subscription, 
      ...subscriptionUpdate, 
      updatedAt: new Date() 
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Helper methods for common error messages
  private notFoundError(entity: string, id: number): Error {
    return new Error(`${entity} with ID ${id} not found`);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Create a properly typed object with null handling
    const userToInsert = {
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
      businessName: insertUser.businessName ?? null
    };
    
    const [user] = await db.insert(users).values(userToInsert).returning();
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
      
    if (!user) {
      throw this.notFoundError('User', id);
    }
    
    return user;
  }
  
  async updateUserResetToken(id: number, resetToken: string, resetTokenExpiry: Date): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ resetToken, resetTokenExpiry })
      .where(eq(users.id, id))
      .returning();
      
    if (!user) {
      throw this.notFoundError('User', id);
    }
    
    return user;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        password, 
        resetToken: null, 
        resetTokenExpiry: null 
      })
      .where(eq(users.id, id))
      .returning();
      
    if (!user) {
      throw this.notFoundError('User', id);
    }
    
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Business methods
  async getBusinessByUserId(userId: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.userId, userId));
    return business;
  }

  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    // Create a properly typed object with null handling
    const businessToInsert = {
      userId: insertBusiness.userId,
      businessName: insertBusiness.businessName,
      businessType: insertBusiness.businessType ?? 'other',
      description: insertBusiness.description ?? null,
      address: insertBusiness.address ?? null,
      city: insertBusiness.city ?? null,
      state: insertBusiness.state ?? null,
      zip: insertBusiness.zip ?? null,
      phone: insertBusiness.phone ?? null,
      email: insertBusiness.email ?? null,
      website: insertBusiness.website ?? null
    };
    
    const [business] = await db.insert(businesses).values(businessToInsert).returning();
    return business;
  }

  async updateBusiness(id: number, businessUpdate: Partial<Business>): Promise<Business> {
    const updatedValues = {
      ...businessUpdate,
      updatedAt: new Date()
    };
    
    const [business] = await db
      .update(businesses)
      .set(updatedValues)
      .where(eq(businesses.id, id))
      .returning();
      
    if (!business) {
      throw this.notFoundError('Business', id);
    }
    
    return business;
  }

  // Hours of operation methods
  async getHoursByBusinessId(businessId: number): Promise<HoursOfOperation[]> {
    return await db
      .select()
      .from(hoursOfOperation)
      .where(eq(hoursOfOperation.businessId, businessId));
  }

  async createHours(insertHours: InsertHours): Promise<HoursOfOperation> {
    // Create a properly typed object with null handling
    const hoursToInsert = {
      businessId: insertHours.businessId,
      dayOfWeek: insertHours.dayOfWeek,
      openTime: insertHours.openTime ?? null,
      closeTime: insertHours.closeTime ?? null,
      isOpen: insertHours.isOpen ?? null
    };
    
    const [hours] = await db
      .insert(hoursOfOperation)
      .values(hoursToInsert)
      .returning();
      
    return hours;
  }

  async updateHours(id: number, hoursUpdate: Partial<HoursOfOperation>): Promise<HoursOfOperation> {
    const [hours] = await db
      .update(hoursOfOperation)
      .set(hoursUpdate)
      .where(eq(hoursOfOperation.id, id))
      .returning();
      
    if (!hours) {
      throw this.notFoundError('Hours of Operation', id);
    }
    
    return hours;
  }

  async deleteHoursByBusinessId(businessId: number): Promise<void> {
    await db
      .delete(hoursOfOperation)
      .where(eq(hoursOfOperation.businessId, businessId));
  }

  // FAQ methods
  async getFaqsByBusinessId(businessId: number): Promise<FAQ[]> {
    return await db
      .select()
      .from(faqs)
      .where(eq(faqs.businessId, businessId));
  }

  async createFaq(insertFaq: InsertFAQ): Promise<FAQ> {
    const [faq] = await db
      .insert(faqs)
      .values(insertFaq)
      .returning();
      
    return faq;
  }

  async updateFaq(id: number, faqUpdate: Partial<FAQ>): Promise<FAQ> {
    const [faq] = await db
      .update(faqs)
      .set(faqUpdate)
      .where(eq(faqs.id, id))
      .returning();
      
    if (!faq) {
      throw this.notFoundError('FAQ', id);
    }
    
    return faq;
  }

  async deleteFaqsByBusinessId(businessId: number): Promise<void> {
    await db
      .delete(faqs)
      .where(eq(faqs.businessId, businessId));
  }

  // Call methods
  async getCallsByBusinessId(businessId: number): Promise<Call[]> {
    return await db
      .select()
      .from(calls)
      .where(eq(calls.businessId, businessId))
      .orderBy(asc(calls.startTime));
  }

  async getCallById(id: number): Promise<Call | undefined> {
    const [call] = await db
      .select()
      .from(calls)
      .where(eq(calls.id, id));
      
    return call;
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    // Ensure proper typing and null handling
    const callToInsert = {
      businessId: insertCall.businessId,
      status: insertCall.status,
      startTime: insertCall.startTime ?? new Date(),
      caller: insertCall.caller ?? null,
      phone: insertCall.phone ?? null,
      type: insertCall.type ?? null,
      duration: null,
      endTime: null,
      recording: insertCall.recording ?? null,
      transcript: insertCall.transcript ?? null
    };
    
    const [call] = await db
      .insert(calls)
      .values(callToInsert)
      .returning();
      
    return call;
  }

  async updateCall(id: number, callUpdate: Partial<Call>): Promise<Call> {
    const [call] = await db
      .update(calls)
      .set(callUpdate)
      .where(eq(calls.id, id))
      .returning();
      
    if (!call) {
      throw this.notFoundError('Call', id);
    }
    
    return call;
  }

  // Booking methods
  async getBookingsByBusinessId(businessId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.businessId, businessId))
      .orderBy(asc(bookings.date));
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
      
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Ensure proper typing and null handling
    const bookingToInsert = {
      businessId: insertBooking.businessId,
      customer: insertBooking.customer,
      service: insertBooking.service,
      date: insertBooking.date,
      status: insertBooking.status ?? "upcoming", // Default status
      email: insertBooking.email ?? null,
      phone: insertBooking.phone ?? null,
      notes: insertBooking.notes ?? null
    };
    
    const [booking] = await db
      .insert(bookings)
      .values(bookingToInsert)
      .returning();
      
    return booking;
  }

  async updateBooking(id: number, bookingUpdate: Partial<Booking>): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set(bookingUpdate)
      .where(eq(bookings.id, id))
      .returning();
      
    if (!booking) {
      throw this.notFoundError('Booking', id);
    }
    
    return booking;
  }

  async deleteBooking(id: number): Promise<void> {
    const result = await db
      .delete(bookings)
      .where(eq(bookings.id, id));
      
    if (!result) {
      throw this.notFoundError('Booking', id);
    }
  }

  // Integration methods
  async getIntegrationsByBusinessId(businessId: number): Promise<Integration[]> {
    return await db
      .select()
      .from(integrations)
      .where(eq(integrations.businessId, businessId));
  }

  async getIntegrationById(id: number): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(eq(integrations.id, id));
      
    return integration;
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    // Ensure proper typing and null handling
    const integrationToInsert = {
      businessId: insertIntegration.businessId,
      type: insertIntegration.type,
      config: insertIntegration.config,
      status: insertIntegration.status ?? "inactive" // Default status
    };
    
    const [integration] = await db
      .insert(integrations)
      .values(integrationToInsert)
      .returning();
      
    return integration;
  }

  async updateIntegration(id: number, integrationUpdate: Partial<Integration>): Promise<Integration> {
    const updatedValues = {
      ...integrationUpdate,
      updatedAt: new Date()
    };
    
    const [integration] = await db
      .update(integrations)
      .set(updatedValues)
      .where(eq(integrations.id, id))
      .returning();
      
    if (!integration) {
      throw this.notFoundError('Integration', id);
    }
    
    return integration;
  }

  async deleteIntegration(id: number): Promise<void> {
    const result = await db
      .delete(integrations)
      .where(eq(integrations.id, id));
      
    if (!result) {
      throw this.notFoundError('Integration', id);
    }
  }

  // Subscription methods
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db
        .select({
          id: subscriptions.id,
          userId: subscriptions.userId,
          plan: subscriptions.plan,
          stripeCustomerId: subscriptions.stripeCustomerId,
          stripeSubscriptionId: subscriptions.stripeSubscriptionId,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt
        })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));
        
      return subscription;
    } catch (error) {
      console.error("Error in getSubscriptionByUserId:", error);
      return undefined;
    }
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    try {
      const [subscription] = await db
        .select({
          id: subscriptions.id,
          userId: subscriptions.userId,
          plan: subscriptions.plan,
          stripeCustomerId: subscriptions.stripeCustomerId,
          stripeSubscriptionId: subscriptions.stripeSubscriptionId,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt
        })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
        
      return subscription;
    } catch (error) {
      console.error("Error in getSubscriptionByStripeId:", error);
      return undefined;
    }
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    try {
      // Ensure proper typing and null handling
      const subscriptionToInsert = {
        userId: insertSubscription.userId,
        plan: insertSubscription.plan ?? "free", // Default plan
        status: insertSubscription.status ?? "active", // Default status
        stripeCustomerId: insertSubscription.stripeCustomerId ?? null,
        stripeSubscriptionId: insertSubscription.stripeSubscriptionId ?? null,
        currentPeriodStart: insertSubscription.currentPeriodStart ?? null,
        currentPeriodEnd: insertSubscription.currentPeriodEnd ?? null
      };
      
      // Use explicit column selection to avoid schema mismatch
      const [subscription] = await db
        .insert(subscriptions)
        .values(subscriptionToInsert)
        .returning({
          id: subscriptions.id,
          userId: subscriptions.userId,
          plan: subscriptions.plan,
          stripeCustomerId: subscriptions.stripeCustomerId,
          stripeSubscriptionId: subscriptions.stripeSubscriptionId,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt
        });
        
      return subscription;
    } catch (error) {
      console.error("Error in createSubscription:", error);
      throw error;
    }
  }

  async updateSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription> {
    try {
      // Create updated values without cancelAtPeriodEnd which isn't in the database yet
      const { cancelAtPeriodEnd, ...allowedUpdates } = subscriptionUpdate as any;
      
      const updatedValues = {
        ...allowedUpdates,
        updatedAt: new Date()
      };
      
      // Use explicit column selection for returning to avoid schema mismatch
      const [subscription] = await db
        .update(subscriptions)
        .set(updatedValues)
        .where(eq(subscriptions.id, id))
        .returning({
          id: subscriptions.id,
          userId: subscriptions.userId,
          plan: subscriptions.plan,
          stripeCustomerId: subscriptions.stripeCustomerId,
          stripeSubscriptionId: subscriptions.stripeSubscriptionId,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt
        });
        
      if (!subscription) {
        throw this.notFoundError('Subscription', id);
      }
      
      return subscription;
    } catch (error) {
      console.error("Error in updateSubscription:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();

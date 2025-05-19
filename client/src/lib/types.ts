// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  businessName?: string;
  role?: 'user' | 'admin';
  createdAt: string;
}

// Business Types
export interface Business {
  id: number;
  userId: number;
  businessName: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Hours of Operation Types
export interface HoursOfOperation {
  id: number;
  businessId: number;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime?: string;
  closeTime?: string;
  isOpen: boolean;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

// FAQ Types
export interface FAQ {
  id: number;
  businessId: number;
  question: string;
  answer: string;
}

// Call Types
export type CallStatus = 'completed' | 'in-progress' | 'missed' | 'transferred';

export interface Call {
  id: number;
  businessId: number;
  caller?: string;
  phone?: string;
  type?: string;
  startTime: string;
  endTime?: string;
  status: CallStatus;
  duration?: string;
  recording?: string;
  transcript?: string;
}

// Booking Types
export type BookingStatus = 'upcoming' | 'completed' | 'canceled';

export interface Booking {
  id: number;
  businessId: number;
  customer: string;
  phone?: string;
  email?: string;
  service: string;
  date: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

// Integration Types
export type IntegrationType = 'twilio' | 'eleven_labs' | 'n8n' | 'stripe' | 'email';
export type IntegrationStatus = 'active' | 'inactive' | 'error';

export interface Integration {
  id: number;
  businessId: number;
  type: IntegrationType;
  config: Record<string, any>;
  status: IntegrationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedIntegration {
  id: number;
  name: string;
  description: string;
  iconColor: string;
  status: IntegrationStatus;
  type: IntegrationType;
  config?: Record<string, any>;
}

// Subscription Types
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: number;
  userId: number;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCalls: number;
  monthlyBookings: number;
  monthlyRevenue: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed?: string;
}

// Notification Settings Types
export interface NotificationSettings {
  emailNotifications: boolean;
  bookingConfirmations: boolean;
  callNotifications: boolean;
  marketingEmails: boolean;
}

// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  pdf?: string;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

# Micro8gents Database Schema Documentation

This document provides a detailed overview of the Micro8gents database schema, including tables, relationships, and field descriptions.

## Overview

The Micro8gents platform uses PostgreSQL as its database, with Drizzle ORM for database operations. The schema is defined in `shared/schema.ts`.

## Tables

### users

Stores user authentication and profile information.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| username | varchar(255) | User's login name | Not Null, Unique |
| email | varchar(255) | User's email address | Not Null, Unique |
| password | varchar(255) | Hashed password | Not Null |
| businessName | varchar(255) | Optional business name | Nullable |
| createdAt | timestamp | When the user was created | Not Null, Default: now() |

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### businesses

Stores business details for registered users.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| userId | integer | Reference to users table | Not Null, Foreign Key |
| businessName | varchar(255) | Business name | Not Null |
| description | text | Business description | Nullable |
| address | varchar(255) | Business address | Nullable |
| city | varchar(100) | Business city | Nullable |
| state | varchar(100) | Business state or province | Nullable |
| zip | varchar(20) | Business postal code | Nullable |
| phone | varchar(20) | Business phone number | Nullable |
| email | varchar(255) | Business email | Not Null |
| website | varchar(255) | Business website URL | Nullable |
| createdAt | timestamp | When the business was created | Not Null, Default: now() |
| updatedAt | timestamp | When the business was last updated | Not Null, Default: now() |

```typescript
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  description: text("description"),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zip: varchar("zip", { length: 20 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### hours_of_operation

Stores business operating hours.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| businessId | integer | Reference to businesses table | Not Null, Foreign Key |
| dayOfWeek | varchar(20) | Day of the week | Not Null |
| openTime | varchar(20) | Opening time (HH:MM format) | Nullable |
| closeTime | varchar(20) | Closing time (HH:MM format) | Nullable |
| isOpen | boolean | Whether the business is open on this day | Not Null, Default: true |

```typescript
export const hoursOfOperation = pgTable("hours_of_operation", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
  openTime: varchar("open_time", { length: 20 }),
  closeTime: varchar("close_time", { length: 20 }),
  isOpen: boolean("is_open").default(true).notNull(),
});
```

### faqs

Stores frequently asked questions for a business.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| businessId | integer | Reference to businesses table | Not Null, Foreign Key |
| question | text | FAQ question | Not Null |
| answer | text | FAQ answer | Not Null |

```typescript
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});
```

### calls

Stores call logs and transcripts.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| businessId | integer | Reference to businesses table | Not Null, Foreign Key |
| caller | varchar(100) | Caller's name | Nullable |
| phone | varchar(20) | Caller's phone number | Nullable |
| type | varchar(50) | Call type classification | Nullable |
| startTime | timestamp | When the call started | Not Null, Default: now() |
| endTime | timestamp | When the call ended | Nullable |
| status | enum | Call status (completed, in-progress, missed, transferred) | Not Null |
| duration | varchar(20) | Call duration in minutes:seconds | Nullable |
| recording | text | URL or ID of call recording | Nullable |
| transcript | text | Call transcript | Nullable |

```typescript
export const callStatusEnum = pgEnum('call_status', [
  'completed', 'in-progress', 'missed', 'transferred'
]);

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  caller: varchar("caller", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  type: varchar("type", { length: 50 }),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  status: callStatusEnum("status").notNull(),
  duration: varchar("duration", { length: 20 }),
  recording: text("recording"),
  transcript: text("transcript"),
});
```

### bookings

Stores customer appointment bookings.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| businessId | integer | Reference to businesses table | Not Null, Foreign Key |
| customer | varchar(100) | Customer's name | Not Null |
| phone | varchar(20) | Customer's phone number | Nullable |
| email | varchar(255) | Customer's email | Nullable |
| service | varchar(100) | Service being booked | Not Null |
| date | timestamp | Appointment date and time | Not Null |
| status | enum | Booking status (upcoming, completed, canceled) | Not Null |
| notes | text | Additional booking notes | Nullable |
| createdAt | timestamp | When the booking was created | Not Null, Default: now() |

```typescript
export const bookingStatusEnum = pgEnum('booking_status', [
  'upcoming', 'completed', 'canceled'
]);

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  customer: varchar("customer", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  service: varchar("service", { length: 100 }).notNull(),
  date: timestamp("date").notNull(),
  status: bookingStatusEnum("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### integrations

Stores external service integration configurations.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| businessId | integer | Reference to businesses table | Not Null, Foreign Key |
| type | varchar(50) | Integration type (twilio, eleven_labs, n8n, stripe, email) | Not Null |
| config | jsonb | Integration configuration (API keys, etc.) | Not Null |
| status | varchar(20) | Integration status (active, inactive, error) | Not Null |
| createdAt | timestamp | When the integration was created | Not Null, Default: now() |
| updatedAt | timestamp | When the integration was last updated | Not Null, Default: now() |

```typescript
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull().references(() => businesses.id),
  type: varchar("type", { length: 50 }).notNull(),
  config: jsonb("config").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### subscriptions

Stores user subscription plans and status.

| Column | Type | Description | Constraints |
|--------|------|-------------|------------|
| id | serial | Primary key | Primary Key, Auto-increment |
| userId | integer | Reference to users table | Not Null, Foreign Key |
| plan | enum | Subscription plan (free, basic, premium, enterprise) | Not Null |
| stripeCustomerId | varchar(100) | Stripe customer ID | Nullable |
| stripeSubscriptionId | varchar(100) | Stripe subscription ID | Nullable |
| status | varchar(20) | Subscription status (active, canceled, past_due, trialing) | Not Null |
| currentPeriodStart | timestamp | Start of current billing period | Nullable |
| currentPeriodEnd | timestamp | End of current billing period | Nullable |
| createdAt | timestamp | When the subscription was created | Not Null, Default: now() |
| updatedAt | timestamp | When the subscription was last updated | Not Null, Default: now() |

```typescript
export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'free', 'basic', 'premium', 'enterprise'
]);

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plan: subscriptionPlanEnum("plan").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

## Relationships

The database schema includes the following relationships:

1. **One-to-One Relationships**:
   - A user has one business
   - A user has one subscription

2. **One-to-Many Relationships**:
   - A business has many hours of operation
   - A business has many FAQs
   - A business has many calls
   - A business has many bookings
   - A business has many integrations

## Type Definitions

For each table, the schema also defines TypeScript types for both select and insert operations:

```typescript
// User types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Business types
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

// Hours of operation types
export type HoursOfOperation = typeof hoursOfOperation.$inferSelect;
export type InsertHours = z.infer<typeof insertHoursSchema>;

// FAQ types
export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;

// Call types
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;

// Booking types
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Integration types
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

// Subscription types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
```

## Migrations

Database schema changes are managed through Drizzle's schema migration tools. To apply schema changes to the database, run:

```bash
npm run db:push
```

This command uses Drizzle Kit to push schema changes directly to the database.

## Best Practices

1. **Referential Integrity**: All foreign key relationships are properly defined to maintain data integrity.
2. **Timestamps**: All tables include appropriate timestamp fields for audit and tracking purposes.
3. **Nullability**: Fields are marked as nullable or not null based on business requirements.
4. **Enums**: Enum types are used for fields with a fixed set of valid values.
5. **JSON Storage**: Complex configuration data is stored in JSONB columns for flexibility.
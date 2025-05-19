# Micro8gents API Documentation

This document provides detailed information about the RESTful API endpoints available in the Micro8gents platform. Use this as a reference for integrating with the backend services.

## Base URL

All API endpoints are relative to:

```
/api
```

## Authentication

Most endpoints require authentication. Requests to protected endpoints without a valid session will return a `401 Unauthorized` response.

### Authentication Endpoints

#### Register a new user

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "businessName": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "businessName": "string",
  "createdAt": "string"
}
```

**Status Codes:**
- `201 Created`: User successfully registered
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Username or email already exists

#### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "businessName": "string",
  "createdAt": "string"
}
```

**Status Codes:**
- `200 OK`: User successfully logged in
- `401 Unauthorized`: Invalid credentials

#### Logout

```
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200 OK`: User successfully logged out

#### Get Current User

```
GET /api/auth/me
```

**Response:**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "businessName": "string",
  "createdAt": "string"
}
```

**Status Codes:**
- `200 OK`: User information returned
- `401 Unauthorized`: Not authenticated

## Business Management

### Business Information

#### Get Business Information

```
GET /api/business/info
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "businessName": "string",
  "description": "string|null",
  "address": "string|null",
  "city": "string|null",
  "state": "string|null",
  "zip": "string|null",
  "phone": "string|null",
  "email": "string",
  "website": "string|null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200 OK`: Business information returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Business information not found

#### Update Business Information

```
PUT /api/business/info
```

**Request Body:**
```json
{
  "businessName": "string",
  "description": "string|null",
  "address": "string|null",
  "city": "string|null",
  "state": "string|null",
  "zip": "string|null",
  "phone": "string|null",
  "email": "string",
  "website": "string|null"
}
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "businessName": "string",
  "description": "string|null",
  "address": "string|null",
  "city": "string|null",
  "state": "string|null",
  "zip": "string|null",
  "phone": "string|null",
  "email": "string",
  "website": "string|null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200 OK`: Business information updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Hours of Operation

#### Get Hours of Operation

```
GET /api/business/hours
```

**Response:**
```json
{
  "monday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "tuesday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "wednesday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "thursday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "friday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "saturday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "sunday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  }
}
```

**Status Codes:**
- `200 OK`: Hours of operation returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Hours of operation not found

#### Update Hours of Operation

```
PUT /api/business/hours
```

**Request Body:**
```json
{
  "monday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "tuesday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "wednesday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "thursday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "friday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "saturday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  },
  "sunday": {
    "open": "string",
    "close": "string",
    "isOpen": "boolean"
  }
}
```

**Response:**
```json
{
  "message": "Hours of operation updated successfully"
}
```

**Status Codes:**
- `200 OK`: Hours of operation updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### FAQs

#### Get FAQs

```
GET /api/business/faqs
```

**Response:**
```json
{
  "faqs": [
    {
      "id": "number",
      "businessId": "number",
      "question": "string",
      "answer": "string"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: FAQs returned
- `401 Unauthorized`: Not authenticated

#### Update FAQs

```
PUT /api/business/faqs
```

**Request Body:**
```json
{
  "faqs": [
    {
      "id": "number|null",
      "question": "string",
      "answer": "string"
    }
  ]
}
```

**Response:**
```json
{
  "message": "FAQs updated successfully"
}
```

**Status Codes:**
- `200 OK`: FAQs updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

## Call Management

### Get Calls

```
GET /api/calls
```

**Response:**
```json
[
  {
    "id": "number",
    "businessId": "number",
    "caller": "string|null",
    "phone": "string|null",
    "type": "string|null",
    "startTime": "string",
    "endTime": "string|null",
    "status": "completed|in-progress|missed|transferred",
    "duration": "string",
    "recording": "string|null",
    "transcript": "string|null"
  }
]
```

**Status Codes:**
- `200 OK`: Calls returned
- `401 Unauthorized`: Not authenticated

### Get Call by ID

```
GET /api/calls/:id
```

**Path Parameters:**
- `id`: Call ID

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "caller": "string|null",
  "phone": "string|null",
  "type": "string|null",
  "startTime": "string",
  "endTime": "string|null",
  "status": "completed|in-progress|missed|transferred",
  "duration": "string",
  "recording": "string|null",
  "transcript": "string|null"
}
```

**Status Codes:**
- `200 OK`: Call returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Call not found

### Create Call

```
POST /api/calls
```

**Request Body:**
```json
{
  "caller": "string|null",
  "phone": "string|null",
  "type": "string|null",
  "status": "completed|in-progress|missed|transferred",
  "duration": "string|null",
  "recording": "string|null",
  "transcript": "string|null"
}
```

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "caller": "string|null",
  "phone": "string|null",
  "type": "string|null",
  "startTime": "string",
  "endTime": "string|null",
  "status": "completed|in-progress|missed|transferred",
  "duration": "string",
  "recording": "string|null",
  "transcript": "string|null"
}
```

**Status Codes:**
- `201 Created`: Call created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Get Dashboard Stats

```
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalCalls": "number",
  "monthlyBookings": "number",
  "monthlyRevenue": "string"
}
```

**Status Codes:**
- `200 OK`: Dashboard stats returned
- `401 Unauthorized`: Not authenticated

## Booking Management

### Get Bookings

```
GET /api/bookings
```

**Response:**
```json
[
  {
    "id": "number",
    "businessId": "number",
    "customer": "string",
    "phone": "string|null",
    "email": "string|null",
    "service": "string",
    "date": "string",
    "status": "upcoming|completed|canceled",
    "notes": "string|null",
    "createdAt": "string"
  }
]
```

**Status Codes:**
- `200 OK`: Bookings returned
- `401 Unauthorized`: Not authenticated

### Get Booking by ID

```
GET /api/bookings/:id
```

**Path Parameters:**
- `id`: Booking ID

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "customer": "string",
  "phone": "string|null",
  "email": "string|null",
  "service": "string",
  "date": "string",
  "status": "upcoming|completed|canceled",
  "notes": "string|null",
  "createdAt": "string"
}
```

**Status Codes:**
- `200 OK`: Booking returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Booking not found

### Create Booking

```
POST /api/bookings
```

**Request Body:**
```json
{
  "customer": "string",
  "phone": "string|null",
  "email": "string|null",
  "service": "string",
  "date": "string",
  "status": "upcoming|completed|canceled",
  "notes": "string|null"
}
```

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "customer": "string",
  "phone": "string|null",
  "email": "string|null",
  "service": "string",
  "date": "string",
  "status": "upcoming|completed|canceled",
  "notes": "string|null",
  "createdAt": "string"
}
```

**Status Codes:**
- `201 Created`: Booking created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Update Booking

```
PUT /api/bookings/:id
```

**Path Parameters:**
- `id`: Booking ID

**Request Body:**
```json
{
  "customer": "string",
  "phone": "string|null",
  "email": "string|null",
  "service": "string",
  "date": "string",
  "status": "upcoming|completed|canceled",
  "notes": "string|null"
}
```

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "customer": "string",
  "phone": "string|null",
  "email": "string|null",
  "service": "string",
  "date": "string",
  "status": "upcoming|completed|canceled",
  "notes": "string|null",
  "createdAt": "string"
}
```

**Status Codes:**
- `200 OK`: Booking updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Booking not found

### Delete Booking

```
DELETE /api/bookings/:id
```

**Path Parameters:**
- `id`: Booking ID

**Response:**
```json
{
  "message": "Booking deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Booking deleted
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Booking not found

## Integration Management

### Get Integrations

```
GET /api/integrations
```

**Response:**
```json
[
  {
    "id": "number",
    "businessId": "number",
    "type": "twilio|eleven_labs|n8n|stripe|email",
    "config": "object",
    "status": "active|inactive|error",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

**Status Codes:**
- `200 OK`: Integrations returned
- `401 Unauthorized`: Not authenticated

### Create Integration

```
POST /api/integrations
```

**Request Body:**
```json
{
  "type": "twilio|eleven_labs|n8n|stripe|email",
  "config": "object",
  "status": "active|inactive|error"
}
```

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "type": "twilio|eleven_labs|n8n|stripe|email",
  "config": "object",
  "status": "active|inactive|error",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `201 Created`: Integration created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Update Integration

```
PUT /api/integrations/:id
```

**Path Parameters:**
- `id`: Integration ID

**Request Body:**
```json
{
  "config": "object",
  "status": "active|inactive|error"
}
```

**Response:**
```json
{
  "id": "number",
  "businessId": "number",
  "type": "twilio|eleven_labs|n8n|stripe|email",
  "config": "object",
  "status": "active|inactive|error",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200 OK`: Integration updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Integration not found

### Delete Integration

```
DELETE /api/integrations/:id
```

**Path Parameters:**
- `id`: Integration ID

**Response:**
```json
{
  "message": "Integration deleted successfully"
}
```

**Status Codes:**
- `200 OK`: Integration deleted
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Integration not found

## Subscription Management

### Get Current Subscription

```
GET /api/subscriptions/current
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "plan": "free|basic|premium|enterprise",
  "stripeCustomerId": "string|null",
  "stripeSubscriptionId": "string|null",
  "status": "active|canceled|past_due|trialing",
  "currentPeriodStart": "string|null",
  "currentPeriodEnd": "string|null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200 OK`: Subscription returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Subscription not found

### Create Subscription

```
POST /api/subscriptions
```

**Request Body:**
```json
{
  "plan": "free|basic|premium|enterprise"
}
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "plan": "free|basic|premium|enterprise",
  "stripeCustomerId": "string|null",
  "stripeSubscriptionId": "string|null",
  "status": "active|canceled|past_due|trialing",
  "currentPeriodStart": "string|null",
  "currentPeriodEnd": "string|null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `201 Created`: Subscription created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Update Subscription

```
PUT /api/subscriptions/:id
```

**Path Parameters:**
- `id`: Subscription ID

**Request Body:**
```json
{
  "plan": "free|basic|premium|enterprise"
}
```

**Response:**
```json
{
  "id": "number",
  "userId": "number",
  "plan": "free|basic|premium|enterprise",
  "stripeCustomerId": "string|null",
  "stripeSubscriptionId": "string|null",
  "status": "active|canceled|past_due|trialing",
  "currentPeriodStart": "string|null",
  "currentPeriodEnd": "string|null",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Status Codes:**
- `200 OK`: Subscription updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Subscription not found

### Create Checkout Session

```
POST /api/subscriptions/checkout
```

**Request Body:**
```json
{
  "plan": "basic|premium|enterprise",
  "successUrl": "string",
  "cancelUrl": "string"
}
```

**Response:**
```json
{
  "sessionId": "string",
  "url": "string"
}
```

**Status Codes:**
- `200 OK`: Checkout session created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated

### Create Billing Portal Session

```
POST /api/subscriptions/billing-portal
```

**Request Body:**
```json
{
  "returnUrl": "string"
}
```

**Response:**
```json
{
  "url": "string"
}
```

**Status Codes:**
- `200 OK`: Billing portal session created
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Stripe customer not found

## Webhook Endpoints

### Stripe Webhook

```
POST /api/webhooks/stripe
```

This endpoint handles Stripe webhook events, including:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Status Codes:**
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid webhook signature or event type

### Twilio Webhook

```
POST /api/webhooks/twilio
```

This endpoint handles Twilio webhook events for voice calls.

**Status Codes:**
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid webhook request

### n8n Webhook

```
POST /api/webhooks/n8n
```

This endpoint handles n8n webhook events for automation workflows.

**Status Codes:**
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid webhook request

## Error Responses

All API endpoints return standardized error responses in the following format:

```json
{
  "message": "Error message",
  "errors": {
    "field1": ["Error message for field1"],
    "field2": ["Error message for field2"]
  }
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are subject to rate limiting to prevent abuse. The current limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

Rate limit headers are included in all API responses:
- `X-RateLimit-Limit`: The maximum number of requests allowed in the current time window
- `X-RateLimit-Remaining`: The number of requests remaining in the current time window
- `X-RateLimit-Reset`: The time when the current rate limit window resets, in Unix timestamp format

When a rate limit is exceeded, a `429 Too Many Requests` response is returned.
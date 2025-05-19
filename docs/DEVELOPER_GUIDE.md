# Micro8gents Developer Documentation

## Project Overview

Micro8gents is an AI Voice Assistant platform for Small and Medium Enterprises (SMEs) that enables advanced communication automation through cutting-edge integrations. The platform provides businesses with tools to automate customer interactions, manage appointments, track calls, and analyze business metrics.

## Tech Stack

- **Frontend**: React with TypeScript, Vite, TanStack React Query, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: Session-based with Passport.js
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for client-side routing
- **Payments**: Stripe integration
- **External Services**: 
  - Twilio for communication
  - ElevenLabs for text-to-speech
  - n8n for workflow automation

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and types
│   │   ├── pages/         # Page components corresponding to routes
│   │   ├── App.tsx        # Main application component and routing
│   │   └── main.tsx       # Entry point for React application
├── server/                # Backend Express application
│   ├── controllers/       # Request handlers grouped by resource
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic for external services
│   ├── db.ts              # Database connection setup
│   ├── index.ts           # Express server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   └── vite.ts            # Vite integration for development
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and TypeScript types
└── docs/                  # Project documentation
```

## Database Schema

The database schema is defined in `shared/schema.ts` using Drizzle ORM. The schema includes the following tables:

1. **users**: User authentication and profile information
2. **businesses**: Business details associated with users
3. **hours_of_operation**: Business operating hours
4. **faqs**: Frequently asked questions for a business
5. **calls**: Call logs and transcripts
6. **bookings**: Customer appointment bookings
7. **integrations**: External service integrations
8. **subscriptions**: User subscription plans and status

## Authentication Flow

1. **Registration**:
   - Client: `client/src/pages/auth/register.tsx`
   - Server: `server/controllers/auth.ts` - `register` function
   - User data is validated, password is hashed, and user is stored in the database

2. **Login**:
   - Client: `client/src/pages/auth/login.tsx`
   - Server: `server/controllers/auth.ts` - `login` function
   - Credentials are validated, session is created using Express session

3. **Session Management**:
   - Authentication status is checked via `server/middleware/auth.ts`
   - Client checks auth status with `client/src/lib/auth.ts` - `isAuthenticated` function

## Key Features and Implementations

### Business Setup

Located in `client/src/pages/business-setup/index.tsx`, this section allows users to:

1. Set up general business information
2. Configure hours of operation
3. Create FAQs for their business

The implementation uses React Hook Form with Zod validation and React Query for data fetching and cache management.

```typescript
// Example of React Query implementation
const { data: businessInfo, isLoading: isLoadingBusiness } = useQuery({
  queryKey: ['/api/business/info'],
  refetchOnWindowFocus: false,
})

// Form submission with mutation
const businessMutation = useMutation({
  mutationFn: (data: BusinessInfoValues) => 
    apiRequest('/api/business/info', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/business/info'] });
    toast({
      title: "Business information updated",
      description: "Your business information has been saved.",
    })
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: "Failed to update business information. Please try again.",
      variant: "destructive",
    })
  }
})
```

### Call Management

Call management is handled through:

1. **Twilio Integration**: `server/services/twilio.ts` - Manages incoming/outgoing calls
2. **Call Logging**: `server/controllers/calls.ts` - Records call details and transcripts
3. **UI Display**: `client/src/pages/call-logs/index.tsx` - Displays call history and details

### Booking System

The booking system allows customers to schedule appointments:

1. **Booking Creation**: `server/controllers/bookings.ts` - Creates and manages bookings
2. **UI Implementation**: `client/src/pages/bookings/index.tsx` - Displays and manages bookings

### Dashboard

The dashboard displays key business metrics:

1. **Data Aggregation**: `server/controllers/calls.ts` - `getDashboardStats` function
2. **UI Implementation**: `client/src/pages/dashboard/index.tsx` - Visual representation of metrics

### Subscription Management

Stripe integration for managing subscription plans:

1. **Stripe Service**: `server/services/stripe.ts` - Handles Stripe API interactions
2. **Subscription Controller**: `server/controllers/subscriptions.ts` - Manages subscription logic
3. **UI Implementation**: `client/src/pages/subscription/index.tsx` - Displays and manages plans

## Data Flow

1. **Frontend Request**: API requests are made using React Query's `useQuery` and `useMutation` hooks
2. **API Routes**: Defined in `server/routes.ts`, they map to controller functions
3. **Controllers**: Process requests, validate data, and interact with storage
4. **Storage Layer**: `server/storage.ts` - Handles database operations through Drizzle ORM
5. **Response**: Data is returned to the frontend and cached with React Query

## Error Handling

1. **Frontend**: React Query's error handling with toast notifications
2. **Backend**: Express middleware for error handling in `server/index.ts`
3. **Form Validation**: Zod schemas validate form input before submission

## Adding New Features

When adding new features, follow these steps:

1. **Update Schema**: Add new tables or fields to `shared/schema.ts`
2. **Storage Interface**: Extend `IStorage` in `server/storage.ts` with new methods
3. **Controller Logic**: Add controller functions in the appropriate file in `server/controllers/`
4. **API Routes**: Register new routes in `server/routes.ts`
5. **UI Components**: Create React components in `client/src/components/`
6. **Pages**: Add new pages in `client/src/pages/` and register in `App.tsx`
7. **Data Fetching**: Use React Query for API integration

## Environment Configuration

The application uses environment variables for configuration:

- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Stripe**: `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` for payments
- **External Services**: Keys for Twilio, ElevenLabs, and n8n

## Development Workflow

1. **Start the Application**: Run `npm run dev` to start both frontend and backend
2. **Database Migrations**: Run `npm run db:push` after schema changes
3. **Testing**: Test API endpoints with curl or Postman before integrating with frontend

## Common Patterns

### Form Implementation

```typescript
// 1. Define Zod schema
const formSchema = z.object({
  field: z.string().min(1, "Field is required"),
});

// 2. Create form with React Hook Form
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    field: "",
  },
});

// 3. Handle submission
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    // API request
  } catch (error) {
    // Error handling
  }
};

// 4. Render form
return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  </Form>
);
```

### API Requests

```typescript
// Query for fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/resource'],
  refetchOnWindowFocus: false,
});

// Mutation for modifying data
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/resource', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
    // Success handling
  },
  onError: (error) => {
    // Error handling
  }
});
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check session configuration and middleware
2. **Database Connectivity**: Verify `DATABASE_URL` and database status
3. **API Errors**: Check network tab for response details and server logs
4. **Form Validation**: Inspect `form.formState.errors` for validation issues
5. **React Query**: Ensure proper query keys and cache invalidation

### Debugging Tips

1. Use browser developer tools for frontend issues
2. Check server logs for backend errors
3. Validate data at each step in the flow (client → API → storage)
4. Use React Query DevTools in development for query debugging

## Performance Considerations

1. **Data Fetching**: Use proper cache settings in React Query
2. **Pagination**: Implement for large data sets
3. **Bundle Size**: Minimize imports and use code splitting
4. **Database Queries**: Use indexes for frequently queried fields

## Security Best Practices

1. **Authentication**: Always verify user sessions for protected routes
2. **Data Validation**: Validate all inputs on both client and server
3. **CSRF Protection**: Express session includes CSRF protection
4. **Sensitive Data**: Never expose sensitive keys in frontend code
5. **API Limits**: Implement rate limiting for API endpoints

## Deployment

The application is deployed through Replit Deployments, which handles:

1. Building the application
2. Setting up the hosting environment
3. Configuring TLS for secure connections
4. Setting up health checks

## Contributing Guidelines

1. Follow the established code style and patterns
2. Use TypeScript types for all variables and functions
3. Document complex functions and components
4. Write tests for critical functionality
5. Validate form inputs with Zod schemas
6. Use React Query for all API interactions
7. Update documentation when adding new features
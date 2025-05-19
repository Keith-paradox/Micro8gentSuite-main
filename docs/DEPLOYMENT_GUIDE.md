# Micro8gents Deployment Guide

This guide provides instructions for deploying the Micro8gents platform to production environments.

## Prerequisites

Before deploying, ensure you have the following:

1. Access to a PostgreSQL database
2. Required environment variables configured
3. Stripe account (for payment processing)
4. Twilio account (for communication features)
5. ElevenLabs account (for text-to-speech)
6. n8n instance (for workflow automation)

## Environment Variables

The following environment variables must be configured:

### Core Configuration
- `NODE_ENV`: Set to `production` for production environments
- `PORT`: The port the server will listen on (defaults to 5000 if not specified)
- `SESSION_SECRET`: Long, random string for securing session cookies

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string

### Stripe Configuration
- `STRIPE_SECRET_KEY`: Your Stripe API secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe API publishable key
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook events

### Twilio Configuration
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### ElevenLabs Configuration
- `ELEVEN_LABS_API_KEY`: Your ElevenLabs API key

### n8n Configuration
- `N8N_WEBHOOK_URL`: URL for triggering n8n workflows

## Deployment Options

### Replit Deployment

The easiest way to deploy Micro8gents is through Replit's built-in deployment feature:

1. Click the "Deploy" button in the Replit interface
2. Replit will handle the building and deployment process
3. Your app will be hosted under a `.replit.app` domain

### Custom Server Deployment

To deploy to your own server:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/micro8gents.git
   cd micro8gents
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Set up environment variables**:
   Create a `.env` file in the root directory with the required environment variables.

5. **Start the production server**:
   ```bash
   npm run start
   ```

### Docker Deployment

For containerized deployment:

1. **Build the Docker image**:
   ```bash
   docker build -t micro8gents .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 --env-file .env micro8gents
   ```

## Database Setup

### Initialize the Database

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable to your database connection string
3. Run database migrations:
   ```bash
   npm run db:push
   ```

## External Service Setup

### Stripe Integration

1. Create a Stripe account at https://stripe.com
2. Obtain your API keys from the Stripe Dashboard
3. Configure webhook endpoints in the Stripe Dashboard:
   - Add a webhook endpoint with URL: `https://your-domain.com/api/webhooks/stripe`
   - Subscribe to the following events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Set the Stripe environment variables in your deployment environment

### Twilio Integration

1. Create a Twilio account at https://twilio.com
2. Purchase a phone number
3. Set up a TwiML App
4. Configure webhook endpoints:
   - Voice URL: `https://your-domain.com/api/webhooks/twilio`
5. Set the Twilio environment variables in your deployment environment

### ElevenLabs Integration

1. Create an ElevenLabs account at https://elevenlabs.io
2. Obtain your API key
3. Set the ElevenLabs environment variable in your deployment environment

### n8n Integration

1. Set up an n8n instance
2. Create workflows for call handling, booking management, and reporting
3. Configure webhook nodes with URLs that point to your Micro8gents instance
4. Set the n8n webhook URL environment variable in your deployment environment

## SSL Configuration

For production deployments, SSL is essential:

1. **Using Replit**: SSL is automatically configured
2. **Custom server**:
   - Use a reverse proxy like Nginx with Let's Encrypt
   - Configure your server to redirect HTTP to HTTPS

## Monitoring and Logging

### Application Logs

The application uses a structured logging system:

1. **Production logs**: In production, logs are formatted as JSON for easier parsing
2. **Log levels**: Configure the appropriate log level (`error`, `warn`, `info`, `debug`)

### Error Monitoring

Consider integrating an error monitoring service:

1. **Sentry**: For real-time error tracking
2. **LogRocket**: For session replay and debugging

## Performance Optimization

### Database Indexing

Ensure the following indexes are created for optimal performance:

1. Index on `users.username` and `users.email` (already created by unique constraints)
2. Index on `calls.businessId` for faster call lookups
3. Index on `bookings.businessId` and `bookings.date` for appointment queries
4. Index on `businesses.userId` for quick business lookup by user

### Caching

Implement caching for frequently accessed data:

1. **API responses**: Use HTTP caching headers
2. **Database queries**: Consider adding a Redis cache layer

## Backup and Recovery

### Database Backups

Implement a regular backup strategy:

1. **Automated backups**: Schedule daily database backups
2. **Offsite storage**: Store backups in a separate location
3. **Retention policy**: Define how long backups are kept

### Disaster Recovery

Prepare a disaster recovery plan:

1. **Recovery procedures**: Document steps to restore from backups
2. **Testing**: Regularly test the recovery process

## Security Considerations

### Authentication and Authorization

1. **Session management**: Sessions expire after 24 hours of inactivity
2. **Password security**: Passwords are hashed using bcrypt
3. **Role-based access**: Endpoints check for appropriate user permissions

### Data Protection

1. **Sensitive data**: API keys and secrets are never exposed to the client
2. **HTTPS**: All communication is encrypted using TLS
3. **CORS**: Cross-Origin Resource Sharing is properly configured

### API Rate Limiting

To prevent abuse, API endpoints are rate-limited:

1. **Authenticated users**: 100 requests per minute
2. **Unauthenticated users**: 20 requests per minute

## Maintenance

### Updates and Patches

1. **Dependencies**: Regularly update npm dependencies
2. **Security patches**: Promptly apply security updates

### Downtime Planning

When planning maintenance that requires downtime:

1. **Scheduled maintenance**: Plan maintenance during low-traffic periods
2. **Notifications**: Notify users in advance
3. **Status page**: Provide a status page for updates

## Troubleshooting

### Common Issues

1. **Connection errors**: Check database connectivity and credentials
2. **Webhook failures**: Verify webhook URLs and secrets
3. **Payment processing issues**: Confirm Stripe configuration

### Support Resources

1. **Documentation**: Refer to the developer documentation
2. **Issue tracking**: Use GitHub Issues for bug reporting
3. **Support email**: Contact support@micro8gents.com for assistance

## Post-Deployment Verification

After deployment, verify the following:

1. **Authentication**: Test user registration and login
2. **Business setup**: Verify business profile creation and updating
3. **Booking system**: Test creating and managing bookings
4. **Call logs**: Check call logging functionality
5. **Subscription management**: Verify payment processing
6. **External integrations**: Test Twilio, ElevenLabs, and n8n integrations

## Scaling

As your user base grows, consider these scaling strategies:

1. **Horizontal scaling**: Deploy multiple application instances behind a load balancer
2. **Database scaling**: Consider read replicas or sharding for database scaling
3. **Caching layer**: Implement Redis for caching frequently accessed data
4. **CDN**: Use a Content Delivery Network for static assets

## Conclusion

Following this deployment guide will help ensure a smooth, secure, and performant deployment of the Micro8gents platform. For any additional assistance, refer to the developer documentation or contact the support team.
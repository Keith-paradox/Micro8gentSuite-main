# Micro8gents

![Micro8gents Logo](generated-icon.png)

## AI Voice Assistant Platform for Small and Medium Enterprises

Micro8gents is an innovative AI Voice Assistant platform designed specifically for Small and Medium Enterprises (SMEs), enabling advanced communication automation through cutting-edge integrations.

## Features

- 🤖 **AI-Powered Voice Assistant**: Automate customer interactions with natural language processing
- 📞 **Call Management**: Log, record, and analyze phone conversations
- 📅 **Booking System**: Manage customer appointments efficiently
- 📊 **Analytics Dashboard**: Track business metrics and performance
- 🔌 **Integration Hub**: Connect with popular business tools and services
- 💼 **Business Profile**: Manage business information and operating hours
- 💰 **Subscription Management**: Flexible plans with Stripe integration

## Tech Stack

- **Frontend**: React, TypeScript, TanStack React Query, Shadcn UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Express Session
- **Integrations**:
  - Twilio for communication
  - ElevenLabs for text-to-speech
  - n8n for workflow automation
  - Stripe for payment processing

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/micro8gents.git
   cd micro8gents
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/micro8gents
   SESSION_SECRET=your-session-secret
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Documentation

Comprehensive documentation is available in the `docs` directory:

- [Developer Guide](docs/DEVELOPER_GUIDE.md): Detailed guide for developers working on the project
- [API Documentation](docs/API_DOCUMENTATION.md): API endpoints and usage
- [Database Schema](docs/DATABASE_SCHEMA.md): Database structure and relationships
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md): Instructions for deploying to production

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and types
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Entry point
├── server/                # Backend Express application
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── db.ts              # Database connection
│   ├── index.ts           # Express server entry point
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data access layer
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
└── docs/                  # Documentation
```

## Key Workflows

### Authentication

- User registration and login
- Session management
- Password reset

### Business Setup

- Configure business details
- Set operating hours
- Define FAQs

### Call Management

- Log incoming calls
- Record and transcribe conversations
- Categorize calls

### Booking System

- Manage customer appointments
- Send automated reminders
- Track booking status

### Subscription Management

- Flexible subscription plans
- Secure payment processing
- Billing portal access

## Deployment

Micro8gents can be deployed using Replit Deployments:

1. Click the "Deploy" button in the Replit interface
2. Replit handles the build and deployment process
3. Your application will be accessible via a `.replit.app` domain

For custom server deployment, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Replit](https://replit.com) for the development environment
- [Shadcn UI](https://ui.shadcn.com) for the component library
- [Drizzle ORM](https://orm.drizzle.team) for the database ORM
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Twilio](https://twilio.com) for communication APIs
- [ElevenLabs](https://elevenlabs.io) for text-to-speech
- [n8n](https://n8n.io) for workflow automation
- [Stripe](https://stripe.com) for payment processing
# Service Connect

A mobile app that connects customers with local service businesses through AI-powered problem identification and voice interactions.

## Features

### Customer Interface
- 📸 **Camera Capture**: Take photos of maintenance problems
- 🤖 **AI Analysis**: OpenAI Vision identifies the issue and urgency
- 💬 **Voice/Chat**: Describe details and schedule appointments (coming soon)
- 🏢 **Business Matching**: Find nearby service providers
- 📅 **Calendar Integration**: Auto-sync appointments (coming soon)

### Business Interface
- 📬 **Request Inbox**: Uber-style card interface for new requests
- ✅ **Accept/Decline**: One-tap actions for incoming requests
- 📞 **Quick Contact**: Call or message customers directly
- 📊 **Active Jobs**: Track ongoing work (coming soon)
- 🗓️ **Calendar View**: See all appointments (coming soon)

## Tech Stack

- **Frontend**: React Native (Expo)
- **Authentication**: Clerk (phone/email + organizations)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Storage**: Supabase Storage
- **AI Vision**: OpenAI GPT-4o
- **Navigation**: React Navigation

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up services** (see [SETUP.md](./SETUP.md))
   - Clerk account + publishable key
   - Supabase project + database schema
   - OpenAI API key

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in your API keys
   ```

4. **Run the app**
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

## Image Optimization

All photos are automatically optimized:
- **Size**: Resized to max 1280px width
- **Quality**: 80% JPEG compression
- **Result**: ~200-400KB uploads (vs 2-5MB raw)

Perfect for AI analysis and mobile bandwidth!

## Interface Routing

The app automatically detects user type:
- **Personal Clerk account** → Customer Interface
- **Clerk Organization member** → Business Interface

## Current Implementation Status

✅ **Completed**
- Expo project setup with TypeScript
- Clerk authentication integration
- Dual interface routing (Customer/Business)
- Camera screen with permissions
- Image compression (1280px, 80% quality)
- Photo upload to Supabase Storage
- OpenAI Vision analysis
- Problem categorization and urgency detection
- Business request inbox with real-time updates
- Request detail view with Accept/Decline
- Supabase database schema

🚧 **In Progress / Next Steps**
- Appointment details form/chat screen
- Text chat with OpenAI for appointment scheduling
- Voice-to-text input integration
- Business matching algorithm (distance-based)
- ACI MCP email outreach for unmatched areas
- Calendar integration (ACI.dev)
- Push notifications
- Active jobs screen
- Calendar view screen

## Database Schema

See [supabase-schema.sql](./supabase-schema.sql) for the complete schema.

**Tables:**
- `customers` - Customer profiles (Clerk user IDs)
- `businesses` - Business profiles (Clerk organization IDs)
- `service_requests` - Service requests with AI analysis

**Key Features:**
- PostGIS for geolocation and distance queries
- Row-level security (RLS) policies
- Real-time subscriptions for instant updates
- Helper functions for business matching

## Project Structure

```
service-connect/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   │   ├── customer/        # Customer interface
│   │   ├── business/        # Business interface
│   │   └── auth/            # Authentication
│   ├── navigation/          # App routing
│   ├── services/            # API integrations
│   ├── types/               # TypeScript types
│   └── utils/               # Helper functions
├── App.tsx                  # Entry point
├── supabase-schema.sql      # Database schema
├── SETUP.md                 # Detailed setup guide
└── README.md               # This file
```

## Development

```bash
# Start dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests (coming soon)
npm test
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

## Documentation

- [SETUP.md](./SETUP.md) - Complete setup guide
- [supabase-schema.sql](./supabase-schema.sql) - Database schema

## Architecture Decisions

### Why Supabase?
- Real-time database (instant inbox updates for businesses)
- Built-in storage (no need for separate S3)
- PostGIS support (geolocation queries)
- RLS for security

### Why Clerk?
- Native mobile support
- Built-in organizations (perfect for businesses)
- Easy phone authentication
- Secure token management

### Image Compression Strategy
- 1280px is optimal for OpenAI Vision API
- 80% JPEG quality maintains clarity for contractors
- ~75% file size reduction saves bandwidth and storage costs

## Next Phase Implementation

### 1. Appointment Details Screen
Create a chat-based interface where customers can provide:
- Preferred date/time
- Location details
- Additional notes

### 2. Business Matching Algorithm
```typescript
// Pseudo-code
findNearbyBusinesses(location, category, radius) {
  // Use Supabase function: find_businesses_in_radius
  // Returns businesses sorted by distance
}
```

### 3. ACI MCP Integration
When no businesses match:
```typescript
// Draft outreach email to potential businesses
sendOutreachEmail({
  to: potentialBusinesses,
  subject: "New customer in your area needs [category]",
  body: customerRequest
})
```

### 4. Calendar Integration
After business accepts:
```typescript
// Create Google Calendar event via ACI.dev
createCalendarEvent({
  participants: [customer, business],
  details: appointmentDetails
})
```

## Contributing

This project is part of a hackathon. Feel free to fork and extend!

## License

MIT

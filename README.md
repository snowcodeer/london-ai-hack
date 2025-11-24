# SquareDeal

A mobile app that connects customers with local service businesses through AI-powered problem identification and intelligent business discovery.

## Overview

SquareDeal is an on-demand home services marketplace that makes it easy for customers to find and book local service providers. Take a photo of your problem, get instant AI analysis, and connect with verified professionals or discover local businesses in your area.

## Features

### Customer Interface
- 📸 **Camera Capture**: Take photos of maintenance problems
- 🤖 **AI Analysis**: OpenAI Vision identifies the issue, category, and urgency
- 🔍 **Smart Discovery**: Find verified providers or discover local businesses via Valyu AI search
- 📧 **Business Invitations**: Invite unverified businesses to join the platform
- 📅 **Request Tracking**: View all your service requests and messages
- 👤 **Profile Management**: Manage your account settings

### Business Interface
- 📬 **Request Inbox**: Swipeable card interface for new service requests
- ✅ **Accept/Decline**: One-tap actions for incoming requests
- 📅 **Schedule View**: See all upcoming appointments with customer details
- 💰 **Revenue Tracking**: Monitor jobs and earnings
- 👤 **Business Profile**: Manage business details and stats

## Tech Stack

- **Frontend**: React Native (Expo)
- **Authentication**: Mock Auth (Demo mode with customer/business roles)
- **Database**: SQLite (Local storage with seed data)
- **AI Vision**: OpenAI GPT-4o
- **AI Search**: Valyu API (Web search for local businesses)
- **Navigation**: React Navigation (Bottom tabs + Stack navigation)
- **Storage**: AsyncStorage & Expo FileSystem

## Quick Start

1. **Navigate to the app directory**
   ```bash
   cd SquareDeal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env file with:
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
   EXPO_PUBLIC_VALYU_API_KEY=your_valyu_key
   ```

4. **Run the app**
   ```bash
   npm start
   # Then press 'i' for iOS or 'a' for Android
   ```

## Key Integrations

### OpenAI Vision API
- Analyzes photos of maintenance problems
- Identifies problem category (plumbing, electrical, HVAC, etc.)
- Determines urgency level (low, medium, high)
- Extracts key details for service providers

### Valyu AI Search
- Discovers local businesses when no verified providers are available
- Returns comprehensive business information including:
  - Contact details (phone, email, website)
  - Ratings and reviews from multiple sources
  - Service categories and specializations
  - Operating hours and emergency service availability
  - Years in business and licensing info

### Email Invitation System
- Generates personalized invitation emails for unverified businesses
- Uses Python email agent API (separate service)
- Creates Gmail drafts for business outreach
- Helps grow the platform's provider network

## Project Structure

```
SquareDeal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── UnverifiedVendorCard.tsx
│   │   ├── VerifiedBusinessCard.tsx
│   │   ├── EmailPreviewModal.tsx
│   │   └── SwipeableRequestCard.tsx
│   ├── screens/             # Screen components
│   │   ├── customer/        # Customer interface
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── ProblemAnalysisScreen.tsx
│   │   │   ├── VendorListScreen.tsx
│   │   │   ├── CustomerProfileScreen.tsx
│   │   │   ├── CustomerRequestsScreen.tsx
│   │   │   └── CustomerMessagesScreen.tsx
│   │   ├── business/        # Business interface
│   │   │   ├── SwipeableInboxScreen.tsx
│   │   │   ├── ScheduleScreen.tsx
│   │   │   └── BusinessProfileScreen.tsx
│   │   └── auth/            # Authentication
│   │       ├── RoleSelectionScreen.tsx
│   │       ├── SignInScreen.tsx
│   │       ├── BusinessAuthScreen.tsx
│   │       └── BusinessSignupScreen.tsx
│   ├── navigation/          # App routing
│   │   ├── AppRouter.tsx
│   │   ├── CustomerNavigator.tsx
│   │   ├── BusinessNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── services/            # API integrations
│   │   ├── openai.ts        # OpenAI Vision API
│   │   ├── valyuSearch.ts   # Valyu AI search
│   │   ├── emailAgent.ts    # Email invitation service
│   │   ├── appointments.ts  # Appointment management
│   │   ├── database.ts      # SQLite database
│   │   └── localStorage.ts  # Local file storage
│   ├── types/               # TypeScript types
│   ├── utils/               # Helper functions
│   └── contexts/            # React contexts
├── App.tsx                  # Entry point
├── app.config.js            # Expo configuration
└── README.md               # This file
```

## Current Implementation Status

✅ **Completed**
- Expo project setup with TypeScript
- Mock authentication with customer/business roles
- Camera screen with permissions and image capture
- Image compression and optimization
- OpenAI Vision API integration for problem analysis
- SQLite database with seed data
- Valyu AI search for local business discovery
- Email invitation system for unverified businesses
- Customer interface with bottom tab navigation
- Business interface with swipeable inbox
- Schedule view with appointment management
- Profile screens for both user types
- Request tracking and messaging screens

## Image Optimization

All photos are automatically optimized:
- **Size**: Resized to max 1280px width
- **Quality**: 80% JPEG compression
- **Format**: JPEG with base64 encoding for AI analysis
- **Result**: ~200-400KB uploads (vs 2-5MB raw)

Perfect for AI analysis and mobile bandwidth!

## Database Schema

SQLite database with the following tables:
- `customers` - Customer profiles
- `businesses` - Business profiles (verified and unverified)
- `service_requests` - Service requests with AI analysis
- `appointments` - Scheduled appointments

Includes seed data with mock businesses in the London area.

## Development

```bash
# Start dev server
npm start

# Run on iOS simulator
npm run ios

# Clear cache and restart
npm start --clear
```

## Environment Variables

Required environment variables:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
EXPO_PUBLIC_VALYU_API_KEY=...
EXPO_PUBLIC_EMAIL_AGENT_API_URL=http://localhost:5000  # Optional
```

## Architecture Decisions

### Why Valyu AI?
- Discovers real local businesses when verified providers aren't available
- Returns comprehensive business data from web sources
- Helps grow the platform by identifying businesses to recruit
- Provides rich context for email invitations

### Image Compression Strategy
- 1280px is optimal for OpenAI Vision API
- 80% JPEG quality maintains clarity for service providers
- ~75% file size reduction saves bandwidth and storage costs

## Email Invitation Flow

1. Customer searches for service → No verified providers found
2. Valyu AI searches web for local businesses
3. Customer sees unverified business cards
4. Customer clicks "Invite to Platform"
5. Email preview modal shows personalized invitation
6. Python email agent creates Gmail draft
7. Business receives invitation to join platform

## License

MIT

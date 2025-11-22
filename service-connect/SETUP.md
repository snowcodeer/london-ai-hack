# Service Connect Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (for testing)
- Accounts:
  - [Clerk](https://clerk.com) for authentication
  - [Supabase](https://supabase.com) for database
  - [OpenAI](https://platform.openai.com) for vision API

## Step 1: Install Dependencies

```bash
cd service-connect
npm install
```

## Step 2: Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable **Phone Number** authentication
4. Enable **Organizations** feature (for businesses)
5. Copy your **Publishable Key**

## Step 3: Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase-schema.sql`
4. Go to Storage → Create bucket named `problem-photos`
5. Make `problem-photos` bucket **public**
6. Copy your:
   - Project URL
   - Anon/Public API Key

## Step 4: Set Up OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Make sure you have access to `gpt-4o` (or fallback to `gpt-4-vision-preview`)

## Step 5: Create Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# OpenAI
OPENAI_API_KEY=sk-...
```

## Step 6: Test the Database

Test your Supabase connection:

```sql
-- Insert a test business
INSERT INTO businesses (id, name, email, phone, categories, location, coordinates)
VALUES (
  'test_business_123',
  'Mike''s Plumbing',
  'mike@plumbing.com',
  '+1234567890',
  ARRAY['plumbing', 'general_handyman'],
  '{"address": "123 Main St", "city": "San Francisco", "state": "CA", "zip": "94102"}',
  ST_MakePoint(-122.4194, 37.7749)::geography
);
```

## Step 7: Run the App

```bash
# Start Expo dev server
npm start

# Or run directly on iOS
npm run ios

# Or run on Android
npm run android
```

## Testing Accounts

### Create a Customer Account

1. Open the app
2. Sign up with phone number
3. You'll see the **Customer Interface** (camera screen)

### Create a Business Account

1. Sign up with a different phone number
2. In Clerk dashboard:
   - Go to Users → find your user
   - Go to Organizations → Create new organization
   - Add the user to the organization
3. Reopen the app → You'll see the **Business Interface** (inbox)

## Project Structure

```
service-connect/
├── src/
│   ├── components/          # Reusable components
│   │   ├── customer/
│   │   ├── business/
│   │   └── shared/
│   ├── screens/             # Screen components
│   │   ├── customer/
│   │   │   ├── CameraScreen.tsx
│   │   │   └── ProblemAnalysisScreen.tsx
│   │   ├── business/
│   │   │   ├── RequestInboxScreen.tsx
│   │   │   └── RequestDetailScreen.tsx
│   │   └── auth/
│   │       └── SignInScreen.tsx
│   ├── navigation/          # Navigation setup
│   │   ├── AppRouter.tsx
│   │   ├── CustomerNavigator.tsx
│   │   └── BusinessNavigator.tsx
│   ├── services/            # API integrations
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── storage.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   └── utils/               # Helper functions
│       └── imageCompression.ts
├── App.tsx                  # App entry point
├── supabase-schema.sql      # Database schema
└── package.json
```

## Image Optimization Settings

Current configuration:
- **Max width**: 1280px
- **JPEG quality**: 80%
- **Result**: ~200-400KB per image

## Next Steps

### Implement Text Chat + Voice Input

Currently, the customer flow stops after AI analysis. You need to implement:

1. Create `AppointmentDetailsScreen.tsx`
2. Add text-based chat with OpenAI
3. Optional: Add voice-to-text input (Expo Speech Recognition)
4. Extract appointment details from conversation
5. Create service request in Supabase

### Implement Business Matching Algorithm

In `src/services/matching.ts`, create:

```typescript
export async function findMatchingBusinesses(
  location: { latitude: number; longitude: number },
  category: ProblemCategory,
  radiusMiles: number = 25
): Promise<Business[]> {
  // Use Supabase function: find_businesses_in_radius
  // Return sorted by distance
}
```

### Implement ACI MCP Email Outreach

When no businesses are found:

```typescript
if (matchedBusinesses.length === 0) {
  await sendOutreachEmail({
    area: request.location.city,
    category: request.problem_category,
    customerInfo: request
  });
}
```

### Add Push Notifications

1. Set up Expo Notifications
2. Send to businesses when new request arrives
3. Send to customers when request is accepted

### Add Calendar Integration (ACI.dev)

After business accepts request:

```typescript
await createCalendarEvent({
  businessId: business.id,
  customerId: customer.id,
  appointmentDetails: request.appointment_details
});
```

## Troubleshooting

### "Can't find variable: process"

Make sure you're using Expo SDK 50+ which supports `process.env`.

### Clerk authentication not working

- Check your publishable key is correct
- Make sure phone authentication is enabled in Clerk dashboard
- Clear app data and retry

### Supabase connection errors

- Verify your URL and anon key
- Check RLS policies are set correctly
- Make sure storage bucket exists and is public

### Camera not working

- Check permissions in iOS Settings or Android Settings
- Rebuild the app after permission changes

## Development Tips

1. **Use Expo Go** for rapid testing (iOS/Android)
2. **Test on real devices** for camera functionality
3. **Monitor Supabase logs** in Dashboard → Logs
4. **Check Clerk webhook logs** for auth debugging
5. **Use React Native Debugger** for advanced debugging

## Production Checklist

- [ ] Update RLS policies for production
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Amplitude/Mixpanel)
- [ ] Add rate limiting for OpenAI calls
- [ ] Implement proper auth flow (not placeholder)
- [ ] Add terms of service and privacy policy
- [ ] Set up CI/CD (EAS Build)
- [ ] Add app icons and splash screen
- [ ] Test on multiple devices
- [ ] Submit to App Store / Play Store

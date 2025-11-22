# Mobile App: Voice-First Service Request Platform

## Overview
Build an Expo-based mobile app with **dual interfaces** (Customer & Business) that connects service requests with local SMBs through AI-powered problem identification and voice interactions.

## Authentication Strategy: Clerk

### Setup
```bash
npx expo install @clerk/clerk-expo
npm install @clerk/clerk-expo react-native-safe-area-context
```

### User Types
1. **Customers**: Personal Clerk accounts (individuals requesting services)
2. **Businesses**: Clerk Organizations (SMBs with potential team members)

### Account Flow
- **Customer signup**: Standard phone/email auth → personal account
- **Business signup**: Phone/email auth → create/join Organization
- **App detects**: If user belongs to Organization → show Business Interface, else → Customer Interface

---

## App Structure

```
App Root
├── Authentication (Clerk)
│   ├── Sign In / Sign Up
│   └── Organization Creation/Selection (for businesses)
│
├── CUSTOMER INTERFACE (Personal accounts)
│   ├── Home: "Take Photo of Your Problem"
│   ├── Camera Capture
│   ├── AI Problem Analysis (loading state)
│   ├── Voice Conversation (LiveKit + OpenAI)
│   ├── Matched Businesses List
│   ├── Request Status Tracking
│   └── My Appointments (Calendar view)
│
└── BUSINESS INTERFACE (Organization accounts)
    ├── Request Inbox (Uber-style)
    ├── Request Detail View
    │   ├── Problem photo
    │   ├── AI description
    │   ├── Customer info
    │   └── Accept/Decline buttons
    ├── Active Jobs
    ├── Calendar (synced via ACI.dev)
    └── Team Management (if Org admin)
```

---

## Technical Implementation

### 1. Clerk Integration

```javascript
// App.js
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { useOrganization, useUser } from '@clerk/clerk-expo';

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SignedIn>
        <AppRouter />
      </SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </ClerkProvider>
  );
}
```

### 2. Interface Router

```javascript
// AppRouter.js - Determines which interface to show
import { useOrganization, useUser } from '@clerk/clerk-expo';

function AppRouter() {
  const { organization } = useOrganization();
  const { user } = useUser();

  // If user belongs to an organization → Business Interface
  if (organization) {
    return <BusinessApp organization={organization} user={user} />;
  }

  // Otherwise → Customer Interface
  return <CustomerApp user={user} />;
}
```

### 3. Customer Interface Flow

```javascript
// CustomerApp.js
function CustomerApp({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={CameraCapture} />
        <Stack.Screen name="ProblemAnalysis" component={AIAnalysisScreen} />
        <Stack.Screen name="VoiceChat" component={VoiceConversation} />
        <Stack.Screen name="BusinessMatches" component={BusinessList} />
        <Stack.Screen name="RequestStatus" component={StatusTracking} />
        <Stack.Screen name="MyAppointments" component={CustomerCalendar} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Key Screens:**
- **CameraCapture**: Expo Camera to take problem photo
- **AIAnalysisScreen**: Show OpenAI vision analysis, "Analyzing problem..." loader
- **VoiceConversation**: LiveKit voice interface to refine details (SIMPLIFIED: Text chat + voice input for MVP)
- **BusinessList**: Show matched businesses
- **StatusTracking**: "Request sent to Mike's Plumbing... Waiting for response"
- **CustomerCalendar**: Google Calendar appointments (via ACI.dev)

### 4. Business Interface Flow

```javascript
// BusinessApp.js
function BusinessApp({ organization, user }) {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Inbox" component={RequestInbox} />
        <Tab.Screen name="Active" component={ActiveJobs} />
        <Tab.Screen name="Calendar" component={BusinessCalendar} />
        <Tab.Screen name="Team" component={TeamManagement} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

**Key Screens:**
- **RequestInbox**: Card-based list of incoming requests (like Uber requests)
  - Show: photo thumbnail, AI description, customer name, urgency
  - Actions: Accept (green) / Decline (red)
- **ActiveJobs**: Accepted jobs awaiting completion
- **BusinessCalendar**: Google Calendar sync showing all appointments
- **TeamManagement**: Org members (only visible to admins)

---

## Data Schema

### Service Request Object
```javascript
{
  id: "req_123",
  customerId: "user_abc",
  customerName: "John Smith",
  customerPhone: "+1234567890",

  // Problem details
  problemPhoto: "https://...",
  aiDescription: "Broken pipe under kitchen sink, active leak",
  problemType: "plumbing",
  urgency: "high",

  // Voice conversation output
  appointmentDetails: {
    location: "123 Main St, Apt 4B",
    preferredDate: "2024-01-15",
    preferredTime: "morning",
    additionalNotes: "Need to shut off water main"
  },

  // Business matching
  matchedBusinesses: ["org_xyz"], // Clerk org IDs
  assignedBusiness: null,
  status: "pending", // pending, accepted, declined, completed

  // Timestamps
  createdAt: "2024-01-10T10:00:00Z",
  respondedAt: null,
  scheduledAt: null
}
```

---

## Integration Points

### OpenAI Vision (Problem Identification)
```javascript
// Analyze photo
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Describe this home/business problem in detail" },
        { type: "image_url", image_url: { url: photoBase64 } }
      ]
    }]
  })
});
```

### Voice Conversation (APPROACH 2 - MVP)
**Simplified Implementation:**
- Text-based chat with OpenAI
- Optional: Voice-to-text input using device capabilities
- Extract appointment details from conversation
- Structured output for appointment schema

### Business Matching Algorithm
**DECISION:** Custom algorithm (no Valyu AI)
```javascript
// Match businesses based on:
// 1. Geographic proximity (PostGIS)
// 2. Service category
// 3. Availability
const businesses = await supabase.rpc('find_businesses_in_radius', {
  request_lat: latitude,
  request_lon: longitude,
  category: problemCategory,
  radius_miles: 25
});
```

### ACI.dev MCP (Calendar Sync & Email Outreach)
```javascript
// When business accepts request
await acidev.calendar.createEvent({
  organizationId: business.id,
  customerId: customer.id,
  event: {
    summary: `Service: ${problemType}`,
    description: aiDescription,
    start: scheduledDateTime,
    attendees: [customer.email, business.email]
  }
});

// NEW: When NO businesses are found nearby
if (matchedBusinesses.length === 0) {
  await acidev.email.sendOutreach({
    to: potentialBusinesses,
    subject: `New customer in ${location.city} needs ${category}`,
    body: draftInvitationEmail({
      customerRequest: request,
      area: location
    })
  });
}
```

---

## Development Roadmap

### Phase 1: Setup & Auth ✅
- [x] Initialize Expo project
- [x] Install and configure Clerk
- [x] Build auth screens (phone number login) - PLACEHOLDER
- [x] Create organization setup flow for businesses
- [x] Build interface router (customer vs business detection)

### Phase 2: Customer Interface ⚠️ (70% COMPLETE)
- [x] Camera integration (Expo Camera)
- [x] OpenAI vision API integration
- [x] Loading/analysis UI
- [ ] Text chat / form for appointment details (SIMPLIFIED from voice)
- [ ] Appointment schema design
- [ ] Business matching integration
- [ ] Request submission flow

### Phase 3: Business Interface ✅ (85% COMPLETE)
- [x] Request inbox UI (card-based list)
- [x] Request detail view
- [x] Accept/Decline functionality
- [ ] Active jobs list (placeholder exists)
- [x] Push notifications setup (realtime subscriptions working)

### Phase 4: Calendar Integration (NOT STARTED)
- [ ] ACI.dev MCP setup
- [ ] Google Calendar OAuth for customers
- [ ] Google Calendar OAuth for businesses
- [ ] Bidirectional sync
- [ ] Calendar views in both interfaces

### Phase 5: ACI Email Outreach (NOT STARTED)
- [ ] Detect when no businesses match
- [ ] Draft professional outreach email template
- [ ] Integrate ACI MCP for email sending
- [ ] Track outreach attempts

### Phase 6: Polish (NOT STARTED)
- [ ] Proper Clerk auth flow (replace placeholder)
- [ ] Push notifications (Expo Notifications)
- [ ] Offline handling
- [ ] Error states
- [ ] Loading states
- [ ] Onboarding flows
- [ ] Profile management

---

## Key UX Considerations

### For Customers (Non-technical)
- **Big, obvious camera button** on home screen ✅
- **Visual feedback** during AI analysis ("Reading your photo...") ✅
- **Voice-first** - minimize typing ⚠️ (simplified to text chat for MVP)
- **Clear status updates** - "Your request was sent to 3 plumbers nearby" ❌

### For Businesses (On-the-go)
- **Uber-style cards** - swipe to see details, tap to accept ✅
- **Photo front and center** - see problem immediately ✅
- **One-tap actions** - Accept/Decline should be effortless ✅
- **Push notifications** - audible alert for new requests ⚠️ (realtime working, push pending)
- **Calendar auto-sync** - no manual entry ❌

---

## Environment Variables Needed

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-...
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# Future:
# LIVEKIT_URL=wss://...
# LIVEKIT_API_KEY=...
```

---

## Image Optimization Strategy

**Implemented:**
```typescript
{
  maxWidth: 1280,
  quality: 0.8,
  format: 'jpeg'
}
// Result: ~200-400KB per image (vs 2-5MB raw)
```

**Reasoning:**
- OpenAI Vision works well with 1280px images
- 80% quality maintains clarity for contractors
- ~75% file size reduction saves bandwidth and costs

---

## Status Legend
- ✅ Completed
- ⚠️ Partially implemented
- ❌ Not started

---

**Last Updated:** 2025-11-22
**Current Phase:** Phase 2 (Customer Interface) - 70% complete
**Next Priority:** Appointment details screen + request submission flow

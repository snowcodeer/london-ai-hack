# Mock Authentication - What Changed

## Summary

Removed Clerk authentication and replaced it with a simple mock auth system for faster development.

---

## What Was Removed

- ❌ `@clerk/clerk-expo` dependency
- ❌ `expo-secure-store` dependency
- ❌ Clerk publishable key requirement
- ❌ Organization setup complexity

**Saved:** ~95 packages, complex auth setup, external dependencies

---

## What Was Added

### 1. Mock Auth Context (`src/contexts/MockAuthContext.tsx`)

Simple authentication context with two mock profiles:

**Customer Profile:**
```typescript
{
  id: 'customer_123',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  type: 'customer'
}
```

**Business Profile:**
```typescript
{
  id: 'business_user_456',
  name: 'Mike Johnson',
  email: 'mike@plumbing.com',
  phone: '+1 (555) 987-6543',
  type: 'business',
  organization: {
    id: 'org_789',
    name: "Mike's Plumbing"
  }
}
```

### 2. Profile Switcher UI

Added toggle at the top of the app:
- 👤 **Customer** button - Switch to customer view
- 💼 **Business** button - Switch to business view

### 3. Compatible Hooks

The mock context provides the same hooks as Clerk:
```typescript
useUser()         // Returns mock user
useOrganization() // Returns mock org (if business)
```

No need to change screen code!

---

## Files Changed

### Core Files
- ✅ `App.tsx` - Removed ClerkProvider, added MockAuthProvider
- ✅ `src/navigation/AppRouter.tsx` - Added profile switcher UI
- ✅ `src/contexts/MockAuthContext.tsx` - **New file**

### Screen Updates (Just import changes)
- ✅ `src/screens/customer/ProblemAnalysisScreen.tsx`
- ✅ `src/screens/business/RequestInboxScreen.tsx`
- ✅ `src/screens/business/RequestDetailScreen.tsx`

### Documentation
- ✅ `.env.example` - Removed Clerk key
- ✅ `QUICKSTART.md` - **New simplified guide**

---

## How to Use

### Switch Profiles
Just tap the buttons at the top of the app:

```
[👤 Customer] [💼 Business] ← Tap to switch
```

### In Code
```typescript
// Get current user (works the same as before)
const { user } = useUser();
console.log(user.name); // "John Smith" or "Mike Johnson"

// Get organization (only if business profile)
const { organization } = useOrganization();
console.log(organization?.name); // "Mike's Plumbing" or null
```

---

## Benefits

✅ **Faster setup** - No external auth service needed
✅ **Easier testing** - Switch profiles instantly
✅ **Fewer dependencies** - Removed 95 packages
✅ **Simpler onboarding** - Just Supabase + OpenAI keys needed
✅ **Same API** - Screens didn't need major changes

---

## Future: Adding Real Auth

When you're ready to add real authentication:

1. Install Clerk (or Firebase Auth, etc.)
2. Replace `MockAuthProvider` with real provider
3. Keep the same `useUser()` and `useOrganization()` API
4. Screens won't need changes!

---

## Testing

### Test Customer Flow
1. Tap **Customer** button
2. Take a photo
3. See AI analysis

### Test Business Flow
1. Tap **Business** button
2. See request inbox
3. Click request → Accept/Decline

---

## What Still Works

Everything! The mock profiles have the same structure as real Clerk users:

✅ Camera screen
✅ Image upload
✅ OpenAI analysis
✅ Request inbox
✅ Accept/Decline
✅ All database operations

The only difference: you manually switch profiles instead of signing in.

---

**Next:** Run `npm start` and start building features without auth hassle!

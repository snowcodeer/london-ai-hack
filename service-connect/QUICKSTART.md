# Quick Start Guide

## 🎯 Ultra-Simplified Setup (Zero External Services!)

This app now uses:
- ✅ **Mock Authentication** - No Clerk needed
- ✅ **SQLite Database** - No Supabase needed
- ✅ **Local File Storage** - Photos saved on device

**Only requirement:** OpenAI API key for vision analysis

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variable

```bash
cp .env.example .env
```

Edit `.env` and add **only your OpenAI key**:

```env
# OpenAI (Required for vision analysis)
OPENAI_API_KEY=sk-...
```

That's it! No database setup required.

### 3. Run the App!

```bash
npm start
```

This will automatically launch the **iOS Simulator**.

Alternatively, use `npm run dev` to choose your platform manually.

---

## 📱 Using the App

### Profile Switcher

At the top of the app, you'll see two buttons:

- 👤 **Customer** - Switch to customer view (take photos, request services)
- 💼 **Business** - Switch to business view (see requests, accept/decline)

### Mock Profiles

**Customer:**
- Name: John Smith
- Email: john@example.com
- Phone: +1 (555) 123-4567

**Business:**
- Name: Mike's Plumbing
- Email: contact@mikesplumbing.com
- Phone: +1 (555) 987-6543

---

## 🧪 Testing the Flow

### As Customer:
1. Click the **Customer** button at the top
2. Take a photo of a problem (or use camera roll)
3. Watch AI analyze it
4. See the categorization and urgency

### As Business:
1. Click the **Business** button at the top
2. View the request inbox (currently shows mock data from Supabase)
3. Click a request to see details
4. Accept or decline requests

---

## 🔑 Getting Your OpenAI API Key

### OpenAI (Pay as you go)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account / Sign in
3. Go to **API Keys**
4. Create new key
5. You need access to `gpt-4o` model

---

## 💰 Estimated Costs

For development/testing:

- **Database**: $0 (SQLite - free, local)
- **Storage**: $0 (Local file system - free)
- **OpenAI**: ~$0.01 per image analysis (gpt-4o)

Example: 100 test images = ~$1.00 total

---

## 🐛 Troubleshooting

### "Can't find variable: process"
Make sure you have a `.env` file in the project root with your keys.

### Camera not working
- On iOS Simulator: Camera might not work, use a real device or image picker
- On iOS Device: Grant camera permissions in Settings when prompted
- Physical device recommended for testing camera features

### Database errors
- Database is created automatically on first run
- Check console for initialization messages
- Try clearing app data and restarting

### OpenAI errors
- Check your API key is valid
- Ensure you have credits in your account
- Verify you have access to `gpt-4o` (or update to `gpt-4-vision-preview`)

---

## 📝 Next Steps

Once you have the basic app running:

1. **Test the camera flow**: Take photos, see AI analysis
2. **Check local storage**: Photos saved in app documents directory
3. **Test business view**: Switch profiles, see requests
4. **View database**: Use SQLite browser to inspect local database

---

## 🚀 What Works Right Now

✅ Camera capture with permissions
✅ Image compression (1280px, 80% quality)
✅ Photo saved locally (no external storage)
✅ SQLite database (no external database)
✅ OpenAI Vision analysis
✅ Problem categorization & urgency
✅ Profile switcher (Customer ↔ Business)
✅ Request inbox with polling updates
✅ Request details with Accept/Decline

## 🚧 What's Next

- Appointment details form
- Business matching algorithm
- Create service requests
- Push notifications
- Calendar integration

---

**Ready to build!** Start with `npm start` and switch between Customer and Business views using the toggle at the top.

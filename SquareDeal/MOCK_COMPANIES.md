# Mock Companies - Old Street Area, London

## 🏢 8 Local Businesses Ready to Test

All businesses are located within walking distance of **Old Street Station, London EC1**.

---

## 1. 🔧 Shoreditch Plumbing Services
**Your default business profile when you switch to Business view**

- **ID**: `org_shoreditch_plumbing`
- **Address**: 15 Old Street, London EC1V 9HL
- **Phone**: +44 20 7123 4567
- **Email**: info@shoreditchplumbing.co.uk
- **Services**: Plumbing, General Handyman
- **Owner**: Sarah Mitchell (Mock Business User)

---

## 2. ⚡ East London Electrical Ltd

- **ID**: `org_eastlondon_electrical`
- **Address**: 42 City Road, London EC1Y 2AP
- **Phone**: +44 20 7234 5678
- **Email**: contact@eastlondonelectrical.com
- **Services**: Electrical, Appliance Repair

---

## 3. 🌡️ Shoreditch HVAC & Heating

- **ID**: `org_shoreditch_hvac`
- **Address**: 78 Great Eastern Street, London EC2A 3JL
- **Phone**: +44 20 7345 6789
- **Email**: hello@shoreditchhvac.co.uk
- **Services**: HVAC (Heating, Ventilation, Air Conditioning)

---

## 4. 🪚 Tech City Carpentry & Joinery

- **ID**: `org_tech_city_carpentry`
- **Address**: 23 Leonard Street, London EC2A 4QS
- **Phone**: +44 20 7456 7890
- **Email**: bookings@techcitycarpentry.com
- **Services**: Carpentry

---

## 5. 🔨 Hoxton Handyman Services

- **ID**: `org_hoxton_handyman`
- **Address**: 91 Hoxton Street, London N1 6QL
- **Phone**: +44 20 7567 8901
- **Email**: info@hoxtonhandyman.co.uk
- **Services**: General Handyman, Painting, Carpentry

---

## 6. 🎨 Clerkenwell Painting & Decorating

- **ID**: `org_clerkenwell_painting`
- **Address**: 56 Clerkenwell Road, London EC1M 5PX
- **Phone**: +44 20 7678 9012
- **Email**: team@clerkenwellpainting.com
- **Services**: Painting

---

## 7. 🔌 City Road Appliance Repair

- **ID**: `org_cityroad_appliances`
- **Address**: 134 City Road, London EC1V 2NJ
- **Phone**: +44 20 7789 0123
- **Email**: repairs@cityroadappliances.co.uk
- **Services**: Appliance Repair, Electrical

---

## 8. 🚨 Old Street 24/7 Emergency Services

- **ID**: `org_oldstreet_247`
- **Address**: 1 Old Street Roundabout, London EC1V 9AA
- **Phone**: +44 20 7890 1234
- **Email**: emergency@oldstreet247.co.uk
- **Services**: Plumbing, Electrical, General Handyman
- **Special**: 24/7 Emergency coverage

---

## 🗺️ Coverage Map

```
Old Street Station (EC1V 9AA)
     │
     ├─ 15m walk → Shoreditch Plumbing (15 Old Street)
     ├─ 5m walk → City Road Electrical (42 City Road)
     ├─ 10m walk → HVAC (Great Eastern Street)
     ├─ 8m walk → Tech City Carpentry (Leonard Street)
     ├─ 12m walk → Hoxton Handyman (Hoxton Street)
     ├─ 7m walk → Clerkenwell Painting (Clerkenwell Road)
     ├─ 6m walk → Appliance Repair (134 City Road)
     └─ 2m walk → 24/7 Emergency (Old Street Roundabout)
```

---

## 🎯 Service Category Coverage

| Category | Companies | Coverage |
|----------|-----------|----------|
| **Plumbing** | 2 | Shoreditch Plumbing, Old Street 24/7 |
| **Electrical** | 3 | East London Electrical, City Road Appliances, Old Street 24/7 |
| **HVAC** | 1 | Shoreditch HVAC |
| **Carpentry** | 2 | Tech City Carpentry, Hoxton Handyman |
| **Painting** | 2 | Clerkenwell Painting, Hoxton Handyman |
| **Appliance Repair** | 2 | East London Electrical, City Road Appliances |
| **General Handyman** | 3 | Shoreditch Plumbing, Hoxton Handyman, Old Street 24/7 |

---

## 🧪 Testing Scenarios

### Scenario 1: Plumbing Emergency
**Customer takes photo of burst pipe**
- AI categorizes as: `plumbing`, urgency: `high`
- Matched businesses:
  - ✅ Shoreditch Plumbing Services
  - ✅ Old Street 24/7 Emergency Services

### Scenario 2: Electrical Issue
**Customer takes photo of broken socket**
- AI categorizes as: `electrical`, urgency: `medium`
- Matched businesses:
  - ✅ East London Electrical Ltd
  - ✅ City Road Appliance Repair
  - ✅ Old Street 24/7 Emergency Services

### Scenario 3: Painting Job
**Customer takes photo of damaged wall**
- AI categorizes as: `painting`, urgency: `low`
- Matched businesses:
  - ✅ Clerkenwell Painting & Decorating
  - ✅ Hoxton Handyman Services

### Scenario 4: Landscaping (No Match!)
**Customer takes photo of overgrown garden**
- AI categorizes as: `landscaping`, urgency: `low`
- Matched businesses: ❌ **NONE**
- **Triggers**: ACI email outreach to local landscaping companies!

---

## 📱 How to Use in the App

### As a Customer:
1. Tap **Customer** button at top
2. Take photo of a problem
3. AI will analyze and match with nearby businesses
4. See which of the 8 companies can help

### As a Business (Shoreditch Plumbing):
1. Tap **Business** button at top
2. You're now Sarah Mitchell from Shoreditch Plumbing
3. View incoming requests in your area
4. Accept/Decline jobs

---

## 🔄 Database Reset

To re-seed with fresh data:
```bash
# Delete the database file
rm -rf ~/Library/Developer/CoreSimulator/Devices/*/data/Containers/Data/Application/*/Documents/serviceconnect.db

# Restart the app
# Database will auto-create and seed 8 companies
```

---

## 📊 Business Diversity

- **3 specialist services** (HVAC, Carpentry, Painting)
- **2 multi-service providers** (Hoxton Handyman, Old Street 24/7)
- **3 focused trades** (Plumbing, Electrical, Appliances)
- **All within 15-minute walk** of Old Street Station

---

**Perfect for testing the full matching algorithm and cold email outreach!** 🚀

When you take a photo of something that none of these companies handle (like landscaping or pest control), the app will trigger the ACI outreach email feature.

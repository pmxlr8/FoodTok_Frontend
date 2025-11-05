# 🚀 Quick Start Guide

**For developers who want to get started immediately!**

## 📥 Setup (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open browser
http://localhost:3000
```

**Login:** `demo@example.com` / `password123`

---

## 🎯 What's Built

### ✅ Complete Features
- **Discovery Feed** - TikTok-style swipeable restaurant cards
- **Restaurant Details** - Full restaurant info with "Reserve Table" button
- **Reservation System** - Book tables with $25/person deposit
  - 2-step booking wizard (date/party → time slot)
  - 10-minute hold timer (countdown with urgency)
  - Deposit payment checkout
  - Confirmation codes (e.g., FT-ABC123)
  - Upcoming/Past bookings list
  - Cancel with refund calculation
- **User Profile** - View reservations, edit preferences
- **Favorites** - Save liked restaurants

### 🔧 Technical Highlights
- **Race Condition Prevention** - Distributed locking (no double-bookings)
- **Idempotency** - Can't create duplicate reservations
- **Hold Auto-Expiry** - 10-minute timer with automatic cleanup
- **Real-time Inventory** - Track 10 tables per slot
- **Refund Policy** - 100%/50%/0% based on cancellation time

---

## 📁 Key Files

### API (Centralized)
```
src/lib/api/
├── index.ts                 ← Main entry point (switch mock/real here)
├── mock-reservations.ts     ← Current (development)
├── mock-restaurants.ts      ← Current (development)
├── reservations.ts          ← Template for real backend
└── restaurants.ts           ← Template for real backend
```

**All components import from:** `@/lib/api`

### Pages
```
src/app/(main)/
├── page.tsx                 ← Discovery feed
├── restaurant/[id]/         ← Restaurant details
├── checkout/                ← Deposit payment
├── reservations/            ← Bookings list
├── favorites/               ← Liked restaurants
└── profile/                 ← User settings
```

### Components
```
src/components/
├── reservation/
│   ├── ReservationModal.tsx  ← Booking wizard
│   └── HoldTimer.tsx         ← Countdown timer
└── features/
    └── RestaurantCard.tsx    ← Swipeable card
```

---

## 🔌 Switch to Real Backend (1 step!)

### Option 1: Edit index.ts
```typescript
// src/lib/api/index.ts

// Comment out mocks
// export * from './mock-reservations';
// export * from './mock-restaurants';

// Uncomment real APIs
export * from './reservations';
export * from './restaurants';
```

### Option 2: Set environment variable
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**That's it!** No component changes needed.

---

## 🎓 Documentation

### For Team Members
**Read:** `INTERNAL_README.md` - Complete internal documentation
- Full architecture explanation
- API integration guide
- Development workflow
- Testing instructions
- Troubleshooting

### For Public/GitHub
**Read:** `README.md` - Public-facing README
- Project overview
- Setup instructions
- Feature list
- Tech stack

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Visual Demo
Visit: `http://localhost:3000/demo`
- Interactive reservation flow
- Race condition tester
- Idempotency tester
- Activity logs

---

## 📱 Mobile Testing

### Find Your IP
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I
```

### Connect from Phone
1. Ensure same WiFi network
2. Visit: `http://[YOUR_IP]:3000`
3. Add to home screen for PWA experience

---

## 🆘 Common Issues

**Port 3000 in use:**
```bash
npm run dev -- -p 3001
```

**TypeScript errors after pulling:**
```bash
rm -rf .next node_modules package-lock.json
npm install
```

**Imports not working:**
- Restart VS Code TypeScript server
- Cmd+Shift+P → "TypeScript: Restart TS Server"

---

## 🎯 Backend Integration Checklist

### Required Endpoints
- [ ] `POST /api/reservations/availability`
- [ ] `POST /api/reservations/hold`
- [ ] `GET /api/reservations/hold/active`
- [ ] `POST /api/reservations/confirm`
- [ ] `GET /api/reservations/user/:userId`
- [ ] `PATCH /api/reservations/:id`
- [ ] `DELETE /api/reservations/:id`
- [ ] `GET /api/restaurants/discovery`
- [ ] `GET /api/restaurants/:id`

### Templates Provided
See `src/lib/api/reservations.ts` and `restaurants.ts` for:
- TypeScript interfaces
- Request/response examples
- Error handling patterns

---

## 👥 Team

- **Matthew Boubin** - Product Owner
- **Pranjal Mishra** - Frontend Lead
- **Jiyuan Ren** - Backend (Auth ✅)
- **Yuxuan Wang** - Backend (APIs 🚧)
- **Aaron Benochea** - Backend (Database 🚧)

---

**Questions?** Check `INTERNAL_README.md` or ask in team channel.

**Happy Coding! 🎉**

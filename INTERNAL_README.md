# 🍔 FoodTok - Internal Team Documentation

**Version:** 2.0  
**Last Updated:** November 4, 2025  
**Status:** Frontend Complete ✅ | Backend In Progress 🚧

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Complete Feature List](#complete-feature-list)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [API Integration Guide](#api-integration-guide)
8. [Reservation System](#reservation-system)
9. [State Management](#state-management)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Team & Responsibilities](#team--responsibilities)

---

## 🎯 Project Overview

**FoodTok** is a TikTok-inspired restaurant discovery and reservation platform focused on NYC restaurants. Users swipe through personalized restaurant recommendations and can book tables with deposit payments.

### Core Value Proposition
- **Discovery:** TikTok-style swipe interface eliminates decision fatigue
- **Personalization:** AI-powered recommendations based on preferences
- **Reservations:** Book tables with $25/person deposits (like Dineout India)
- **Trust:** Deposits prevent no-shows, better for restaurants

### Current Status
- ✅ **Frontend:** 100% complete with reservation system
- 🚧 **Backend:** Authentication done (Ren), other endpoints in progress
- 📱 **Mobile:** Fully responsive, PWA-ready
- 🧪 **Testing:** Mock APIs with comprehensive tests

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd FoodTok

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
# Desktop: http://localhost:3000
# Mobile: http://[YOUR_IP]:3000
```

### Demo Credentials
```
Email: demo@example.com
Password: password123
```

### Find Your IP (for mobile testing)
```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1

# Linux
hostname -I
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐
│  Next.js        │  Port 3000 (Frontend)
│  Frontend       │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Backend API    │  Port 8080 (Backend - In Progress)
│  (Flask/Django) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  PostgreSQL     │  Database
│  Redis          │  Distributed Locking
│  S3/Storage     │  Images
└─────────────────┘
```

### Frontend Architecture

```
Next.js 15 (App Router)
├── (auth)          → Login, Signup, Onboarding
├── (main)          → Main app with bottom nav
│   ├── /           → Discovery feed (swipe)
│   ├── /restaurant/[id]  → Restaurant details
│   ├── /checkout   → Deposit payment
│   ├── /reservations     → Upcoming/Past bookings
│   ├── /favorites  → Liked restaurants
│   └── /profile    → User settings
└── /demo           → Reservation system demo
```

### State Management (Zustand)

```typescript
// Global stores
useAuthStore()       // User authentication, session
useDiscoveryStore()  // Restaurant queue, swipe history
useCartStore()       // Shopping cart (food ordering - future)
useAppStore()        // UI state, notifications
```

---

## ✨ Complete Feature List

### 🎭 User Features

#### 1. Discovery Feed (`/`)
- ✅ TikTok-style swipeable restaurant cards
- ✅ AI-powered personalized recommendations
- ✅ Match score (e.g., "92% match - Loves Italian")
- ✅ Swipe right (like), left (pass), tap (details)
- ✅ Undo last swipe
- ✅ Infinite scroll with loading states

#### 2. Restaurant Details (`/restaurant/[id]`)
- ✅ Full restaurant information
- ✅ Image gallery
- ✅ Location, hours, price range
- ✅ Features (outdoor seating, romantic, etc.)
- ✅ **"Reserve a Table" button** → Opens modal

#### 3. Reservation System (NEW!)
- ✅ **ReservationModal:** 2-step booking wizard
  - Step 1: Select date & party size (1-20 guests)
  - Step 2: Choose time slot with real-time availability
- ✅ **10-Minute Hold Timer:** Countdown with urgency
- ✅ **Checkout Page:** Deposit payment ($25/person)
  - Reservation summary
  - Payment form (card details)
  - Special requests textarea
  - Success screen with confirmation code
- ✅ **Reservations List:** View upcoming & past bookings
  - Filter tabs (Upcoming | Past)
  - Confirmation codes (e.g., FT-ABC123)
  - Cancel with refund calculation
  - Status badges (Confirmed, Cancelled, etc.)

#### 4. User Profile (`/profile`)
- ✅ User statistics (Total Reservations, Favorites)
- ✅ Edit preferences (cuisine, dietary restrictions)
- ✅ Account management
- ✅ Logout

#### 5. Favorites (`/favorites`)
- ✅ View liked restaurants
- ✅ Quick access to reserve or view details

### 🔧 Technical Features

#### Race Condition Prevention
- ✅ Distributed locking mechanism
- ✅ Multiple users can't book same table simultaneously
- ✅ Atomic capacity updates (10 tables per slot)

#### Idempotency
- ✅ Users can't create multiple holds
- ✅ Duplicate payment confirmations return existing reservation
- ✅ Network retry safety

#### Hold Auto-Expiry
- ✅ 10-minute timer with automatic cleanup
- ✅ Tables released back to inventory
- ✅ Simulates DynamoDB TTL

#### Refund Policy
- ✅ 100% refund: Cancel 24+ hours before
- ✅ 50% refund: Cancel 4-24 hours before
- ✅ 0% refund: Cancel <4 hours before

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + CSS Variables
- **Animations:** Framer Motion
- **UI Components:** Custom components built on Radix UI
- **Icons:** Lucide React
- **State:** Zustand with persistence
- **Forms:** React Hook Form (future)
- **HTTP:** Native fetch API

### Backend (In Progress)
- **API:** Flask/Django (Python)
- **Database:** PostgreSQL
- **Cache/Locks:** Redis
- **Auth:** AWS Cognito (Ren's implementation)
- **Storage:** S3/LocalStack
- **Payment:** Stripe (future integration)

### DevOps
- **Hosting:** Vercel (frontend), AWS (backend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics
- **Testing:** Jest, React Testing Library

---

## 📁 Project Structure

```
FoodTok/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── onboarding/
│   │   ├── (main)/            # Main app routes
│   │   │   ├── page.tsx       # Discovery feed
│   │   │   ├── restaurant/[id]/
│   │   │   ├── checkout/
│   │   │   ├── reservations/
│   │   │   ├── favorites/
│   │   │   └── profile/
│   │   ├── demo/              # Reservation system demo
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── features/          # Feature-specific
│   │   │   └── RestaurantCard.tsx
│   │   ├── reservation/       # Reservation system
│   │   │   ├── ReservationModal.tsx
│   │   │   └── HoldTimer.tsx
│   │   └── ui/                # Reusable components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       └── textarea.tsx
│   │
│   ├── lib/
│   │   ├── api/               # API clients
│   │   │   ├── index.ts       # Main entry point
│   │   │   ├── mock-reservations.ts  # Mock (current)
│   │   │   ├── mock-restaurants.ts   # Mock (current)
│   │   │   ├── reservations.ts       # Real API template
│   │   │   └── restaurants.ts        # Real API template
│   │   ├── stores/            # Zustand stores
│   │   │   ├── auth.ts
│   │   │   ├── discovery.ts
│   │   │   ├── cart.ts
│   │   │   └── app.ts
│   │   └── utils.ts
│   │
│   └── types/
│       ├── index.ts           # General types
│       └── reservation.ts     # Reservation types
│
├── public/                    # Static assets
├── INTERNAL_README.md         # This file
├── README.md                  # Public-facing README
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔌 API Integration Guide

### Current State: Mock APIs

All components currently use mock APIs from `src/lib/api/mock-*.ts`:

```typescript
// Components import from centralized entry point
import { checkAvailability, createHold } from '@/lib/api';
```

The `src/lib/api/index.ts` file controls the routing:

```typescript
// CURRENT (Development)
export * from './mock-reservations';
export * from './mock-restaurants';

// FUTURE (Production) - Uncomment when backend ready
// export * from './reservations';
// export * from './restaurants';
```

### Switching to Real Backend

**Step 1:** Set environment variable
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Step 2:** Implement real API functions in `src/lib/api/reservations.ts` and `restaurants.ts`

**Step 3:** Update `src/lib/api/index.ts`
```typescript
// Comment out mocks
// export * from './mock-reservations';
// export * from './mock-restaurants';

// Uncomment real APIs
export * from './reservations';
export * from './restaurants';
```

**Step 4:** Test all components - NO CODE CHANGES NEEDED!

### Required Backend Endpoints

#### Reservations
1. `POST /api/reservations/availability` - Check available time slots
2. `POST /api/reservations/hold` - Create 10-minute hold
3. `GET /api/reservations/hold/active?userId=X` - Get active hold
4. `POST /api/reservations/confirm` - Pay deposit & confirm
5. `GET /api/reservations/user/:userId?filter=upcoming|past` - List reservations
6. `GET /api/reservations/:id` - Get reservation details
7. `PATCH /api/reservations/:id` - Modify reservation
8. `DELETE /api/reservations/:id` - Cancel reservation

#### Restaurants
1. `GET /api/restaurants/discovery?userId=X&limit=Y` - Discovery feed
2. `GET /api/restaurants/:id` - Restaurant details
3. `GET /api/restaurants/search?...` - Search with filters

#### Authentication (✅ Already Done by Ren)
1. `POST /api/auth/signup` - User registration
2. `POST /api/auth/login` - User login
3. `GET /api/auth/me` - Get current user

### API Request/Response Examples

See template files:
- `src/lib/api/reservations.ts` - All reservation endpoints with types
- `src/lib/api/restaurants.ts` - All restaurant endpoints with types

---

## 🍽️ Reservation System Deep Dive

### User Flow

```
1. Browse discovery feed → Swipe right on restaurant
2. Click "Reserve a Table" → Opens ReservationModal
3. Select date & party size → Shows available time slots
4. Choose time slot → Creates 10-minute hold
5. Redirected to /checkout → 10-minute countdown visible
6. Enter payment details → Pay $25/person deposit
7. Click "Pay & Confirm" → Payment processes
8. Success screen → Shows confirmation code (e.g., FT-ABC123)
9. View in /reservations → See all upcoming bookings
```

### Technical Flow

```typescript
// 1. Check Availability
const response = await checkAvailability({
  restaurantId: 'rest_001',
  date: '2025-11-15',
  partySize: 2
});
// Returns: { slots: [...], depositPerPerson: 25, totalDeposit: 50 }

// 2. Create Hold
const { hold, totalDeposit } = await createHold({
  userId: 'user_001',
  restaurantId: 'rest_001',
  date: '2025-11-15',
  time: '19:00',
  partySize: 2
});
// Returns: { holdId, expiresAt (10 min from now) }

// 3. Confirm Reservation (within 10 minutes!)
const { reservation } = await confirmReservation({
  holdId: hold.holdId,
  userId: 'user_001',
  paymentMethod: { type: 'credit-card', last4: '4242' },
  specialRequests: 'Window seat please'
});
// Returns: { reservationId, confirmationCode: 'FT-ABC123' }
```

### Race Condition Handling

The system prevents double-bookings using distributed locking:

```
Scenario: 10 tables available, 15 users try to book simultaneously

User 1  →  [LOCK]  →  Reserve  →  [UNLOCK]  ✅ Success (9 left)
User 2  →  [WAIT]  →  [LOCK]    →  Reserve  →  [UNLOCK]  ✅ Success (8 left)
User 3  →  [WAIT]  →  [LOCK]    →  Reserve  →  [UNLOCK]  ✅ Success (7 left)
...
User 10 →  [WAIT]  →  [LOCK]    →  Reserve  →  [UNLOCK]  ✅ Success (0 left)
User 11 →  [WAIT]  →  [LOCK]    →  Check    →  [UNLOCK]  ❌ No tables available
User 12-15 → ❌ No tables available

Lock timeout: 5 seconds (prevents deadlocks)
```

### Hold Auto-Expiry

```typescript
// Hold expires after 10 minutes
const expiresAt = Date.now() + 10 * 60 * 1000;

// Frontend shows countdown timer
<HoldTimer expiresAt={expiresAt} onExpired={() => {
  alert('Hold expired! Please create a new reservation.');
  router.push('/reservations');
}} />

// Backend automatically deletes expired holds
// (Simulated with setTimeout in mock, use DynamoDB TTL in production)
```

### Refund Policy Implementation

```typescript
// Calculate refund based on cancellation time
const hoursUntilReservation = (reservationTime - now) / (1000 * 60 * 60);

if (hoursUntilReservation >= 24) {
  refundPercentage = 100;  // Full refund
} else if (hoursUntilReservation >= 4) {
  refundPercentage = 50;   // 50% refund
} else {
  refundPercentage = 0;    // No refund
}

const refundAmount = (depositAmount * refundPercentage) / 100;
```

---

## 🗄️ State Management

### Zustand Stores

#### 1. Auth Store (`src/lib/stores/auth.ts`)
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: Preferences) => Promise<void>;
}
```

#### 2. Discovery Store (`src/lib/stores/discovery.ts`)
```typescript
interface DiscoveryState {
  queue: DiscoveryCard[];
  currentIndex: number;
  loading: boolean;
  fetchQueue: () => Promise<void>;
  swipe: (direction: 'left' | 'right') => void;
  undo: () => void;
  reset: () => void;
}
```

#### 3. Cart Store (`src/lib/stores/cart.ts`)
```typescript
interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: MenuItem, restaurantId: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}
```

#### 4. App Store (`src/lib/stores/app.ts`)
```typescript
interface AppState {
  notifications: Notification[];
  theme: 'light' | 'dark';
  addNotification: (notif: Notification) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

### Persistence

Authentication and cart state persist to `localStorage`:

```typescript
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      // ... state
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 💻 Development Workflow

### Running Locally

```bash
# Start development server
npm run dev

# In another terminal, run tests
npm test

# Check types
npm run type-check

# Lint code
npm run lint

# Format code (if Prettier configured)
npm run format
```

### Adding a New Feature

1. **Create types** in `src/types/`
2. **Create mock API** in `src/lib/api/mock-*.ts`
3. **Create components** in `src/components/`
4. **Create page** in `src/app/(main)/[feature]/`
5. **Update navigation** in `src/app/(main)/layout.tsx`
6. **Add tests** in `src/__tests__/` or co-located
7. **Update this README**

### Code Style

- **TypeScript:** Strict mode, explicit types
- **Components:** Functional components with hooks
- **Naming:** 
  - Components: PascalCase (e.g., `RestaurantCard.tsx`)
  - Utilities: camelCase (e.g., `formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **File structure:** Feature-based organization

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/reservation-system

# Make changes, commit frequently
git add .
git commit -m "feat: add reservation modal component"

# Push and create PR
git push origin feature/reservation-system
```

**Commit Message Format:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/config changes

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/lib/api/__tests__/reservation-system-test.ts

# Run with coverage
npm test -- --coverage
```

### Test Structure

```typescript
// src/lib/api/__tests__/reservation-system-test.ts
describe('Reservation System', () => {
  test('should handle race conditions', async () => {
    // Simulate 5 users booking simultaneously
    const results = await Promise.allSettled([...]);
    
    // Verify only available tables were booked
    expect(successCount).toBeLessThanOrEqual(availableTables);
  });
  
  test('should enforce idempotency', async () => {
    // Try to create duplicate hold
    await expect(createHold(request)).rejects.toThrow('already have');
  });
});
```

### Testing the Demo Page

Visit `http://localhost:3000/demo` to interactively test:
- ✅ Check availability (real-time capacity)
- ✅ Create hold (10-minute timer)
- ✅ Race condition simulation (5 users)
- ✅ Idempotency enforcement
- ✅ Hold expiry
- ✅ Payment confirmation
- ✅ Cancellation with refund

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Connect to Vercel
vercel

# Deploy to production
vercel --prod
```

**Environment Variables (Vercel Dashboard):**
```
NEXT_PUBLIC_API_URL=https://api.foodtok.com/api
NEXT_PUBLIC_ENV=production
```

### Backend (AWS/Docker)

See backend repository for deployment instructions.

---

## 👥 Team & Responsibilities

### Current Team
- **Matthew Boubin** (mjb9353) - Product Owner
- **Pranjal Mishra** - Frontend Lead
- **Jiyuan Ren** (jr5887) - Backend (Authentication ✅)
- **Yuxuan Wang** (yw5343) - Backend (APIs 🚧)
- **Aaron Benochea** (ab6503) - Backend (Database 🚧)

### Who to Ask

| Question About | Contact |
|----------------|---------|
| Frontend components, UI/UX | Pranjal |
| Authentication, Cognito | Ren |
| Backend APIs, endpoints | Yuxuan, Aaron |
| Product decisions, requirements | Matthew |
| Deployment, DevOps | TBD |

### Weekly Sync
- **When:** Every Monday 6 PM EST
- **Where:** Zoom (link in team channel)
- **Agenda:** Progress updates, blockers, plan for week

---

## 🆘 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>

# Or run on different port
npm run dev -- -p 3001
```

**Build errors after pulling:**
```bash
# Clean and reinstall
rm -rf .next node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Restart VS Code TypeScript server
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or run type check
npm run type-check
```

**Mobile device can't connect:**
- Ensure phone and computer on same WiFi
- Check firewall isn't blocking port 3000
- Use `http://` not `https://`
- Find correct IP: `ifconfig | grep "inet "` (macOS)

**Mock data not showing:**
```bash
# Check if mock files exist
ls src/lib/api/mock-*.ts

# Check import in src/lib/api/index.ts
# Should export from './mock-reservations' and './mock-restaurants'
```

---

## 📚 Additional Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://docs.pmnd.rs/zustand/)

### Design References
- [TikTok UX Patterns](https://www.tiktok.com)
- [Dineout (India)](https://www.dineout.co.in/) - Reservation + Deposit model
- [OpenTable](https://www.opentable.com/) - Traditional reservations

### Backend Integration
- See `src/lib/api/reservations.ts` for API templates
- See `src/lib/api/restaurants.ts` for API templates
- Backend repo: [GitHub - 123R3N321/FoodTok](https://github.com/123R3N321/FoodTok)

---

## 📝 Changelog

### v2.0 - November 4, 2025
- ✅ Added complete reservation system
- ✅ Created ReservationModal component
- ✅ Created HoldTimer component
- ✅ Created Checkout page
- ✅ Created Reservations list page
- ✅ Implemented race condition prevention
- ✅ Implemented idempotency enforcement
- ✅ Added 10-minute hold timer
- ✅ Added refund policy logic
- ✅ Created visual demo page
- ✅ Consolidated API structure
- ✅ Updated documentation

### v1.0 - Previous
- ✅ Initial app structure
- ✅ Authentication flow
- ✅ Discovery feed
- ✅ Restaurant details
- ✅ Shopping cart (food ordering)
- ✅ Profile page

---

## 🎓 For New Team Members

### Getting Started Checklist

- [ ] Clone repository and install dependencies
- [ ] Run `npm run dev` and verify app works
- [ ] Test on mobile device (find your IP)
- [ ] Login with demo credentials
- [ ] Explore all pages: Discovery, Restaurant Detail, Checkout, Reservations, Profile
- [ ] Visit `/demo` page to see reservation system in action
- [ ] Read this README fully (yes, all of it! 😊)
- [ ] Review `src/lib/api/` folder structure
- [ ] Check TypeScript types in `src/types/`
- [ ] Run tests: `npm test`
- [ ] Join team Slack/Discord
- [ ] Ask questions!

### Your First Contribution

Good starter tasks:
1. Fix a UI bug (check GitHub issues)
2. Add a new UI component
3. Write tests for existing components
4. Improve error messages
5. Update documentation

---

**Built with ❤️ by the FoodTok Team**

**Questions?** Open an issue or ask in the team channel.

**Last Updated:** November 4, 2025

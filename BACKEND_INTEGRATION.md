# 🔌 Backend Integration Guide

**For Backend Developers: How to Connect Your APIs to This Frontend**

---

## 🎯 Overview

The frontend is **100% complete** and currently uses **mock APIs** for development. Your job is to implement **8 real API endpoints** that match the mock interface.

### Why This Approach?
- ✅ Frontend team didn't wait for you (unblocked)
- ✅ You have complete API specifications with types
- ✅ Integration will take < 1 day once APIs are done
- ✅ No frontend code changes needed

---

## 📋 Quick Checklist

### Phase 1: Setup (15 min)
- [ ] Clone this repo
- [ ] Run `npm install && npm run dev`
- [ ] Test the app at `http://localhost:3000`
- [ ] Create a test reservation to see the full flow
- [ ] Read `src/lib/api/reservations.ts` (your template)

### Phase 2: Build APIs (1-2 weeks)
- [ ] Set up PostgreSQL database
- [ ] Set up Redis for distributed locking
- [ ] Implement 6 reservation endpoints
- [ ] Implement 2 restaurant endpoints
- [ ] Test with Postman/curl

### Phase 3: Integration (1 day)
- [ ] Set `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- [ ] Edit `src/lib/api/index.ts` (comment mocks, uncomment real)
- [ ] Test full flow end-to-end
- [ ] Fix bugs and edge cases

---

## 🏗️ What You Need to Build

### Database Schema

#### Tables Needed

**1. reservations**
```sql
CREATE TABLE reservations (
  reservation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(user_id),
  restaurant_id UUID NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
  confirmation_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'FT-ABC123'
  deposit_amount DECIMAL(10, 2) NOT NULL,
  deposit_paid BOOLEAN DEFAULT false,
  payment_last4 VARCHAR(4),
  payment_brand VARCHAR(50), -- 'Visa', 'Mastercard', etc.
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  UNIQUE(restaurant_id, date, time, user_id) -- Prevent duplicates
);

CREATE INDEX idx_user_reservations ON reservations(user_id, date, status);
CREATE INDEX idx_restaurant_slots ON reservations(restaurant_id, date, time, status);
```

**2. holds** (temporary 10-minute holds)
```sql
CREATE TABLE holds (
  hold_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL, -- created_at + 10 minutes
  UNIQUE(user_id, expires_at) -- One hold per user at a time
);

CREATE INDEX idx_hold_expiry ON holds(expires_at) WHERE expires_at > NOW();
```

**3. restaurant_capacity** (inventory tracking)
```sql
CREATE TABLE restaurant_capacity (
  restaurant_id UUID NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  total_tables INTEGER DEFAULT 10,
  available_tables INTEGER DEFAULT 10,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (restaurant_id, date, time)
);

CREATE INDEX idx_capacity_check ON restaurant_capacity(restaurant_id, date, time);
```

### Redis Keys (Distributed Locking)

```
Key Format: lock:reservation:{restaurantId}:{date}:{time}
Value: {userId} (who acquired the lock)
TTL: 5 seconds (lock timeout)

Example:
lock:reservation:rest_001:2025-11-15:19:00 = "user_123"
```

---

## 🔗 API Endpoints to Implement

### 1. Check Availability
**Endpoint:** `POST /api/reservations/availability`

**Request:**
```json
{
  "restaurantId": "rest_001",
  "date": "2025-11-15",
  "partySize": 2
}
```

**Response:**
```json
{
  "slots": [
    {
      "time": "17:00",
      "available": true,
      "availableTables": 10,
      "totalTables": 10
    },
    {
      "time": "19:00",
      "available": true,
      "availableTables": 3,
      "totalTables": 10
    }
  ],
  "depositPerPerson": 25,
  "totalDeposit": 50
}
```

**Logic:**
```python
def check_availability(restaurant_id, date, party_size):
    # Get all time slots for the day (11:00 AM - 10:00 PM, every 30 min)
    time_slots = generate_time_slots(11, 22, 30)
    
    slots = []
    for time in time_slots:
        # Count existing reservations + holds for this slot
        reserved = count_reservations(restaurant_id, date, time) + \
                   count_active_holds(restaurant_id, date, time)
        
        available_tables = 10 - reserved
        
        slots.append({
            'time': time,
            'available': available_tables > 0,
            'availableTables': available_tables,
            'totalTables': 10
        })
    
    # Get deposit amount from restaurant settings
    deposit = get_restaurant_deposit(restaurant_id)  # $25
    
    return {
        'slots': slots,
        'depositPerPerson': deposit,
        'totalDeposit': deposit * party_size
    }
```

---

### 2. Create Hold (CRITICAL - NEEDS LOCKING!)
**Endpoint:** `POST /api/reservations/hold`

**Request:**
```json
{
  "userId": "user_123",
  "restaurantId": "rest_001",
  "date": "2025-11-15",
  "time": "19:00",
  "partySize": 2
}
```

**Response:**
```json
{
  "hold": {
    "holdId": "hold_abc123",
    "userId": "user_123",
    "restaurantId": "rest_001",
    "date": "2025-11-15",
    "time": "19:00",
    "partySize": 2,
    "depositAmount": 50,
    "createdAt": 1699123456789,
    "expiresAt": 1699124056789
  },
  "totalDeposit": 50,
  "expiresIn": 600
}
```

**Logic (IMPORTANT - Race Condition Prevention):**
```python
def create_hold(user_id, restaurant_id, date, time, party_size):
    # 1. Check if user already has an active hold
    existing_hold = get_user_active_hold(user_id)
    if existing_hold:
        raise Exception("You already have an active reservation hold")
    
    # 2. ACQUIRE DISTRIBUTED LOCK (5-second timeout)
    lock_key = f"lock:reservation:{restaurant_id}:{date}:{time}"
    lock_acquired = redis.set(lock_key, user_id, nx=True, ex=5)
    
    if not lock_acquired:
        raise Exception("Another user is currently booking this slot. Please try again.")
    
    try:
        # 3. Check capacity (inside lock!)
        reserved = count_reservations(restaurant_id, date, time) + \
                   count_active_holds(restaurant_id, date, time)
        available = 10 - reserved
        
        if available <= 0:
            raise Exception("No tables available for this time slot")
        
        # 4. Create hold record
        hold = {
            'hold_id': generate_uuid(),
            'user_id': user_id,
            'restaurant_id': restaurant_id,
            'date': date,
            'time': time,
            'party_size': party_size,
            'deposit_amount': 25 * party_size,
            'created_at': now(),
            'expires_at': now() + timedelta(minutes=10)
        }
        
        db.insert('holds', hold)
        
        # 5. Schedule cleanup job (or use PostgreSQL trigger)
        schedule_hold_cleanup(hold['hold_id'], hold['expires_at'])
        
        return hold
        
    finally:
        # 6. ALWAYS RELEASE LOCK
        redis.delete(lock_key)
```

---

### 3. Get Active Hold
**Endpoint:** `GET /api/reservations/hold/active?userId=user_123`

**Response:**
```json
{
  "holdId": "hold_abc123",
  "restaurantId": "rest_001",
  "restaurantName": "Bella Notte",
  "date": "2025-11-15",
  "time": "19:00",
  "partySize": 2,
  "depositAmount": 50,
  "expiresAt": 1699124056789
}
```

**Logic:**
```python
def get_user_active_hold(user_id):
    return db.query("""
        SELECT h.*, r.name as restaurant_name
        FROM holds h
        JOIN restaurants r ON h.restaurant_id = r.id
        WHERE h.user_id = %s AND h.expires_at > NOW()
        LIMIT 1
    """, (user_id,))
```

---

### 4. Confirm Reservation (CRITICAL - PAYMENT!)
**Endpoint:** `POST /api/reservations/confirm`

**Request:**
```json
{
  "holdId": "hold_abc123",
  "userId": "user_123",
  "paymentMethod": {
    "type": "credit-card",
    "last4": "4242",
    "cardBrand": "Visa"
  },
  "specialRequests": "Window seat please"
}
```

**Response:**
```json
{
  "reservation": {
    "reservationId": "res_abc123",
    "confirmationCode": "FT-ABC123",
    "userId": "user_123",
    "restaurantId": "rest_001",
    "restaurantName": "Bella Notte",
    "date": "2025-11-15",
    "time": "19:00",
    "partySize": 2,
    "depositAmount": 50,
    "status": "confirmed",
    "createdAt": 1699123456789
  },
  "message": "Reservation confirmed! Show code FT-ABC123 at the restaurant."
}
```

**Logic (CRITICAL - ATOMIC TRANSACTION):**
```python
def confirm_reservation(hold_id, user_id, payment_method, special_requests=None):
    # 1. Get hold (with lock)
    hold = db.query_with_lock("""
        SELECT * FROM holds 
        WHERE hold_id = %s AND user_id = %s 
        FOR UPDATE
    """, (hold_id, user_id))
    
    if not hold:
        raise Exception("Hold not found or expired")
    
    if hold['expires_at'] < now():
        raise Exception("Hold has expired. Please create a new reservation.")
    
    # 2. IDEMPOTENCY CHECK - Already confirmed?
    existing = db.query("""
        SELECT * FROM reservations
        WHERE user_id = %s 
          AND restaurant_id = %s
          AND date = %s 
          AND time = %s
          AND status = 'confirmed'
    """, (user_id, hold['restaurant_id'], hold['date'], hold['time']))
    
    if existing:
        # Already confirmed - return existing reservation (no double charge!)
        return existing
    
    # 3. PROCESS PAYMENT (Stripe integration)
    try:
        charge = stripe.Charge.create(
            amount=int(hold['deposit_amount'] * 100),  # cents
            currency='usd',
            source=payment_method['token'],
            description=f"Deposit for {hold['restaurant_id']} on {hold['date']}"
        )
    except stripe.error.CardError as e:
        raise Exception(f"Payment failed: {e.user_message}")
    
    # 4. CREATE RESERVATION (atomic transaction)
    with db.transaction():
        reservation = {
            'reservation_id': generate_uuid(),
            'user_id': user_id,
            'restaurant_id': hold['restaurant_id'],
            'date': hold['date'],
            'time': hold['time'],
            'party_size': hold['party_size'],
            'status': 'confirmed',
            'confirmation_code': generate_confirmation_code(),  # FT-ABC123
            'deposit_amount': hold['deposit_amount'],
            'deposit_paid': True,
            'payment_last4': payment_method['last4'],
            'payment_brand': payment_method['cardBrand'],
            'special_requests': special_requests,
            'created_at': now()
        }
        
        db.insert('reservations', reservation)
        
        # 5. DELETE HOLD (important!)
        db.delete('holds', hold_id=hold_id)
    
    # 6. SEND CONFIRMATION EMAIL
    send_email(
        to=user['email'],
        subject=f"Reservation Confirmed - {restaurant['name']}",
        template='reservation_confirmation',
        data=reservation
    )
    
    return reservation
```

---

### 5. Get User Reservations
**Endpoint:** `GET /api/reservations/user/:userId?filter=upcoming`

**Query Params:**
- `filter`: `upcoming` | `past`

**Response:**
```json
[
  {
    "reservationId": "res_abc123",
    "confirmationCode": "FT-ABC123",
    "restaurantId": "rest_001",
    "restaurantName": "Bella Notte",
    "restaurantImage": "https://...",
    "cuisine": ["Italian"],
    "date": "2025-11-15",
    "time": "19:00",
    "partySize": 2,
    "depositAmount": 50,
    "status": "confirmed",
    "createdAt": 1699123456789
  }
]
```

**Logic:**
```python
def get_user_reservations(user_id, filter='upcoming'):
    if filter == 'upcoming':
        condition = "date >= CURRENT_DATE AND status = 'confirmed'"
        order = "date ASC, time ASC"
    else:  # past
        condition = "date < CURRENT_DATE OR status IN ('cancelled', 'completed')"
        order = "date DESC, time DESC"
    
    return db.query(f"""
        SELECT r.*, rest.name, rest.images[0] as image, rest.cuisine
        FROM reservations r
        JOIN restaurants rest ON r.restaurant_id = rest.id
        WHERE r.user_id = %s AND {condition}
        ORDER BY {order}
    """, (user_id,))
```

---

### 6. Cancel Reservation (WITH REFUND)
**Endpoint:** `DELETE /api/reservations/:id`

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reservation cancelled. Full refund will be processed in 3-5 business days.",
  "refundAmount": 50,
  "refundPercentage": 100
}
```

**Logic (REFUND POLICY):**
```python
def cancel_reservation(reservation_id, user_id):
    # 1. Get reservation
    res = db.query("""
        SELECT * FROM reservations
        WHERE reservation_id = %s AND user_id = %s
    """, (reservation_id, user_id))
    
    if not res:
        raise Exception("Reservation not found")
    
    if res['status'] == 'cancelled':
        raise Exception("Reservation already cancelled")
    
    # 2. Calculate refund based on cancellation policy
    reservation_time = datetime.combine(res['date'], res['time'])
    hours_until = (reservation_time - now()).total_seconds() / 3600
    
    if hours_until >= 24:
        refund_percentage = 100  # Full refund
        message = "Full refund will be processed in 3-5 business days."
    elif hours_until >= 4:
        refund_percentage = 50   # 50% refund
        message = "50% refund will be processed in 3-5 business days."
    else:
        refund_percentage = 0    # No refund
        message = "No refund available (less than 4 hours notice)."
    
    refund_amount = (res['deposit_amount'] * refund_percentage) / 100
    
    # 3. Process refund via Stripe
    if refund_amount > 0:
        stripe.Refund.create(
            charge=res['stripe_charge_id'],
            amount=int(refund_amount * 100)
        )
    
    # 4. Update reservation status
    db.update('reservations', {
        'status': 'cancelled',
        'cancelled_at': now()
    }, reservation_id=reservation_id)
    
    # 5. Send cancellation email
    send_email(user['email'], 'Reservation Cancelled', {...})
    
    return {
        'success': True,
        'message': message,
        'refundAmount': refund_amount,
        'refundPercentage': refund_percentage
    }
```

---

### 7. Get Restaurant Discovery Feed
**Endpoint:** `GET /api/restaurants/discovery?userId=user_123&limit=20`

**Response:**
```json
[
  {
    "restaurant": {
      "id": "rest_001",
      "name": "Bella Notte",
      "description": "Authentic Italian...",
      "cuisine": ["Italian"],
      "priceRange": "$$",
      "rating": 4.7,
      "reviewCount": 342,
      "images": ["https://..."],
      "location": {
        "address": "234 Greenwich Ave",
        "city": "New York",
        "distance": 0.8
      },
      "reservationInfo": {
        "acceptsReservations": true,
        "depositPerPerson": 25
      }
    },
    "matchScore": 92,
    "matchReason": "Loves Italian cuisine • Romantic atmosphere"
  }
]
```

**Logic (AI Matching Algorithm):**
```python
def get_discovery_feed(user_id, limit=20):
    # 1. Get user preferences
    prefs = get_user_preferences(user_id)
    
    # 2. Get user's swipe history
    history = get_swipe_history(user_id)
    liked_restaurants = [s['restaurant_id'] for s in history if s['action'] == 'like']
    passed_restaurants = [s['restaurant_id'] for s in history if s['action'] == 'pass']
    
    # 3. Query restaurants matching preferences
    restaurants = db.query("""
        SELECT * FROM restaurants
        WHERE id NOT IN (%s)  -- Exclude already swiped
          AND cuisine && %s    -- Match user's cuisines (PostgreSQL array overlap)
          AND price_range = %s
          AND ST_Distance(location, %s) <= %s  -- Within distance
        ORDER BY rating DESC, review_count DESC
        LIMIT %s
    """, (passed_restaurants + liked_restaurants, 
          prefs['cuisines'], 
          prefs['price_range'],
          prefs['location'],
          prefs['max_distance'],
          limit))
    
    # 4. Calculate match scores using AI/ML
    feed = []
    for restaurant in restaurants:
        match_score = calculate_match_score(user_id, restaurant)
        match_reason = generate_match_reason(prefs, restaurant)
        
        feed.append({
            'restaurant': restaurant,
            'matchScore': match_score,
            'matchReason': match_reason
        })
    
    return feed
```

---

### 8. Get Restaurant Details
**Endpoint:** `GET /api/restaurants/:id`

**Response:**
```json
{
  "id": "rest_001",
  "name": "Bella Notte",
  "description": "Authentic Italian cuisine...",
  "cuisine": ["Italian", "Mediterranean"],
  "priceRange": "$$",
  "rating": 4.7,
  "reviewCount": 342,
  "images": ["https://...", "https://..."],
  "location": {
    "address": "234 Greenwich Ave",
    "city": "New York",
    "state": "NY",
    "zipCode": "10011",
    "latitude": 40.7359,
    "longitude": -74.0014
  },
  "reservationInfo": {
    "acceptsReservations": true,
    "depositPerPerson": 25,
    "minimumPartySize": 2,
    "maximumPartySize": 12,
    "cancellationPolicy": "Full refund 24+ hours before..."
  },
  "hours": {
    "monday": { "isOpen": true, "openTime": "17:00", "closeTime": "22:00" },
    ...
  },
  "features": ["Outdoor Seating", "Wine Bar", "Romantic"]
}
```

---

## 🔥 Critical Implementation Details

### 1. Distributed Locking (MUST IMPLEMENT!)

**Why:** Prevents race conditions when multiple users book same slot simultaneously

**Implementation Options:**

**Option A: Redis (Recommended)**
```python
import redis

redis_client = redis.Redis(host='localhost', port=6379)

def acquire_lock(restaurant_id, date, time, user_id, timeout=5):
    lock_key = f"lock:reservation:{restaurant_id}:{date}:{time}"
    return redis_client.set(lock_key, user_id, nx=True, ex=timeout)

def release_lock(restaurant_id, date, time):
    lock_key = f"lock:reservation:{restaurant_id}:{date}:{time}"
    redis_client.delete(lock_key)

# Usage in create_hold:
if not acquire_lock(restaurant_id, date, time, user_id):
    raise Exception("Slot is being booked by another user")

try:
    # ... check capacity and create hold ...
finally:
    release_lock(restaurant_id, date, time)
```

**Option B: PostgreSQL Advisory Locks**
```python
def create_hold_with_lock(user_id, restaurant_id, date, time, party_size):
    lock_id = generate_lock_id(restaurant_id, date, time)
    
    with db.transaction():
        # Acquire advisory lock (blocks other transactions)
        db.execute("SELECT pg_advisory_xact_lock(%s)", (lock_id,))
        
        # Check capacity
        # Create hold
        # ...
        
    # Lock automatically released at transaction end
```

---

### 2. Hold Auto-Expiry

**Option A: Background Job (Recommended)**
```python
from celery import Celery

celery = Celery('tasks', broker='redis://localhost:6379')

@celery.task
def cleanup_expired_hold(hold_id):
    hold = db.query("SELECT * FROM holds WHERE hold_id = %s", (hold_id,))
    if hold and hold['expires_at'] < now():
        db.delete('holds', hold_id=hold_id)

# When creating hold:
cleanup_expired_hold.apply_async(
    args=[hold_id],
    eta=hold['expires_at']  # Run at expiry time
)
```

**Option B: PostgreSQL Trigger**
```sql
-- Create function to delete expired holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM holds WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule to run every minute
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-holds', '*/1 * * * *', $$CALL cleanup_expired_holds()$$);
```

---

### 3. Idempotency

**Must handle:**
- User tries to create 2nd hold while 1st is active → Return error
- User submits payment form twice (double-click) → Return existing reservation
- Network retry causes duplicate request → Use idempotency keys

**Implementation:**
```python
# For hold creation:
existing_hold = get_user_active_hold(user_id)
if existing_hold:
    raise Exception("You already have an active reservation hold")

# For payment confirmation:
existing_reservation = db.query("""
    SELECT * FROM reservations
    WHERE user_id = %s AND restaurant_id = %s 
      AND date = %s AND time = %s AND status = 'confirmed'
""", (...))

if existing_reservation:
    return existing_reservation  # Don't charge again!
```

---

## 🧪 Testing Your APIs

### Use curl or Postman

**1. Check Availability:**
```bash
curl -X POST http://localhost:8080/api/reservations/availability \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest_001",
    "date": "2025-11-15",
    "partySize": 2
  }'
```

**2. Create Hold:**
```bash
curl -X POST http://localhost:8080/api/reservations/hold \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user_123",
    "restaurantId": "rest_001",
    "date": "2025-11-15",
    "time": "19:00",
    "partySize": 2
  }'
```

**3. Confirm Reservation:**
```bash
curl -X POST http://localhost:8080/api/reservations/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "holdId": "hold_abc123",
    "userId": "user_123",
    "paymentMethod": {
      "type": "credit-card",
      "last4": "4242",
      "cardBrand": "Visa"
    }
  }'
```

---

## 🔗 Integration Steps

### Step 1: Set Frontend API URL
```bash
# Create .env.local in frontend directory
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
```

### Step 2: Switch to Real APIs
Edit `src/lib/api/index.ts`:
```typescript
// Comment out these lines:
// export * from './mock-reservations';
// export * from './mock-restaurants';

// Uncomment these lines:
export * from './reservations';
export * from './restaurants';
```

### Step 3: Test Integration
```bash
# Start backend
cd backend && python manage.py runserver

# Start frontend
cd frontend && npm run dev

# Test full flow:
# 1. Login at http://localhost:3000
# 2. Browse discovery feed
# 3. Click restaurant → "Reserve Table"
# 4. Select date, time, party size
# 5. Pay deposit
# 6. Check confirmation code appears
# 7. Go to /reservations to see booking
```

### Step 4: Debug Common Issues

**CORS Errors:**
```python
# Add to backend (Django)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3002",
]
```

**Auth Token Issues:**
```python
# Ensure JWT token is in request headers
Authorization: Bearer <token>

# Frontend sends this automatically (see src/lib/api/index.ts)
```

**Payment Failures:**
```python
# Use Stripe test mode
STRIPE_SECRET_KEY = "sk_test_..."

# Test cards:
# 4242424242424242 (success)
# 4000000000000002 (decline)
```

---

## 📞 Support

**Questions about integration?**
- Read `INTERNAL_README.md` for architecture details
- Check `src/lib/api/reservations.ts` for TypeScript interfaces
- Check `src/types/reservation.ts` for all type definitions
- Ask in team channel

**Frontend Lead:** Pranjal Mishra  
**Backend Lead:** Ren (Auth), Yuxuan/Aaron (APIs)

---

**Good luck! The frontend is waiting for you! 🚀**

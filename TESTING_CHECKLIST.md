# 🧪 FoodTok Testing Checklist

## Testing Instructions
1. Open http://localhost:3000 in your browser
2. For best experience, use Chrome DevTools mobile view (F12 → Toggle device toolbar)
3. Test on actual mobile device by visiting http://YOUR_IP:3000
4. Check each item below and mark ✅ when verified

---

## 🔐 Authentication Flow

### Login Page (`/login`)
- [ ] Can access login page
- [ ] Email validation works (shows error for invalid format)
- [ ] Password field has show/hide toggle
- [ ] Login with `demo@example.com` / `password123` works
- [ ] Error message shows for invalid credentials
- [ ] Loading spinner appears during login
- [ ] Redirects to discovery page after successful login
- [ ] "Sign up" link navigates to signup page

### Signup Page (`/signup`)
- [ ] Can access signup page
- [ ] All form fields validate properly
- [ ] Password strength indicator works
- [ ] Confirm password validation works
- [ ] Can create new account
- [ ] Redirects to onboarding after signup
- [ ] "Login" link navigates to login page

### Onboarding Page (`/onboarding`)
- [ ] Shows after new user signup
- [ ] Can select multiple cuisines
- [ ] Can select dietary restrictions
- [ ] Can adjust price range slider
- [ ] Can set max distance
- [ ] "Get Started" button saves preferences
- [ ] Redirects to discovery page after completion

---

## 🎯 Discovery Queue (`/` - Main Page)

### Card Display
- [ ] Restaurant cards load and display
- [ ] Match score badge shows percentage
- [ ] Restaurant image displays correctly
- [ ] Restaurant name and rating visible
- [ ] Cuisine tags display properly
- [ ] Location information shows
- [ ] "Why we picked this" reason displays
- [ ] **CURSOR: Shows pointer cursor when hovering over card** ✨ (FIXED)

### Swipe Interactions
- [ ] Can swipe left to pass (card animates left)
- [ ] Can swipe right to like (card animates right)
- [ ] Green overlay shows when swiping right
- [ ] Red overlay shows when swiping left
- [ ] Card snaps back if swipe distance is too short
- [ ] Next card appears after swipe
- [ ] **CURSOR: Shows grabbing cursor while dragging** ✨ (FIXED)

### Button Actions
- [ ] "Pass" button (X) works
- [ ] "Like" button (Heart) works
- [ ] Buttons animate on click
- [ ] Card counter updates after each swipe

### Card Tap/Click
- [ ] **Tapping card navigates to restaurant details** ✨ (VERIFIED)
- [ ] **Cursor shows pointer on hover** ✨ (FIXED)
- [ ] Doesn't navigate while dragging
- [ ] Touch tap works on mobile

### Top Controls
- [ ] Undo button brings back last card
- [ ] Undo disabled when no history
- [ ] Refresh button reloads queue
- [ ] Card counter shows remaining restaurants
- [ ] Loading spinner shows during refresh

### Edge Cases
- [ ] "No more restaurants" message when queue empty
- [ ] "Load More" button works
- [ ] Error message displays if API fails
- [ ] Swipe instruction tooltip shows for first card

---

## 🍽️ Restaurant Details (`/restaurant/[id]`)

### Page Display
- [ ] Restaurant header image loads
- [ ] Back button returns to discovery
- [ ] Favorite (heart) button visible
- [ ] Restaurant name and rating display
- [ ] Full description visible
- [ ] Cuisine tags show
- [ ] Address and hours display
- [ ] **"Reserve a Table" button prominent** ✨

### Menu Section
- [ ] Menu categories filter works
- [ ] "All" category shows everything
- [ ] Menu items display with images
- [ ] Item prices show correctly
- [ ] Descriptions readable
- [ ] Dietary info badges display

### Add to Cart
- [ ] Quantity selector works (+/-)
- [ ] Can't reduce below 1
- [ ] "Add to Cart" button works
- [ ] Cart notification appears briefly
- [ ] Item added to cart successfully

### Multiple Items
- [ ] Can add different items from same restaurant
- [ ] Quantities tracked separately
- [ ] Total updates correctly

### Navigation
- [ ] Back button works
- [ ] Bottom nav still accessible
- [ ] Can navigate to cart

---

## 🎫 Reservation System (NEW FEATURE)

### Reserve Table Button
- [ ] "Reserve a Table" button visible on restaurant page
- [ ] **Button has calendar icon** ✨
- [ ] Clicking opens reservation modal
- [ ] Modal animates smoothly

### Reservation Modal - Step 1 (Date & Party)
- [ ] Modal displays with restaurant image
- [ ] Close (X) button works
- [ ] Progress indicator shows "Step 1"
- [ ] Next 30 days of dates display
- [ ] Can select a date
- [ ] Selected date highlights in blue
- [ ] Party size controls work (+/-)
- [ ] Can't reduce below 1 guest
- [ ] Can't increase above 20 guests
- [ ] Deposit calculation shows ($25 × guests)
- [ ] "Check Availability" button enabled when date selected
- [ ] Loading spinner shows during check

### Reservation Modal - Step 2 (Time Selection)
- [ ] Available time slots display
- [ ] Times shown in 30-minute intervals
- [ ] Remaining capacity shows per slot
- [ ] Can select a time slot
- [ ] Selected time highlights in blue
- [ ] "Back" link returns to step 1
- [ ] "Reserve Table (10 Minutes)" button enabled when time selected

### Hold Creation
- [ ] Hold created successfully
- [ ] Redirects to checkout page
- [ ] **10-minute countdown timer appears at top** ✨
- [ ] Timer shows remaining time (MM:SS)
- [ ] Timer turns orange when < 2 minutes
- [ ] Timer turns red when < 1 minute
- [ ] Warning message shows when urgent

### Checkout with Reservation
- [ ] Hold details display at top
- [ ] Restaurant name and time shown
- [ ] Deposit amount correct
- [ ] Party size correct
- [ ] Can add special requests
- [ ] Payment form works
- [ ] "Confirm Reservation" button processes
- [ ] Success message with confirmation code
- [ ] Reservation appears in history

### Error Handling
- [ ] Error shows if no availability
- [ ] Can't create multiple holds
- [ ] Hold expires after 10 minutes
- [ ] Error if trying to confirm expired hold
- [ ] Payment failure shows error message

### Reservations Page (`/reservations`)
- [ ] Upcoming reservations display
- [ ] Past reservations in separate tab
- [ ] Confirmation codes visible
- [ ] Restaurant details shown
- [ ] Date and time correct
- [ ] Can modify reservation (if > 4 hours away)
- [ ] Can cancel reservation
- [ ] Refund policy shows correctly

---

## 🛒 Shopping Cart (`/cart`)

### Cart Display
- [ ] Cart items display with images
- [ ] Item names and prices show
- [ ] Quantity for each item visible
- [ ] Subtotal calculates correctly
- [ ] Tax (8.875%) calculated
- [ ] Delivery fee added ($3.99)
- [ ] Total is correct

### Cart Actions
- [ ] Can increase item quantity
- [ ] Can decrease item quantity
- [ ] Item removes when quantity hits 0
- [ ] "Remove" button works
- [ ] Totals update in real-time

### Empty Cart
- [ ] Empty cart message shows
- [ ] "Browse Restaurants" button works

### Different Restaurant Warning
- [ ] Adding item from different restaurant shows warning
- [ ] Can cancel to keep current cart
- [ ] Can confirm to clear and add new item

### Checkout Button
- [ ] "Proceed to Checkout" button visible
- [ ] Button disabled when cart empty
- [ ] Navigates to checkout page

---

## 💳 Checkout (`/checkout`)

### Order Summary
- [ ] All cart items display
- [ ] Restaurant name shows
- [ ] Price breakdown visible
- [ ] Total matches cart

### Delivery Details
- [ ] Address form works
- [ ] Phone number validates
- [ ] Special instructions text area works

### Payment Method
- [ ] Card number field validates
- [ ] Expiry date formats correctly
- [ ] CVV field limits to 3-4 digits
- [ ] Card brand icon shows

### Order Placement
- [ ] "Place Order" button works
- [ ] Loading state shows
- [ ] Success message displays
- [ ] Redirects to order confirmation
- [ ] Cart clears after order

### Validation
- [ ] Can't proceed without required fields
- [ ] Error messages show for invalid inputs
- [ ] Card validation works

---

## ❤️ Favorites Page (`/favorites`)

### Display
- [ ] Liked restaurants display in grid
- [ ] Restaurant images show
- [ ] Names and ratings visible
- [ ] "View Details" button works

### Interactions
- [ ] Clicking card navigates to restaurant
- [ ] Can unlike (heart icon toggles)
- [ ] Restaurant removes from favorites

### Empty State
- [ ] Empty message shows when no favorites
- [ ] "Discover Restaurants" button works

---

## 👤 Profile Page (`/profile`)

### User Information
- [ ] User name displays
- [ ] Email shows
- [ ] Profile image placeholder visible

### Order History
- [ ] Past orders display
- [ ] Order details show (restaurant, items, date)
- [ ] Order status visible
- [ ] Total price correct

### Reservations Section
- [ ] **Upcoming reservations display** ✨
- [ ] **Confirmation codes visible** ✨
- [ ] **Date and time correct** ✨
- [ ] **Can view reservation details** ✨

### Statistics
- [ ] Total orders count correct
- [ ] Favorite cuisines display
- [ ] Activity stats show

### Actions
- [ ] "Edit Profile" button works
- [ ] Can update preferences
- [ ] "View All Orders" button works

---

## ⚙️ Settings Page (`/settings`)

### Preferences
- [ ] Current preferences display
- [ ] Can update cuisines
- [ ] Can change dietary restrictions
- [ ] Price range slider works
- [ ] Max distance updates

### Account Settings
- [ ] Email visible
- [ ] Name editable
- [ ] Profile image uploader visible

### App Settings
- [ ] Theme toggle works (light/dark)
- [ ] Language selector visible
- [ ] Notification toggles work

### Logout
- [ ] Logout button visible
- [ ] Clicking logs out user
- [ ] Redirects to login page
- [ ] Session clears

---

## 🧭 Navigation

### Bottom Navigation Bar
- [ ] Shows on all main pages
- [ ] Discover icon (home)
- [ ] Cart icon with badge
- [ ] Favorites icon
- [ ] Profile icon
- [ ] Active state highlights current page
- [ ] All nav items clickable

### Back Navigation
- [ ] Browser back button works
- [ ] In-app back buttons work
- [ ] Returns to correct previous page

### Deep Links
- [ ] Can navigate directly to `/restaurant/rest_001`
- [ ] Can access `/cart` directly
- [ ] Protected routes redirect to login

---

## 🎨 UI/UX

### Responsive Design
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1280px width)
- [ ] Touch targets large enough (44px minimum)
- [ ] Text readable on all screen sizes

### Animations
- [ ] Page transitions smooth
- [ ] Button hover effects work
- [ ] Loading spinners animate
- [ ] Card swipes fluid
- [ ] Modal open/close animates
- [ ] Notification toasts slide in

### Dark Mode
- [ ] Can toggle dark mode in settings
- [ ] All pages support dark mode
- [ ] Colors readable in dark mode
- [ ] Images have proper contrast

### Performance
- [ ] Page loads quickly
- [ ] Images load progressively
- [ ] No janky animations
- [ ] Scrolling smooth
- [ ] No console errors

---

## 🐛 Error States

### Network Errors
- [ ] Shows error message if API fails
- [ ] "Try Again" button works
- [ ] Graceful degradation

### Empty States
- [ ] Empty cart message
- [ ] No favorites message
- [ ] No order history message
- [ ] End of discovery queue message

### Validation Errors
- [ ] Form validation messages clear
- [ ] Error styling visible
- [ ] Can correct and resubmit

---

## 🔄 State Management

### Persistence
- [ ] Login persists across page refresh
- [ ] Cart persists across sessions
- [ ] Preferences saved correctly
- [ ] Favorites persist

### Updates
- [ ] Cart badge updates immediately
- [ ] Like count updates
- [ ] Order history reflects new orders
- [ ] Profile changes save

---

## 📱 Mobile-Specific

### Touch Gestures
- [ ] Swipe gestures work smoothly
- [ ] Tap targets large enough
- [ ] No accidental clicks
- [ ] Pinch zoom disabled on cards

### Mobile Safari
- [ ] Works in iOS Safari
- [ ] Bottom nav doesn't clash with browser UI
- [ ] Viewport height correct

### Android Chrome
- [ ] Works in Android Chrome
- [ ] Address bar doesn't break layout
- [ ] Smooth scrolling

---

## ✅ Color Scheme Verification

### Primary Colors (Blue & Orange)
- [ ] **Primary blue used for main buttons** ✨ (VERIFIED)
- [ ] **Orange accent used appropriately** ✨ (VERIFIED)
- [ ] **No purple colors in reservation modal** ✨ (FIXED)
- [ ] **No pink colors anywhere** ✨ (FIXED)
- [ ] **Discovery page maintains blue/orange scheme** ✨ (VERIFIED)
- [ ] **All buttons use blue/orange/green/red** ✨ (VERIFIED)

---

## 🚀 Final Checklist Before GitHub Push

- [ ] All critical bugs fixed
- [ ] Cursor behavior correct (pointer on hover, grabbing on drag)
- [ ] Color scheme consistent (blue/orange, no purple)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Dev server runs without crashes
- [ ] All features tested and working
- [ ] README accurate
- [ ] Documentation up to date

---

## 📝 Notes & Issues Found

**Issues Fixed:**
1. ✅ Cursor not showing pointer on discovery cards - FIXED
2. ✅ Purple colors in reservation system - CHANGED TO BLUE
3. ✅ All TypeScript compilation errors - RESOLVED

**Known Limitations (By Design):**
- Mock API data (not real backend)
- Simulated payment processing
- Static restaurant images
- No real-time notifications
- Hold expiry uses setTimeout (not actual DynamoDB TTL)

**Future Enhancements:**
- Real backend integration
- Actual payment processing
- Real restaurant data from APIs
- Push notifications
- Advanced filtering and search
- Social features (share restaurants)
- Restaurant reviews and ratings submission

---

## 🎯 Testing Summary

**Total Tests:** 200+
**Critical Features:** 15+
**Pages Tested:** 10+

After completing this checklist, the app is ready for:
- GitHub commit and push
- Demo presentation
- User testing
- Backend integration
- Production deployment planning

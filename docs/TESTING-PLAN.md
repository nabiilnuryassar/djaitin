# Testing Plan - Djaitin Application

## Overview
Comprehensive testing plan untuk aplikasi Djaitin berdasarkan PRD dan use case analysis.

## Test Environment
- **Base URL**: http://localhost:8004
- **Demo Accounts**:
  - Customer: `customer@djaitin.com` / `password`
  - Admin: `admin@djaitin.com` / `password`
  - Owner: `owner@djaitin.com` / `password`
  - Kasir: `kasir@djaitin.com` / `password`
  - Produksi: `produksi@djaitin.com` / `password`

---

## Phase 1: Landing Page (Guest)

### TC-LP-01: Landing Page Load
**Objective**: Verify landing page loads correctly without errors
**Steps**:
1. Navigate to http://localhost:8004
2. Verify page title contains "Djaitin"
3. Check for JavaScript errors in console
4. Verify key sections visible:
   - Navigation bar
   - Hero section
   - Services section
   - Footer

**Expected**: Page loads successfully, no console errors, all sections visible

---

### TC-LP-02: Service Navigation Links
**Objective**: Verify service detail pages are accessible
**Steps**:
1. Navigate to http://localhost:8004
2. Click "Layanan Tailor" link
3. Verify navigation to /services/tailor
4. Click "Ready-to-Wear" link
5. Verify navigation to /services/ready-to-wear
6. Click "Konveksi" link
7. Verify navigation to /services/convection

**Expected**: All service pages load successfully

---

### TC-LP-03: Login/Registration CTAs
**Objective**: Verify authentication entry points work
**Steps**:
1. Navigate to http://localhost:8004
2. Click "Masuk" button
3. Verify redirect to login page
4. Navigate back to landing
5. Click "Daftar" button
6. Verify redirect to registration page

**Expected**: Both CTAs navigate to correct auth pages

---

## Phase 2: Customer Authentication

### TC-CUST-AUTH-01: Customer Login
**Objective**: Verify customer can login successfully
**Steps**:
1. Navigate to login page
2. Enter email: `customer@djaitin.com`
3. Enter password: `password`
4. Click "Masuk" button
5. Verify redirect to /app/dashboard
6. Verify user menu shows customer name

**Expected**: Successful login, redirect to customer dashboard

---

### TC-CUST-AUTH-02: Customer Logout
**Objective**: Verify logout functionality with confirmation dialog
**Steps**:
1. Login as customer
2. Click user menu (avatar/name)
3. Click "Keluar" option
4. Verify logout confirmation dialog appears
5. Click "Ya, Keluar" button
6. Verify redirect to landing page

**Expected**: Logout dialog appears, successful logout, redirect to landing

---

### TC-CUST-AUTH-03: Invalid Login
**Objective**: Verify error handling for invalid credentials
**Steps**:
1. Navigate to login page
2. Enter invalid email: `invalid@djaitin.com`
3. Enter password: `wrongpassword`
4. Click "Masuk" button
5. Verify error message displayed

**Expected**: Error message shown, user remains on login page

---

## Phase 3: Customer Dashboard & Navigation

### TC-CUST-DASH-01: Dashboard Load
**Objective**: Verify customer dashboard displays correctly
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/dashboard
2. Verify dashboard sections:
   - Greeting/welcome message
   - Active order status (if any)
   - Quick action buttons
   - Recent notifications
3. Check for console errors

**Expected**: Dashboard loads, all sections visible, no errors

---

### TC-CUST-NAV-01: Bottom Navigation Bar
**Objective**: Verify mobile bottom navigation works
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/dashboard (mobile viewport)
2. Click "Beranda" tab → verify /app/dashboard
3. Click "Tailor" tab → verify /app/tailor/configurator
4. Click "Katalog" tab → verify /app/catalog
5. Click "Pesanan" tab → verify /app/orders
6. Click "Profil" tab → verify /app/profile

**Expected**: All navigation tabs work, correct page loads

---

### TC-CUST-NAV-02: Desktop Navigation Menu
**Objective**: Verify desktop navigation menu
**Precondition**: Logged in as customer (desktop viewport)
**Steps**:
1. Navigate to /app/dashboard
2. Click "Beranda" → verify /app/dashboard
3. Click "Tailor" → verify /app/tailor/configurator
4. Click "Katalog" → verify /app/catalog
5. Click "Pesanan" → verify /app/orders
6. Click "Pembayaran" → verify /app/payments
7. Click "Profil" → verify /app/profile

**Expected**: All menu items navigate correctly

---

## Phase 4: Customer Catalog & Cart

### TC-CUST-CAT-01: Browse Catalog
**Objective**: Verify catalog browsing functionality
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/catalog
2. Verify product grid displays
3. Check product cards show:
   - Image
   - Name
   - Price
   - Stock indicator
4. Apply category filter
5. Apply price filter
6. Verify filtered results

**Expected**: Catalog loads, products visible, filters work

---

### TC-CUST-CAT-02: Product Detail Page
**Objective**: Verify product detail page
**Precondition**: Logged in as customer, products exist
**Steps**:
1. Navigate to /app/catalog
2. Click on first product
3. Verify detail page shows:
   - Product images
   - Title and category
   - Price
   - Stock status
   - Size/variant selector
   - "Tambah ke Cart" button
   - Description

**Expected**: Product detail page loads with all information

---

### TC-CUST-CART-01: Add to Cart
**Objective**: Verify adding product to cart
**Precondition**: Logged in as customer, viewing product
**Steps**:
1. Select size/variant
2. Click "Tambah ke Cart"
3. Verify success message
4. Navigate to /app/cart
5. Verify product appears in cart

**Expected**: Product added to cart, visible in cart page

---

### TC-CUST-CART-02: Update Cart Quantity
**Objective**: Verify cart quantity updates
**Precondition**: Cart has items
**Steps**:
1. Navigate to /app/cart
2. Increase quantity using + button
3. Verify quantity updates
4. Verify subtotal recalculates
5. Decrease quantity using - button
6. Verify quantity updates

**Expected**: Quantity changes, subtotal recalculates correctly

---

### TC-CUST-CART-03: Remove from Cart
**Objective**: Verify removing items from cart
**Precondition**: Cart has items
**Steps**:
1. Navigate to /app/cart
2. Click "Hapus" button on item
3. Verify item removed from cart
4. Verify cart total updates

**Expected**: Item removed, cart updates correctly

---

## Phase 5: Customer Checkout

### TC-CUST-CO-01: Checkout Flow
**Objective**: Verify complete checkout process
**Precondition**: Cart has items, customer has address
**Steps**:
1. Navigate to /app/checkout
2. Step 1: Select shipping address
3. Step 2: Select courier
4. Step 3: Apply voucher (optional)
5. Step 4: Review order summary
6. Verify DP rule displayed
7. Click "Buat Pesanan"
8. Verify order created

**Expected**: Checkout completes, order created, redirect to orders

---

### TC-CUST-CO-02: Checkout Validation
**Objective**: Verify checkout validation
**Precondition**: Cart has items
**Steps**:
1. Navigate to /app/checkout
2. Try to submit without selecting address
3. Verify validation error
4. Try to submit without selecting courier
5. Verify validation error

**Expected**: Validation errors prevent submission

---

## Phase 6: Customer Orders

### TC-CUST-ORD-01: View Orders List
**Objective**: Verify orders list page
**Precondition**: Logged in as customer with orders
**Steps**:
1. Navigate to /app/orders
2. Verify orders list displays
3. Check order cards show:
   - Order number
   - Order type (tailor/RTW/convection)
   - Status badge
   - Total amount
   - Action buttons
4. Click "Aktif" tab → verify filtered
5. Click "Selesai" tab → verify filtered

**Expected**: Orders list loads, tabs filter correctly

---

### TC-CUST-ORD-02: View Order Detail
**Objective**: Verify order detail page
**Precondition**: Customer has orders
**Steps**:
1. Navigate to /app/orders
2. Click on order
3. Verify detail page shows:
   - Order number and status
   - Product/service summary
   - Payment status
   - Shipping info (if applicable)
   - Status timeline
   - Action buttons (upload proof, etc.)

**Expected**: Order detail page loads with complete information

---

### TC-CUST-ORD-03: Cancel Order
**Objective**: Verify order cancellation
**Precondition**: Customer has cancellable order
**Steps**:
1. Navigate to order detail
2. Click "Batalkan Pesanan"
3. Verify confirmation dialog
4. Confirm cancellation
5. Verify order status changes to "Dibatalkan"

**Expected**: Order cancelled, status updated

---

## Phase 7: Customer Payments

### TC-CUST-PAY-01: View Payments List
**Objective**: Verify payments list page
**Precondition**: Logged in as customer with payments
**Steps**:
1. Navigate to /app/payments
2. Verify payments list displays
3. Check payment items show:
   - Payment amount
   - Status badge (pending/uploaded/verified/rejected)
   - Order reference
   - Action buttons

**Expected**: Payments list loads with all information

---

### TC-CUST-PAY-02: Upload Payment Proof
**Objective**: Verify payment proof upload
**Precondition**: Customer has pending payment
**Steps**:
1. Navigate to /app/payments
2. Click "Upload Bukti" on pending payment
3. Select image file
4. Enter payment amount
5. Click "Upload"
6. Verify success message
7. Verify payment status changes to "uploaded"

**Expected**: Proof uploaded, status updated

---

### TC-CUST-PAY-03: Payment Validation
**Objective**: Verify payment upload validation
**Precondition**: Customer has pending payment
**Steps**:
1. Try to upload without selecting file
2. Verify validation error
3. Try to upload with invalid amount
4. Verify validation error

**Expected**: Validation errors prevent invalid uploads

---

## Phase 8: Customer Measurements

### TC-CUST-MEAS-01: View Measurements
**Objective**: Verify measurements list
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/measurements
2. Verify measurements list displays
3. Check measurement cards show:
   - Name
   - Key measurements
   - Default indicator (if applicable)

**Expected**: Measurements list loads correctly

---

### TC-CUST-MEAS-02: Add Measurement
**Objective**: Verify adding new measurement
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/measurements
2. Click "Tambah Ukuran"
3. Fill measurement form:
   - Name: "Test Measurement"
   - Chest: 100
   - Waist: 80
   - Hips: 90
   - Height: 170
4. Click "Simpan"
5. Verify measurement added to list

**Expected**: Measurement created, visible in list

---

### TC-CUST-MEAS-03: Edit Measurement
**Objective**: Verify editing measurement
**Precondition**: Customer has measurements
**Steps**:
1. Navigate to /app/measurements
2. Click "Edit" on measurement
3. Update values
4. Click "Simpan"
5. Verify changes saved

**Expected**: Measurement updated successfully

---

## Phase 9: Customer Addresses

### TC-CUST-ADDR-01: View Addresses
**Objective**: Verify addresses list
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/addresses
2. Verify addresses list displays
3. Check address cards show:
   - Name/label
   - Full address
   - Default indicator (if applicable)

**Expected**: Addresses list loads correctly

---

### TC-CUST-ADDR-02: Add Address
**Objective**: Verify adding new address
**Precondition**: Logged in as customer
**Steps**:
1. Navigate to /app/addresses
2. Click "Tambah Alamat"
3. Fill address form:
   - Name: "Rumah"
   - Street: "Jl. Test No. 123"
   - City: "Bandung"
   - Province: "Jawa Barat"
   - Postal code: "40123"
4. Click "Simpan"
5. Verify address added to list

**Expected**: Address created, visible in list

---

### TC-CUST-ADDR-03: Set Default Address
**Objective**: Verify setting default address
**Precondition**: Customer has multiple addresses
**Steps**:
1. Navigate to /app/addresses
2. Click "Set as Default" on address
3. Verify address marked as default

**Expected**: Default address updated

---

## Phase 10: Office Authentication

### TC-OFF-AUTH-01: Admin Login
**Objective**: Verify admin can login to office
**Steps**:
1. Navigate to login page
2. Enter email: `admin@djaitin.com`
3. Enter password: `password`
4. Click "Masuk"
5. Verify redirect to /office/dashboard

**Expected**: Successful login, redirect to office dashboard

---

### TC-OFF-AUTH-02: Owner Login
**Objective**: Verify owner can login to office
**Steps**:
1. Navigate to login page
2. Enter email: `owner@djaitin.com`
3. Enter password: `password`
4. Click "Masuk"
5. Verify redirect to /office/dashboard

**Expected**: Successful login, redirect to office dashboard

---

## Phase 11: Office Dashboard

### TC-OFF-DASH-01: Dashboard Metrics
**Objective**: Verify office dashboard displays metrics
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/dashboard
2. Verify metric strip shows:
   - Order baru count
   - Menunggu pembayaran count
   - Produksi count
   - Selesai bulan ini count
3. Verify recent orders list
4. Verify pending payments list
5. Verify slow-moving production list

**Expected**: All metrics and lists display correctly

---

## Phase 12: Office Orders Management

### TC-OFF-ORD-01: View Orders List
**Objective**: Verify office orders list
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/orders
2. Verify metric cards display
3. Verify orders table shows:
   - Order number
   - Customer name
   - Order type
   - Status
   - Payment status
   - Total
   - Actions
4. Apply filters:
   - Search by order number
   - Filter by type
   - Filter by status
5. Verify pagination works

**Expected**: Orders list loads, filters work, pagination works

---

### TC-OFF-ORD-02: View Order Detail
**Objective**: Verify office order detail
**Precondition**: Orders exist
**Steps**:
1. Navigate to /office/orders
2. Click on order
3. Verify detail page shows:
   - Complete order information
   - Customer details
   - Payment history
   - Production stages
   - Attachments
   - Status timeline

**Expected**: Order detail page loads with complete information

---

### TC-OFF-ORD-03: Update Order Status
**Objective**: Verify order status update
**Precondition**: Logged in as admin/owner, order exists
**Steps**:
1. Navigate to order detail
2. Click "Update Status"
3. Select new status
4. Add notes (optional)
5. Click "Update"
6. Verify status changed
7. Verify audit log entry created

**Expected**: Status updated, audit log recorded

---

## Phase 13: Office Customers Management

### TC-OFF-CUST-01: View Customers List
**Objective**: Verify customers list
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/customers
2. Verify customers table shows:
   - Name
   - Email
   - Phone
   - Order count
   - Total spent
3. Apply search filter
4. Verify pagination

**Expected**: Customers list loads, search works

---

### TC-OFF-CUST-02: View Customer Detail
**Objective**: Verify customer detail page
**Precondition**: Customers exist
**Steps**:
1. Navigate to /office/customers
2. Click on customer
3. Verify detail shows:
   - Customer information
   - Order history
   - Payment history
   - Measurements
   - Addresses

**Expected**: Customer detail page loads with complete information

---

## Phase 14: Office Payments Management

### TC-OFF-PAY-01: View Payments List
**Objective**: Verify payments list
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/payments
2. Verify payments table shows:
   - Payment ID
   - Customer
   - Amount
   - Status
   - Order reference
   - Proof thumbnail (if uploaded)
3. Apply filters

**Expected**: Payments list loads, filters work

---

### TC-OFF-PAY-02: Verify Payment Proof
**Objective**: Verify payment proof verification
**Precondition**: Payment proof uploaded, logged in as kasir/admin
**Steps**:
1. Navigate to /office/payments
2. Click on payment with uploaded proof
3. View proof image
4. Click "Verifikasi"
5. Add notes (optional)
6. Confirm verification
7. Verify status changes to "verified"

**Expected**: Payment verified, status updated

---

### TC-OFF-PAY-03: Reject Payment Proof
**Objective**: Verify payment proof rejection
**Precondition**: Payment proof uploaded
**Steps**:
1. Navigate to payment detail
2. Click "Tolak"
3. Enter rejection reason
4. Confirm rejection
5. Verify status changes to "rejected"

**Expected**: Payment rejected, customer notified

---

## Phase 15: Office Production

### TC-OFF-PROD-01: View Production Board
**Objective**: Verify production board
**Precondition**: Logged in as produksi/admin
**Steps**:
1. Navigate to /office/production
2. Verify production board shows:
   - Orders by production stage
   - Stage indicators
   - Priority indicators
   - Due dates
3. Apply filters

**Expected**: Production board loads, displays correctly

---

### TC-OFF-PROD-02: Update Production Stage
**Objective**: Verify production stage update
**Precondition**: Orders in production
**Steps**:
1. Navigate to production board
2. Click on order
3. Update production stage
4. Add notes
5. Click "Update"
6. Verify stage updated
7. Verify customer notification sent

**Expected**: Stage updated, notification sent

---

## Phase 16: Office Shipping

### TC-OFF-SHIP-01: View Shipping List
**Objective**: Verify shipping management
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/shipping
2. Verify shipping list shows:
   - Order number
   - Customer
   - Address
   - Courier
   - Tracking number
   - Status

**Expected**: Shipping list loads correctly

---

### TC-OFF-SHIP-02: Create Shipment
**Objective**: Verify shipment creation
**Precondition**: Order ready to ship
**Steps**:
1. Navigate to /office/shipping
2. Click "Buat Pengiriman" on order
3. Select courier
4. Enter tracking number
5. Add notes
6. Click "Buat"
7. Verify shipment created

**Expected**: Shipment created, customer notified

---

## Phase 17: Office Reports

### TC-OFF-REP-01: View Reports Dashboard
**Objective**: Verify reports page
**Precondition**: Logged in as owner
**Steps**:
1. Navigate to /office/reports
2. Verify report sections:
   - Sales summary
   - Order statistics
   - Payment summary
   - Production metrics
3. Apply date range filter
4. Verify charts update

**Expected**: Reports load, filters work, charts display

---

### TC-OFF-REP-02: Export Report
**Objective**: Verify report export
**Precondition**: Reports available
**Steps**:
1. Navigate to /office/reports
2. Click "Export"
3. Select format (PDF/Excel)
4. Verify file downloads

**Expected**: Report exported successfully

---

## Phase 18: Office Audit Log

### TC-OFF-AUDIT-01: View Audit Log
**Objective**: Verify audit log
**Precondition**: Logged in as owner
**Steps**:
1. Navigate to /office/audit-log
2. Verify log entries show:
   - Timestamp
   - User
   - Action
   - Entity type
   - Entity ID
   - Details
3. Apply filters:
   - User filter
   - Action filter
   - Date range

**Expected**: Audit log loads, filters work

---

## Phase 19: Office Master Data (Admin Only)

### TC-OFF-ADMIN-01: Manage Products
**Objective**: Verify product management
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/admin/products
2. Click "Tambah Produk"
3. Fill product form:
   - Name
   - Category
   - Price
   - Stock
   - Images
4. Click "Simpan"
5. Verify product created

**Expected**: Product created, visible in list

---

### TC-OFF-ADMIN-02: Manage Fabrics
**Objective**: Verify fabric management
**Precondition**: Logged in as admin/owner
**Steps**:
1. Navigate to /office/admin/fabrics
2. Add new fabric
3. Edit existing fabric
4. Verify changes saved

**Expected**: Fabric management works

---

### TC-OFF-ADMIN-03: Manage Users
**Objective**: Verify user management
**Precondition**: Logged in as owner
**Steps**:
1. Navigate to /office/admin/users
2. Click "Tambah User"
3. Fill user form:
   - Name
   - Email
   - Role
4. Click "Simpan"
5. Verify user created

**Expected**: User created successfully

---

## Phase 20: Cross-Role Authorization

### TC-AUTH-01: Customer Cannot Access Office
**Objective**: Verify role-based access control
**Precondition**: Logged in as customer
**Steps**:
1. Try to navigate to /office/dashboard
2. Verify access denied or redirect

**Expected**: Customer blocked from office pages

---

### TC-AUTH-02: Kasir Limited Access
**Objective**: Verify kasir role limitations
**Precondition**: Logged in as kasir
**Steps**:
1. Navigate to /office/dashboard
2. Verify access granted
3. Try to access /office/admin/users
4. Verify access denied

**Expected**: Kasir has limited access

---

### TC-AUTH-03: Customer Ownership Enforcement
**Objective**: Verify customer can only see own orders
**Precondition**: Multiple customers with orders
**Steps**:
1. Login as customer A
2. Navigate to /app/orders
3. Verify only customer A's orders visible
4. Try to access customer B's order directly
5. Verify access denied

**Expected**: Ownership enforced correctly

---

## Phase 21: Error Handling & Edge Cases

### TC-ERR-01: 404 Page
**Objective**: Verify 404 handling
**Steps**:
1. Navigate to /invalid-page
2. Verify 404 page displayed
3. Verify navigation back to home works

**Expected**: 404 page shown, recovery possible

---

### TC-ERR-02: Network Error Handling
**Objective**: Verify network error handling
**Steps**:
1. Disable network (dev tools)
2. Try to submit form
3. Verify error message shown
4. Re-enable network
5. Retry submission
6. Verify success

**Expected**: Network errors handled gracefully

---

### TC-ERR-03: Session Expiry
**Objective**: Verify session expiry handling
**Steps**:
1. Login
2. Wait for session to expire (or clear cookies)
3. Try to perform action
4. Verify redirect to login

**Expected**: Expired session redirects to login

---

## Test Execution Priority

### Critical Path (P0)
1. TC-LP-01: Landing page load
2. TC-CUST-AUTH-01: Customer login
3. TC-CUST-DASH-01: Customer dashboard
4. TC-CUST-CAT-01: Browse catalog
5. TC-CUST-CART-01: Add to cart
6. TC-CUST-CO-01: Checkout flow
7. TC-CUST-ORD-01: View orders
8. TC-CUST-PAY-02: Upload payment proof
9. TC-OFF-AUTH-01: Admin login
10. TC-OFF-DASH-01: Office dashboard
11. TC-OFF-ORD-01: Office orders list
12. TC-OFF-PAY-02: Verify payment proof

### High Priority (P1)
- All authentication tests
- Navigation tests
- Basic CRUD operations
- Role-based access control

### Medium Priority (P2)
- Filter and search functionality
- Validation tests
- Export functionality
- Edge cases

### Low Priority (P3)
- Performance tests
- Accessibility tests
- Mobile responsive tests

---

## Notes

1. **Test Data**: Ensure demo seeder has been run with `php artisan migrate:fresh --seed`
2. **Browser**: Test in Chrome/Chromium with dev tools open
3. **Viewport**: Test both desktop (1920x1080) and mobile (375x667)
4. **Console**: Monitor for JavaScript errors throughout testing
5. **Network**: Monitor API requests to verify correct endpoints called
6. **Screenshots**: Capture screenshots for failed tests
7. **Timing**: Add appropriate waits for async operations

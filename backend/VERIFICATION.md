# Backend API Verification Guide

This guide walks you through verifying your custom Node.js, Express, and PostgreSQL backend.

---

## 1. Prerequisites & Setup

### Step A: Configure Supabase Database
In your `backend/.env` file, replace the `DATABASE_URL` with your actual Supabase PostgreSQL connection string. It should look like this:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres"
```

### Step B: Run Database Migrations
Run the following command to deploy the tables to your Supabase instance:
```bash
npm run prisma:migrate
```

### Step C: Run the Server
Start the development server:
```bash
npm run dev
```
The server will boot up and bind REST + WebSockets on:
*   REST API: `http://localhost:5000`
*   WebSockets: `http://localhost:5000`

---

## 2. API Endpoints Testing Flow (CURL)

Below is a sequential test plan. You can execute these commands in your terminal to test each feature.

### 👤 User Authentication

#### 1. Register a Customer
```bash
curl -X POST http://localhost:5000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan@example.com",
    "password": "password123",
    "phone": "09171234567"
  }'
```
*   *Expected response:* Returns `success: true` along with a **JWT token** and user details (with `walletBalance: "0.00"`).

#### 2. Register a Rider
```bash
curl -X POST http://localhost:5000/api/auth/register/rider \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pedro Rider",
    "email": "pedro@example.com",
    "password": "password123",
    "phone": "09187654321",
    "licenseNumber": "N01-12-345678",
    "plateNumber": "MV-1234",
    "vehicleModel": "Honda Click 125i"
  }'
```
*   *Expected response:* Returns `success: true`, a **JWT token**, and pending rider documents.

#### 3. Log In (Customer)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123",
    "role": "CUSTOMER"
  }'
```
*   *Save the returned `token` from this response! You will use it as `[CUSTOMER_TOKEN]` below.*

#### 4. Log In (Rider)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pedro@example.com",
    "password": "password123",
    "role": "RIDER"
  }'
```
*   *Save the returned `token` from this response! You will use it as `[RIDER_TOKEN]` below.*

---

### 💳 Wallet & Ledger Transactions

#### 5. Get Wallet Balance (Customer)
```bash
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```

#### 6. Top Up Wallet (Simulated GCash Topup)
```bash
curl -X POST http://localhost:5000/api/wallet/topup \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "method": "GCash"
  }'
```
*   *Expected response:* Increments the balance inside a database transaction and logs a ledger transaction. The new wallet balance will show as `1000.00`.

---

### 📦 Order Lifecycle & Financial Settlements

#### 7. Create a New Order (Customer)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PAHATOD",
    "pickupAddress": "Mall of Asia, Pasay",
    "dropoffAddress": "Ayala Malls Manila Bay, Paranaque",
    "pickupCoords": { "latitude": 14.5350, "longitude": 120.9822 },
    "dropoffCoords": { "latitude": 14.5218, "longitude": 120.9902 },
    "estimatedDistance": 2.5,
    "price": 0.00
  }'
```
*   *Expected response:* Creates a pending order. It will calculate the delivery fee (e.g. ₱75.00 for 2.5km) and check wallet coverage.
*   *Save the returned order `id` as `[ORDER_ID]`.*

#### 8. Get Available Orders (Rider)
```bash
curl -X GET http://localhost:5000/api/orders/available \
  -H "Authorization: Bearer [RIDER_TOKEN]"
```
*   *Expected response:* Returns the list of pending orders, including the order we just created.

#### 9. Accept the Order (Rider)
```bash
curl -X POST http://localhost:5000/api/orders/accept \
  -H "Authorization: Bearer [RIDER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "[ORDER_ID]"
  }'
```
*   *Expected response:* Updates order status to `ACCEPTED` and assigns Pedro Rider.

#### 10. Update Order to Completed (Financial Settlement)
```bash
curl -X POST http://localhost:5000/api/orders/status \
  -H "Authorization: Bearer [RIDER_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "[ORDER_ID]",
    "status": "COMPLETED"
  }'
```
*   *Expected response:* Sets the order status to `COMPLETED`.
*   **Behind the scenes database transaction:**
    *   Deducts the delivery fee (₱75.00) from customer Juan's wallet balance.
    *   Credits the delivery fee (₱75.00) to rider Pedro's wallet balance.
    *   Creates a `DEBIT` log for the customer and a `CREDIT` log for the rider.

#### 11. Check Customer Wallet Balance After Settlement
```bash
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer [CUSTOMER_TOKEN]"
```
*   *Expected balance:* `925.00` (decremented from 1000.00).

#### 12. Check Rider Wallet Balance After Settlement
```bash
curl -X GET http://localhost:5000/api/wallet \
  -H "Authorization: Bearer [RIDER_TOKEN]"
```
*   *Expected balance:* `75.00` (credited to the rider).

---

## 3. Real-Time WebSockets Events

Using a Socket.io client in your React Native app:

1.  **Connect:** Point the socket connection to `http://localhost:5000`.
2.  **Join Room:** Emit `join_order_channel` with `{ orderId }` to join the order room.
3.  **Chat:** Emit `send_chat_message` with `{ orderId, senderId, receiverId, message }`. Connected clients receive `chat_message_received`.
4.  **Track:** Emit `update_rider_location` with `{ orderId, riderId, latitude, longitude, bearing }`. Connected clients receive `rider_location_updated`.

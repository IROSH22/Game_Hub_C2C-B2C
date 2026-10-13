# 🎮 Game Hub — Hybrid E-Commerce & C2C Video Game Barter Marketplace

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/Security-Anti--Tamper%20Shield-ef4444?logo=shield&logoColor=white)](#-security-shield--anti-tamper-protection)
[![EmailJS](https://img.shields.io/badge/EmailJS-Real%20Email%20Live-f59e0b?logo=mail.ru&logoColor=white)](https://www.emailjs.com/)

---

## 📌 Executive Summary
**Game Hub** is a state-of-the-art hybrid gaming commerce ecosystem engineered to unite two distinct business models on a unified glassmorphic platform:
1. **B2C (Business-to-Consumer) Retail Store**: Certified merchants and storefronts list authentic physical video games with real-time inventory management, promo codes, multi-method payment processing, and courier tracking.
2. **C2C (Consumer-to-Consumer) Swap Zone**: Everyday gamers barter finished physical games directly with fellow gamers (game-for-game) with **zero commission fees**, backed by a community trust engine and escrow protection.

---

## ⚡ Core Features & Capabilities

### 🛍️ 1. B2C E-Commerce Retail Store
- **Dynamic Catalog Explorer**: Search, filter, and sort video games across platforms (**PlayStation 5, PlayStation 4, Xbox Series X|S, Nintendo Switch, PC**), genres, price bands, and condition (Brand New vs Pre-Owned).
- **Persistent Shopping Cart**: Real-time stock validation, automated promo code discounts (`GAMER10` for 10% OFF), dynamic island-wide shipping calculations, and order persistence.
- **Multi-Method Secure Checkout**: Interactive virtual 3D card entry, PayPal simulation, and Cash on Delivery (COD) with immediate receipt generation.
- **Seller Merchant Dashboard**:
  - Live inventory tracking (Add, Edit, Delete, Restock, Mark Sold).
  - Revenue analytics and sales volume metrics.
  - Order fulfillment management (Confirm -> Processing -> Shipped -> Delivered).

### 🔄 2. C2C Barter & Game Swap Engine
- **Direct Peer-to-Peer Trades**: Gamers list games from their personal library specifying condition, photos, city location, and the desired title they want in exchange.
- **Barter Proposal Workflow**:
  - Trader submits an exchange offer selecting their game and attaching a personalized negotiation note.
  - Game Owner reviews incoming offers with full proposer details and accepts or declines in real-time.
  - Status progression: `Proposed` ➔ `Accepted` ➔ `In Escrow` ➔ `Shipped` ➔ `Completed`.
- **Smart Wishlist Matching Engine**: Matches gamer wishlists with available barter inventory automatically.
- **Trust & Escrow Verification**: Trader reputation score dynamically computed from completed exchanges and positive ratings.

### 📧 3. Automated Transactional Email System (EmailJS Live Delivery)
- Full integration with **[EmailJS](https://www.emailjs.com)** REST API dispatching authentic emails to real inboxes:
  - **Item Listed Confirmation**: Emailed when a game is published to the store or exchange hub.
  - **Order Confirmation & Invoices**: Detailed HTML order receipts sent instantly upon checkout.
  - **Fulfillment Status Updates**: Dispatched when merchant updates delivery status to *Shipped* or *Delivered*.
  - **Barter Offers & Acceptances**: Real-time notifications for trade proposals and accepted barter deals.
- **In-App Dispatched Notification Modal**: View live logs of all sent emails and test real delivery to any personal email address.

### 🛡️ 4. Security Shield & Anti-Tamper Protection
- **Developer Mode & DevTools Lockdown**:
  - Restricts keyboard developer shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U`, `Ctrl+S`).
  - Blocks right-click context menu (`Inspect Element`) across the entire web application.
  - Neutralizes `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` to prevent third-party inspection of component state and hooks.
  - Detects active DevTools window docking and clears console with high-priority security warnings.
- **Payment Gateway Hardening & PCI-DSS Compliance**:
  - **Server-Side Price Integrity**: All prices, quantities, and totals are strictly calculated and validated on the backend against database records — client-side price tampering is impossible.
  - **Cryptographic HMAC-SHA256 Signatures**: Each transaction is signed using HMAC-SHA256 tokens (`/api/orders/:id/verify-signature`) ensuring tamper-proof audit trails.
  - **PCI-DSS Card Sanitization**: Raw card data and CVV are never stored in the database; only sanitized masked last-4 digits are retained.
  - **Anti-Spam Rate Limiting**: Intelligent sliding window rate limiters prevent card brute-force attacks and bot spam checkouts.

---

## 🏗️ Architectural Overview

```
                                  ┌───────────────────────────────┐
                                  │       Client Browser          │
                                  │   React 19 + Tailwind CSS     │
                                  └──────────────┬────────────────┘
                                                 │
                             REST API (JSON)     │ JWT Auth / Bearer Token
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │     Node.js / Express API     │
                                  │    PORT: 5000 (Cors/Helmet)   │
                                  └───────┬───────────────┬───────┘
                                          │               │
                 Mongoose ODM / TLS       │               │ Native Fetch / REST
                                          ▼               ▼
                     ┌────────────────────────┐       ┌──────────────────────┐
                     │    MongoDB Database    │       │     EmailJS Cloud    │
                     │  (Local / Atlas Cloud) │       │   Real Email Sender  │
                     └────────────────────────┘       └──────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8.2, Tailwind CSS 3, Lucide React Icons, Canvas Confetti |
| **Backend** | Node.js 18+, Express.js 4, Mongoose 8, JWT (JSON Web Tokens), Bcrypt.js, Crypto (HMAC-SHA256) |
| **Database** | MongoDB (Local MongoDB Community Server or MongoDB Atlas M0 Free Cluster) |
| **Email Delivery** | EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`) + SMTP Fallback |
| **Security** | Anti-Tamper Security Shield, Rate Limiting, PCI-DSS Sanitization, HMAC-SHA256 Signatures |

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- **Node.js** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **MongoDB** Community Server running locally OR a free **MongoDB Atlas** Cloud Cluster URI ([MongoDB Atlas](https://www.mongodb.com/atlas))

---

### 2. Clone Repository
```bash
git clone https://github.com/your-username/game-hub.git
cd game-hub
```

---

### 3. Backend Configuration & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` configuration file from the template:
   ```bash
   cp .env.example .env
   ```
3. Configure your variables in `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/gamehub
   JWT_SECRET=your_super_secret_jwt_key_here_gamehub_secure_vault

   # Optional: EmailJS credentials for live email delivery (https://www.emailjs.com)
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   EMAILJS_PUBLIC_KEY=your_public_key
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will initialize and listen on `http://localhost:5000`.*

---

### 4. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at **`http://localhost:5173`**.

---

### ⚡ Quick Launch (Windows Users)
You can launch both the backend and frontend simultaneously with a single double-click using the included root batch script:
```bash
start-all.bat
```

---

## 🔑 Pre-Configured Demo Accounts (1-Click Login)
For evaluation and testing, the application includes 1-click test credentials inside the Login Modal:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Customer / Gamer** | `gamer@gamehub.com` | `password123` | Store Buyer, Cart, Checkout, C2C Barter Trader, Wishlist |
| **Trader 2** | `gamer2@gamehub.com` | `password123` | Second Peer Gamer for simulating C2C barter exchanges |
| **Merchant Seller** | `seller@gamehub.com` | `password123` | B2C Merchant Dashboard, Inventory CRUD, Order Management |
| **System Administrator** | `admin@gamehub.com` | `password123` | System Overview, User Management, Full Platform Moderation |

---

## 📡 Core REST API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new gamer or merchant account
- `POST /api/auth/login` — Authenticate and receive signed JWT token
- `GET /api/auth/profile` — Fetch authenticated user profile and stats

### 🎮 Game Catalog & Inventory (`/api/games`)
- `GET /api/games` — Fetch listings with search, platform, genre, and type filters
- `GET /api/games/:id` — Get detailed game profile and seller information
- `POST /api/games` — Create a new B2C product or C2C barter listing
- `PUT /api/games/:id` — Update listing price, condition, or stock
- `DELETE /api/games/:id` — Remove listing from marketplace

### 📦 Orders & Payments (`/api/orders`)
- `POST /api/orders` — Secure checkout, server-side price calculation & HMAC signature creation
- `GET /api/orders/my-orders` — Get authenticated customer's order history
- `GET /api/orders/seller` — Get merchant's customer orders
- `PUT /api/orders/:id/status` — Update order fulfillment status (Shipped, Delivered)
- `GET /api/orders/:id/verify-signature` — Verify cryptographic HMAC-SHA256 payment signature

### 🔄 C2C Barter & Exchange (`/api/exchanges`)
- `GET /api/exchanges` — Get user's incoming and outgoing barter proposals
- `POST /api/exchanges` — Propose a game barter offer
- `PUT /api/exchanges/:id/status` — Accept, decline, or update shipping status of barter deal

### 📧 Email Center (`/api/emails`)
- `GET /api/emails/logs` — Fetch dispatched email logs and status
- `POST /api/emails/test-send` — Send live test email to any verified inbox via EmailJS

---

## 🛡️ Security Verification
To verify payment authenticity and zero-tampering for any order:
```http
GET /api/orders/:orderId/verify-signature
Authorization: Bearer <your_jwt_token>
```
Response:
```json
{
  "success": true,
  "transactionId": "TXN-17918882-5421",
  "amount": 79.99,
  "isAuthentic": true,
  "riskScore": "Low Risk (Score: 0.01 - 3D Secure Verified)",
  "tamperAudit": "SECURE: Transaction has valid cryptographic signature. Zero tampering detected."
}
```

---

## 📄 License
This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for personal or academic purposes.

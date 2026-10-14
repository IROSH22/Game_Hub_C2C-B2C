# 🎮 Game Hub — Hybrid E-Commerce & C2C Video Game Barter Marketplace

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/Security-Anti--Tamper%20Shield-ef4444?logo=shield&logoColor=white)](#-security-shield--anti-tamper-protection)
[![EmailJS](https://img.shields.io/badge/EmailJS-Real%20Email%20Live-f59e0b?logo=mail.ru&logoColor=white)](https://www.emailjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Summary

**Game Hub** is a full-featured hybrid video games commerce and barter platform tailored for the modern gaming community in Sri Lanka. It bridges the gap between commercial game retailers and peer-to-peer gamer communities on a unified, high-performance platform:

1. **Official Games Store**: Certified video game merchants and retail storefronts list authentic physical disc releases (PlayStation 5, Xbox Series X, Nintendo Switch, PC) with live inventory control, sales analytics, and courier delivery.
2. **Game Swap Zone (Community Barter Hub)**: Everyday gamers trade completed games directly with fellow gamers (game-for-game) for **$0 cash with zero platform fees**, protected by community **Trust Scores**, real-time trade messaging, and delivery tracking.
3. **Unified Catalog & Segmented Navigation**: Clear separation between purchase-only titles and barter-only listings, alongside an **All Video Games** view with visual availability badges.

---

## ⚡ Key Highlights & Features

### 🛍️ 1. Official Games Store (Direct Purchase)
- **Multi-Platform Hardware Support**: PS5, PS4, Xbox Series X|S, Nintendo Switch, PC Steam/Windows.
- **Selective Cart Purchasing**: Checkbox item selection allows gamers to select specific games to purchase immediately while saving other items in the cart for later.
- **Smart Promo Discounts**: Automatic discount coupon engine (e.g. `GAMER10` for 10% OFF).
- **Saved Cards Vault**: Add, view, mask (PCI-DSS compliant), and remove saved credit/debit cards with instant card network detection (Visa, Mastercard, Amex).
- **Real Payment Gateways & Zero Auto-Success**:
  - **Stripe**: Interactive 3D Secure (3DS) authentication challenge flow with risk assessment and challenge verification.
  - **PayPal**: Official PayPal SDK flow with simulated sandbox redirection.
  - **Cash on Delivery (COD)**: Verified island-wide courier fulfillment.
- **Live Merchant Reviews & Ratings**: Customers can rate sellers (1-5 stars) and write verified reviews after receiving their orders.

### 🔄 2. Community Game Swap Zone (Barter Desk)
- **Zero Cash Barter**: Barter listings do not require a price (`$0.00`) — trades are 100% game-for-game exchanges.
- **Custom Artwork & Cover Upload**: Gamers can upload custom cover images directly from their device (with instant preview) or enter an external image URL.
- **Gamer-to-Gamer Trade Requests**: Propose a game from your inventory with a personal trade pitch.
- **Live Trade Chat & Messenger**:
  - Once a barter proposal is accepted, an integrated real-time chat unlocks between the two traders.
  - Negotiate meeting locations, courier drop-offs, and swap tracking.
  - Seamless navigation with explicit "Back to Trades" button, backdrop click dismiss, and `ESC` key dismiss.
- **Community Trust Scores**: Dynamic reputation score (0-100%) calculated from successful trades and verified trader ratings.

### 🛡️ 3. Seller Isolation & Merchant Safeguards
- **Role-Based Isolation**: Verified merchants (role: `seller`) are dedicated purely to store inventory.
- **Exchange Section Quarantined**: Sellers never see the Swap Zone tab, trade banners, or barter buttons anywhere in the navigation bar, hero slider, catalog, or game detail modals.
- **Dedicated Merchant Desk**:
  - Inventory CRUD (Add, Edit stock/price, Delete, Restock).
  - Sales analytics, order fulfillment status updates, and revenue metrics.
  - Custom game cover artwork upload with live card preview.

### 📧 4. Transactional Email System (EmailJS Integration)
- Dispatches transactional emails to genuine inboxes via the EmailJS REST API:
  - **Item Listed Notifications**: Sent when games are published.
  - **Order Confirmation & Itemized Receipts**: Dispatched instantly upon checkout.
  - **Order Status Updates**: Dispatched when merchants update status (*Shipped*, *Delivered*).
  - **Barter Offer Alerts**: Dispatched when an exchange is proposed or accepted.
- **In-App Email Center**: Inspect generated HTML templates, view delivery status logs, and test sending to any email address.

### 🎨 5. Professional Obsidian & Sapphire Gaming Theme
- Replaced cheap, neon-purple "AI glow" palettes with a sleek, mature gaming aesthetic inspired by Steam, PlayStation Store, and Epic Games:
  - **Backdrop**: Deep midnight obsidian (`#07090e`, `#0d121c`).
  - **Store Buy Accent**: Electric Sapphire & High-Tech Sky Blue (`#0284c7`, `#2563eb`).
  - **Barter Trade Accent**: Warm Amber Gold & Sunset Bronze (`#f59e0b`, `#d97706`).
  - **Trust & Merchant Badges**: Clean Emerald (`#10b981`).
  - **Typography**: High-legibility Rajdhani headers and Inter body text.

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────────┐
                                  │       Client Browser          │
                                  │   React 19 + Tailwind CSS     │
                                  │   Vite 8.2 • Lucide Icons     │
                                  └──────────────┬────────────────┘
                                                 │
                             REST API (JSON)     │ JWT Bearer Token / Auth
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
                     │  (Local / Atlas Cloud) │       │   Live Email Delivery│
                     └────────────────────────┘       └──────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8.2, Tailwind CSS 3 |
| **Icons & Effects** | Lucide React, Canvas Confetti |
| **Backend Framework** | Node.js 18+, Express.js 4 |
| **Database & ODM** | MongoDB, Mongoose 8 |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, HMAC-SHA256 Signatures, PCI-DSS Sanitization |
| **Payment Gateways** | Stripe 3DS Verification Flow, PayPal SDK Sandbox, Cash on Delivery (COD) |
| **Transactional Email** | EmailJS REST API (`https://api.emailjs.com/api/v1.0/email/send`) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/gamehub`) or a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas).

---

### 2. Clone the Repository
```bash
git clone https://github.com/IROSH22/Game_Hub_C2C-B2C.git
cd game-hub-main
```

---

### 3. Backend Setup
1. Open a terminal and enter the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` file (copy from `.env.example` if available):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/gamehub
   JWT_SECRET=your_super_secret_jwt_key_here_gamehub_secure_vault

   # EmailJS Configuration (Optional for live email delivery)
   EMAILJS_SERVICE_ID=your_emailjs_service_id
   EMAILJS_TEMPLATE_ID=your_emailjs_template_id
   EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *The server will initialize and listen on `http://localhost:5000`.*

---

### 4. Frontend Setup
1. In a separate terminal, enter the frontend directory:
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

### ⚡ One-Click Windows Launch
Double-click `start-all.bat` in the root folder to start both backend and frontend servers simultaneously.

---

## 🔑 Demo Accounts (1-Click Login)

The login modal contains 1-click test credentials for instant evaluation:

| Account Type | Email | Password | Role & Scope |
| :--- | :--- | :--- | :--- |
| **Gamer 1** | `gamer@gamehub.com` | `password123` | Store Buyer, Cart, Checkout, C2C Barter Trader, Wishlist, Trade Chat |
| **Gamer 2** | `gamer2@gamehub.com` | `password123` | Second peer gamer for testing barter proposals and live trade chat |
| **Merchant Seller** | `seller@gamehub.com` | `password123` | B2C Merchant Dashboard, Inventory CRUD, Order Management, Customer Reviews |
| **Administrator** | `admin@gamehub.com` | `password123` | Full system moderation, user access control, catalog oversight |

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new gamer or merchant account
- `POST /api/auth/login` — Sign in and receive signed JWT
- `GET /api/auth/profile` — Fetch user profile, trust score, and trade history

### 🎮 Game Catalog & Inventory (`/api/games`)
- `GET /api/games?listingType=buy|trade|all` — Fetch catalog with platform, genre, and listing type filters
- `GET /api/games/:id` — Get detailed game profile and merchant information
- `POST /api/games` — Add game to store or exchange hub
- `PUT /api/games/:id` — Update listing details, stock, or price
- `DELETE /api/games/:id` — Remove game listing

### 📦 Orders & Payments (`/api/orders`)
- `POST /api/orders` — Server-validated checkout, calculates totals and issues cryptographic HMAC signatures
- `GET /api/orders/my-orders` — Customer's purchase history and courier tracking
- `GET /api/orders/seller` — Merchant's incoming customer orders
- `PUT /api/orders/:id/status` — Update order fulfillment (`Shipped`, `Delivered`)
- `POST /api/orders/:id/rate` — Submit merchant rating and review after delivery

### 🔄 Barter & Trade Hub (`/api/exchanges`)
- `GET /api/exchanges` — Fetch user's incoming and outgoing barter proposals
- `POST /api/exchanges` — Send a game-for-game barter proposal
- `PUT /api/exchanges/:id/status` — Accept or decline a barter proposal
- `GET /api/exchanges/:id/messages` — Fetch trade chat message history
- `POST /api/exchanges/:id/messages` — Send message in trade chat
- `POST /api/exchanges/:id/rate` — Submit peer trader rating and review after trade completion

### 📧 Email Center (`/api/emails`)
- `GET /api/emails/logs` — View all dispatched transactional email logs
- `POST /api/emails/test-send` — Send a test email to any verified recipient address

---

## 🌐 Cloud & Vercel Deployment Guide

To deploy **Game Hub** to Vercel:

1. **Database**: Create a free MongoDB Atlas cluster and obtain the connection string (`mongodb+srv://<user>:<password>@cluster0.mongodb.net/gamehub`).
2. **Backend**: Deploy the `backend/` folder to Render, Railway, or Vercel Serverless Functions. Set `MONGODB_URI` and `JWT_SECRET` in environment variables.
3. **Frontend**: Deploy `frontend/` to Vercel. Set `VITE_API_URL` to your production backend URL (e.g. `https://gamehub-api.onrender.com`).
4. **Build Command**: `npm run build` with output directory `dist`.

---

## 📄 License
This project is licensed under the **MIT License**. Free for personal, educational, and commercial use.

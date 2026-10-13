# 📖 Game Hub — Comprehensive User Guide & Walkthrough Manual

Welcome to the **Game Hub** User Guide! This document provides an exhaustive, step-by-step demonstration walkthrough for gamers, merchants, administrators, and project evaluators.

---

## 📑 Table of Contents
1. [Quick Start & Access](#1-quick-start--access)
2. [Role-Based 1-Click Demo Accounts](#2-role-based-1-click-demo-accounts)
3. [Walkthrough 1: B2C Shopping & Checkout Flow](#walkthrough-1-b2c-shopping--checkout-flow)
4. [Walkthrough 2: Seller Merchant Operations](#walkthrough-2-seller-merchant-operations)
5. [Walkthrough 3: C2C Barter & Game Swap Engine](#walkthrough-3-c2c-barter--game-swap-engine)
6. [Walkthrough 4: Testing Live Email Delivery (EmailJS)](#walkthrough-4-testing-live-email-delivery-emailjs)
7. [Walkthrough 5: Security Shield & Payment Verification](#walkthrough-5-security-shield--payment-verification)
8. [GitHub Upload Instructions](#8-github-upload-instructions)

---

## 1. Quick Start & Access

1. Ensure the servers are running:
   - **Frontend URL**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
2. Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 2. Role-Based 1-Click Demo Accounts

To facilitate instant testing without manually filling registration forms, click the **"Sign In"** button on the top right navigation bar. At the bottom of the modal, click any of the **1-Click Test Buttons**:

| Button | Email | Role | Recommended For |
| :--- | :--- | :--- | :--- |
| **🎮 Gamer (Customer)** | `gamer@gamehub.com` | User | Testing buying, cart, checkout, proposing barter trades |
| **🔄 Trader 2** | `gamer2@gamehub.com` | User | Testing receiving & accepting barter trade proposals |
| **🏪 Merchant (Seller)** | `seller@gamehub.com` | Seller | Testing inventory management, restocking, shipping orders |
| **🛡️ System Admin** | `admin@gamehub.com` | Admin | Testing platform moderation, user roles, system metrics |

---

## Walkthrough 1: B2C Shopping & Checkout Flow

### Step 1: Browse & Filter Games
1. On the homepage, ensure the **"B2C STORE"** view is active.
2. Use the **Search Bar** to search for any title (e.g., `Spider-Man`, `Elden Ring`, `Cyberpunk`).
3. Click on the platform filter pills: **All Platforms, PS5, PS4, Xbox Series X, Switch, PC**.
4. Use the sort dropdown to sort by **Price: Low to High**, **Price: High to Low**, or **Rating**.

### Step 2: Game Details & Wishlist
1. Click on any game card to open the **Game Detail Modal**.
2. View high-resolution cover artwork, genre tags, condition, stock availability, and merchant profile.
3. Click the **Heart Icon** to add the game to your Wishlist.

### Step 3: Add to Cart & Apply Coupon
1. Click **"Add to Cart"**.
2. Open the slide-out **Shopping Cart** by clicking the cart icon in the top right.
3. Adjust quantities or remove items.
4. In the coupon code input, enter:
   ```
   GAMER10
   ```
5. Click **"Apply"** — notice the **10% Instant Discount** applied dynamically.
6. Orders over **$60** automatically qualify for **FREE EXPRESS SHIPPING**!

### Step 4: Multi-Method Checkout
1. In the Cart, click **"Proceed to Secure Checkout"**.
2. Confirm or edit your delivery address (Full Name, Phone, Street, City).
3. Select your preferred payment method:
   - **Credit Card**: Features a 3D interactive virtual credit card with real-time cardholder entry.
   - **PayPal**: Digital wallet simulation.
   - **Cash on Delivery**: Pay in cash upon doorstep delivery.
4. Click **"Pay & Place Order"**.
5. Observe the 256-bit SSL authorization animation, celebratory confetti explosion, and the instant **HMAC-SHA256 Signed Receipt** with a unique Transaction ID.
6. Click **"Track Order"** to view the live status in your orders dashboard.

---

## Walkthrough 2: Seller Merchant Operations

### Step 1: Login as Merchant
1. Click the User Profile icon and select **Log Out**.
2. Click **Sign In** ➔ click the **"🏪 Merchant (Seller)"** 1-click test button.

### Step 2: Open Seller Dashboard
1. Click **"Seller Hub"** or **"Seller Dashboard"** in the navigation bar.
2. View your real-time analytics: **Total Sales Revenue, Active Products, and Total Orders**.

### Step 3: Add a New Retail Game
1. Click **"List New Game"**.
2. Fill in the title, platform, price, stock quantity, condition (Brand New / Pre-Owned), and image URL.
3. Click **"Publish Listing"**.
4. The product immediately appears in the B2C catalog, and a confirmation email is automatically logged!

### Step 4: Fulfill Customer Orders
1. In the Seller Dashboard, scroll to **"Incoming Customer Orders"**.
2. Locate a recent customer purchase.
3. Click the status button to advance the fulfillment:
   - `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`.
4. Each status change automatically dispatches a notification email to the customer's inbox!

---

## Walkthrough 3: C2C Barter & Game Swap Engine

### Step 1: Switch to C2C Swap Zone
1. In the top navigation bar, click the **"C2C SWAP ZONE"** switch.
2. Notice the cyberpunk amber/orange theme change denoting the peer-to-peer barter marketplace.

### Step 2: List Your Own Game for Barter
1. Click **"List Game for Exchange"**.
2. Enter your game's details (e.g., `God of War Ragnarök`, Condition: `Like New`, Location: `Colombo`).
3. In the **"Looking To Trade For"** field, specify what game you desire (e.g., `Final Fantasy XVI or Spider-Man 2`).
4. Click **"Publish Barter Listing"**.

### Step 3: Propose a Trade Offer
1. Browse another gamer's listed game.
2. Click **"Propose Barter Offer"**.
3. Select which game from your collection you wish to offer, and enter an optional message for the owner.
4. Click **"Send Trade Proposal"**.

### Step 4: Accept & Finalize Trade (as Trader 2)
1. Log out and sign in using the **"🔄 Trader 2"** demo account.
2. Click **"My Exchanges"** or the Exchange Notification bell.
3. Review the incoming trade proposal.
4. Click **"Accept Trade"**.
5. Both games enter **Escrow Verification**, and trust scores are updated upon completion!

---

## Walkthrough 4: Testing Live Email Delivery (EmailJS)

Game Hub includes a dedicated **Live Email Center**:

1. Click the **Envelope / Mail Icon** in the top navigation bar.
2. **Tab 1: DISPATCHED INBOX**:
   - Displays all automated transactional emails dispatched by the platform (Order Receipts, Status Updates, Listing Confirmations, and Barter Proposals).
   - Click any email to view the formatted HTML message.
3. **Tab 2: EMAILJS REAL SENDER**:
   - Allows examiners to receive authentic emails in their real personal inbox!
   - Enter your personal email address (e.g., `yourname@gmail.com`).
   - Select an email template type (e.g., `Order Receipt & Invoice`).
   - Click **"Send Live Test Email"**.
   - If EmailJS keys are configured in `backend/.env`, an authentic email is immediately delivered to your personal inbox.

---

## Walkthrough 5: Security Shield & Payment Verification

### 1. Developer Mode Lockdown Test
1. Try pressing **`F12`** on your keyboard:
   - Notice the key is blocked, and a **"SECURITY SHIELD: Developer Mode (F12) is disabled"** toast appears.
2. Try pressing **`Ctrl + Shift + I`** or **`Ctrl + Shift + J`**:
   - Key combination is intercepted and rejected.
3. Try **Right-Clicking** anywhere on the page:
   - Context menu is restricted, preventing "Inspect Element".
4. Open the browser console:
   - Notice the high-priority ASCII security shield banner warning against runtime tampering.

### 2. Cryptographic Payment Verification
1. Every order generated on Game Hub contains a server-generated **HMAC-SHA256 signature**.
2. You can verify the integrity of any order via the backend audit endpoint:
   ```http
   GET http://localhost:5000/api/orders/:orderId/verify-signature
   Header: Authorization: Bearer <your_jwt_token>
   ```
3. The server recalculates the cryptographic hash against the database records:
   - If prices or items were tampered with: `Signature Mismatch Alert`.
   - If genuine: `PASSED: Zero Tampering Detected`.

---

## 8. GitHub Upload Instructions

To publish this project to your GitHub account:

### Step 1: Initialize Git
Open PowerShell or Terminal in the project root:
```bash
git init
```

### Step 2: Stage and Commit All Files
```bash
git add .
git commit -m "feat: complete Game Hub hybrid e-commerce & C2C platform with security shield and EmailJS"
```

### Step 3: Link to Your GitHub Repository
1. Go to [github.com](https://github.com) and click **"New Repository"**.
2. Name it `game-hub` (set to Public or Private).
3. Do NOT initialize with README or .gitignore (we already have created both).
4. Copy your repository URL and run:
```bash
git remote add origin https://github.com/<your-github-username>/game-hub.git
git branch -M main
git push -u origin main
```

---

*Game Hub — Engineered for Gamers & Collectors.*

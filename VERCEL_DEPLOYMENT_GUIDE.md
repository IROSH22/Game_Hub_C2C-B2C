# 🚀 Game Hub - Vercel Deployment & Production Guide

මෙම මාර්ගෝපදේශය (Guide) මඟින් **Game Hub** පද්ධතිය Vercel සහ Cloud Platforms (MongoDB Atlas, EmailJS, Stripe) මත 100% සාර්ථකව Live Deploy කරන ආකාරය පැහැදිලි කරයි.

---

## 🌟 1. Production Architecture Overview

Game Hub පද්ධතිය Production වලදී පහත පරිදි ක්‍රියාත්මක වේ:
1. **Frontend (React + Vite + Tailwind CSS)**: 
   - Vercel මත Host වේ (`frontend/dist`).
   - `frontend/vercel.json` මඟින් Single Page Application (SPA) routing 404 නොවී ස්වයංක්‍රීයව `index.html` වෙත rewrite වේ.
2. **Backend (Node.js + Express API)**:
   - Standalone Node Server එකක් ලෙස **Render.com** හෝ **Railway.app** මත (නොමිලේ) හෝ **Vercel Serverless Functions** (`backend/api/index.js`) ලෙස ධාවනය කළ හැක.
3. **Database (MongoDB Atlas)**:
   - Cloud MongoDB Cluster එකක් (`mongodb+srv://...`).
4. **Email Notifications (EmailJS)**:
   - Client/Server automated email templates (Order Confirmation, Exchange Acceptance, Welcome mail).

---

## 🛠️ 2. MongoDB Atlas (Cloud Database) නොමිලේ සැකසීම

Vercel හෝ Render මත Backend ධාවනය කිරීමට Cloud Database එකක් අවශ්‍ය වේ:
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) වෙත ගොස් නොමිලේ **M0 Free Cluster** එකක් සාදන්න.
2. **Database Access** -> `Add New Database User` (Username & Password එකක් ලබා දෙන්න).
3. **Network Access** -> `Add IP Address` -> **Allow Access from Anywhere (`0.0.0.0/0`)** තෝරා Confirm කරන්න.
4. **Clusters** -> **Connect** -> **Connect your application** (Node.js driver) -> Connection String එක Copy කරගන්න:
   ```env
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gamehub?retryWrites=true&w=majority
   ```

---

## 🌐 3. Backend Deployment (Render හෝ Railway හෝ Vercel)

### Option A: Render.com (ඉතා පහසුයි - Recommended for Express WebSockets/Long Polling)
1. [render.com](https://render.com) වෙත Login වී **New +** -> **Web Service** තෝරන්න.
2. GitHub Repo එක Connect කරන්න.
3. සැකසුම්:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables** (රහස්‍ය අගයන්) Render Dashboard එකේ ඇතුලත් කරන්න:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gamehub?retryWrites=true&w=majority
   JWT_SECRET=your_super_strong_jwt_production_secret_key_8842
   EMAILJS_PUBLIC_KEY=your_emailjs_public_key
   EMAILJS_PRIVATE_KEY=your_emailjs_private_key
   EMAILJS_SERVICE_ID=your_emailjs_service_id
   EMAILJS_TEMPLATE_ORDER_CONFIRMATION=template_order_id
   EMAILJS_TEMPLATE_WELCOME=template_welcome_id
   EMAILJS_TEMPLATE_EXCHANGE_ACCEPTED=template_exchange_id
   STRIPE_SECRET_KEY=sk_test_51xxxxx
   ```
5. Deploy වූ පසු ඔබේ Live Backend URL එක ලැබෙනු ඇත (උදා: `https://game-hub-api.onrender.com`).

---

## ⚡ 4. Frontend Deployment on Vercel

1. [vercel.com](https://vercel.com) වෙත ගොස් **Add New...** -> **Project** තෝරන්න.
2. ඔබගේ Game Hub GitHub Repository එක Import කරන්න.
3. Configure Project තිරයේදී පහත සැකසුම් ලබා දෙන්න:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Edit ක්ලික් කර `frontend` තෝරන්න)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - Variable Name: `VITE_API_URL`
   - Value: ඔබගේ Live Backend URL එක (උදා: `https://game-hub-api.onrender.com` - අගට `/api` අවශ්‍ය නැත, code එකෙන් ස්වයංක්‍රීයව එකතු කරයි).
5. **Deploy** බොත්තම ඔබන්න!
6. විනාඩියකින් ඔබේ Game Hub වෙබ් අඩවිය Live වේ (`https://game-hub-xxxx.vercel.app`).

---

## 📧 5. EmailJS Configuration Check

Frontend හි Admin Dashboard හෝ Email Center වෙත ගොස් (`/email-center`):
- ඔබගේ **EmailJS Service ID, Public Key, Template IDs** නිවැරදිව පරීක්ෂා කර "Test Send Email" මඟින් පරීක්ෂා කරගත හැක.
- පාරිභෝගිකයෙකු Order එකක් දැමූ විට, අලුතෙන් ලියාපදිංචි වූ විට සහ Game Exchange Request එකක් Accept වූ විට ස්වයංක්‍රීයව Emails යැවේ.

---

## ✅ 6. Verified Features in this Release

1. **Clean Jargon-Free UI**: "B2C" සහ "C2C" ඉවත් කර "Official Store Catalog" සහ "Game Swap Zone" ලෙස සරල කර ඇත.
2. **PayHere Completely Removed**: Stripe, PayPal, සහ Cash on Delivery පමණක් ක්‍රියාත්මක වේ.
3. **Role Enforcement**:
   - Game Barter/Exchange සිදු කළ හැක්කේ Regular Gamers (`customer`) ට පමණි.
   - Merchants/Sellers හට Store Catalog එකේ games sell කිරීම පමණක් කළ හැක.
4. **Order Rating System**: Customer හට Order එක ලැබුණු පසු Seller හට 1-5 Star Ratings සහ Comments ලබා දිය හැක. මෙය Merchant ගේ Trust Score එකට එකතු වේ.
5. **Live Trade Chat System**: Gamer දෙදෙනෙකු අතර Game Exchange Request එකක් Accept වූ වහාම Live Trade Chat එක විවෘත වී භාණ්ඩ හුවමාරුව හා Delivery විස්තර කතා කරගත හැක.

-- ============================================================================
-- GAME HUB: SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Project URL: https://mdemadyzfrlmymwgmelk.supabase.co
-- Course Module: IT32053 - E-Commerce
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/mdemadyzfrlmymwgmelk/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  phone TEXT DEFAULT '+94 77 123 4567',
  address TEXT DEFAULT 'Colombo, Sri Lanka',
  city TEXT DEFAULT 'Colombo',
  profile_image TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  shop_name TEXT DEFAULT '',
  trust_score NUMERIC DEFAULT 95,
  successful_trades INT DEFAULT 0,
  wishlist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAME LISTINGS TABLE (B2C Products & C2C Barter Listings)
CREATE TABLE IF NOT EXISTS public.game_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  genre TEXT NOT NULL DEFAULT 'Action',
  condition TEXT NOT NULL DEFAULT 'Brand New' CHECK (condition IN ('Brand New', 'Like New', 'Good', 'Fair')),
  price NUMERIC NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 1,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Inactive')),
  exchangeable BOOLEAN DEFAULT FALSE,
  looking_for TEXT DEFAULT '',
  city TEXT DEFAULT 'Colombo',
  rating NUMERIC DEFAULT 4.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE (B2C Purchases)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  coupon_code TEXT DEFAULT '',
  total_amount NUMERIC NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT DEFAULT 'Credit Card',
  payment_status TEXT DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  order_status TEXT DEFAULT 'Confirmed' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  transaction_id TEXT NOT NULL,
  card_last4 TEXT DEFAULT '4242',
  payment_signature TEXT DEFAULT '',
  risk_score TEXT DEFAULT 'Low Risk (Verified)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.game_listings(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  platform TEXT NOT NULL,
  image_url TEXT,
  condition TEXT DEFAULT 'Brand New'
);

-- 5. C2C EXCHANGE REQUESTS TABLE (Barter Engine)
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.game_listings(id) ON DELETE CASCADE,
  offered_game_title TEXT NOT NULL,
  offered_game_platform TEXT NOT NULL,
  offered_game_condition TEXT NOT NULL DEFAULT 'Like New',
  offered_game_image TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Counter-Offer', 'Completed')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  link TEXT DEFAULT '/',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EMAIL LOGS TABLE (Transactional Email Tracker)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT DEFAULT 'Valued Gamer',
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Sent',
  html_content TEXT,
  error_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read for Public Storefront
CREATE POLICY "Public games can be viewed by all" ON public.game_listings FOR SELECT USING (true);
CREATE POLICY "Public games can be inserted" ON public.game_listings FOR ALL USING (true);
CREATE POLICY "Users can view and register" ON public.users FOR ALL USING (true);
CREATE POLICY "Orders are manageable" ON public.orders FOR ALL USING (true);
CREATE POLICY "Order items are manageable" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Exchanges are manageable" ON public.exchange_requests FOR ALL USING (true);
CREATE POLICY "Notifications are manageable" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Email logs are manageable" ON public.email_logs FOR ALL USING (true);
CREATE POLICY "Reviews are manageable" ON public.reviews FOR ALL USING (true);

-- Enable Realtime on key tables for live barter updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.exchange_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_listings;

-- ============================================================================
-- INITIAL SEED DATA FOR SUPABASE
-- ============================================================================

-- Seed Demo Users
INSERT INTO public.users (id, name, email, password, role, shop_name, trust_score, successful_trades)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Alex Mercer (Gamer)', 'gamer@gamehub.com', '$2a$10$abcdefghijklmnopqrstuv', 'customer', '', 96, 18),
  ('a2222222-2222-2222-2222-222222222222', 'Elena Rostova (Trader)', 'gamer2@gamehub.com', '$2a$10$abcdefghijklmnopqrstuv', 'customer', '', 92, 12),
  ('a3333333-3333-3333-3333-333333333333', 'Nexus Gaming Official', 'seller@gamehub.com', '$2a$10$abcdefghijklmnopqrstuv', 'seller', 'Nexus Gaming Superstore', 99, 142),
  ('a4444444-4444-4444-4444-444444444444', 'GameHub System Admin', 'admin@gamehub.com', '$2a$10$abcdefghijklmnopqrstuv', 'admin', '', 100, 500)
ON CONFLICT (email) DO NOTHING;

-- Seed Retail & Barter Game Catalog
INSERT INTO public.game_listings (title, platform, genre, condition, price, stock, image_url, status, exchangeable, looking_for, city, rating)
VALUES
  ('Marvel''s Spider-Man 2', 'PS5', 'Action Adventure', 'Brand New', 69.99, 15, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600', 'Active', false, '', 'Colombo', 4.9),
  ('Elden Ring: Shadow of the Erdtree', 'PS5', 'Action RPG', 'Brand New', 79.99, 12, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600', 'Active', false, '', 'Colombo', 5.0),
  ('The Legend of Zelda: Tears of the Kingdom', 'Nintendo Switch', 'Open World', 'Brand New', 59.99, 10, 'https://images.unsplash.com/photo-1578377375762-d5540f32e9cf?w=600', 'Active', false, '', 'Kandy', 4.9),
  ('God of War Ragnarök', 'PS5', 'Action', 'Like New', 49.99, 8, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600', 'Active', true, 'Final Fantasy XVI or Spider-Man 2', 'Colombo', 4.8),
  ('Forza Horizon 5', 'Xbox Series X', 'Racing', 'Brand New', 54.99, 14, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600', 'Active', false, '', 'Colombo', 4.7),
  ('Cyberpunk 2077: Ultimate Edition', 'PC', 'Sci-Fi RPG', 'Brand New', 49.99, 20, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600', 'Active', false, '', 'Galle', 4.6),
  ('Final Fantasy XVI', 'PS5', 'Action RPG', 'Like New', 45.00, 1, 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=600', 'Active', true, 'Elden Ring or Tekken 8', 'Malabe', 4.8),
  ('Ghost of Tsushima: Director''s Cut', 'PS4', 'Samurai Action', 'Good', 29.99, 1, 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600', 'Active', true, 'Bloodborne or Sekiro', 'Colombo', 4.9)
ON CONFLICT DO NOTHING;

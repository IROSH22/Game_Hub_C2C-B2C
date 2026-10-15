const path = require('path');
const dotenv = require('dotenv');

// Always ensure backend/.env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mdemadyzfrlmymwgmelk.supabase.co';

let supabase = null;

function initSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!key) return null;
  if (!supabase) {
    try {
      supabase = createClient(SUPABASE_URL, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(`⚡ Supabase Client initialized for: ${SUPABASE_URL}`);
    } catch (err) {
      console.warn('⚠️ Supabase initialization warning:', err.message);
    }
  }
  return supabase;
}

// Initial attempt
initSupabase();

const getSupabase = () => supabase || initSupabase();

const isSupabaseLive = () => {
  const client = getSupabase();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(client && key);
};

module.exports = {
  getSupabase,
  isSupabaseLive,
  SUPABASE_URL,
};

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mdemadyzfrlmymwgmelk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
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

const getSupabase = () => supabase;

const isSupabaseLive = () => Boolean(supabase && SUPABASE_KEY);

module.exports = {
  supabase,
  getSupabase,
  isSupabaseLive,
  SUPABASE_URL,
};

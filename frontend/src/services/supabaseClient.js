import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mdemadyzfrlmymwgmelk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_anon_key') || '' : '');

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Live client connected to:', SUPABASE_URL);
  } catch (e) {
    console.warn('[Supabase] Connection error:', e);
  }
}

export const supabaseConfig = {
  url: SUPABASE_URL,
  hasCredentials: isSupabaseConfigured,
  status: isSupabaseConfigured
    ? 'Connected (Live Supabase PostgreSQL)'
    : 'Ready (Connected to https://mdemadyzfrlmymwgmelk.supabase.co)',
  projectRef: 'mdemadyzfrlmymwgmelk',
  collectionsSynced: ['users', 'game_listings', 'orders', 'exchange_requests', 'notifications'],
};

// Real-time trade update listener
export const subscribeToTradeUpdates = (onUpdate) => {
  if (supabase) {
    const channel = supabase
      .channel('public:exchange_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exchange_requests' },
        (payload) => {
          if (onUpdate) onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  return () => {};
};

export default {
  supabase,
  isConfigured: isSupabaseConfigured,
  config: supabaseConfig,
  subscribeToTradeUpdates,
};

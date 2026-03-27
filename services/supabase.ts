import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Avoid localStorage lock issues on public paths by disabling session persistence there
const isPublicPath = typeof window !== 'undefined' && 
  (window.location.pathname === '/' || 
   window.location.pathname === '/hospedagem' || 
   window.location.pathname === '/consultar' ||
   window.location.pathname === '/ordem-publica');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isPublicPath,
    autoRefreshToken: !isPublicPath,
    detectSessionInUrl: !isPublicPath
  }
});

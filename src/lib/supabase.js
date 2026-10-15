import { createClient } from "@supabase/supabase-js";

// Browser Supabase client (persists the session in localStorage, auto-refreshes the token).
// Use the ANON/publishable key only on the frontend. Never put the service_role key here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
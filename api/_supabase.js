const { createClient } = require('@supabase/supabase-js');

// Vercel's Supabase integration injects SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
// Fall back to the NEXT_PUBLIC_/anon variants in case only those were provided.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let client = null;
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase belum disambung (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tiada). Sila sambung integrasi Supabase di Vercel dan redeploy.');
  }
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}

module.exports = { getSupabase };

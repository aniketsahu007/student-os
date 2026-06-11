import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// For unauthenticated, public queries (rare in this app)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// For authenticated queries (pass the Clerk getToken() result here)
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  });
};

// For server-side admin actions that bypass RLS (e.g., webhook user creation)
// Only usable server-side where SUPABASE_SERVICE_ROLE_KEY is defined
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

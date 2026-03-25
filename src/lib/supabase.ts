import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Defensive check in case user literally entered "YOUR_SUPABASE_URL" into Vercel
if (!supabaseUrl.startsWith('http')) {
  supabaseUrl = 'https://placeholder.supabase.co';
}

let client: any;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  // Prevent build crash if URL is still somehow malformed
  client = {} as any;
}

export const supabase = client;

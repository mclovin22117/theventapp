// Supabase Configuration Template
// Copy this file to supabaseConfig.js and replace with your actual credentials

import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase project settings:
// https://app.supabase.com/project/YOUR_PROJECT/settings/api

const supabaseUrl = 'YOUR_SUPABASE_URL'; // e.g., https://xxxxx.supabase.co
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Your public anon key (safe for client-side)

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client that won't throw errors
let supabase: ReturnType<typeof createClient<Database>>;

try {
  // Check if environment variables are properly configured
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://placeholder.supabase.co' || 
      supabaseAnonKey === 'placeholder_key' ||
      supabaseUrl === 'your_supabase_url_here' || 
      supabaseAnonKey === 'your_supabase_anon_key_here') {
    
    console.warn('Supabase not configured - using mock data mode');
    
    // Create a mock client that won't actually connect
    supabase = createClient('https://placeholder.supabase.co', 'placeholder_key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } else {
    // Validate URL format
    new URL(supabaseUrl);
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.warn('Supabase configuration error - using mock data mode:', error);
  
  // Create a fallback client
  supabase = createClient('https://placeholder.supabase.co', 'placeholder_key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { supabase };
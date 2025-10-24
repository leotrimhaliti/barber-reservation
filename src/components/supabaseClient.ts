// src/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Vlerat merren nga variablat e mjedisit (shiko .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL ose Anon Key mungojnë në .env file!")
}

// Krijimi i klientit
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
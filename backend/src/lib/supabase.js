import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

// Server-side client with the service-role key. Never ship this key to a browser or the app.
export const supabase = createClient(
  config.supabaseUrl || "http://localhost",
  config.supabaseServiceKey || "missing-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

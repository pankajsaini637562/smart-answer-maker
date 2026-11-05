import { createClient } from "@supabase/supabase-js";
import { EXTERNAL_BACKEND_PUBLISHABLE_KEY, EXTERNAL_BACKEND_URL } from "@/lib/externalBackend";

// Secondary client for features explicitly assigned to the external backend.
// Uses its own storage key so it never overwrites the main app session.
export const externalBackend = createClient(EXTERNAL_BACKEND_URL, EXTERNAL_BACKEND_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "sb-external-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});

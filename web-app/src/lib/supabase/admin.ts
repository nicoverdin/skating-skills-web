import { createClient } from '@supabase/supabase-js'

// Nota: Esta función SOLO se debe usar en Server Actions o API Routes.
// NUNCA en componentes de cliente (expondría tu clave secreta).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

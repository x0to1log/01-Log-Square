import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Cookie-based Supabase client for Server Components and Route Handlers.
 * Respects RLS and uses the current user's session.
 */
export async function createAuthClient() {
  const cookieStore = await cookies()

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll can fail in Server Components (read-only).
          }
        },
      },
    },
  )
}

/**
 * Service role client — bypasses RLS.
 * Use only for admin operations (bootstrap, setup, agent calls, etc.)
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

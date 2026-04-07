import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Validates the user session from cookies.
 * Returns the authenticated user or a 401 response.
 *
 * Usage in any API route:
 *   const auth = await requireAuth()
 *   if (auth.error) return auth.error
 *   const { user } = auth
 */
export async function requireAuth(): Promise<
  | { user: { id: string; email: string }; error: null }
  | { user: null; error: NextResponse }
> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
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
            // read-only in some contexts
          }
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // Admin-only check
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && user.email !== adminEmail) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return {
    user: { id: user.id, email: user.email },
    error: null,
  }
}

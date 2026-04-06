import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * V1 single-user setup: creates an auth user + profile.
 * Only runs if no profile exists yet.
 */
export async function POST() {
  const supabase = createServerClient()

  // Check if a profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Already set up', userId: existing[0].id })
  }

  // Create an auth user (triggers profile creation via DB trigger)
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'ceo@logsquare.local',
    password: 'logsquare-v1-local',
    email_confirm: true,
    user_metadata: { display_name: '대표' },
  })

  if (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update profile with display name
  await supabase
    .from('profiles')
    .update({ display_name: '대표' })
    .eq('id', data.user.id)

  return NextResponse.json({
    message: 'Setup complete',
    userId: data.user.id,
  })
}

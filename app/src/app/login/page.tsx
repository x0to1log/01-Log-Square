'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  async function handleGoogleLogin() {
    const supabase = getSupabaseClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">01 Log Square</h1>
        <p className="mt-2 text-sm text-zinc-400">
          가상 오피스에 입장하려면 로그인하세요
        </p>
      </div>

      {error === 'unauthorized' && (
        <div className="mb-4 rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-400">
          접근 권한이 없습니다. 관리자에게 문의하세요.
        </div>
      )}

      {error === 'auth_failed' && (
        <div className="mb-4 rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-400">
          인증에 실패했습니다. 다시 시도해주세요.
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        Google로 로그인
      </button>

      <p className="mt-6 text-center text-xs text-zinc-600">
        From 0 to 1, Every Log Matters.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Suspense fallback={
        <div className="text-sm text-zinc-400">로딩 중...</div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  )
}

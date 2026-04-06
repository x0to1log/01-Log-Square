'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SetupButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSetup() {
    setLoading(true)
    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        alert(`설정 실패: ${data.error}`)
        return
      }
      router.refresh()
    } catch {
      alert('설정 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
      <h2 className="text-lg font-semibold">01 Log Square에 오신 것을 환영합니다</h2>
      <p className="mt-2 text-sm text-zinc-500">
        시작하려면 아래 버튼을 눌러 초기 설정을 완료하세요.
      </p>
      <button
        onClick={handleSetup}
        disabled={loading}
        className="mt-4 rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {loading ? '설정 중...' : '시작하기'}
      </button>
    </div>
  )
}

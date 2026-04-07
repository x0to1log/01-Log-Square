'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateProjectDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })

      if (!res.ok) throw new Error('Failed to create project')

      const project = await res.json()
      setOpen(false)
      setName('')
      setDescription('')
      router.push(`/project/${project.id}`)
    } catch {
      alert('프로젝트 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
      >
        새 프로젝트
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold">새 프로젝트</h2>

        <label className="mb-1 block text-sm font-medium">
          프로젝트 이름
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 01 Log 브랜드 런칭"
          className="mb-4 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
          autoFocus
        />

        <label className="mb-1 block text-sm font-medium">
          설명 (선택)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="이 프로젝트에 대한 간단한 설명"
          rows={3}
          className="mb-6 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-foreground-muted hover:text-foreground"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? '생성 중...' : '만들기'}
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

export function ProjectBriefCard({ projectId }: { projectId: number }) {
  const [brief, setBrief] = useState('')
  const [saved, setSaved] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/brief`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.body_md) {
          setBrief(data.body_md)
          setSaved(data.body_md)
        }
      })
      .catch(() => {})
  }, [projectId])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/brief`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body_md: brief }),
      })
      if (res.ok) {
        setSaved(brief)
        setEditing(false)
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  if (!editing && !saved) {
    return (
      <div className="mb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
          Project Brief
        </h3>
        <button
          onClick={() => setEditing(true)}
          className="w-full rounded-md border border-dashed border-border px-3 py-4 text-left text-xs text-foreground-muted hover:border-border-hover hover:text-foreground"
        >
          프로젝트에 대해 설명해주세요. 에이전트들이 이 내용을 참고합니다.
        </button>
      </div>
    )
  }

  if (!editing) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600">
            Project Brief
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-foreground-muted hover:text-foreground"
          >
            수정
          </button>
        </div>
        <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-foreground-muted">
          {saved}
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
        Project Brief
      </h3>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="이 프로젝트가 뭔지, 현재 어디까지 왔는지, 핵심 목표가 뭔지 알려주세요..."
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs leading-relaxed focus:border-accent focus:outline-none"
        rows={6}
      />
      <div className="mt-1 flex justify-end gap-2">
        <button
          onClick={() => { setEditing(false); setBrief(saved) }}
          className="rounded px-2 py-1 text-xs text-foreground-muted hover:text-foreground"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !brief.trim()}
          className="rounded bg-accent px-3 py-1 text-xs text-background hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}

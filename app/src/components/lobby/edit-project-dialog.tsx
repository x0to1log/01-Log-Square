'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectStatus, ProjectPhase } from '@/lib/types/database'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: '진행 중' },
  { value: 'paused', label: '보류' },
  { value: 'completed', label: '완료' },
  { value: 'archived', label: '보관됨' },
]

const PHASE_OPTIONS: { value: ProjectPhase; label: string }[] = [
  { value: 'discovery', label: '탐색' },
  { value: 'planning', label: '계획' },
  { value: 'building', label: '구현' },
  { value: 'review', label: '검토' },
  { value: 'shipping', label: '출시' },
]

export function EditProjectDialog({
  project,
  onClose,
}: {
  project: Project
  onClose: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [status, setStatus] = useState(project.status)
  const [phase, setPhase] = useState(project.phase)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, status, phase }),
      })
      if (res.ok) {
        router.refresh()
        onClose()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-semibold">프로젝트 수정</h2>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">프로젝트 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-muted">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          {/* Status + Phase row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-foreground-muted">상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-foreground-muted">단계</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value as ProjectPhase)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
              >
                {PHASE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-foreground-muted hover:text-foreground"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </>
  )
}

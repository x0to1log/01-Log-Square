import { createServerClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types/database'
import { ProjectCard } from '@/components/lobby/project-card'
import { CreateProjectDialog } from '@/components/lobby/create-project-dialog'
import { SetupButton } from '@/components/lobby/setup-button'

export const dynamic = 'force-dynamic'

export default async function LobbyPage() {
  const supabase = createServerClient()

  // Check if user profile exists (v1 single-user)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  const hasProfile = profiles && profiles.length > 0

  if (!hasProfile) {
    return (
      <>
        <header className="mb-8">
          <h1 className="text-2xl font-bold">01 Log Square</h1>
        </header>
        <SetupButton />
      </>
    )
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('last_opened_at', { ascending: false, nullsFirst: false }) as {
    data: Project[] | null
  }

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">01 Log Square</h1>
          <p className="mt-1 text-sm text-zinc-500">프로젝트를 선택하거나 새로 만드세요</p>
        </div>
        <CreateProjectDialog />
      </header>

      {projects?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500">아직 프로젝트가 없습니다</p>
          <p className="mt-1 text-sm text-zinc-400">위의 버튼으로 첫 프로젝트를 만들어보세요</p>
        </div>
      )}
    </>
  )
}

import { createServerClient } from '@/lib/supabase/server'
import type { Project } from '@/lib/types/database'
import { ProjectCard } from '@/components/lobby/project-card'
import { CreateProjectDialog } from '@/components/lobby/create-project-dialog'
import { SetupButton } from '@/components/lobby/setup-button'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'

export const dynamic = 'force-dynamic'

export default async function LobbyPage() {
  const supabase = createServerClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)

  const hasProfile = profiles && profiles.length > 0

  if (!hasProfile) {
    return (
      <>
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">01 Log Square</h1>
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
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/sprites/characters/ceo/south.png"
            alt="대표"
            width={40}
            height={40}
            className="pixel-art object-contain"
          />
          <div>
            <h1 className="text-xl font-bold text-foreground">01 Log Square</h1>
            <p className="text-xs text-foreground-muted">
              {projects?.length
                ? `${projects.length}개 프로젝트`
                : '프로젝트를 만들어보세요'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <CreateProjectDialog />
        </div>
      </header>

      {/* Project grid */}
      {projects?.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <img
            src="/sprites/characters/ceo/south.png"
            alt="대표"
            width={48}
            height={48}
            className="pixel-art mx-auto mb-3 object-contain"
          />
          <p className="text-sm text-foreground-muted">아직 프로젝트가 없습니다</p>
          <p className="mt-1 text-xs text-foreground-muted">
            위의 버튼으로 첫 프로젝트를 만들어보세요
          </p>
        </div>
      )}
    </>
  )
}

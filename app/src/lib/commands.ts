export interface SlashCommand {
  key: string
  label: string
  description: string
  category: 'agent' | 'project' | 'meeting' | 'navigate'
  usage: string
  available: boolean // false = coming soon
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // Agent collaboration
  {
    key: 'call',
    label: '/call',
    description: '특정 에이전트를 호출하여 답변 요청',
    category: 'agent',
    usage: '/call @cto',
    available: true,
  },
  {
    key: 'all',
    label: '/all',
    description: '모든 코어 에이전트에게 의견 요청',
    category: 'agent',
    usage: '/all 다음 분기 전략을 논의합시다',
    available: true,
  },
  {
    key: 'review',
    label: '/review',
    description: '한 에이전트의 의견을 다른 에이전트가 리뷰',
    category: 'agent',
    usage: '/review @risk_critic CTO의 제안을 검토해주세요',
    available: false,
  },
  {
    key: 'compare',
    label: '/compare',
    description: '두 옵션을 구조화된 비교표로 분석',
    category: 'agent',
    usage: '/compare AWS vs GCP',
    available: false,
  },
  {
    key: 'vote',
    label: '/vote',
    description: '에이전트들에게 투표 요청 (각자 입장 + 이유)',
    category: 'agent',
    usage: '/vote SMB vs 엔터프라이즈',
    available: false,
  },

  // Project operations
  {
    key: 'decision',
    label: '/decision',
    description: '결정 사항을 공식 기록으로 저장',
    category: 'project',
    usage: '/decision 기술 스택: Next.js + Mastra 확정',
    available: true,
  },
  {
    key: 'action',
    label: '/action',
    description: '액션 아이템 생성 (담당자, 마감일)',
    category: 'project',
    usage: '/action DB 마이그레이션 @cto 4/14',
    available: true,
  },
  {
    key: 'status',
    label: '/status',
    description: '현재 프로젝트 상태 요약 (결정/액션/리스크)',
    category: 'project',
    usage: '/status',
    available: true,
  },
  {
    key: 'focus',
    label: '/focus',
    description: '프로젝트 포커스 설정 — 모든 에이전트가 참조',
    category: 'project',
    usage: '/focus 다음 2주: MVP 런칭 준비',
    available: false,
  },
  {
    key: 'risk',
    label: '/risk',
    description: '열린 리스크 + Red Flag 목록 확인',
    category: 'project',
    usage: '/risk',
    available: false,
  },
  {
    key: 'deadline',
    label: '/deadline',
    description: '다가오는 마감일 목록',
    category: 'project',
    usage: '/deadline',
    available: false,
  },
  {
    key: 'log',
    label: '/log',
    description: '빠른 저널 기록 (메모, 발견, 관찰)',
    category: 'project',
    usage: '/log 경쟁사 X가 새 기능 출시',
    available: false,
  },
  {
    key: 'portfolio',
    label: '/portfolio',
    description: '전체 프로젝트 크로스 뷰',
    category: 'project',
    usage: '/portfolio',
    available: false,
  },

  // Meeting flow
  {
    key: 'summary',
    label: '/summary',
    description: '현재 대화를 요약하여 노트로 저장',
    category: 'meeting',
    usage: '/summary',
    available: true,
  },
  {
    key: 'agenda',
    label: '/agenda',
    description: '회의 아젠다 설정 — 에이전트들이 준비된 상태로 답변',
    category: 'meeting',
    usage: '/agenda 기술 스택, 예산, 타깃',
    available: false,
  },
  {
    key: 'recall',
    label: '/recall',
    description: '과거 대화/결정에서 관련 내용 검색',
    category: 'meeting',
    usage: '/recall 기술 스택',
    available: false,
  },
  {
    key: 'catchup',
    label: '/catchup',
    description: '마지막 접속 이후 변경사항 요약',
    category: 'meeting',
    usage: '/catchup',
    available: false,
  },
  {
    key: 'pin',
    label: '/pin',
    description: '메시지를 중요 참고자료로 고정',
    category: 'meeting',
    usage: '/pin',
    available: false,
  },

  // Navigation
  {
    key: 'dm',
    label: '/dm',
    description: '특정 에이전트와 1:1 DM으로 이동',
    category: 'navigate',
    usage: '/dm cto',
    available: true,
  },
  {
    key: 'switch',
    label: '/switch',
    description: '다른 프로젝트로 전환',
    category: 'navigate',
    usage: '/switch 0to1log',
    available: false,
  },
  {
    key: 'clear',
    label: '/clear',
    description: '대화창 초기화 (새로고침하면 복원)',
    category: 'navigate',
    usage: '/clear',
    available: true,
  },
  {
    key: 'help',
    label: '/help',
    description: '사용 가능한 커맨드 목록',
    category: 'navigate',
    usage: '/help',
    available: true,
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  agent: '에이전트',
  project: '프로젝트',
  meeting: '회의',
  navigate: '이동',
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function filterCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase().replace(/^\//, '')
  if (!q) return SLASH_COMMANDS
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.key.includes(q) ||
      cmd.label.includes(q) ||
      cmd.description.includes(q),
  )
}

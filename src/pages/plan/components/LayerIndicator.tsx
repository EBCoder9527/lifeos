import type { GoalCategory } from '../../../types'

const categoryConfig: Record<GoalCategory, { label: string; emoji: string; color: string; bg: string }> = {
  career: { label: '事业', emoji: '💼', color: 'text-primary', bg: 'bg-primary-soft' },
  health: { label: '健康', emoji: '💪', color: 'text-success', bg: 'bg-success-soft' },
  learning: { label: '学习', emoji: '📚', color: 'text-accent', bg: 'bg-accent-soft' },
  relationship: { label: '关系', emoji: '❤️', color: 'text-secondary', bg: 'bg-secondary-soft' },
  finance: { label: '财务', emoji: '💰', color: 'text-warning', bg: 'bg-warning-soft' },
  hobby: { label: '兴趣', emoji: '🎨', color: 'text-primary', bg: 'bg-primary-soft' },
  other: { label: '其他', emoji: '✨', color: 'text-text-secondary', bg: 'bg-gray-100 dark:bg-gray-800' },
}

export { categoryConfig }

interface LayerIndicatorProps {
  layer: 'goal' | 'phase' | 'strategy' | 'execution'
}

const layerConfig = {
  goal: { label: '目标层', color: 'bg-primary-soft text-primary' },
  phase: { label: '阶段层', color: 'bg-accent-soft text-accent' },
  strategy: { label: '策略层', color: 'bg-warning-soft text-warning' },
  execution: { label: '执行层', color: 'bg-success-soft text-success' },
}

export function LayerIndicator({ layer }: LayerIndicatorProps) {
  const cfg = layerConfig[layer]
  return (
    <span className={`chip ${cfg.color} text-[10px] font-bold`}>
      {cfg.label}
    </span>
  )
}

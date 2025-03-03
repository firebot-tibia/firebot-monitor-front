import { useState, useEffect } from 'react'

import type { GuildMemberResponse } from '@/core/types/guild-member.response'

import type { Death } from '../../types/death'
import type { Level } from '../../types/level'

type AnimationType = 'death' | 'levelUp' | 'levelDown' | null

export function useCharacterAnimation(
  member: GuildMemberResponse,
  recentDeaths: { death: Death }[],
  recentLevels: { level: Level }[],
) {
  const [animationType, setAnimationType] = useState<AnimationType>(null)

  useEffect(() => {
    // Check for death
    const isDead = recentDeaths.some(d => d.death.name.toLowerCase() === member.Name.toLowerCase())
    if (isDead) {
      setAnimationType('death')
      const timer = setTimeout(() => setAnimationType(null), 5000) // Reset after 5 seconds
      return () => clearTimeout(timer)
    }

    // Check for level changes
    const levelChange = recentLevels.find(
      l => l.level.player.toLowerCase() === member.Name.toLowerCase(),
    )
    if (levelChange) {
      const isLevelUp = levelChange.level.new_level > levelChange.level.old_level
      setAnimationType(isLevelUp ? 'levelUp' : 'levelDown')
      const timer = setTimeout(() => setAnimationType(null), 5000) // Reset after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [member.Name, recentDeaths, recentLevels])

  return animationType
}

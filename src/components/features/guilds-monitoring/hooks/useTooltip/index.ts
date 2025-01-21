import { useState, useCallback } from 'react'

export const useTooltipState = () => {
  const [openTooltips, setOpenTooltips] = useState(new Set<string>())

  const toggleTooltip = useCallback((id: string) => {
    setOpenTooltips(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const isTooltipOpen = useCallback((id: string) => openTooltips.has(id), [openTooltips])

  return { toggleTooltip, isTooltipOpen }
}

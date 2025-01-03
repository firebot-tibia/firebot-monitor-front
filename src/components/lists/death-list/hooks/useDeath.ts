import { useState, useCallback, useEffect, useRef } from 'react'
import { useToast } from '@chakra-ui/react'
import { Death } from '../../../../types/interfaces/death.interface'
import { useGlobalStore } from '../../../../stores/death-level-store'

const ITEMS_PER_PAGE = 50
const RESET_HOUR = 6

export const useDeathTable = (deathList: Death[], audioEnabled: boolean) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [newDeathCount, setNewDeathCount] = useState(0)
  const previousDeathListLength = useRef(deathList.length)
  const toast = useToast()

  const totalPages = Math.max(1, Math.ceil(deathList.length / ITEMS_PER_PAGE))

  const shouldResetData = useCallback(() => {
    const now = new Date()
    const lastReset = localStorage.getItem('lastResetDate')
    const lastResetDate = lastReset ? new Date(lastReset) : null

    if (!lastResetDate) return true

    return now.getDate() !== lastResetDate.getDate() && now.getHours() >= RESET_HOUR
  }, [])

  useEffect(() => {
    if (shouldResetData()) {
      localStorage.setItem('lastResetDate', new Date().toISOString())
      localStorage.removeItem('deathList')
      localStorage.removeItem('levelUpList')
      localStorage.removeItem('levelDownList')
    }
  }, [shouldResetData])

  useEffect(() => {
    const savedDeaths = localStorage.getItem('deathList')
    if (savedDeaths) {
      const parsedDeaths = JSON.parse(savedDeaths)
      useGlobalStore.getState().deathList = parsedDeaths
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('deathList', JSON.stringify(deathList))
  }, [deathList])

  useEffect(() => {
    if (deathList.length > previousDeathListLength.current) {
      const newDeathsCount = deathList.length - previousDeathListLength.current
      setNewDeathCount((prevCount) => prevCount + newDeathsCount)
    }
    previousDeathListLength.current = deathList.length
  }, [deathList, audioEnabled])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleCopyAllDeaths = useCallback(() => {
    const textToCopy = deathList.map((death) => `${death.name}: ${death.text}`).join('\n')

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Todas as mortes copiadas',
        description: 'Todas as mortes foram copiadas para a área de transferência.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    })
  }, [deathList, toast])

  return {
    currentPage,
    totalPages,
    newDeathCount,
    handlePageChange,
    handleCopyAllDeaths,
  }
}

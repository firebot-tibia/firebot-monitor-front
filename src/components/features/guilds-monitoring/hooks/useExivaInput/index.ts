'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

import type { GuildMemberResponse } from '@/common/types/guild-member.response'

import { useRespawnsStore } from '../../../reservations/stores/respawn-store'

interface UseLocalInputProps {
  member: GuildMemberResponse
  onLocalChange: (member: GuildMemberResponse, newLocal: string) => void
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

export const useLocalInput = ({ member, onLocalChange }: UseLocalInputProps) => {
  const [inputValue, setInputValue] = useState(member.Local || '')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  })
  const [isDropdownSelection, setIsDropdownSelection] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentLocations, setRecentLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentLocations')
    return saved ? JSON.parse(saved) : []
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const { respawns, fetchRespawns, isLoading: isRespawnsLoading } = useRespawnsStore()

  useEffect(() => {
    if (!isDropdownSelection) {
      setInputValue(member.Local || '')
    }
    return () => clearTimeout(selectionTimeoutRef.current)
  }, [member.Local, isDropdownSelection])

  useEffect(() => {
    fetchRespawns()
  }, [fetchRespawns])

  useEffect(() => {
    localStorage.setItem('recentLocations', JSON.stringify(recentLocations))
  }, [recentLocations])

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return

    const rect = inputRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // Calculate if dropdown should open upward or downward
    const spaceBelow = viewportHeight - rect.bottom
    const spaceNeeded = Math.min(filteredOptions.length * 32, 200) // 32px per item, max 200px

    const position: DropdownPosition = {
      width: rect.width,
      left: rect.left,
      top: spaceBelow >= spaceNeeded ? rect.bottom : rect.top - spaceNeeded,
    }

    setDropdownPosition(position)
  }, [filteredOptions.length])

  const handleInputChange = useCallback(
    async (value: string) => {
      setInputValue(value)
      setIsDropdownSelection(false)
      setIsLoading(true)

      try {
        if (respawns.length === 0 && !isRespawnsLoading) {
          await fetchRespawns()
        }

        const trimmedValue = value.trim().toLowerCase()
        if (trimmedValue) {
          const filtered = respawns
            .filter(r => r.name.toLowerCase().includes(trimmedValue))
            .map(r => r.name)

          setFilteredOptions(filtered)
          setIsDropdownOpen(filtered.length > 0)
          updateDropdownPosition()
        } else {
          setFilteredOptions([])
          setIsDropdownOpen(recentLocations.length > 0)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [respawns, isRespawnsLoading, fetchRespawns, recentLocations.length, updateDropdownPosition],
  )

  const addToRecentLocations = useCallback((location: string) => {
    setRecentLocations(prev => {
      const filtered = prev.filter(loc => loc !== location)
      return [location, ...filtered].slice(0, 5)
    })
  }, [])

  const handleOptionClick = useCallback(
    (option: string) => {
      clearTimeout(selectionTimeoutRef.current)
      setIsDropdownSelection(true)
      setInputValue(option)
      onLocalChange({ ...member, Local: option }, option)
      setIsDropdownOpen(false)
      setFilteredOptions([])
      addToRecentLocations(option)

      selectionTimeoutRef.current = setTimeout(() => {
        setIsDropdownSelection(false)
      }, 500)
    },
    [member, onLocalChange, addToRecentLocations],
  )

  const applyChange = useCallback(() => {
    if (!isDropdownSelection && inputValue !== member.Local) {
      onLocalChange({ ...member, Local: inputValue }, inputValue)
      if (inputValue.trim()) {
        addToRecentLocations(inputValue)
      }
    }
    setIsDropdownOpen(false)
  }, [isDropdownSelection, inputValue, member, onLocalChange, addToRecentLocations])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        applyChange()
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    },
    [applyChange],
  )

  const handleBlur = useCallback(() => {
    setTimeout(applyChange, 200)
  }, [applyChange])

  useEffect(() => {
    if (!isDropdownOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (!inputRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setIsDropdownOpen(false)
        if (!isDropdownSelection) applyChange()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen, isDropdownSelection, applyChange])

  useEffect(() => {
    if (!isDropdownOpen) return

    const observer = new ResizeObserver(updateDropdownPosition)
    if (inputRef.current) observer.observe(inputRef.current)

    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [isDropdownOpen, updateDropdownPosition])

  return {
    inputValue,
    isDropdownOpen,
    filteredOptions,
    dropdownPosition,
    inputRef,
    dropdownRef,
    handleInputChange,
    handleKeyDown,
    handleBlur,
    handleOptionClick,
    updateDropdownPosition,
    isLoading: isLoading || isRespawnsLoading,
    recentLocations,
  }
}

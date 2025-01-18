'use client'
import { useEffect, useRef, useState } from 'react'

import { useRespawnsStore } from '../../../../stores/respawn-store'
import type { GuildMemberResponse } from '../../../../types/guild-member.interface'

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

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const { respawns, fetchRespawns, isLoading } = useRespawnsStore()

  useEffect(() => {
    if (!isDropdownSelection) {
      setInputValue(member.Local || '')
    }
    return () => clearTimeout(selectionTimeoutRef.current)
  }, [member.Local, isDropdownSelection])

  useEffect(() => {
    fetchRespawns()
  }, [fetchRespawns])

  const updateDropdownPosition = () => {
    const rect = inputRef.current?.getBoundingClientRect()
    if (rect) {
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      })
    }
  }

  const handleInputChange = async (value: string) => {
    setInputValue(value)
    setIsDropdownSelection(false)

    if (respawns.length === 0 && !isLoading) {
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
      setIsDropdownOpen(false)
    }
  }

  const applyChange = () => {
    if (!isDropdownSelection && inputValue !== member.Local) {
      onLocalChange({ ...member, Local: inputValue }, inputValue)
    }
    setIsDropdownOpen(false)
  }

  const handleOptionClick = (option: string) => {
    clearTimeout(selectionTimeoutRef.current)
    setIsDropdownSelection(true)
    setInputValue(option)
    onLocalChange({ ...member, Local: option }, option)
    setIsDropdownOpen(false)
    setFilteredOptions([])

    selectionTimeoutRef.current = setTimeout(() => {
      setIsDropdownSelection(false)
    }, 500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applyChange()
  }

  const handleBlur = () => {
    setTimeout(applyChange, 200)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const isOutside =
        !inputRef.current?.contains(target) && !dropdownRef.current?.contains(target)

      if (isOutside) {
        setIsDropdownOpen(false)
        if (!isDropdownSelection) applyChange()
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen, isDropdownSelection])

  useEffect(() => {
    if (isDropdownOpen) {
      const observer = new ResizeObserver(updateDropdownPosition)
      if (inputRef.current) observer.observe(inputRef.current)
      return () => observer.disconnect()
    }
  }, [isDropdownOpen])

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
    isLoading,
  }
}

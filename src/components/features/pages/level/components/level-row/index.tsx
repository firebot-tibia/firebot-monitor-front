import React from 'react'

import { Td, Tr } from '@chakra-ui/react'

import type { Level } from '@/components/features/guilds-monitoring/types/level.interface'


interface LevelTableRowProps {
  level: Level
}

export const LevelTableRow: React.FC<LevelTableRowProps> = ({ level }) => {
  return (
    <Tr>
      <Td>{level.player}</Td>
      <Td>{level.old_level}</Td>
      <Td>{level.new_level}</Td>
    </Tr>
  )
}

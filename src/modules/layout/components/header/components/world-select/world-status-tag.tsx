import { Badge } from '@chakra-ui/react'

import { WORLD_STATUS_COLORS, WORLD_STATUS_LABELS, type WorldStatus } from './types'

interface WorldStatusTagProps {
  status: WorldStatus
}

export const WorldStatusTag = ({ status }: WorldStatusTagProps) => {
  return (
    <Badge
      colorScheme={WORLD_STATUS_COLORS[status]}
      variant="solid"
      fontSize="2xs"
      borderRadius="sm"
      px={1.5}
      py={0.5}
      ml={1}
    >
      {WORLD_STATUS_LABELS[status]}
    </Badge>
  )
}

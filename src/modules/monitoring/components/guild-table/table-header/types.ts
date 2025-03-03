import type { SortConfig, SortableFields } from '@/modules/monitoring/hooks/useGuildTable'

export interface TableHeaderProps {
  sortConfig: SortConfig
  onSort: (key: SortableFields) => void
  showExivaInput: boolean
}

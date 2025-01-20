import type { SortableFields, SortConfig } from '../../../hooks/useGuildTable/types'

export interface TableHeaderProps {
  sortConfig: SortConfig
  onSort: (key: SortableFields) => void
  showExivaInput: boolean
}

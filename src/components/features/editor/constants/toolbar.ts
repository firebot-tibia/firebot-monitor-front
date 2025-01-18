import { FiEdit } from 'react-icons/fi'

import DescriptionEditor from '../components/description'
import type { Tool } from '../types/unauthenticated.types'

export const tools: Tool[] = [
  {
    id: 'description',
    name: 'Editor de Descrição',
    icon: FiEdit,
    component: DescriptionEditor,
  },
]

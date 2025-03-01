import { FiEdit } from 'react-icons/fi'

import DescriptionEditor from '../components/description'
import type { Tool } from '../types/tools.types'

export const tools: Tool[] = [
  {
    id: 'description',
    name: 'Editor de Descrição',
    icon: FiEdit,
    component: DescriptionEditor,
  },
]
